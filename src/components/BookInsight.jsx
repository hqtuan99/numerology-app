import { useState } from 'react'

/**
 * Collapsible card showing a short interpretation from the book.
 * Interpretations are 3-5 sentences so no expand/collapse needed.
 * Returns null when the entry isn't found in the data file.
 */
export default function BookInsight({ chunk }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!chunk) return null

  return (
    <div className="border-l-4 border-amber-400 bg-amber-50 rounded-r-xl mt-3">
      {/* ── Header ── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left
                   hover:bg-amber-100/60 transition-colors"
      >
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-base leading-none mt-0.5 flex-shrink-0">📖</span>
          <div className="min-w-0">
            <p className="font-medium text-gray-800 text-sm leading-snug">{chunk.label}</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{chunk.chapter}</p>
          </div>
        </div>
        <span
          className="text-gray-400 text-sm ml-3 flex-shrink-0 transition-transform duration-200 inline-block"
          style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          ▸
        </span>
      </button>

      {/* ── Body ── */}
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {chunk.interpretation}
          </p>

          {/* Citation */}
          <div className="text-xs italic text-gray-400 border-t border-amber-100 pt-2 mt-3">
            Nguồn: {chunk.source} · {chunk.chapter}
          </div>
        </div>
      )}
    </div>
  )
}
