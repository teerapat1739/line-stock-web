<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useAdmin } from '../composables/useAdmin'
import type { AdminLlmSummary, AdminUserRow, AdminDailyRow } from '../types'
import { fmtMoney, fmtNumber } from '../format'

const { isUnlocked, fetchLlmSummary, fetchUserActivity, fetchDailyRollup } = useAdmin()

const llm = ref<AdminLlmSummary | null>(null)
const users = ref<AdminUserRow[]>([])
const days = ref<AdminDailyRow[]>([])

async function load() {
  if (!isUnlocked.value) return
  const [a, b, c] = await Promise.all([
    fetchLlmSummary(),
    fetchUserActivity(),
    fetchDailyRollup(),
  ])
  llm.value = a
  users.value = b
  days.value = c
}

watch(isUnlocked, (v) => {
  if (v) load()
})
onMounted(() => {
  if (isUnlocked.value) load()
})

function maxDaily(): number {
  return Math.max(
    1,
    ...days.value.map((d) => Math.max(Number(d.in_qty || 0), Number(d.out_qty || 0))),
  )
}
</script>

<template>
  <div v-if="isUnlocked" class="admin-row">
    <div class="panel admin-card">
      <div class="panel-head">
        <div class="panel-title">ค่าใช้จ่าย LLM <em>· 30 days</em></div>
        <div class="panel-meta">Claude Haiku</div>
      </div>
      <div class="panel-body">
        <template v-if="llm">
          <div class="meta-stat">
            <span class="ms-l">เรียก LLM</span>
            <span class="ms-v">{{ fmtNumber(llm.total_calls) }}</span>
          </div>
          <div class="meta-stat">
            <span class="ms-l">ล้มเหลว</span>
            <span class="ms-v" :class="{ coral: llm.errored_calls > 0 }">
              {{ fmtNumber(llm.errored_calls) }}
            </span>
          </div>
          <div class="meta-stat">
            <span class="ms-l">tokens เข้า</span>
            <span class="ms-v">{{ fmtNumber(llm.total_input_tokens) }}</span>
          </div>
          <div class="meta-stat">
            <span class="ms-l">tokens ออก</span>
            <span class="ms-v">{{ fmtNumber(llm.total_output_tokens) }}</span>
          </div>
          <div class="meta-stat">
            <span class="ms-l">cache hit</span>
            <span class="ms-v green">{{ fmtNumber(llm.total_cache_read_tokens) }}</span>
          </div>
          <div class="meta-stat">
            <span class="ms-l">เฉลี่ย latency</span>
            <span class="ms-v">{{ fmtNumber(llm.avg_latency_ms) }} ms</span>
          </div>
          <div class="meta-stat">
            <span class="ms-l">ค่าใช้จ่าย</span>
            <span class="ms-v gold">฿ {{ fmtMoney(llm.estimated_cost_thb) }}</span>
          </div>
        </template>
        <div v-else class="empty">
          <div class="illu">…</div>
          <div class="ti">กำลังโหลด</div>
        </div>
      </div>
    </div>

    <div class="panel admin-card">
      <div class="panel-head">
        <div class="panel-title">ผู้ใช้งาน <em>· users</em></div>
        <div class="panel-meta">{{ fmtNumber(users.length) }} คน</div>
      </div>
      <div class="panel-body users-list">
        <template v-if="users.length">
          <div v-for="u in users" :key="u.line_user_id" class="user-row">
            <div class="un">
              {{ u.display_name || '—' }}
              <small>{{ (u.line_user_id || '').slice(-12) }}</small>
            </div>
            <div class="ub">{{ fmtNumber(u.entries_count) }}</div>
            <div class="rt" :class="u.role">{{ u.role }}</div>
          </div>
        </template>
        <div v-else class="empty">
          <div class="ti">ยังไม่มีผู้ใช้งาน</div>
        </div>
      </div>
    </div>

    <div class="panel admin-card">
      <div class="panel-head">
        <div class="panel-title">รายวัน <em>· 14 days</em></div>
        <div class="panel-meta">in / out qty</div>
      </div>
      <div class="panel-body">
        <template v-if="days.length">
          <div v-for="d in days.slice(0, 14)" :key="d.day" class="day-bar">
            <div class="dd">
              {{ new Date(d.day).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }) }}
            </div>
            <div class="db">
              <i
                class="in"
                :style="{ width: Math.min(100, (Number(d.in_qty) / maxDaily()) * 50) + '%' }"
              ></i>
              <i
                class="out"
                :style="{ width: Math.min(100, (Number(d.out_qty) / maxDaily()) * 50) + '%' }"
              ></i>
            </div>
            <div class="dv">{{ fmtNumber(d.records) }}</div>
          </div>
        </template>
        <div v-else class="empty">
          <div class="ti">ยังไม่มีบันทึก</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}
.users-list {
  max-height: 380px;
  overflow-y: auto;
}
.admin-card .meta-stat {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 10px 0;
  border-bottom: 1px solid var(--line-2);
}
.admin-card .meta-stat:last-child {
  border-bottom: 0;
}
.admin-card .meta-stat .ms-l {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--ink-3);
}
.admin-card .meta-stat .ms-v {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  color: var(--ink-1);
  font-weight: 500;
}
.admin-card .meta-stat .ms-v.gold {
  color: var(--gold);
}
.admin-card .meta-stat .ms-v.green {
  color: var(--line-green);
}
.admin-card .meta-stat .ms-v.coral {
  color: var(--coral);
}

.user-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--line-2);
  font-size: 13px;
}
.user-row:last-child {
  border-bottom: 0;
}
.user-row .un {
  font-family: 'Noto Sans Thai', sans-serif;
  font-weight: 600;
  color: var(--ink-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-row .un small {
  display: block;
  color: var(--ink-3);
  font-size: 10.5px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 400;
}
.user-row .ub {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  color: var(--ink-2);
}
.user-row .rt {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 5px;
}
.user-row .rt.staff {
  background: var(--surface-3);
  color: var(--ink-3);
}
.user-row .rt.admin {
  background: var(--gold);
  color: var(--surface);
}

.day-bar {
  display: grid;
  grid-template-columns: 54px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 7px 0;
}
.day-bar .dd {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--ink-3);
}
.day-bar .db {
  height: 6px;
  background: var(--surface-3);
  border-radius: 3px;
  overflow: hidden;
  display: flex;
}
.day-bar .db i {
  display: block;
  height: 100%;
}
.day-bar .db .in {
  background: var(--line-green);
}
.day-bar .db .out {
  background: var(--coral);
}
.day-bar .dv {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  color: var(--ink-2);
}

@media (max-width: 980px) {
  .admin-row {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .admin-row {
    gap: 14px;
    margin-top: 14px;
  }
}
</style>
