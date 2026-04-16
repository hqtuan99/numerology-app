import data from '../data/book-interpretations.json'

// Find one entry by type + number
export function getInterpretation(type, number) {
  if (number === null || number === undefined) {
    return data.find(d => d.type === type) ?? null
  }
  return data.find(d =>
    d.type === type && String(d.number) === String(number)
  ) ?? null
}

// Reduce a day number to single digit (1-9) for birth_day lookup
// e.g. day=10 → 1, day=22 → "22/4" (special case)
export function getBirthDayKey(day) {
  if (day === 22) return '22/4'
  let n = Number(day)
  while (n > 9) n = String(n).split('').reduce((a, d) => a + Number(d), 0)
  return n
}

// Arrow lookup helpers — call these after computing the birth chart
// arrowKey examples: "1-5-9", "3-6-9", "4-5-6"
export function getArrowInterpretation(arrowKey, isEmpty) {
  const type = isEmpty ? 'arrow_empty' : 'arrow'
  return data.find(d => d.type === type && d.number === arrowKey) ?? null
}
