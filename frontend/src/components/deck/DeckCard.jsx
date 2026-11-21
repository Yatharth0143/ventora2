import React from 'react'
import { Link } from 'react-router-dom'
import { FileText, ArrowRight, Clock, ShieldCheck, BarChart3 } from 'lucide-react'

export default function DeckCard({ deck }) {
  const formattedDate = deck.created_at
    ? new Date(deck.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recent'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {deck.language ? deck.language.toUpperCase() : 'EN'}
          </span>
        </div>

        <h3 className="font-bold text-sm text-slate-900 mt-3 line-clamp-1">{deck.title}</h3>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
          {deck.sections && deck.sections.length > 0 
            ? `${deck.sections.length} slides extracted and parsed` 
            : 'Complete deck audit record'}
        </p>

        <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
          <span>·</span>
          <span className="capitalize text-emerald-600 font-semibold">{deck.status || 'audited'}</span>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/marketing/${deck._id}`}
          className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Marketing
        </Link>

        <Link
          to={`/audit/${deck._id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
        >
          View Audit
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

