<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Item } from '../types'
import { fmtQty, fmtMoney, fmtTime, fmtNumber } from '../format'

const props = defineProps<{ items: Item[] }>()
const emit = defineEmits<{ (e: 'pick', name: string): void }>()

type SortKey = 'name' | 'qty' | 'value' | 'updated'
const sortKey = ref<SortKey>('value')
const sortDir = ref<'asc' | 'desc'>('desc')

const sorted = computed(() => {
  const out = [...props.items]
  out.sort((a, b) => {
    let av: any, bv: any
    switch (sortKey.value) {
      case 'name':
        av = a.name
        bv = b.name
        break
      case 'qty':
        av = Number(a.current_qty || 0)
        bv = Number(b.current_qty || 0)
        break
      case 'value':
        av = Number(a.total_cost || 0)
        bv = Number(b.total_cost || 0)
        break
      case 'updated':
        av = new Date(a.last_updated).getTime()
        bv = new Date(b.last_updated).getTime()
        break
    }
    if (av < bv) return sortDir.value === 'asc' ? -1 : 1
    if (av > bv) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })
  return out
})

function changeSort(k: SortKey) {
  if (sortKey.value === k) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = k
    sortDir.value = k === 'name' ? 'asc' : 'desc'
  }
}
</script>

<template>
  <div class="panel">
    <div class="panel-head">
      <div class="panel-title">สต็อคทั้งหมด <em>· inventory</em></div>
      <div class="panel-meta">{{ fmtNumber(items.length) }} รายการ</div>
    </div>
    <div class="panel-body tight">
      <table v-if="items.length">
        <thead>
          <tr>
            <th
              :class="{ sorted: sortKey === 'name' }"
              @click="changeSort('name')"
            >
              ชื่อ <span class="arrow">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th
              class="num"
              :class="{ sorted: sortKey === 'qty' }"
              @click="changeSort('qty')"
            >
              จำนวน <span class="arrow">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th
              class="num"
              :class="{ sorted: sortKey === 'value' }"
              @click="changeSort('value')"
            >
              มูลค่า <span class="arrow">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th
              class="num"
              :class="{ sorted: sortKey === 'updated' }"
              @click="changeSort('updated')"
            >
              อัปเดต <span class="arrow">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="i in sorted"
            :key="i.name"
            :class="{ low: i.is_low }"
            @click="emit('pick', i.name)"
          >
            <td class="name">{{ i.name }}</td>
            <td class="num">
              {{ fmtQty(i.current_qty) }} <span class="unit">{{ i.default_unit || '' }}</span>
            </td>
            <td class="num">
              {{ fmtMoney(i.total_cost) }} <span class="unit">฿</span>
            </td>
            <td class="num muted">{{ fmtTime(i.last_updated) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty">
        <div class="illu">empty</div>
        <div class="ti">ยังไม่มีของในคลัง</div>
        <div class="lo">ลองส่ง "มีพริก 500" ใน LINE บอท</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}
thead th {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--ink-3);
  text-align: left;
  padding: 0 14px 12px;
  border-bottom: 1px solid var(--line);
  user-select: none;
  cursor: pointer;
  font-weight: 500;
}
thead th.num {
  text-align: right;
}
thead th:hover {
  color: var(--ink-1);
}
thead th .arrow {
  margin-left: 4px;
  color: var(--gold);
  opacity: 0;
  transition: opacity var(--t-fast);
}
thead th.sorted .arrow {
  opacity: 1;
}
tbody tr {
  transition: background var(--t-fast);
}
tbody tr:hover {
  background: var(--surface-2);
  cursor: pointer;
}
tbody td {
  padding: 11px 14px;
  border-bottom: 1px solid var(--line-2);
  color: var(--ink-2);
}
tbody td.num {
  text-align: right;
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  color: var(--ink-1);
}
tbody td.name {
  font-family: 'Noto Sans Thai', sans-serif;
  font-weight: 600;
  color: var(--ink-1);
}
tbody td.unit {
  font-family: 'JetBrains Mono', monospace;
  color: var(--ink-3);
  font-size: 11.5px;
}
tbody td.muted {
  color: var(--ink-3);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
}
tbody tr.low {
  background: linear-gradient(90deg, var(--coral-glow), transparent 30%);
}
tbody tr.low td.name {
  color: var(--coral);
}
tbody tr.low td.name::before {
  content: '!';
  display: inline-block;
  width: 14px;
  height: 14px;
  background: var(--coral);
  color: var(--surface);
  border-radius: 50%;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  line-height: 14px;
  margin-right: 8px;
  vertical-align: middle;
}

/* Phone: cards instead of table */
@media (max-width: 640px) {
  table {
    display: block;
  }
  thead {
    display: none;
  }
  tbody {
    display: block;
  }
  tbody tr {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 4px 12px;
    padding: 12px 14px;
    border: 1px solid var(--line-2);
    border-radius: 10px;
    margin-bottom: 8px;
    background: var(--surface-2);
  }
  tbody tr:hover {
    background: var(--surface-3);
  }
  tbody td {
    padding: 0;
    border: none;
  }
  tbody td.name {
    font-size: 15px;
    grid-column: 1;
  }
  tbody td.num:nth-of-type(2) {
    grid-column: 2;
    text-align: right;
    font-size: 14px;
    color: var(--ink-1);
  }
  tbody td.num:nth-of-type(3) {
    grid-column: 1 / -1;
    color: var(--gold);
    font-size: 13px;
    text-align: left;
  }
  tbody td.num:nth-of-type(3)::before {
    content: '฿ ';
    color: var(--ink-3);
    font-weight: 400;
  }
  tbody td.num:nth-of-type(4) {
    grid-column: 1 / -1;
    color: var(--ink-3);
    font-size: 11px;
    text-align: left;
  }
  tbody td.num:nth-of-type(4)::before {
    content: 'อัปเดต ';
    color: var(--muted);
  }
  tbody td.unit {
    display: inline;
  }
  tbody tr.low {
    background: linear-gradient(135deg, var(--coral-glow), var(--surface-2) 60%);
    border-color: rgba(200, 62, 62, 0.3);
  }
}
</style>
