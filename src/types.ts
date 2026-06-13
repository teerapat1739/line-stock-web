// Shared types across the dashboard.

export type ActionKind = 'in' | 'out' | 'adj' | 'meta_edit' | 'meta_void'
export type EntryStatus = 'active' | 'edited' | 'voided'

export interface Item {
  name: string
  current_qty: number
  default_unit: string | null
  total_cost: number
  unit_cost: number | null
  low_threshold: number | null
  is_low: boolean
  last_updated: string
}

export interface EntryDetails {
  total_price?: number
  unit_cost?: number
  unit_size?: number
  unit_size_unit?: string
  unit_price?: number
  price_per?: string
  currency?: string
  pack_size?: number
  pack_size_unit?: string
  total_weight?: number
  computed_from?: string
  imported_kind?: string
  [k: string]: unknown
}

export interface Entry {
  id: string
  created_at: string
  action: ActionKind
  qty: number
  unit: string
  status: EntryStatus
  details: EntryDetails | null
  by_user_id: string
  items: { name: string; default_unit: string | null } | null
  users: { display_name: string | null } | null
  // computed
  _name: string
  _by: string
}

export interface ItemActivity {
  inQty: number
  outQty: number
  count: number
  net: number
}

export interface HeatmapTile extends Item {
  activity: ItemActivity
  value: number
  x: number
  y: number
  w: number
  h: number
}

export interface AdminLlmSummary {
  total_calls: number
  errored_calls: number
  total_input_tokens: number
  total_output_tokens: number
  total_cache_read_tokens: number
  avg_latency_ms: number
  estimated_cost_usd: number
  estimated_cost_thb: number
}

export interface AdminUserRow {
  line_user_id: string
  display_name: string | null
  role: string
  entries_count: number
  last_active: string | null
}

export interface AdminDailyRow {
  day: string
  records: number
  in_qty: number
  out_qty: number
  in_value: number
  out_value: number
}

export type Theme = 'light' | 'dark'
