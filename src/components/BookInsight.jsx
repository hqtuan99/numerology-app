import { useState } from 'react'

/**
 * Collapsible book interpretation card — light theme.
 * Returns null when the entry isn't found in the data file.
 */
export default function BookInsight({ chunk }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!chunk) return null

  return (
    <div style={{
      borderLeft: '3px solid var(--accent)',
      background: 'var(--accent-dim)',
      borderRadius: 'var(--radius-sm)',
      marginTop: 16,
      overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(o => !o)}
        onKeyDown={e => e.key === 'Enter' && setIsOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 16px', cursor: 'pointer',
        }}
      >
        <span style={{ color: 'var(--accent)', fontSize: 12, flexShrink: 0 }}>✦</span>
        <span style={{ fontSize: 13, color: 'var(--text-2)', flex: 1 }}>{chunk.label}</span>
        <span style={{ color: 'var(--text-3)', fontSize: 13, flexShrink: 0 }}>
          {isOpen ? '▾' : '▸'}
        </span>
      </div>

      {/* ── Body ── */}
      {isOpen && (
        <div style={{ background: 'var(--bg-card)' }}>
          <div style={{ padding: '0 16px 16px', fontSize: 14, color: 'var(--text-1)', lineHeight: 1.75, fontWeight: 400 }}>
            {chunk.interpretation}
          </div>
        </div>
      )}
    </div>
  )
}
