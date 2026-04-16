// ─── Basic reducers ───────────────────────────────────────────────────────────

/** Reduce any integer to a single digit 1-9 by repeatedly summing digits. */
export function reduceToSingle(n) {
  n = Math.abs(Math.floor(n))
  while (n > 9) {
    n = String(n).split('').reduce((s, d) => s + Number(d), 0)
  }
  return n
}

/**
 * Life-path reducer: stop at 2–11 (master range) or return "22/4".
 * In practice never produces 1 because sums ≥ 2 for any real date.
 */
export function reduceToLifePath(n) {
  if (n === 22) return '22/4'
  if (n >= 2 && n <= 11) return n
  const next = String(n).split('').reduce((s, d) => s + Number(d), 0)
  return reduceToLifePath(next)
}

// ─── Core calculations ────────────────────────────────────────────────────────

/**
 * Life-path number: sum ALL individual digits of dd + mm + yyyy, then reduce.
 * Example: 10/02/1999 → 1+0+0+2+1+9+9+9 = 31 → 4
 */
export function getLifePathNumber(day, month, year) {
  const s =
    String(day).padStart(2, '0') +
    String(month).padStart(2, '0') +
    String(year)
  const sum = s.split('').reduce((a, d) => a + Number(d), 0)
  return reduceToLifePath(sum)
}

/**
 * Birth chart: count occurrences of digits 1-9 in the full date string
 * formatted as dd/mm/yyyy (leading zeros included, zeros themselves ignored).
 */
export function getBirthChart(day, month, year) {
  const s =
    String(day).padStart(2, '0') +
    String(month).padStart(2, '0') +
    String(year)
  const chart = emptyChart()
  for (const ch of s) {
    const n = Number(ch)
    if (n >= 1 && n <= 9) chart[n]++
  }
  return chart
}

// ─── Letter map (Pythagorean) ─────────────────────────────────────────────────

const PYTH_ROWS = [
  ['A', 'J', 'S'],
  ['B', 'K', 'T'],
  ['C', 'L', 'U'],
  ['D', 'M', 'V'],
  ['E', 'N', 'W'],
  ['F', 'O', 'X'],
  ['G', 'P', 'Y'],
  ['H', 'Q', 'Z'],
  ['I', 'R'],
]
export const LETTER_MAP = {}
PYTH_ROWS.forEach((letters, i) => letters.forEach(l => { LETTER_MAP[l] = i + 1 }))

// ─── Vietnamese diacritic removal ─────────────────────────────────────────────

export function removeDiacritics(str) {
  // Handle Đ/đ first (not covered by NFD decomposition alone)
  str = str.replace(/Đ/g, 'D').replace(/đ/g, 'd')
  // NFD decomposes accented chars → strip combining diacritical marks
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// ─── Name chart ───────────────────────────────────────────────────────────────

/** Map a name string to a digit-count chart using the Pythagorean system. */
export function getNameChart(nameString) {
  if (!nameString?.trim()) return emptyChart()
  const cleaned = removeDiacritics(nameString).toUpperCase().replace(/[^A-Z]/g, '')
  const chart = emptyChart()
  for (const ch of cleaned) {
    const n = LETTER_MAP[ch]
    if (n) chart[n]++
  }
  return chart
}

// ─── Combine charts ───────────────────────────────────────────────────────────

export function getCombinedChart(a, b) {
  return Object.fromEntries(
    [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => [n, (a[n] || 0) + (b[n] || 0)])
  )
}

// ─── Four peaks ───────────────────────────────────────────────────────────────

/**
 * reducePeak: peaks 3 & 4 may stay at 10 or 11; only reduce if ≥ 12.
 */
function reducePeak(n) {
  return n <= 11 ? n : reduceToSingle(n)
}

export function getFourPeaks(day, month, year, lifePath) {
  const day_r = reduceToSingle(day)
  const month_r = reduceToSingle(month)
  // Year: sum ALL year digits first, then reduce
  const yearDigitSum = String(year).split('').reduce((a, d) => a + Number(d), 0)
  const year_r = reduceToSingle(yearDigitSum)

  const peak1 = reduceToSingle(month_r + day_r)
  const peak2 = reduceToSingle(day_r + year_r)
  const peak3 = reducePeak(peak1 + peak2)
  const peak4 = reducePeak(month_r + year_r)

  const lifePathNum = typeof lifePath === 'string' ? 4 : lifePath // "22/4" → 4
  const age1 = 36 - lifePathNum
  const age2 = age1 + 9
  const age3 = age2 + 9
  const age4 = age3 + 9

  return {
    bases: { month: month_r, day: day_r, year: year_r },
    peaks: [
      { peak: peak1, age: age1 },
      { peak: peak2, age: age2 },
      { peak: peak3, age: age3 },
      { peak: peak4, age: age4 },
    ],
  }
}

// ─── Personal year ────────────────────────────────────────────────────────────

export function getPersonalYear(day, month, targetYear) {
  const WYN = reduceToSingle(
    String(targetYear).split('').reduce((a, d) => a + Number(d), 0)
  )
  const day_r = reduceToSingle(day)
  const month_r = reduceToSingle(month)
  return reduceToSingle(WYN + day_r + month_r)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyChart() {
  return Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => [n, 0]))
}
