import { ref, watch } from 'vue'
import type { Theme } from '../types'

const KEY = 'stockyard-theme'

function initial(): Theme {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* ignore */
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

const theme = ref<Theme>(initial())
document.documentElement.setAttribute('data-theme', theme.value)
watch(theme, (t) => {
  document.documentElement.setAttribute('data-theme', t)
  try {
    localStorage.setItem(KEY, t)
  } catch {
    /* ignore */
  }
})

export function useTheme() {
  return {
    theme,
    toggle: () => {
      theme.value = theme.value === 'dark' ? 'light' : 'dark'
    },
  }
}
