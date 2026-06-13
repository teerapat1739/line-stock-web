<script setup lang="ts">
import { computed } from 'vue'
import type { Item, Entry } from '../types'
import { fmtMoney, fmtNumber } from '../format'

const props = defineProps<{ items: Item[]; entries: Entry[] }>()

const totalValue = computed(() =>
  props.items.reduce((s, i) => s + Number(i.total_cost || 0), 0),
)
const withQtyCount = computed(
  () => props.items.filter((i) => Number(i.current_qty || 0) > 0).length,
)
const lowItems = computed(() => props.items.filter((i) => i.is_low))
const todayEntries = computed(() => {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return props.entries.filter((e) => new Date(e.created_at).getTime() >= t.getTime())
})
const todayTxn = computed(
  () => todayEntries.value.filter((e) => ['in', 'out', 'adj'].includes(e.action)).length,
)
const todayIn = computed(() => todayEntries.value.filter((e) => e.action === 'in').length)
const todayOut = computed(() => todayEntries.value.filter((e) => e.action === 'out').length)
</script>

<template>
  <div class="kpi">
    <div class="card kpi-card featured">
      <div>
        <div class="label">มูลค่าสต็อครวม</div>
        <div class="num tnum">{{ fmtMoney(totalValue) }}</div>
      </div>
      <div class="foot">รวมต้นทุนของทุกรายการในคลัง</div>
      <div class="corner">฿ · Total Value</div>
    </div>
    <div class="card kpi-card">
      <div>
        <div class="label">รายการของ</div>
        <div class="num tnum">{{ fmtNumber(items.length) }}<span class="u">ชนิด</span></div>
      </div>
      <div class="foot">{{ fmtNumber(withQtyCount) }} ที่ยังมีของ</div>
      <div class="corner">Items</div>
    </div>
    <div class="card kpi-card" :class="{ warn: lowItems.length > 0 }">
      <div>
        <div class="label">ของใกล้หมด</div>
        <div class="num tnum">{{ fmtNumber(lowItems.length) }}<span class="u">รายการ</span></div>
      </div>
      <div class="foot">
        <template v-if="lowItems.length">
          {{ lowItems.slice(0, 3).map((i) => i.name).join(' · ')
          }}{{ lowItems.length > 3 ? ' …' : '' }}
        </template>
        <template v-else>ปกติทั้งหมด</template>
      </div>
      <div class="corner">Low</div>
    </div>
    <div class="card kpi-card">
      <div>
        <div class="label">เคลื่อนไหววันนี้</div>
        <div class="num tnum">{{ fmtNumber(todayTxn) }}<span class="u">ครั้ง</span></div>
      </div>
      <div class="foot">เติม {{ todayIn }} · เบิก {{ todayOut }}</div>
      <div class="corner">Today</div>
    </div>
  </div>
</template>

<style scoped>
.kpi {
  display: grid;
  grid-template-columns: 1.55fr 1fr 1fr 1fr;
  gap: 14px;
  margin-bottom: 24px;
}
@media (max-width: 980px) {
  .kpi {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 640px) {
  .kpi {
    gap: 10px;
    margin-bottom: 18px;
  }
}
@media (max-width: 380px) {
  .kpi {
    grid-template-columns: 1fr;
  }
}

.kpi-card {
  padding: 22px 22px 20px;
  min-height: 154px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.kpi-card .label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--ink-3);
  margin-bottom: 8px;
}
.kpi-card .label::before {
  content: '';
  display: inline-block;
  width: 14px;
  height: 1px;
  background: var(--muted);
  vertical-align: middle;
  margin-right: 8px;
  margin-bottom: 2px;
}
.kpi-card .num {
  font-family: 'Fraunces', serif;
  font-variation-settings: 'opsz' 144;
  font-weight: 700;
  font-size: 48px;
  line-height: 0.95;
  letter-spacing: -0.04em;
  color: var(--ink-1);
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.kpi-card .num .u {
  font-family: 'Noto Sans Thai', sans-serif;
  font-size: 14px;
  color: var(--ink-3);
  font-weight: 400;
  letter-spacing: 0;
}
.kpi-card .foot {
  font-family: 'Noto Sans Thai', sans-serif;
  font-size: 12.5px;
  color: var(--ink-2);
  margin-top: 10px;
}
.kpi-card.featured {
  background: var(--kpi-featured-bg);
  border-color: rgba(176, 142, 42, 0.22);
}
:root[data-theme='dark'] .kpi-card.featured {
  border-color: rgba(212, 164, 55, 0.22);
}
.kpi-card.featured .num {
  font-size: 64px;
  color: var(--gold);
  font-style: italic;
  font-variation-settings: 'opsz' 144;
  font-weight: 500;
}
.kpi-card.featured .num .u {
  color: var(--gold);
  font-style: normal;
  font-size: 15px;
}
.kpi-card.featured .label {
  color: var(--gold);
}
.kpi-card.warn .num {
  color: var(--coral);
}
.kpi-card.warn .label {
  color: var(--coral);
}
.kpi-card .corner {
  position: absolute;
  top: 14px;
  right: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--muted-2);
}

@media (max-width: 640px) {
  .kpi-card {
    padding: 18px 16px 16px;
    min-height: 120px;
    border-radius: 14px;
  }
  .kpi-card .num {
    font-size: 36px;
    line-height: 1;
  }
  .kpi-card.featured {
    grid-column: span 2;
  }
  .kpi-card.featured .num {
    font-size: 46px;
  }
  .kpi-card .foot {
    font-size: 11.5px;
  }
  .kpi-card .corner {
    font-size: 9px;
    top: 10px;
    right: 12px;
  }
}
@media (max-width: 380px) {
  .kpi-card.featured {
    grid-column: span 1;
  }
  .kpi-card .num {
    font-size: 34px;
  }
  .kpi-card.featured .num {
    font-size: 42px;
  }
}
</style>
