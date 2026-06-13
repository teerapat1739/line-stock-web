import { ref } from 'vue'
import { sb } from '../supabase'
import type { AdminLlmSummary, AdminUserRow, AdminDailyRow } from '../types'

const KEY = 'stockyard-admin'

const phrase = ref<string>((() => {
  try {
    return sessionStorage.getItem(KEY) || ''
  } catch {
    return ''
  }
})())

const isUnlocked = ref(false)

async function tryUnlock(p: string): Promise<boolean> {
  const { data, error } = await sb.rpc('check_admin_passphrase', { p_phrase: p })
  if (error || !data) return false
  phrase.value = p
  try {
    sessionStorage.setItem(KEY, p)
  } catch {
    /* ignore */
  }
  isUnlocked.value = true
  return true
}

function lock(): void {
  phrase.value = ''
  isUnlocked.value = false
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

// On first call, try to restore session
let _restoreAttempted = false
async function restoreIfPossible(): Promise<void> {
  if (_restoreAttempted) return
  _restoreAttempted = true
  if (!phrase.value) return
  const ok = await tryUnlock(phrase.value)
  if (!ok) lock()
}

async function fetchLlmSummary(): Promise<AdminLlmSummary | null> {
  if (!phrase.value) return null
  const { data, error } = await sb.rpc('admin_llm_summary', { p_phrase: phrase.value })
  if (error) return null
  return (data && data[0]) || null
}

async function fetchUserActivity(): Promise<AdminUserRow[]> {
  if (!phrase.value) return []
  const { data, error } = await sb.rpc('admin_user_activity', { p_phrase: phrase.value })
  if (error) return []
  return (data || []) as AdminUserRow[]
}

async function fetchDailyRollup(): Promise<AdminDailyRow[]> {
  if (!phrase.value) return []
  const { data, error } = await sb.rpc('admin_daily_rollup', { p_phrase: phrase.value })
  if (error) return []
  return (data || []) as AdminDailyRow[]
}

export function useAdmin() {
  return {
    phrase,
    isUnlocked,
    tryUnlock,
    lock,
    restoreIfPossible,
    fetchLlmSummary,
    fetchUserActivity,
    fetchDailyRollup,
  }
}
