import { ref, onMounted, onUnmounted } from 'vue'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { sb } from '../supabase'
import type { Item, Entry } from '../types'

// Single global state — every component that calls useStockData() shares it.
const items = ref<Item[]>([])
const entries = ref<Entry[]>([])
const isConnected = ref(false)
const lastSync = ref<Date | null>(null)
const newEntryName = ref<string | null>(null) // pulse signal for heatmap tile

let loadPromise: Promise<void> | null = null
let channel: RealtimeChannel | null = null
let refCount = 0

async function load(): Promise<void> {
  const [stockRes, entriesRes] = await Promise.all([
    sb
      .from('v_stock_with_cost')
      .select(
        'name,current_qty,default_unit,total_cost,unit_cost,low_threshold,is_low,last_updated',
      )
      .order('total_cost', { ascending: false }),
    sb
      .from('entries')
      .select(
        'id,created_at,action,qty,unit,status,details,by_user_id,items(name,default_unit),users(display_name)',
      )
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  items.value = (stockRes.data as Item[] | null) || []
  entries.value = ((entriesRes.data as any[] | null) || []).map((e) => ({
    ...e,
    _name: e.items?.name || '—',
    _by: e.users?.display_name || (e.by_user_id ? e.by_user_id.slice(-4) : ''),
  })) as Entry[]

  lastSync.value = new Date()
  isConnected.value = true
}

function subscribe(): void {
  if (channel) return
  channel = sb
    .channel('stock-realtime')
    .on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'entries' },
      (payload: any) => {
        load().then(() => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const name = entries.value.find((e) => e.id === payload.new.id)?._name
            if (name) {
              newEntryName.value = name
              setTimeout(() => {
                if (newEntryName.value === name) newEntryName.value = null
              }, 1200)
            }
          }
        })
      },
    )
    .on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'items' },
      () => load(),
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') isConnected.value = true
      else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') isConnected.value = false
    })
}

function unsubscribe(): void {
  if (channel) {
    sb.removeChannel(channel)
    channel = null
  }
}

export function useStockData() {
  onMounted(() => {
    refCount++
    if (!loadPromise) loadPromise = load()
    subscribe()
  })
  onUnmounted(() => {
    refCount--
    if (refCount === 0) {
      unsubscribe()
      loadPromise = null
    }
  })

  return {
    items,
    entries,
    isConnected,
    lastSync,
    newEntryName,
    reload: load,
  }
}
