import React, { useState } from 'react'
import { 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Languages, 
  Scale, 
  Lock,
  ExternalLink 
} from 'lucide-react'
import QuoteViewer from './QuoteViewer'

const SEVERITY_COLORS = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-blue-50 text-blue-700 border-blue-200',
}

const TYPE_ICONS = {
  contradiction: AlertTriangle,
  numeric_inconsistency: Scale,
  missing_evidence: HelpCircle,
  strength: CheckCircle,
}

export default function FindingCard({ finding, isLocked = false, onUpgradeClick }) {
  const [expanded, setExpanded] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState(null)

  if (isLocked) {
    return (
      <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-5 overflow-hidden filter blur-[1.5px] select-none opacity-60">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-slate-300 rounded w-1/3"></div>
          <div className="h-4 bg-slate-300 rounded w-16"></div>
        </div>
        <div className="h-3 bg-slate-200 rounded w-full mt-3"></div>
        <div className="h-3 bg-slate-200 rounded w-4/5 mt-2"></div>
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-2xs">
          <button
            onClick={onUpgradeClick}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer filter-none"
          >
            <Lock className="w-3.5 h-3.5" />
            Unlock with Founder Pro
          </button>
        </div>
      </div>
    )
  }

  const Icon = TYPE_ICONS[finding.type] || AlertTriangle
  const severityClass = SEVERITY_COLORS[finding.severity] || SEVERITY_COLORS.medium

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg border ${severityClass}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm text-slate-900">{finding.title}</h3>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${severityClass}`}>
                {finding.severity}
              </span>
              <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {finding.type.replace('_', ' ')}
              </span>
              {finding.is_translated && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  <Languages className="w-3 h-3" />
                  Translated via Bhashini
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{finding.description}</p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Numeric claim discrepancy card if applicable */}
      {finding.numeric_claim && (
        <div className="mt-3 bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
          <div className="font-bold flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-amber-600" />
            Deterministic Math Audit (USP 2):
          </div>
          <p className="mt-1 font-mono text-[11px] text-amber-800">{finding.numeric_claim.discrepancy}</p>
        </div>
      )}

      {/* Quotes & evidence */}
      {finding.quotes && finding.quotes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Verified Source Quotes ({finding.quotes.length})
            </span>
            <button
              onClick={() => {
                if (selectedQuote) {
                  setSelectedQuote(null)
                } else {
                  setSelectedQuote(finding.quotes[0])
                }
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              {selectedQuote ? 'Close citation' : 'Click to inspect citation'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {finding.quotes.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedQuote(q)}
                className={`text-xs px-2.5 py-1 rounded-lg border text-left transition-colors cursor-pointer ${
                  selectedQuote === q
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Page {q.page_number} {q.section_title ? `(${q.section_title})` : ''}
              </button>
            ))}
          </div>

          {selectedQuote && (
            <QuoteViewer quote={selectedQuote} onClose={() => setSelectedQuote(null)} />
          )}
        </div>
      )}

      {/* Original Hindi/Regional text preservation (USP 15) */}
      {finding.is_translated && finding.original_text && (
        <div className="mt-3 bg-purple-50/60 border border-purple-100 rounded-lg p-2.5 text-xs text-purple-900">
          <span className="font-bold text-[10px] uppercase text-purple-700 block mb-0.5">Original Source Text (Audit Trail):</span>
          <p className="font-mono text-[11px] text-purple-800 italic">"{finding.original_text}"</p>
        </div>
      )}
    </div>
  )
}

