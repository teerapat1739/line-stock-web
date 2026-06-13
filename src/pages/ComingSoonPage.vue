<script setup lang="ts">
defineProps<{ title: string; subtitle: string; bullets: string[] }>()
</script>

<template>
  <div class="cs panel">
    <div class="cs-body">
      <div class="cs-illu">coming soon</div>
      <h1 class="cs-title">{{ title }}</h1>
      <p class="cs-sub">{{ subtitle }}</p>
      <ul class="cs-list">
        <li v-for="b in bullets" :key="b">{{ b }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.cs {
  padding: 60px 40px;
  text-align: center;
}
.cs-illu {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-variation-settings: 'opsz' 144;
  font-size: 48px;
  color: var(--muted-2);
  letter-spacing: -0.02em;
  margin-bottom: 24px;
}
.cs-title {
  font-family: 'Noto Serif Thai', serif;
  font-weight: 700;
  font-size: 28px;
  color: var(--ink-1);
  margin-bottom: 8px;
}
.cs-sub {
  font-family: 'Noto Sans Thai', sans-serif;
  font-size: 14.5px;
  color: var(--ink-3);
  margin-bottom: 24px;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}
.cs-list {
  text-align: left;
  max-width: 360px;
  margin: 0 auto;
  font-size: 14px;
  color: var(--ink-2);
  font-family: 'Noto Sans Thai', sans-serif;
  list-style: none;
  padding: 0;
}
.cs-list li {
  padding: 9px 0;
  border-bottom: 1px dashed var(--line);
  position: relative;
  padding-left: 24px;
}
.cs-list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--gold);
  font-family: 'JetBrains Mono', monospace;
}
.cs-list li:last-child {
  border-bottom: 0;
}
</style>
