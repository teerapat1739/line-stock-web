// Thai-locale formatters used everywhere in the UI.

const nf = new Intl.NumberFormat('th-TH')
const nf2 = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 })

export const fmtMoney = (n: number | null | undefined): string => nf2.format(Number(n || 0))

export const fmtQty = (q: number | null | undefined): string => {
  const n = Number(q)
  if (!isFinite(n)) return '—'
  return Number.isInteger(n) ? nf.format(n) : nf2.format(n)
}

export const fmtNumber = (n: number | null | undefined): string => nf.format(Number(n || 0))

export const fmtTime = (iso: string): string => {
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 45) return 'เมื่อสักครู่'
  if (diff < 3600) return Math.floor(diff / 60) + ' นาที'
  if (diff < 86400) return Math.floor(diff / 3600) + ' ชม.'
  if (diff < 86400 * 7) return Math.floor(diff / 86400) + ' วัน'
  return d.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })
}

export const fmtClock = (iso: string): string =>
  new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })

export const fmtDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })

export const fmtClockNow = (): string =>
  new Date().toLocaleTimeString('th-TH', { hour12: false })
