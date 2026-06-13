<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { squarify, type Rect } from '../utils/treemap'
import type { Item, Entry, ItemActivity } from '../types'
import { useTheme } from '../composables/useTheme'
import { fmtQty, fmtMoney } from '../format'

type TileData = Item & { value: number; activity: ItemActivity }
type Tile = Rect<TileData>

const props = defineProps<{ items: Item[]; entries: Entry[]; pulseName: string | null }>()
const emit = defineEmits<{ (e: 'pick', name: string): void }>()

const { theme } = useTheme()
const wrap = ref<HTMLDivElement | null>(null)
const tiles = ref<Tile[]>([])
const flashSet = ref<Set<string>>(new Set())

const tip = ref({ show: false, x: 0, y: 0, item: null as Tile | null })

function itemActivity(name: string): ItemActivity {
  const cutoff = Date.now() - 7 * 86400 * 1000
  let inQty = 0,
    outQty = 0,
    count = 0
  for (const e of props.entries) {
    if (e._name !== name || e.status === 'voided') continue
    if (new Date(e.created_at).getTime() < cutoff) continue
    count++
    const q = Number(e.qty || 0)
    if (e.action === 'in') inQty += q
    else if (e.action === 'out') outQty += q
  }
  return { inQty, outQty, count, net: inQty - outQty }
}

function compute() {
  if (!wrap.value) return
  const data: TileData[] = props.items
    .map((i) => ({ ...i, activity: itemActivity(i.name), value: Math.max(Number(i.total_cost || 0), 1) }))
    .filter((d) => Number(d.current_qty || 0) > 0 || d.activity.count > 0)
    .sort((a, b) => b.value - a.value)
  const W = wrap.value.clientWidth
  const H = wrap.value.clientHeight
  tiles.value = squarify(data, 0, 0, W, H)
}

function toneColor(activity: ItemActivity, max: number, isDark: boolean) {
  if (activity.count === 0)
    return isDark
      ? { fill: '#1e242e', stroke: '#181d25', text: '#8a8270' }
      : { fill: '#ece2c8', stroke: '#dccfae', text: '#6b6354' }
  const net = activity.net
  const intensity = Math.min(1, Math.abs(net) / (max || 1))
  if (net < 0) {
    const a = 0.32 + intensity * 0.55
    return isDark
      ? { fill: `linear-gradient(135deg, rgba(127,42,42,${a}) 0%, rgba(255,107,107,${a * 0.9}) 100%)`, stroke: '#3a1f1f', text: '#ffe0e0' }
      : { fill: `linear-gradient(135deg, rgba(214,105,94,${a}) 0%, rgba(200,62,62,${a * 0.95}) 100%)`, stroke: '#a64646', text: '#fff5f3' }
  }
  if (net > 0) {
    const a = 0.32 + intensity * 0.55
    return isDark
      ? { fill: `linear-gradient(135deg, rgba(12,94,52,${a}) 0%, rgba(61,220,124,${a * 0.85}) 100%)`, stroke: '#1a3725', text: '#d8f5e3' }
      : { fill: `linear-gradient(135deg, rgba(127,201,156,${a}) 0%, rgba(4,168,71,${a * 0.85}) 100%)`, stroke: '#1e6b3a', text: '#f5fbef' }
  }
  return isDark
    ? { fill: 'rgba(212,164,55,.18)', stroke: '#332a17', text: '#e8d49a' }
    : { fill: 'rgba(176,142,42,.18)', stroke: '#8a6f1d', text: '#5c4810' }
}

const maxAbsNet = computed(() => Math.max(1, ...tiles.value.map((t) => Math.abs(t.activity.net))))

const isDark = computed(() => theme.value === 'dark')

function tileStyle(t: Tile) {
  const tone = toneColor(t.activity, maxAbsNet.value, isDark.value)
  return {
    left: `${t.x}px`,
    top: `${t.y}px`,
    width: `${Math.max(0, t.w - 2)}px`,
    height: `${Math.max(0, t.h - 2)}px`,
    background: tone.fill,
    borderColor: tone.stroke,
    color: tone.text,
  }
}

function tileClass(t: Tile) {
  return {
    small: t.w < 110 || t.h < 56,
    tiny: t.w < 60 || t.h < 36,
    flash: flashSet.value.has(t.name),
  }
}

function showTip(e: MouseEvent, t: Tile) {
  tip.value = { show: true, x: e.clientX, y: e.clientY, item: t }
}
function moveTip(e: MouseEvent) {
  if (tip.value.show) {
    tip.value.x = e.clientX
    tip.value.y = e.clientY
  }
}
function hideTip() {
  tip.value.show = false
}

const tipStyle = computed(() => {
  const pad = 16
  const tw = 240
  const th = 110
  let x = tip.value.x + pad
  let y = tip.value.y + pad
  if (x + tw + pad > innerWidth) x = tip.value.x - tw - pad
  if (y + th + pad > innerHeight) y = tip.value.y - th - pad
  return { left: x + 'px', top: y + 'px' }
})

watch(() => [props.items, props.entries, theme.value], () => {
  nextTick(compute)
}, { deep: true })

watch(
  () => props.pulseName,
  (name) => {
    if (!name) return
    flashSet.value.add(name)
    setTimeout(() => flashSet.value.delete(name), 900)
  },
)

let resizeT: number | null = null
function onResize() {
  if (resizeT) clearTimeout(resizeT)
  resizeT = window.setTimeout(compute, 120)
}

onMounted(() => {
  nextTick(compute)
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div class="hm-card panel">
    <div class="panel-head">
      <div class="panel-title">แผนที่ความร้อนคลัง <em>· heat map</em></div>
      <div class="panel-meta">7-day activity</div>
    </div>
    <div class="panel-body">
      <div ref="wrap" class="heatmap-wrap">
        <div
          v-for="t in tiles"
          :key="t.name"
          class="heatmap-tile"
          :class="tileClass(t)"
          :style="tileStyle(t)"
          @mouseenter="(e) => showTip(e, t)"
          @mousemove="moveTip"
          @mouseleave="hideTip"
          @click="emit('pick', t.name)"
        >
          <div class="tn">{{ t.name }}</div>
          <div class="tq">{{ fmtQty(t.current_qty) }} {{ t.default_unit || '' }}</div>
        </div>
        <div v-if="!tiles.length" class="empty hm-empty">
          <div class="illu">— quiet —</div>
          <div class="ti">ยังไม่มีรายการในคลัง</div>
          <div class="lo">ส่งบันทึกเข้า LINE เพื่อเริ่ม</div>
        </div>
      </div>
      <div class="legend">
        <div class="legend-item"><span class="legend-swatch sw-out"></span>เบิกบ่อย</div>
        <div class="legend-item"><span class="legend-swatch sw-idle"></span>เฉย</div>
        <div class="legend-item"><span class="legend-swatch sw-in"></span>เพิ่งเติม</div>
        <div class="legend-item legend-caption">
          ขนาดตาม <b>มูลค่า</b>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="tip.show && tip.item" class="tip on" :style="tipStyle">
      <div class="t-name">{{ tip.item.name }}</div>
      <div class="t-row"><span>คงเหลือ</span><b>{{ fmtQty(tip.item.current_qty) }} {{ tip.item.default_unit || '' }}</b></div>
      <div class="t-row"><span>มูลค่า</span><b>{{ fmtMoney(tip.item.total_cost) }} ฿</b></div>
      <div
        class="t-row"
        :class="{ pos: tip.item.activity.net > 0, neg: tip.item.activity.net < 0 }"
      >
        <span>7 วัน</span>
        <b>{{ tip.item.activity.net > 0 ? '+' : '' }}{{ fmtQty(tip.item.activity.net) }} {{ tip.item.default_unit || '' }}</b>
      </div>
      <div class="t-row"><span>ครั้ง</span><b>{{ tip.item.activity.count }}</b></div>
    </div>
  </Teleport>
</template>

<style scoped>
.heatmap-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  background: var(--bg-2);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--line-2);
}
.hm-empty {
  position: absolute;
  inset: 0;
}
.heatmap-tile {
  position: absolute;
  border: 1px solid var(--surface);
  padding: 8px 11px;
  cursor: pointer;
  transition: transform var(--t-fast), filter var(--t-fast);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 2px;
}
.heatmap-tile.flash {
  animation: flash 900ms var(--ease);
}
@keyframes flash {
  0% {
    filter: brightness(1.4);
    box-shadow: 0 0 24px var(--line-green-glow);
  }
  100% {
    filter: brightness(1);
    box-shadow: 0 0 0 transparent;
  }
}
.heatmap-tile:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
  z-index: 2;
}
:root[data-theme='dark'] .heatmap-tile:hover {
  filter: brightness(1.15);
}
.heatmap-tile .tn {
  font-family: 'Noto Sans Thai', sans-serif;
  font-weight: 600;
  font-size: 12.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.heatmap-tile .tq {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  opacity: 0.85;
  font-variant-numeric: tabular-nums;
}
.heatmap-tile.small {
  padding: 4px 6px;
}
.heatmap-tile.small .tn {
  font-size: 10.5px;
}
.heatmap-tile.small .tq {
  display: none;
}
.heatmap-tile.tiny {
  padding: 2px;
}
.heatmap-tile.tiny .tn,
.heatmap-tile.tiny .tq {
  display: none;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 14px;
  font-size: 11.5px;
  color: var(--ink-3);
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
}
.legend-caption {
  margin-left: auto;
}
.legend-caption b {
  color: var(--ink-2);
  font-weight: 500;
}
.legend-swatch {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}
.sw-out {
  background: linear-gradient(135deg, #d6695e, #c83e3e);
}
.sw-in {
  background: linear-gradient(135deg, #7fc99c, #04a847);
}
.sw-idle {
  background: #cbc1a9;
}
:root[data-theme='dark'] .sw-out {
  background: linear-gradient(135deg, #7f2a2a, #ff6b6b);
}
:root[data-theme='dark'] .sw-in {
  background: linear-gradient(135deg, #0c5e34, #3ddc7c);
}
:root[data-theme='dark'] .sw-idle {
  background: #2a313d;
}

@media (max-width: 640px) {
  .heatmap-wrap {
    aspect-ratio: 5 / 6;
  }
  .legend {
    font-size: 10.5px;
    gap: 12px;
    margin-top: 12px;
  }
  .legend-caption {
    display: none;
  }
  .heatmap-tile:hover {
    transform: none;
  }
}
</style>

<style>
/* Tooltip is teleported to body, so use a global rule */
.tip {
  position: fixed;
  pointer-events: none;
  z-index: 50;
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 9px 12px;
  border-radius: 9px;
  font-size: 12px;
  box-shadow: var(--shadow-deep);
  opacity: 0;
  transform: translateY(4px);
  transition: opacity var(--t-fast), transform var(--t-fast);
  max-width: 240px;
}
.tip.on {
  opacity: 1;
  transform: translateY(0);
}
.tip .t-name {
  font-weight: 600;
  color: var(--ink-1);
  font-family: 'Noto Sans Thai', sans-serif;
  margin-bottom: 4px;
}
.tip .t-row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--ink-3);
}
.tip .t-row b {
  color: var(--ink-2);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.tip .t-row.pos b {
  color: var(--line-green);
}
.tip .t-row.neg b {
  color: var(--coral);
}
@media (max-width: 640px) {
  .tip {
    display: none;
  }
}
</style>
