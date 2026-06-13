<script setup lang="ts">
import { computed } from 'vue'
import type { Entry } from '../types'
import { fmtQty, fmtMoney, fmtClock, fmtDate } from '../format'

const props = defineProps<{ entry: Entry; fresh?: boolean }>()

const baseAct = computed(() =>
  props.entry.action.startsWith('meta_') ? 'meta' : props.entry.action,
)
const actLbl = computed(() => {
  const map: Record<string, string> = {
    in: 'เติม',
    out: 'เบิก',
    adj: 'เกิน',
    meta_edit: 'แก้',
    meta_void: 'ลบ',
  }
  return map[props.entry.action] || props.entry.action
})
const sign = computed(() =>
  props.entry.action === 'in' ? '+' : props.entry.action === 'out' ? '−' : '',
)
const cost = computed(() => Number(props.entry.details?.total_price || 0))
</script>

<template>
  <div
    class="entry"
    :class="[
      baseAct,
      { voided: entry.status === 'voided', fresh },
    ]"
  >
    <div class="when">
      {{ fmtClock(entry.created_at) }}<br />
      <span>{{ fmtDate(entry.created_at) }}</span>
    </div>
    <div><span class="act">{{ actLbl }}</span></div>
    <div class="body">
      <span class="nm">{{ entry._name }}</span>
      <span class="qty">{{ sign }}{{ fmtQty(entry.qty) }} {{ entry.unit || '' }}</span>
      <div v-if="cost > 0" class="meta-line">
        มูลค่า <span class="cost">{{ fmtMoney(cost) }} ฿</span>
      </div>
      <div v-if="entry.status !== 'active'" class="meta-line ital">
        — {{ entry.status === 'voided' ? 'ลบแล้ว' : 'แก้แล้ว' }}
      </div>
    </div>
    <div class="by" :title="entry.by_user_id || ''">{{ entry._by }}</div>
  </div>
</template>

<style scoped>
.entry {
  display: grid;
  grid-template-columns: 54px 50px 1fr auto;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid var(--line-2);
  align-items: start;
  position: relative;
}
.entry::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 18px;
  width: 3px;
  height: 14px;
  background: var(--muted-2);
  border-radius: 2px;
}
.entry.in::before {
  background: var(--line-green);
}
.entry.out::before {
  background: var(--coral);
}
.entry.adj::before {
  background: var(--gold);
}
.entry.fresh {
  animation: slideIn 600ms var(--ease);
}
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
    background: var(--line-green-glow);
  }
  to {
    opacity: 1;
    transform: none;
    background: transparent;
  }
}
.when {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--ink-3);
  padding-top: 1px;
}
.when span {
  color: var(--muted);
}
.act {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
  padding: 3px 7px;
  border-radius: 5px;
  display: inline-block;
  align-self: start;
}
.entry.in .act {
  background: rgba(6, 199, 85, 0.14);
  color: var(--line-green);
}
.entry.out .act {
  background: var(--coral-glow);
  color: var(--coral);
}
.entry.adj .act {
  background: rgba(176, 142, 42, 0.18);
  color: var(--gold);
}
.entry.meta .act {
  background: var(--surface-3);
  color: var(--ink-3);
}
.body {
  min-width: 0;
  line-height: 1.4;
}
.body .nm {
  font-family: 'Noto Sans Thai', sans-serif;
  font-weight: 600;
  color: var(--ink-1);
  margin-right: 6px;
}
.body .qty {
  font-family: 'JetBrains Mono', monospace;
  color: var(--ink-2);
  font-variant-numeric: tabular-nums;
}
.body .meta-line {
  font-size: 11.5px;
  color: var(--ink-3);
  margin-top: 3px;
}
.body .meta-line.ital {
  font-style: italic;
}
.body .meta-line .cost {
  color: var(--gold);
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
}
.by {
  font-family: 'Noto Sans Thai', sans-serif;
  font-size: 12px;
  color: var(--ink-3);
  text-align: right;
  align-self: start;
  padding-top: 2px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}
.entry.voided .body .nm,
.entry.voided .body .qty {
  text-decoration: line-through;
  color: var(--ink-3);
}
.entry.voided {
  opacity: 0.6;
}

@media (max-width: 640px) {
  .entry {
    grid-template-columns: 54px 1fr auto;
    gap: 4px 10px;
    padding: 14px 0;
    min-height: 52px;
    align-items: start;
  }
  .entry::before {
    left: -8px;
  }
  .when {
    grid-row: 1 / 3;
    grid-column: 1;
    font-size: 11px;
  }
  .entry > div:nth-child(2) {
    grid-row: 1;
    grid-column: 2;
    justify-self: start;
  }
  .body {
    grid-column: 2;
    grid-row: 2;
  }
  .by {
    grid-row: 1 / 3;
    grid-column: 3;
    align-self: center;
  }
  .act {
    font-size: 9.5px;
  }
  .body .nm {
    font-size: 14.5px;
    display: block;
    margin-bottom: 2px;
  }
  .body .qty {
    font-size: 13px;
  }
}
</style>
