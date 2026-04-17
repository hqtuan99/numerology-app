import { useState } from 'react'
import BookInsight from './BookInsight'
import { getInterpretation } from '../lib/bookLookup'

// ─── Constants ────────────────────────────────────────────────────────────────

const CELL = 100 // px

// Grid top-to-bottom, left-to-right: 3 6 9 / 2 5 8 / 1 4 7
const GRID_ROWS = [[3, 6, 9], [2, 5, 8], [1, 4, 7]]

const ROW_BG = ['var(--row-top)', 'var(--row-mid)', 'var(--row-bot)']

const ARROWS = [
  { key: '1-5-9', cells: [1,5,9], pLabel: 'Quyết tâm',   eLabel: 'Trì hoãn'       },
  { key: '3-5-7', cells: [3,5,7], pLabel: 'Tâm linh',    eLabel: 'Hoài nghi'       },
  { key: '3-6-9', cells: [3,6,9], pLabel: 'Trí tuệ',     eLabel: 'Trí nhớ ngắn'   },
  { key: '2-5-8', cells: [2,5,8], pLabel: 'Cân bằng CX', eLabel: 'Nhạy cảm'       },
  { key: '1-4-7', cells: [1,4,7], pLabel: 'Thực tế',     eLabel: 'Thiếu trật tự'  },
  { key: '1-2-3', cells: [1,2,3], pLabel: 'Kế hoạch',    eLabel: null              },
  { key: '4-5-6', cells: [4,5,6], pLabel: 'Ý chí',       eLabel: 'Uất giận'       },
  { key: '7-8-9', cells: [7,8,9], pLabel: 'Hoạt động',   eLabel: 'Thụ động'       },
]

// ─── Cell component ───────────────────────────────────────────────────────────

function GridCell({ digit, count, rowBg }) {
  const empty = count === 0
  const repeated = String(digit).repeat(count)

  return (
    <div style={{
      width: CELL, height: CELL, boxSizing: 'border-box',
      border: empty ? '1px dashed var(--border)' : '1px solid var(--border)',
      background: empty ? 'transparent' : rowBg,
      borderRadius: 'var(--radius-sm)',
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ position: 'absolute', top: 5, right: 7, fontSize: 10, color: 'var(--text-3)' }}>
        {digit}
      </span>
      {!empty && (
        <span style={{
          fontSize: 26, fontWeight: 600,
          color: 'var(--text-1)', lineHeight: 1,
          fontFamily: "'DM Serif Display', serif",
          letterSpacing: '-1px',
        }}>
          {repeated}
        </span>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BirthChart({ dateChart, nameChart, hoChart, name }) {
  const [layer, setLayer] = useState(1)

  const words = name.trim().split(/\s+/).filter(Boolean)
  const tabLabels = [
    'Ngày sinh',
    words.length > 1 ? `+ ${words.slice(1).join(' ')}` : '+ Tên',
    `+ ${name.trim()}`,
  ]

  // Merge counts based on active layer
  function getCount(digit) {
    const d = dateChart[digit] || 0
    const n = layer >= 2 ? (nameChart[digit] || 0) : 0
    const h = layer >= 3 ? (hoChart[digit] || 0)   : 0
    return d + n + h
  }

  const arrowStates = ARROWS.map(a => ({
    ...a,
    present: a.cells.every(c => getCount(c) > 0),
  }))

  const presentArrows = arrowStates.filter(a => a.present)
  const emptyArrows   = arrowStates.filter(a => !a.present && a.eLabel)

  const gridSize = CELL * 3

  return (
    <div>
      {/* ── Layer tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabLabels.map((lbl, i) => {
          const active = layer === i + 1
          return (
            <button key={i} onClick={() => setLayer(i + 1)} style={{
              padding: '6px 16px', borderRadius: 999, cursor: 'pointer',
              border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#ffffff' : 'var(--text-2)',
              fontSize: 13, fontWeight: active ? 600 : 400,
              transition: 'all 0.2s',
            }}>
              {lbl}
            </button>
          )
        })}
      </div>

      {/* ── Grid ── */}
      <div style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: gridSize, flexShrink: 0 }}>
          {GRID_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} style={{ display: 'flex' }}>
              {row.map(digit => (
                <GridCell
                  key={digit}
                  digit={digit}
                  count={getCount(digit)}
                  rowBg={ROW_BG[rowIdx]}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Arrow legend ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 10 }}>
            Mũi tên có ✦
          </p>
          {presentArrows.length === 0
            ? <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Không có</p>
            : presentArrows.map(a => (
              <div key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{a.pLabel}</span>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>({a.key})</span>
              </div>
            ))
          }
        </div>
        <div>
          <p style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, marginBottom: 10 }}>
            Mũi tên trống
          </p>
          {emptyArrows.length === 0
            ? <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Không có</p>
            : emptyArrows.map(a => (
              <div key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{a.eLabel}</span>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>({a.key})</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* ── BookInsight ── */}
      <BookInsight chunk={getInterpretation('birth_chart', null)} />
    </div>
  )
}
