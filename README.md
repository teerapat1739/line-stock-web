# STOCKYARD — บันทึกสต็อค

Vue 3 + Vite + TypeScript dashboard for the LINE stock bot.
Read-only window onto the Supabase backend, deployed to GitHub Pages.

## Dev

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # → dist/
npm run preview      # serve the build locally
```

## Structure

```
src/
├─ main.ts                  # bootstrap
├─ App.vue                  # shell + RouterView
├─ router.ts                # 4 routes
├─ supabase.ts              # shared anon client
├─ types.ts                 # Item, Entry, …
├─ format.ts                # Thai-locale formatters
├─ utils/
│  └─ treemap.ts            # squarified treemap
├─ composables/
│  ├─ useTheme.ts           # light/dark + localStorage
│  ├─ useAdmin.ts           # passphrase-gated RPCs
│  └─ useStockData.ts       # realtime Supabase subscription
├─ pages/
│  ├─ DashboardPage.vue     # ← current view
│  ├─ ItemsPage.vue         # stub
│  ├─ ReportsPage.vue       # stub
│  └─ SettingsPage.vue      # stub
├─ components/
│  ├─ AppHeader.vue
│  ├─ KpiStrip.vue
│  ├─ Heatmap.vue
│  ├─ CostBurnPanel.vue
│  ├─ StockTable.vue
│  ├─ ActivityFeed.vue
│  ├─ EntryRow.vue
│  ├─ DrillDownDrawer.vue
│  ├─ AdminPanel.vue
│  └─ AdminModal.vue
└─ styles/
   ├─ tokens.css
   └─ base.css
```

## Deploy

Push to `main` → GitHub Actions runs `npm ci && npm run build`, copies index.html to 404.html for SPA routing, deploys to GitHub Pages.

The Pages source must be set to **"GitHub Actions"** (not branch). Run once:

```bash
gh api -X PUT /repos/teerapat1739/line-stock-web/pages -f build_type=workflow
```

## Adding a new screen

1. Create `src/pages/MyPage.vue`
2. Register the route in `src/router.ts`
3. Add to `navItems` in `src/components/AppHeader.vue`
