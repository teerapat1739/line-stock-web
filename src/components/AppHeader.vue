<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useAdmin } from '../composables/useAdmin'
import { useStockData } from '../composables/useStockData'
import AdminModal from './AdminModal.vue'

const { theme, toggle: toggleTheme } = useTheme()
const { isUnlocked, lock } = useAdmin()
const { isConnected, lastSync } = useStockData()

const modalOpen = ref(false)
const route = useRoute()

const syncText = computed(() => {
  if (!lastSync.value) return '—'
  return lastSync.value.toLocaleTimeString('th-TH', { hour12: false })
})

setInterval(() => {
  // re-compute syncText every second by touching value (no-op trigger)
  // (Vue auto-tracks; we just keep lastSync ticking)
}, 1000)

function onAdminClick() {
  if (isUnlocked.value) {
    lock()
    return
  }
  modalOpen.value = true
}

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/items', label: 'Items' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
]
</script>

<template>
  <header class="hdr">
    <div class="brand">
      <div class="markdot" aria-hidden="true"></div>
      <div>
        <div class="brand-word">STOCKYARD<em>·</em></div>
        <div class="brand-sub">
          <b>บันทึกสต็อค</b> · LINE Bot Dashboard · live realtime
        </div>
      </div>
    </div>

    <div class="head-right">
      <div class="hbtns">
        <button
          class="admin-toggle"
          :class="{ on: isUnlocked }"
          @click="onAdminClick"
        >
          <span class="dot"></span>
          <span>admin</span>
        </button>
        <button class="theme-toggle" @click="toggleTheme">
          <span class="tt-icon"></span>
          <span>{{ theme }}</span>
        </button>
      </div>
      <div class="status-row" :class="{ off: !isConnected }">
        <span class="status-dot"></span>
        <span>{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
      </div>
      <div class="sync-line">SYNC · {{ syncText }}</div>
      <a class="docs-nav" href="/line-stock-web/chat.html">← chat demo</a>
    </div>
  </header>

  <nav class="app-nav">
    <RouterLink
      v-for="n in navItems"
      :key="n.to"
      :to="n.to"
      class="nav-item"
      :class="{ active: route.path === n.to || (n.to === '/' && route.path === '/') }"
    >
      {{ n.label }}
    </RouterLink>
  </nav>

  <AdminModal :open="modalOpen" @close="modalOpen = false" />
</template>

<style scoped>
.hdr {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 14px 0 22px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 18px;
}
.brand {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.markdot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--line-green);
  margin-top: 14px;
  flex: none;
  animation: beat 2.2s ease-in-out infinite;
}
.brand-word {
  font-family: 'Fraunces', serif;
  font-variation-settings: 'opsz' 144;
  font-weight: 900;
  font-size: 30px;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--ink-1);
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.brand-word em {
  font-style: italic;
  font-variation-settings: 'opsz' 144;
  font-weight: 500;
  color: var(--gold-2);
  font-size: 0.7em;
}
.brand-sub {
  font-family: 'Noto Sans Thai', sans-serif;
  font-size: 12.5px;
  color: var(--ink-3);
  margin-top: 6px;
  letter-spacing: 0.01em;
}
.brand-sub b {
  color: var(--ink-2);
  font-weight: 600;
}

.head-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.14em;
}
.hbtns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--line-green);
  box-shadow: 0 0 8px var(--line-green-glow);
}
.status-row.off .status-dot {
  background: var(--coral);
  box-shadow: 0 0 8px var(--coral-glow);
}
.sync-line {
  color: var(--muted);
}
.docs-nav {
  color: var(--ink-3);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border var(--t-fast), color var(--t-fast);
}
.docs-nav:hover {
  border-color: var(--ink-2);
  color: var(--ink-2);
}

.admin-toggle,
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--ink-3);
  padding: 5px 10px;
  border-radius: 999px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 500;
  transition: all var(--t-fast);
}
.admin-toggle:hover,
.theme-toggle:hover {
  color: var(--ink-1);
  border-color: var(--ink-3);
  background: var(--surface);
}
.admin-toggle.on {
  background: var(--gold);
  color: var(--surface);
  border-color: var(--gold);
}
.admin-toggle .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--muted);
}
.admin-toggle.on .dot {
  background: var(--surface);
  box-shadow: 0 0 6px var(--surface);
}
.theme-toggle .tt-icon {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, var(--gold-2), var(--gold));
}
:root[data-theme='dark'] .theme-toggle .tt-icon {
  background: radial-gradient(circle at 30% 30%, var(--ink-1), transparent 70%), var(--bg);
  box-shadow: inset -2px -2px 0 var(--ink-1);
}

.app-nav {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 24px;
  overflow-x: auto;
  scrollbar-width: none;
}
.app-nav::-webkit-scrollbar {
  display: none;
}
.nav-item {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-weight: 500;
  padding: 10px 14px;
  color: var(--ink-3);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  white-space: nowrap;
  transition: color var(--t-fast), border-color var(--t-fast);
}
.nav-item:hover {
  color: var(--ink-1);
}
.nav-item.active {
  color: var(--ink-1);
  border-bottom-color: var(--gold);
}

@media (max-width: 640px) {
  .hdr {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    padding: 8px 0 16px;
    margin-bottom: 14px;
  }
  .brand-word {
    font-size: 24px;
  }
  .brand-sub {
    font-size: 11.5px;
  }
  .head-right {
    align-items: flex-start;
    font-size: 10.5px;
  }
  .app-nav {
    margin-bottom: 18px;
  }
  .nav-item {
    padding: 10px 12px;
  }
}
@media (max-width: 380px) {
  .brand-word {
    font-size: 22px;
  }
}
</style>
