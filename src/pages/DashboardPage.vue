<script setup lang="ts">
import { ref } from 'vue'
import { useStockData } from '../composables/useStockData'
import { useAdmin } from '../composables/useAdmin'
import KpiStrip from '../components/KpiStrip.vue'
import Heatmap from '../components/Heatmap.vue'
import StockTable from '../components/StockTable.vue'
import ActivityFeed from '../components/ActivityFeed.vue'
import CostBurnPanel from '../components/CostBurnPanel.vue'
import DrillDownDrawer from '../components/DrillDownDrawer.vue'
import AdminPanel from '../components/AdminPanel.vue'

const { items, entries, newEntryName } = useStockData()
const { restoreIfPossible } = useAdmin()

const active = ref<string | null>(null)
const onPick = (name: string) => {
  active.value = name
}
const onClose = () => {
  active.value = null
}

restoreIfPossible()
</script>

<template>
  <KpiStrip :items="items" :entries="entries" />

  <div class="row row-a">
    <Heatmap :items="items" :entries="entries" :pulse-name="newEntryName" @pick="onPick" />
    <CostBurnPanel :entries="entries" @pick="onPick" />
  </div>

  <div class="row row-b">
    <StockTable :items="items" @pick="onPick" />
    <ActivityFeed :entries="entries" @pick="onPick" />
  </div>

  <AdminPanel />

  <DrillDownDrawer
    :items="items"
    :entries="entries"
    :active="active"
    @close="onClose"
  />
</template>

<style scoped>
.row {
  display: grid;
  gap: 20px;
}
.row-a {
  grid-template-columns: 1.5fr 1fr;
  margin-bottom: 20px;
}
.row-b {
  grid-template-columns: 1.5fr 1fr;
}
@media (max-width: 980px) {
  .row-a,
  .row-b {
    grid-template-columns: 1fr;
  }
}
</style>
