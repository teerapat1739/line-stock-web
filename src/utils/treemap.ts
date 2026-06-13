// Squarified treemap algorithm (Bruls et al.)
// Returns rectangles with x,y,w,h sized proportional to each item's `value`.

export interface TreemapItem {
  value: number
}

export type Rect<T> = T & {
  x: number
  y: number
  w: number
  h: number
}

export function squarify<T extends TreemapItem>(
  items: T[],
  x: number,
  y: number,
  w: number,
  h: number,
): Rect<T>[] {
  if (!items.length) return []
  if (items.length === 1) return [{ ...items[0], x, y, w, h }]
  const sum = items.reduce((s, i) => s + i.value, 0) || 1
  const scale = (w * h) / sum
  const result: Rect<T>[] = []
  let remaining = items.slice()
  let curX = x,
    curY = y,
    curW = w,
    curH = h

  while (remaining.length) {
    const horizontal = curW < curH
    const side = horizontal ? curW : curH
    let row: T[] = []
    let bestWorst = Infinity
    for (let i = 0; i < remaining.length; i++) {
      const cand = row.concat([remaining[i]])
      const worst = worstAspect(cand, side, scale)
      if (row.length > 0 && worst > bestWorst) break
      row = cand
      bestWorst = worst
    }
    const rowSum = row.reduce((s, i) => s + i.value, 0)
    const thick = (rowSum * scale) / side
    let pos = 0
    for (const it of row) {
      const len = (it.value * scale) / thick
      if (horizontal) result.push({ ...it, x: curX + pos, y: curY, w: len, h: thick })
      else result.push({ ...it, x: curX, y: curY + pos, w: thick, h: len })
      pos += len
    }
    if (horizontal) {
      curY += thick
      curH -= thick
    } else {
      curX += thick
      curW -= thick
    }
    remaining = remaining.slice(row.length)
  }
  return result
}

function worstAspect<T extends TreemapItem>(row: T[], side: number, scale: number): number {
  const sum = row.reduce((s, i) => s + i.value, 0)
  const thick = (sum * scale) / side
  let worst = 0
  for (const it of row) {
    const len = (it.value * scale) / thick
    if (len === 0) continue
    const r = Math.max(thick / len, len / thick)
    if (r > worst) worst = r
  }
  return worst
}
