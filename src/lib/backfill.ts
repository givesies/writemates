export type BackfillEntry = { date: string; delta: number }

function toUTCDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
}

function parseDate(raw: string): Date | null {
  const trimmed = raw.trim()

  const numMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (numMatch) {
    const day = parseInt(numMatch[1], 10)
    const month = parseInt(numMatch[2], 10)
    const year = parseInt(numMatch[3], 10)
    const d = new Date(Date.UTC(year, month - 1, day))
    if (!isNaN(d.getTime())) return d
  }

  const native = new Date(trimmed)
  if (!isNaN(native.getTime())) return toUTCDateOnly(native)

  const withYear = new Date(`${trimmed} ${new Date().getFullYear()}`)
  if (!isNaN(withYear.getTime())) return toUTCDateOnly(withYear)

  return null
}

function splitDateAndCount(line: string): [string, string] | null {
  // Prefer a tab, since that's what pasting from Scrivener/Excel/Numbers uses —
  // this way, commas inside the number itself (like 12,751) are left alone
  if (line.includes('\t')) {
    const idx = line.indexOf('\t')
    return [line.slice(0, idx), line.slice(idx + 1)]
  }
  // Next, a run of multiple spaces (another common column separator)
  const spaceMatch = line.match(/\s{2,}/)
  if (spaceMatch && spaceMatch.index !== undefined) {
    return [line.slice(0, spaceMatch.index), line.slice(spaceMatch.index + spaceMatch[0].length)]
  }
  // Last resort: a single comma, like "Sep 1, 500" — split only at the FIRST
  // comma, so a thousands separator later in the number isn't treated as a break
  const commaIdx = line.indexOf(',')
  if (commaIdx !== -1) {
    return [line.slice(0, commaIdx), line.slice(commaIdx + 1)]
  }
  return null
}

export function parseBackfillText(text: string): BackfillEntry[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const results: BackfillEntry[] = []

  for (const line of lines) {
    const split = splitDateAndCount(line)
    if (!split) continue

    const [datePart, countPart] = split
    const date = parseDate(datePart.trim())
    if (!date) continue

    const delta = parseInt(countPart.trim().replace(/,/g, ''), 10)
    if (isNaN(delta)) continue

    results.push({ date: date.toISOString().split('T')[0], delta })
  }

  const byDate = new Map<string, number>()
  for (const r of results) {
    byDate.set(r.date, (byDate.get(r.date) || 0) + r.delta)
  }

  return Array.from(byDate.entries())
    .map(([date, delta]) => ({ date, delta }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
}
