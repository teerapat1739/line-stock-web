<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
</script>

<template>
  <div class="frame">
    <AppHeader />
    <main>
      <RouterView />
    </main>
    <footer class="foot">
      STOCKYARD · A read-only window on your stock ledger ·
      <a href="https://pefsxeskrlfmhardceer.supabase.co" target="_blank" rel="noopener">supabase</a>
    </footer>
  </div>
</template>

<style scoped>
.foot {
  margin-top: 36px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--muted-2);
  text-transform: uppercase;
  letter-spacing: 0.2em;
}
.foot a {
  color: var(--ink-3);
  text-decoration: none;
  border-bottom: 1px solid var(--line);
}
.foot a:hover {
  color: var(--ink-2);
}
</style>
