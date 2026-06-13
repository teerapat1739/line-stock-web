<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Entry } from '../types'
import { useTheme } from '../composables/useTheme'
import { fmtMoney, fmtQty } from '../format'

const props = defineProps<{ entries: Entry[] }>()
const emit = defineEmits<{ (e: 'pick', name: string): void }>()
const { theme } = useTheme()

const svgRef = ref<SVGSVGElement | null>(null)
const burnTotalText = ref<string>('—')

const isDark = computed(() => theme.value === 'dark')

function renderChart() {
  const svg = svgRef.value
  if (!svg) return
  const W = svg.clientWidth || 380
  const H = 140
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)

  type DayBucket = { d: Date; inSum: number; outSum: number }
  const days: DayBucket[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 6; i >= 0; i--) {
    days.push({ d: new Date(today.getTime() - i * 86400 * 1000), inSum: 0, outSum: 0 })
  }
  const dayIdx = (iso: string) =>
    6 - Math.floor((today.getTime() - new Date(iso).setHours(0, 0, 0, 0)) / 86400000)

  for (const e of props.entries) {
    if (e.status === 'voided') continue
    const i = dayIdx(e.created_at)
    if (i < 0 || i > 6) continue
    const cost = Number(e.details?.total_price || 0)
    if (!cost) continue
    if (e.action === 'in') days[i].inSum += cost
    else if (e.action === 'out') days[i].outSum += cost
  }

  const max = Math.max(1, ...days.map((d) => Math.max(d.inSum, d.outSum)))
  const padX = 14
  const padY = 16
  const innerW = W - padX * 2
  const barW = innerW / 7 - 6

  const axis = isDark.value ? '#21272f' : '#dccfae'
  const grid = isDark.value ? '#1a1f27' : '#ebe2cf'
  const todayCol = isDark.value ? '#e8c468' : '#9c7912'
  const dayCol = isDark.value ? '#6b6354' : '#8b8472'

  let content = ''
  content += `<line x1="${padX}" y1="${H - padY}" x2="${W - padX}" y2="${H - padY}" stroke="${axis}" stroke-width="1"/>`
  for (let g = 1; g <= 3; g++) {
    const y = H - padY - ((H - padY * 2) * g) / 3
    content += `<line x1="${padX}" y1="${y}" x2="${W - padX}" y2="${y}" stroke="${grid}" stroke-width="1" stroke-dasharray="2 4"/>`
  }

  let totalOut = 0
  days.forEach((d, i) => {
    const x = padX + i * (barW + 6) + 3
    const inH = (d.inSum / max) * (H - padY * 2)
    const outH = (d.outSum / max) * (H - padY * 2)
    totalOut += d.outSum
    if (d.inSum > 0)
      content += `<rect x="${x}" y="${H - padY - inH}" width="${barW / 2 - 1}" height="${inH}" fill="url(#g-in)" rx="2"/>`
    if (d.outSum > 0)
      content += `<rect x="${x + barW / 2 + 1}" y="${H - padY - outH}" width="${barW / 2 - 1}" height="${outH}" fill="url(#g-out)" rx="2"/>`
    const dayName = d.d.toLocaleDateString('th-TH', { weekday: 'narrow' })
    const isToday = i === 6
    content += `<text x="${x + barW / 2}" y="${H - 4}" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="9" fill="${isToday ? todayCol : dayCol}" letter-spacing="0.06em">${dayName}</text>`
  })

  const inA = isDark.value ? '#3ddc7c' : '#06c755'
  const inB = isDark.value ? '#06c755' : '#04a847'
  const outA = isDark.value ? '#ff8585' : '#e85a5a'
  const outB = isDark.value ? '#ff6b6b' : '#c83e3e'

  svg.innerHTML = `
    <defs>
      <linearGradient id="g-in" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${inA}" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="${inB}" stop-opacity="0.55"/>
      </linearGradient>
      <linearGradient id="g-out" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${outA}" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="${outB}" stop-opacity="0.55"/>
      </linearGradient>
    </defs>` + content

  burnTotalText.value = totalOut > 0 ? `เบิกรวม ${fmtMoney(totalOut)} ฿` : 'ยังไม่มีค่าใช้จ่าย'
}

const consumers = computed(() => buildRanking('out'))
const restocks = computed(() => buildRanking('in'))

function buildRanking(kind: 'in' | 'out') {
  const cutoff = Date.now() - 7 * 86400 * 1000
  const m = new Map<string, number>()
  for (const e of props.entries) {
    if (e.status === 'voided') continue
    if (new Date(e.created_at).getTime() < cutoff) continue
    if (e.action !== kind) continue
    m.set(e._name, (m.get(e._name) || 0) + Number(e.qty || 0))
  }
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty], i) => ({ name, qty, rank: i + 1 }))
}

const topConsumer = computed(() => consumers.value[0]?.qty || 1)
const topRestock = computed(() => restocks.value[0]?.qty || 1)

onMounted(renderChart)
watch(() => [props.entries, theme.value], renderChart, { deep: true })
let resizeT: number | null = null
window.addEventListener('resize', () => {
  if (resizeT) clearTimeout(resizeT)
  resizeT = window.setTimeout(renderChart, 120)
})
</script>

<template>
  <div class="panel">
    <div class="panel-head">
      <div class="panel-title">การใช้จ่าย 7 วัน <em>· cost burn</em></div>
      <div class="panel-meta">{{ burnTotalText }}</div>
    </div>
    <div class="panel-body">
      <svg ref="svgRef" class="cost-chart" preserveAspectRatio="none"></svg>
      <div class="rankings">
        <div class="ranking">
          <h4>เบิกมากสุด · OUT</h4>
          <template v-if="consumers.length">
            <div
              v-for="c in consumers"
              :key="c.name"
              class="ranking-row out"
              @click="emit('pick', c.name)"
            >
              <div class="rk">{{ c.rank }}</div>
              <div class="rn">{{ c.name }}</div>
              <div class="rv">{{ fmtQty(c.qty) }}</div>
              <div class="bar">
                <i :style="{ width: ((c.qty / topConsumer) * 100).toFixed(1) + '%' }"></i>
              </div>
            </div>
          </template>
          <div v-else class="empty-mini">— ยังไม่มี —</div>
        </div>
        <div class="ranking">
          <h4>เติมบ่อยสุด · IN</h4>
          <template v-if="restocks.length">
            <div
              v-for="c in restocks"
              :key="c.name"
              class="ranking-row in"
              @click="emit('pick', c.name)"
            >
              <div class="rk">{{ c.rank }}</div>
              <div class="rn">{{ c.name }}</div>
              <div class="rv">{{ fmtQty(c.qty) }}</div>
              <div class="bar">
                <i :style="{ width: ((c.qty / topRestock) * 100).toFixed(1) + '%' }"></i>
              </div>
            </div>
          </template>
          <div v-else class="empty-mini">— ยังไม่มี —</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cost-chart {
  height: 140px;
  width: 100%;
  margin-bottom: 14px;
}
.rankings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 6px;
}
.ranking h4 {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--ink-3);
  font-weight: 500;
  margin-bottom: 10px;
}
.ranking-row {
  display: grid;
  grid-template-columns: 14px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
  cursor: pointer;
}
.ranking-row .rk {
  font-family: 'JetBrains Mono', monospace;
  color: var(--ink-3);
  font-size: 10.5px;
  text-align: right;
}
.ranking-row .rn {
  font-family: 'Noto Sans Thai', sans-serif;
  font-weight: 600;
  color: var(--ink-2);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ranking-row .rv {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  color: var(--ink-3);
  font-size: 11.5px;
}
.ranking-row .bar {
  grid-column: 1 / -1;
  height: 2px;
  background: var(--surface-3);
  border-radius: 1px;
  margin-top: 2px;
  overflow: hidden;
}
.ranking-row .bar i {
  display: block;
  height: 100%;
  background: var(--ink-2);
  border-radius: 1px;
  transition: width var(--t-med);
}
.ranking-row.out .bar i {
  background: linear-gradient(90deg, var(--coral), var(--coral-2));
}
.ranking-row.in .bar i {
  background: linear-gradient(90deg, var(--line-green), var(--line-green-2));
}
.empty-mini {
  color: var(--ink-3);
  font-size: 12px;
  padding: 6px 0;
}

@media (max-width: 640px) {
  .cost-chart {
    height: 120px;
  }
  .rankings {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}
</style>
