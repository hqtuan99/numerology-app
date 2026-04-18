import { useState, useEffect } from 'react'
import {
  getLifePathNumber,
  getBirthChart,
  getNameChart,
  getFourPeaks,
  getPersonalYear,
} from './lib/numerology'
import { getInterpretation, getBirthDayKey } from './lib/bookLookup'
import BirthChart   from './components/BirthChart'
import PyramidChart from './components/PyramidChart'
import BookInsight  from './components/BookInsight'

// ─── Constants ────────────────────────────────────────────────────────────────

const TODAY_YEAR = new Date().getFullYear()
const LS_KEY = 'nhan_so_hoc_saved'

const MONTHS_VI = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4',
  'Tháng 5','Tháng 6','Tháng 7','Tháng 8',
  'Tháng 9','Tháng 10','Tháng 11','Tháng 12',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function splitName(fullName) {
  const words = fullName.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return { ho: '', tenLotTen: '' }
  const ho = words[0]
  // 4+ words: chỉ lấy 2 chữ cuối làm tên lót + tên riêng (bỏ qua chữ đệm giữa như "Thị")
  const tenLotTen = words.length >= 4
    ? words.slice(-2).join(' ')
    : words.slice(1).join(' ')
  return { ho, tenLotTen }
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const S = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '24px 20px',
  },
  sectionTitle: {
    fontSize: 11, letterSpacing: '0.12em', fontWeight: 700,
    textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 20,
  },
  divider: {
    height: 1, background: 'var(--border)',
    border: 'none', margin: '20px auto',
  },
}

// ─── Personal Year card ───────────────────────────────────────────────────────

function PersonalYearCard({ entry, isCurrent }) {
  const interp = getInterpretation('personal_year', entry.pyn)
  return (
    <div style={{
      ...S.card,
      border: `1.5px solid ${isCurrent ? 'var(--accent)' : 'var(--border)'}`,
      boxShadow: isCurrent ? '0 0 0 4px var(--accent-dim)' : 'none',
      position: 'relative',
      flex: 1, minWidth: 0,
    }}>
      {isCurrent && (
        <span style={{
          position: 'absolute', top: 12, right: 12,
          background: 'var(--accent-dim)', color: 'var(--accent)',
          fontSize: 10, fontWeight: 600, padding: '2px 10px', borderRadius: 999,
        }}>Hiện tại</span>
      )}

      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>{entry.year}</p>
      <p style={{
        fontSize: 52, lineHeight: 1, margin: '0 0 10px',
        fontFamily: "'DM Serif Display', serif",
        color: isCurrent ? 'var(--accent)' : 'var(--text-2)',
        fontWeight: 700,
      }}>{entry.pyn}</p>

      {interp && (
        <>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 14 }}>{interp.label}</p>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: 14 }} />
          <p style={{ fontSize: 14, color: 'var(--text-1)', lineHeight: 1.75, fontWeight: 400, marginBottom: 12 }}>
            {interp.interpretation}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic' }}>
            {interp.source} · {interp.chapter}
          </p>
        </>
      )}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [name,  setName]  = useState('')
  const [day,   setDay]   = useState('')
  const [month, setMonth] = useState('')
  const [year,  setYear]  = useState('')
  const [results, setResults] = useState(null)
  const [saved,   setSaved]   = useState([])
  const [error,   setError]   = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      setSaved(raw ? JSON.parse(raw) : [])
    } catch { setSaved([]) }
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

  function deletePerson(id) { persistSaved(saved.filter(p => p.id !== id)) }

  function runCalc(n, d, m, y) {
    const { ho, tenLotTen } = splitName(n)
    const lifePath = getLifePathNumber(d, m, y)
    setResults({
      dateChart:    getBirthChart(d, m, y),
      midLastChart: getNameChart(tenLotTen),
      hoChart:      getNameChart(ho),
      lifePath,
      birthDayKey:  getBirthDayKey(d),
      peaksData:    getFourPeaks(d, m, y, lifePath),
      personalYears: [TODAY_YEAR - 1, TODAY_YEAR, TODAY_YEAR + 1].map(yr => ({
        year: yr,
        pyn:  getPersonalYear(d, m, yr),
      })),
      birthYear: +y,
    })
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
    if (!n)                      { setError('Vui lòng nhập họ và tên.'); return }
    if (!day || !month || !year) { setError('Vui lòng chọn ngày sinh đầy đủ.'); return }
    runCalc(n, +day, +month, +year)
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: '#ffffff', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '10px 12px',
    color: 'var(--text-1)', fontSize: 14, outline: 'none',
    fontFamily: "'Inter', sans-serif",
  }

  const labelStyle = {
    display: 'block', fontSize: 12, color: 'var(--text-2)',
    marginBottom: 6, fontWeight: 500,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

        {/* ── Top bar ── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 8 }}>
            NHÂN SỐ HỌC PYTHAGOREAN
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif", fontSize: 28,
            color: 'var(--text-1)', fontWeight: 700, margin: 0,
          }}>Quản trị cuộc sống với Nhân số học</h1>
        </div>

        {/* ── Saved people ── */}
        {saved.length > 0 && (
          <div style={{ ...S.card, marginBottom: 16 }}>
            <p style={{ ...S.sectionTitle, marginBottom: 12 }}>Đã lưu</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {saved.map(p => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'var(--bg-raised)', border: '1px solid var(--border)',
                  borderRadius: 999, paddingLeft: 12, paddingRight: 8, paddingTop: 5, paddingBottom: 5,
                }}>
                  <button onClick={() => loadPerson(p)} style={{
                    background: 'none', border: 'none', color: 'var(--accent)',
                    fontSize: 13, cursor: 'pointer', padding: 0,
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    {p.name} · {p.day}/{p.month}/{p.year}
                  </button>
                  <button onClick={() => deletePerson(p.id)} style={{
                    background: 'none', border: 'none', color: 'var(--text-3)',
                    fontSize: 16, cursor: 'pointer', lineHeight: 1, padding: '0 2px',
                  }} title="Xóa">×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Input form ── */}
        <div style={{ ...S.card, marginBottom: 32 }}>
          <p style={S.sectionTitle}>Thông tin cá nhân</p>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Họ và tên đầy đủ</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCalculate()}
              placeholder="VD: Nguyễn Văn An"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Ngày sinh</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number" value={day} onChange={e => setDay(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCalculate()}
                placeholder="Ngày" min={1} max={31}
                style={{ ...inputStyle, flex: 1, padding: '10px 8px' }}
              />
              <select value={month} onChange={e => setMonth(e.target.value)}
                style={{ ...inputStyle, flex: 1.4, padding: '10px 8px', cursor: 'pointer' }}>
                <option value="">Tháng</option>
                {MONTHS_VI.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
              <input
                type="number" value={year} onChange={e => setYear(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCalculate()}
                placeholder="Năm" min={1900} max={TODAY_YEAR}
                style={{ ...inputStyle, flex: 1.2, padding: '10px 8px' }}
              />
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: 'var(--red)', marginBottom: 12 }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleCalculate} style={{
              flex: 1, padding: '11px 0',
              background: 'var(--accent)',
              color: '#ffffff', fontWeight: 600, fontSize: 14,
              border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'opacity 0.2s',
            }}>
              Tính toán
            </button>
            {results && (
              <button onClick={savePerson} style={{
                padding: '11px 20px',
                background: 'var(--bg-raised)', color: 'var(--text-2)', fontWeight: 500,
                fontSize: 14, border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}>
                Lưu
              </button>
            )}
          </div>
        </div>

        {/* ══ Results ══════════════════════════════════════════════════════════ */}
        {results && (
          <>
            {/* ── Hero header ── */}
            <div className="fade-up fade-up-1" style={{ textAlign: 'center', padding: '16px 0 20px' }}>
              <h1 style={{
                fontFamily: "'Inter', sans-serif", fontSize: 30,
                color: 'var(--text-1)', fontWeight: 700, margin: '0 0 6px',
              }}>
                {name.trim()}
              </h1>
              <div style={{ fontSize: 14, color: 'var(--text-2)', letterSpacing: '0.1em' }}>
                {day} / {String(month).padStart(2, '0')} / {year}
              </div>
              <hr style={{ ...S.divider, maxWidth: 320 }} />
            </div>

            {/* ── Summary strip ── */}
            <div className="fade-up fade-up-2" style={{
              display: 'flex', gap: 12, justifyContent: 'center',
              flexWrap: 'wrap', marginBottom: 32,
            }}>
              {[
                { label: 'Số chủ đạo',          value: results.lifePath    },
                { label: 'Số ngày sinh',         value: results.birthDayKey },
                { label: `Năm CN ${TODAY_YEAR}`, value: results.personalYears[1].pyn },
              ].map(chip => (
                <div key={chip.label} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 999, padding: '8px 20px', fontSize: 13, color: 'var(--text-2)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                  {chip.label}:{' '}
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{chip.value}</span>
                </div>
              ))}
            </div>

            {/* Life path BookInsight */}
            <div className="fade-up fade-up-2" style={{ marginBottom: 20 }}>
              <BookInsight chunk={getInterpretation('life_path', results.lifePath)} />
            </div>

            {/* ── Birth chart ── */}
            <div className="fade-up fade-up-3" style={{ ...S.card, marginBottom: 20 }}>
              <p style={S.sectionTitle}>Biểu đồ ngày sinh</p>
              <BirthChart
                dateChart={results.dateChart}
                nameChart={results.midLastChart}
                hoChart={results.hoChart}
                name={name}
              />
            </div>

            {/* ── Four peaks ── */}
            <div className="fade-up fade-up-4" style={{ ...S.card, marginBottom: 20 }}>
              <p style={S.sectionTitle}>Bốn đỉnh cao</p>
              <PyramidChart peaksData={results.peaksData} birthYear={results.birthYear} />

              <BookInsight chunk={getInterpretation('four_peaks', null)} />
            </div>

            {/* ── Personal year ── */}
            <div className="fade-up fade-up-5" style={{ marginBottom: 20 }}>
              <p style={S.sectionTitle}>Năm cá nhân</p>
              <div className="personal-year-row">
                {results.personalYears.map((entry, i) => (
                  <PersonalYearCard key={entry.year} entry={entry} isCurrent={i === 1} />
                ))}
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', paddingBottom: 40 }}>
              Nhân Số Học Pythagorean · Team MayQ Share
            </p>
          </>
        )}
      </div>
    </div>
  )
}
