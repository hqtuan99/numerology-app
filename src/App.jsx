import { useState, useEffect } from 'react'
import {
  getLifePathNumber,
  getBirthChart,
  getNameChart,
  getFourPeaks,
  getPersonalYear,
} from './lib/numerology'
import BookInsight from './components/BookInsight'
import { getInterpretation, getBirthDayKey } from './lib/bookLookup'

// ─── Constants ────────────────────────────────────────────────────────────────

const TODAY_YEAR = new Date().getFullYear()
const LS_KEY = 'nhan_so_hoc_saved'

// Grid renders top-left → bottom-right as: 3 6 9 / 2 5 8 / 1 4 7
const GRID_ORDER = [3, 6, 9, 2, 5, 8, 1, 4, 7]

const MONTHS_VI = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function splitName(fullName) {
  const words = fullName.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return { ho: '', tenLotTen: '' }
  return { ho: words[0], tenLotTen: words.slice(1).join(' ') }
}

// ─── Small components ─────────────────────────────────────────────────────────

function Dot({ color }) {
  const cls = {
    blue: 'bg-blue-500',
    amber: 'bg-amber-400',
    purple: 'bg-purple-500',
  }[color]
  return <span className={`block w-3 h-3 rounded-full ${cls} flex-shrink-0`} />
}

function ChartCell({ digit, blue, amber, purple, layer }) {
  const showAmber = layer >= 2 ? amber : 0
  const showPurple = layer >= 3 ? purple : 0
  const dots = [
    ...Array(blue).fill('blue'),
    ...Array(showAmber).fill('amber'),
    ...Array(showPurple).fill('purple'),
  ]
  const empty = dots.length === 0

  return (
    <div
      className={`relative min-h-[72px] rounded-xl border-2 flex items-center justify-center p-2
        ${empty
          ? 'border-dashed border-gray-200 bg-gray-50/60'
          : 'border-gray-200 bg-white shadow-sm'
        }`}
    >
      <span className="absolute top-0.5 right-1.5 text-[9px] font-bold text-gray-300 select-none">
        {digit}
      </span>
      <div className="flex flex-wrap justify-center gap-1 pt-2">
        {dots.map((c, i) => <Dot key={i} color={c} />)}
      </div>
    </div>
  )
}

function ChartGrid({ dateChart, nameChart, hoChart, layer }) {
  return (
    <div className="grid grid-cols-3 gap-2 w-[252px] mx-auto">
      {GRID_ORDER.map(d => (
        <ChartCell
          key={d}
          digit={d}
          blue={dateChart[d] || 0}
          amber={nameChart[d] || 0}
          purple={hoChart[d] || 0}
          layer={layer}
        />
      ))}
    </div>
  )
}

function PeakPyramid({ peaksData, birthYear }) {
  const { bases, peaks } = peaksData
  const W = 480
  const H = 300

  // Node centre positions
  const pos = {
    P3: { x: 240, y: 55,  r: 34 },
    P1: { x: 155, y: 162, r: 31 },
    P2: { x: 325, y: 162, r: 31 },
    M:  { x: 80,  y: 258, r: 27 },
    D:  { x: 240, y: 258, r: 27 },
    Y:  { x: 400, y: 258, r: 27 },
  }

  const edges = [['M','P1'],['D','P1'],['D','P2'],['Y','P2'],['P1','P3'],['P2','P3']]

  const baseNodes = [
    { key: 'M', label: 'Tháng', val: bases.month },
    { key: 'D', label: 'Ngày',  val: bases.day   },
    { key: 'Y', label: 'Năm',   val: bases.year  },
  ]

  const peakNodes = [
    { key: 'P1', peakIdx: 0, fill: '#fef3c7', stroke: '#f59e0b', labelClr: '#92400e', numClr: '#78350f' },
    { key: 'P2', peakIdx: 1, fill: '#fef3c7', stroke: '#f59e0b', labelClr: '#92400e', numClr: '#78350f' },
    { key: 'P3', peakIdx: 2, fill: '#ede9fe', stroke: '#8b5cf6', labelClr: '#5b21b6', numClr: '#4c1d95' },
  ]

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-lg mx-auto block"
        aria-label="Sơ đồ bốn đỉnh cao"
      >
        {/* Edges */}
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={pos[a].x} y1={pos[a].y}
            x2={pos[b].x} y2={pos[b].y}
            stroke="#e2e8f0" strokeWidth="2.5"
          />
        ))}

        {/* Base nodes */}
        {baseNodes.map(({ key, label, val }) => {
          const n = pos[key]
          return (
            <g key={key}>
              <circle cx={n.x} cy={n.y} r={n.r} fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
              <text x={n.x} y={n.y - 8} textAnchor="middle" fontSize="9" fill="#1d4ed8" fontWeight="600">
                {label}
              </text>
              <text x={n.x} y={n.y + 10} textAnchor="middle" fontSize="18" fontWeight="700" fill="#1e3a8a">
                {val}
              </text>
            </g>
          )
        })}

        {/* Peak nodes (1-3) */}
        {peakNodes.map(({ key, peakIdx, fill, stroke, labelClr, numClr }) => {
          const n = pos[key]
          const { peak, age } = peaks[peakIdx]
          const yr = birthYear + age
          return (
            <g key={key}>
              <circle cx={n.x} cy={n.y} r={n.r} fill={fill} stroke={stroke} strokeWidth="2" />
              <text x={n.x} y={n.y - 14} textAnchor="middle" fontSize="9" fill={labelClr} fontWeight="700">
                Đỉnh {peakIdx + 1}
              </text>
              <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="21" fontWeight="700" fill={numClr}>
                {peak}
              </text>
              <text x={n.x} y={n.y + 20} textAnchor="middle" fontSize="8.5" fill={labelClr}>
                t.{age} · {yr}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Peak 4 — displayed below as a card */}
      <div className="flex justify-center mt-2">
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl px-10 py-4 text-center">
          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest mb-1">
            Đỉnh 4
          </p>
          <p className="text-5xl font-bold text-emerald-800">{peaks[3].peak}</p>
          <p className="text-xs text-emerald-500 mt-1">
            tuổi {peaks[3].age} · {birthYear + peaks[3].age}
          </p>
        </div>
      </div>

      {/* Age legend */}
      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[10px] text-gray-400">
        {peaks.map(({ age }, i) => (
          <div key={i}>
            <span className="font-semibold text-gray-500">Đỉnh {i + 1}</span>
            <br />
            {i === 0 ? `0 – t.${age}` : `t.${peaks[i - 1].age} – t.${age}`}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [name, setName] = useState('')
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [results, setResults] = useState(null)
  const [activeLayer, setActiveLayer] = useState(1)
  const [saved, setSaved] = useState([])
  const [error, setError] = useState('')

  // Load saved people from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      setSaved(raw ? JSON.parse(raw) : [])
    } catch {
      setSaved([])
    }
  }, [])

  function persistSaved(list) {
    setSaved(list)
    localStorage.setItem(LS_KEY, JSON.stringify(list))
  }

  function savePerson() {
    if (!results) return
    const key = `${name}|${day}|${month}|${year}`
    if (saved.some(p => `${p.name}|${p.day}|${p.month}|${p.year}` === key)) return
    const updated = [{ id: Date.now(), name, day: +day, month: +month, year: +year }, ...saved].slice(0, 10)
    persistSaved(updated)
  }

  function deletePerson(id) {
    persistSaved(saved.filter(p => p.id !== id))
  }

  function runCalc(n, d, m, y) {
    const { ho, tenLotTen } = splitName(n)
    setResults({
      dateChart: getBirthChart(d, m, y),
      midLastChart: getNameChart(tenLotTen),
      hoChart: getNameChart(ho),
      lifePath: getLifePathNumber(d, m, y),
      peaksData: getFourPeaks(d, m, y, getLifePathNumber(d, m, y)),
      personalYears: [TODAY_YEAR, TODAY_YEAR + 1, TODAY_YEAR + 2].map(yr => ({
        year: yr,
        pyn: getPersonalYear(d, m, yr),
      })),
      birthYear: +y,
    })
    setActiveLayer(1)
    setError('')
  }

  function loadPerson(p) {
    setName(p.name)
    setDay(String(p.day))
    setMonth(String(p.month))
    setYear(String(p.year))
    runCalc(p.name, p.day, p.month, p.year)
  }

  function handleCalculate() {
    const n = name.trim()
    if (!n) { setError('Vui lòng nhập họ và tên.'); return }
    if (!day || !month || !year) { setError('Vui lòng chọn ngày sinh đầy đủ.'); return }
    runCalc(n, +day, +month, +year)
  }

  const layerTabs = [
    { label: 'Ngày sinh',       layer: 1 },
    { label: '+ Tên lót & Tên', layer: 2 },
    { label: '+ Họ đầy đủ',    layer: 3 },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 py-8 px-4 text-center shadow-lg">
        <h1 className="text-3xl font-bold text-white tracking-wide">Nhân Số Học</h1>
        <p className="text-indigo-200 mt-1 text-sm">Pythagorean · Phiên bản Tiếng Việt</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* ── Saved people chips ── */}
        {saved.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Đã lưu
            </p>
            <div className="flex flex-wrap gap-2">
              {saved.map(p => (
                <div
                  key={p.id}
                  className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 rounded-full pl-3 pr-2 py-1 text-sm"
                >
                  <button
                    onClick={() => loadPerson(p)}
                    className="text-indigo-700 font-medium hover:text-indigo-900 transition"
                  >
                    {p.name} · {p.day}/{p.month}/{p.year}
                  </button>
                  <button
                    onClick={() => deletePerson(p.id)}
                    className="text-indigo-300 hover:text-red-400 transition text-base leading-none ml-1"
                    title="Xóa"
                    aria-label="Xóa"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Input form ── */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Thông tin cá nhân</h2>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Họ và tên đầy đủ
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCalculate()}
              placeholder="VD: Nguyễn Văn An"
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-gray-800 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>

          {/* Date dropdowns */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-1">Ngày sinh</label>
            <div className="flex gap-2">
              {/* Day */}
              <select
                value={day}
                onChange={e => setDay(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-2 py-2.5 text-sm text-gray-800
                           focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Ngày</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {/* Month */}
              <select
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="flex-[1.4] border border-gray-300 rounded-xl px-2 py-2.5 text-sm text-gray-800
                           focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Tháng</option>
                {MONTHS_VI.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>

              {/* Year */}
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-2 py-2.5 text-sm text-gray-800
                           focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Năm</option>
                {Array.from({ length: TODAY_YEAR - 1899 }, (_, i) => TODAY_YEAR - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-3 -mt-2">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCalculate}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold
                         py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition text-sm"
            >
              Tính toán
            </button>
            {results && (
              <button
                onClick={savePerson}
                className="px-4 bg-gray-100 text-gray-600 font-medium py-2.5 rounded-xl
                           hover:bg-gray-200 transition text-sm"
              >
                Lưu
              </button>
            )}
          </div>
        </div>

        {/* ── Results ── */}
        {results && (
          <>
            {/* Section 1 — Con số chủ đạo */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-5">
                Con số chủ đạo
              </p>
              <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
                                flex items-center justify-center shadow-xl">
                  <span className="text-5xl font-bold text-white">{results.lifePath}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {name.trim()} · {day}/{month}/{year}
                </p>
              </div>
              <BookInsight chunk={getInterpretation('life_path', results.lifePath)} />
            </div>

            {/* Section 2 — Biểu đồ ngày sinh */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Biểu đồ ngày sinh
              </p>

              {/* Layer tabs */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-5 gap-1">
                {layerTabs.map(({ label, layer }) => (
                  <button
                    key={layer}
                    onClick={() => setActiveLayer(layer)}
                    className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition
                      ${activeLayer === layer
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* 3×3 grid */}
              <ChartGrid
                dateChart={results.dateChart}
                nameChart={results.midLastChart}
                hoChart={results.hoChart}
                layer={activeLayer}
              />

              {/* Legend */}
              <div className="flex justify-center flex-wrap gap-4 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  Ngày sinh
                </span>
                {activeLayer >= 2 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                    Tên lót &amp; Tên
                  </span>
                )}
                {activeLayer >= 3 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                    Họ
                  </span>
                )}
              </div>
              <BookInsight chunk={getInterpretation('birth_day', getBirthDayKey(+day))} />
            </div>

            {/* Section 3 — Bốn đỉnh cao */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Bốn đỉnh cao
              </p>
              <PeakPyramid
                peaksData={results.peaksData}
                birthYear={results.birthYear}
              />
              <BookInsight chunk={getInterpretation('four_peaks', null)} />
            </div>

            {/* Section 4 — Năm cá nhân */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Năm cá nhân
              </p>
              <div className="space-y-3">
                {results.personalYears.map(({ year: yr, pyn }) => {
                  const isCurrent = yr === TODAY_YEAR
                  return (
                    <div key={yr}>
                      <div
                        className={`rounded-xl border-2 px-5 py-4 flex items-center gap-5 transition
                          ${isCurrent
                            ? 'border-indigo-400 bg-indigo-50'
                            : 'border-gray-200 bg-gray-50'
                          }`}
                      >
                        <div className="text-center w-16 flex-shrink-0">
                          <p className={`text-xs font-semibold mb-0.5 ${isCurrent ? 'text-indigo-500' : 'text-gray-400'}`}>
                            {yr}
                          </p>
                          <p className={`text-4xl font-bold ${isCurrent ? 'text-indigo-700' : 'text-gray-700'}`}>
                            {pyn}
                          </p>
                          {isCurrent && (
                            <p className="text-[9px] text-indigo-400 mt-0.5 font-medium">Hiện tại</p>
                          )}
                        </div>
                        <div className="h-10 w-px bg-gray-200 flex-shrink-0" />
                        <p className="text-sm text-gray-500">Năm cá nhân số {pyn}</p>
                      </div>
                      <BookInsight chunk={getInterpretation('personal_year', pyn)} />
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <p className="text-center text-xs text-gray-300 pb-4">
          Nhân Số Học Pythagorean · Phiên bản Tiếng Việt
        </p>
      </div>
    </div>
  )
}
