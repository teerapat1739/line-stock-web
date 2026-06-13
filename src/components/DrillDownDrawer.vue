<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { Item, Entry } from '../types'
import { useTheme } from '../composables/useTheme'
import EntryRow from './EntryRow.vue'
import { fmtQty, fmtMoney, fmtTime } from '../format'

const props = defineProps<{ items: Item[]; entries: Entry[]; active: string | null }>()
const emit = defineEmits<{ (e: 'close'): void }>()
const { theme } = useTheme()

const sparkRef = ref<SVGSVGElement | null>(null)

const item = computed(() => props.items.find((i) => i.name === props.active) || null)
const itemEntries = computed(() =>
  props.entries.filter((e) => e._name === props.active).slice(0, 30),
)

function drawSparkline() {
  const svg = sparkRef.value
  if (!svg || !item.value) return
  const isDark = theme.value === 'dark'
  const stroke = isDark ? '#e8c468' : '#9c7912'
  const fill = isDark ? '#e8c468' : '#b08e2a'
  const dot = isDark ? '#0a0c11' : '#fbf6ea'
  const W = svg.clientWidth || 420
  const H = 90
  const pad = 8
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)

  const filtered = props.entries
    .filter(
      (e) =>
        e._name === item.value!.name &&
        e.status !== 'voided' &&
        !e.action.startsWith('meta_'),
    )
    .filter((e) => Date.now() - new Date(e.created_at).getTime() < 30 * 86400 * 1000)

  const points: { t: number; q: number }[] = []
  let q = Number(item.value.current_qty || 0)
  points.push({ t: Date.now(), q })
  for (const e of filtered) {
    const sign = e.action === 'in' ? 1 : e.action === 'out' ? -1 : 1
    q -= sign * Number(e.qty || 0)
    points.push({ t: new Date(e.created_at).getTime(), q })
  }
  points.reverse()

  if (points.length < 2) {
    svg.innerHTML = `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" fill="var(--ink-3)" font-family="'JetBrains Mono',monospace" font-size="11">— ข้อมูลไม่พอ —</text>`
    return
  }

  const minT = points[0].t
  const maxT = points[points.length - 1].t
  const minQ = Math.min(...points.map((p) => p.q))
  const maxQ = Math.max(...points.map((p) => p.q))
  const dT = maxT - minT || 1
  const dQ = maxQ - minQ || 1
  const px = (p: { t: number }) => pad + ((p.t - minT) / dT) * (W - pad * 2)
  const py = (p: { q: number }) => H - pad - ((p.q - minQ) / dQ) * (H - pad * 2)

  let path = ''
  points.forEach((p, i) => {
    const x = px(p)
    const y = py(p)
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
  })
  const area =
    path +
    ` L ${px(points[points.length - 1])} ${H - pad} L ${px(points[0])} ${H - pad} Z`

  svg.innerHTML = `
    <defs>
      <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${fill}" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="${fill}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${area}" fill="url(#sg)"/>
    <path d="${path}" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${points.map((p) => `<circle cx="${px(p)}" cy="${py(p)}" r="2" fill="${dot}" stroke="${stroke}" stroke-width="1"/>`).join('')}`
}

watch(() => [props.active, props.entries, theme.value], () => {
  nextTick(drawSparkline)
}, { deep: true })

function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.active) emit('close')
}
onMounted(() => window.addEventListener('keydown', onEsc))
onUnmounted(() => window.removeEventListener('keydown', onEsc))
</script>

<template>
  <Teleport to="body">
    <div class="scrim" :class="{ open: !!active }" @click="emit('close')"></div>
    <aside
      class="drawer"
      :class="{ open: !!active }"
      role="dialog"
      :aria-hidden="!active"
    >
      <div v-if="item" class="drawer-head">
        <div>
          <div class="drawer-title">{{ item.name }}</div>
          <div class="drawer-sub">
            {{ item.is_low ? 'ใกล้หมด · ' : '' }}อัปเดต {{ fmtTime(item.last_updated) }}
          </div>
        </div>
        <button class="drawer-close" @click="emit('close')" aria-label="close">×</button>
      </div>
      <div v-if="item" class="drawer-body">
        <div class="drawer-summary">
          <div class="dstat">
            <div class="l">คงเหลือ</div>
            <div class="v">
              {{ fmtQty(item.current_qty) }}
              <span class="u">{{ item.default_unit ? ' ' + item.default_unit : '' }}</span>
            </div>
          </div>
          <div class="dstat">
            <div class="l">มูลค่า</div>
            <div class="v">
              {{ fmtMoney(item.total_cost) }}<span class="u"> ฿</span>
            </div>
          </div>
        </div>
        <div class="sparkline-wrap">
          <div class="sparkline-label">qty over time · 30 วันล่าสุด</div>
          <svg ref="sparkRef" class="sparkline" preserveAspectRatio="none"></svg>
        </div>
        <div>
          <div class="sparkline-label drawer-feed-head">ประวัติล่าสุด</div>
          <div class="drawer-feed">
            <EntryRow v-for="e in itemEntries" :key="e.id" :entry="e" />
            <div v-if="!itemEntries.length" class="empty">
              <div class="illu">none</div>
              <div class="ti">ยังไม่มีประวัติ</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </Teleport>
</template>

<style>
.scrim {
  position: fixed;
  inset: 0;
  background: rgba(20, 16, 8, 0.18);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--t-med);
  z-index: 30;
}
:root[data-theme='dark'] .scrim {
  background: rgba(8, 10, 14, 0.6);
}
.scrim.open {
  opacity: 1;
  pointer-events: auto;
}
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100dvh;
  width: min(480px, 100vw);
  background: linear-gradient(180deg, var(--surface) 0%, var(--bg-2) 100%);
  border-left: 1px solid var(--line);
  box-shadow: var(--shadow-deep);
  transform: translateX(110%);
  transition: transform var(--t-slow);
  z-index: 40;
  display: flex;
  flex-direction: column;
}
.drawer.open {
  transform: translateX(0);
}
.drawer-head {
  padding: 22px 24px 18px;
  border-bottom: 1px solid var(--line-2);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.drawer-title {
  font-family: 'Noto Serif Thai', serif;
  font-weight: 700;
  font-size: 22px;
  letter-spacing: -0.01em;
  color: var(--ink-1);
  line-height: 1.2;
}
.drawer-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--ink-3);
  margin-top: 6px;
}
.drawer-close {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--ink-3);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  line-height: 1;
  transition: all var(--t-fast);
  flex: none;
}
.drawer-close:hover {
  color: var(--ink-1);
  border-color: var(--ink-1);
}
.drawer-body {
  padding: 0;
  overflow-y: auto;
  flex: 1;
}
.drawer-summary {
  padding: 18px 24px;
  border-bottom: 1px solid var(--line-2);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.dstat .l {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--ink-3);
  margin-bottom: 6px;
}
.dstat .v {
  font-family: 'Fraunces', serif;
  font-variation-settings: 'opsz' 96;
  font-weight: 700;
  font-size: 30px;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--ink-1);
  font-variant-numeric: tabular-nums;
}
.dstat .v .u {
  font-family: 'Noto Sans Thai', sans-serif;
  font-size: 12px;
  color: var(--ink-3);
  font-weight: 400;
  letter-spacing: 0;
  margin-left: 4px;
}
.sparkline-wrap {
  padding: 14px 24px;
  border-bottom: 1px solid var(--line-2);
}
.sparkline-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--ink-3);
  margin-bottom: 8px;
}
.drawer-feed-head {
  padding: 14px 24px 6px;
}
.sparkline {
  width: 100%;
  height: 90px;
}
.drawer-feed {
  padding: 14px 0;
}
.drawer-feed > .entry {
  padding: 9px 24px;
  grid-template-columns: 50px 44px 1fr auto;
}
.drawer-feed > .entry::before {
  display: none;
}

@media (max-width: 640px) {
  .drawer {
    width: 100vw;
    max-width: none;
  }
  .drawer-head {
    padding: 18px 18px 14px;
    padding-top: max(18px, env(safe-area-inset-top));
  }
  .drawer-title {
    font-size: 19px;
  }
  .drawer-summary {
    padding: 14px 18px;
    gap: 10px;
  }
  .dstat .v {
    font-size: 26px;
  }
  .sparkline-wrap {
    padding: 12px 18px;
  }
  .sparkline {
    height: 80px;
  }
  .drawer-feed > .entry {
    padding: 10px 18px;
  }
  .drawer-close {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
}
</style>
