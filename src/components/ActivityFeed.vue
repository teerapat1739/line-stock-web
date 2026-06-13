<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Entry } from '../types'
import EntryRow from './EntryRow.vue'

const props = defineProps<{ entries: Entry[]; freshId?: string | null }>()
const emit = defineEmits<{ (e: 'pick', name: string): void }>()

type Filter = 'all' | 'in' | 'out' | 'adj' | 'meta'
const filter = ref<Filter>('all')

const filtered = computed(() =>
  props.entries.filter((e) => {
    if (filter.value === 'all') return true
    if (filter.value === 'meta')
      return e.action === 'meta_edit' || e.action === 'meta_void'
    return e.action === filter.value
  }),
)
</script>

<template>
  <div class="panel">
    <div class="panel-head">
      <div class="panel-title">บันทึกล่าสุด <em>· feed</em></div>
      <div class="panel-meta"><span class="live">LIVE</span></div>
    </div>
    <div class="panel-body tight">
      <div class="filters">
        <button
          v-for="f in ['all','in','out','adj','meta'] as Filter[]"
          :key="f"
          class="f-chip"
          :class="{ active: filter === f }"
          @click="filter = f"
        >
          {{ ({ all:'ทั้งหมด', in:'เติม', out:'เบิก', adj:'เกิน', meta:'แก้/ลบ' } as Record<string,string>)[f] }}
        </button>
      </div>
      <div v-if="filtered.length" class="feed">
        <EntryRow
          v-for="e in filtered"
          :key="e.id"
          :entry="e"
          :fresh="freshId === e.id"
          @click="emit('pick', e._name)"
        />
      </div>
      <div v-else class="empty">
        <div class="illu">silence</div>
        <div class="ti">ยังไม่มีการเคลื่อนไหว</div>
        <div class="lo">รอบันทึกจาก LINE บอท</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feed {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 560px;
  overflow-y: auto;
  margin: 0 -22px -22px;
  padding: 0 22px 22px;
}
.feed::-webkit-scrollbar {
  width: 6px;
}
.feed::-webkit-scrollbar-track {
  background: transparent;
}
.feed::-webkit-scrollbar-thumb {
  background: var(--line);
  border-radius: 3px;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}
.f-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 999px;
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--ink-3);
  transition: all var(--t-fast);
}
.f-chip:hover {
  color: var(--ink-1);
  border-color: var(--ink-3);
}
.f-chip.active {
  background: var(--ink-1);
  color: var(--surface);
  border-color: var(--ink-1);
}
.feed > :deep(.entry) {
  cursor: pointer;
}

@media (max-width: 640px) {
  .filters {
    overflow-x: auto;
    flex-wrap: nowrap;
    margin: 0 -16px 14px;
    padding: 0 16px;
    scrollbar-width: none;
  }
  .filters::-webkit-scrollbar {
    display: none;
  }
  .f-chip {
    flex: none;
    padding: 7px 13px;
    font-size: 11px;
  }
  .feed {
    max-height: none;
    margin: 0 -16px -18px;
    padding: 0 16px 18px;
  }
}
</style>
