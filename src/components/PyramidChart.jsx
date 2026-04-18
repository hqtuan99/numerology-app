import { useState, useEffect } from 'react'

// ─── Node positions (centres) ─────────────────────────────────────────────────
// Shifted down to give more vertical room between peaks
const N = {
  month: { x: 80,  y: 285 },
  day:   { x: 220, y: 285 },
  year:  { x: 360, y: 285 },
  p1:    { x: 150, y: 205 },
  p2:    { x: 290, y: 205 },
  p3:    { x: 220, y: 130 },
  p4:    { x: 220, y: 52  },
}

function lineLen(a, b) {
  return Math.hypot(N[b].x - N[a].x, N[b].y - N[a].y)
}

const MAIN_LINES = [
  { a: 'month', b: 'p1', delay: 0.0 },
  { a: 'day',   b: 'p1', delay: 0.1 },
  { a: 'day',   b: 'p2', delay: 0.2 },
  { a: 'year',  b: 'p2', delay: 0.3 },
  { a: 'p1',    b: 'p3', delay: 0.4 },
  { a: 'p2',    b: 'p3', delay: 0.5 },
  { a: 'p3',    b: 'p4', delay: 0.6 },
]

const DASHED_LINES = [
  { a: 'month', b: 'p4' },
  { a: 'year',  b: 'p4' },
]

// ─── SVG node renderers ───────────────────────────────────────────────────────

function BaseNode({ cx, cy, label, value }) {
  const w = 60, h = 44, rx = 8
  return (
    <g>
      <rect x={cx - w/2} y={cy - h/2} width={w} height={h} rx={rx}
        fill="#f0f3f9" stroke="#e4e8f0" strokeWidth="1" />
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="9"
        fill="#b0bac9" fontFamily="'Inter', sans-serif">{label}</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize="15"
        fill="#64748b" fontWeight="600"
        fontFamily="'Inter', sans-serif">{value}</text>
    </g>
  )
}

function PeakNode({ cx, cy, index, peak, age, year, isFour }) {
  // h=72 → box spans cy-36 to cy+36 → all text fits inside
  const w = isFour ? 86 : 76
  const h = 72
  const rx = 10
  const borderColor = isFour ? '#6366f1' : '#a5b4fc'
  const borderW     = isFour ? 2 : 1
  const bgColor     = isFour ? '#eef2ff' : '#ffffff'
  const numColor    = isFour ? '#4338ca' : '#6366f1'

  return (
    <g>
      <rect x={cx - w/2} y={cy - h/2} width={w} height={h} rx={rx}
        fill={bgColor} stroke={borderColor} strokeWidth={borderW} />
      {/* Đỉnh label */}
      <text x={cx} y={cy - 23} textAnchor="middle" fontSize="9"
        fill="#b0bac9" fontFamily="'Inter', sans-serif">
        Đỉnh {index}
      </text>
      {/* Big number */}
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="28"
        fill={numColor} fontWeight="700"
        fontFamily="'DM Serif Display', serif">{peak}</text>
      {/* Age */}
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize="10"
        fill="#1e293b" fontWeight="500" fontFamily="'Inter', sans-serif">
        {age} tuổi
      </text>
      {/* Year — inside box (cy+32 < cy+36) */}
      <text x={cx} y={cy + 33} textAnchor="middle" fontSize="9"
        fill="#6366f1" fontFamily="'Inter', sans-serif">
        {year}
      </text>
    </g>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PyramidChart({ peaksData, birthYear }) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80)
    return () => clearTimeout(t)
  }, [])

  const { bases, peaks } = peaksData

  return (
    <div className="pyramid-wrapper">
    <svg
      viewBox="0 0 440 330"
      style={{ width: '100%', display: 'block' }}
      aria-label="Sơ đồ bốn đỉnh cao"
    >
      {/* ── Dashed outer lines ── */}
      {DASHED_LINES.map(({ a, b }) => (
        <line key={`${a}-${b}`}
          x1={N[a].x} y1={N[a].y} x2={N[b].x} y2={N[b].y}
          stroke="#6366f1" strokeWidth="1" opacity="0.2"
          strokeDasharray="4 4" />
      ))}

      {/* ── Animated solid lines ── */}
      {MAIN_LINES.map(({ a, b, delay }) => {
        const len = lineLen(a, b)
        return (
          <line key={`${a}-${b}`}
            x1={N[a].x} y1={N[a].y} x2={N[b].x} y2={N[b].y}
            stroke="#6366f1" strokeWidth="1.5" opacity="0.3"
            strokeDasharray={String(len)}
            strokeDashoffset={animated ? 0 : len}
            style={{ transition: `stroke-dashoffset 1s ease ${delay}s` }}
          />
        )
      })}

      {/* ── Base nodes ── */}
      <BaseNode cx={N.month.x} cy={N.month.y} label="Tháng" value={bases.month} />
      <BaseNode cx={N.day.x}   cy={N.day.y}   label="Ngày"  value={bases.day}   />
      <BaseNode cx={N.year.x}  cy={N.year.y}  label="Năm"   value={bases.year}  />

      {/* ── Peak nodes ── */}
      <PeakNode cx={N.p1.x} cy={N.p1.y} index={1}
        peak={peaks[0].peak} age={peaks[0].age} year={birthYear + peaks[0].age} />
      <PeakNode cx={N.p2.x} cy={N.p2.y} index={2}
        peak={peaks[1].peak} age={peaks[1].age} year={birthYear + peaks[1].age} />
      <PeakNode cx={N.p3.x} cy={N.p3.y} index={3}
        peak={peaks[2].peak} age={peaks[2].age} year={birthYear + peaks[2].age} />
      <PeakNode cx={N.p4.x} cy={N.p4.y} index={4} isFour
        peak={peaks[3].peak} age={peaks[3].age} year={birthYear + peaks[3].age} />
    </svg>
    </div>
  )
}
