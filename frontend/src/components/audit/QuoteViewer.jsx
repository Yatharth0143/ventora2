import React from 'react'
import { FileText, ArrowRight, Quote, Bookmark } from 'lucide-react'

export default function QuoteViewer({ quote, onClose }) {
  if (!quote) return null

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 shadow-xl mt-3 animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
          <Bookmark className="w-3.5 h-3.5" />
          <span>Verifiable Citation: Page {quote.page_number}</span>
          {quote.section_title && (
            <span className="text-slate-500">· {quote.section_title}</span>
          )}
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Source Verified
        </span>
      </div>

      <div className="relative pl-6 py-1">
        <Quote className="w-4 h-4 text-indigo-500 absolute left-0 top-1 rotate-180" />
        <p className="text-xs leading-relaxed text-slate-200 font-mono italic bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
          "{quote.text}"
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>Literally extracted from original pitch deck slides</span>
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
          >
            Hide citation
          </button>
        )}
      </div>
    </div>
  )
}

