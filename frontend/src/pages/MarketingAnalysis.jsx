import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMarketingReport } from '../services/api'
import { BarChart3, CheckCircle2, AlertCircle, ArrowLeft, TrendingUp, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MarketingAnalysis() {
  const { deckId } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReport()
  }, [deckId])

  const loadReport = async () => {
    try {
      setLoading(true)
      const res = await getMarketingReport(deckId)
      setReport(res.data.report)
    } catch (err) {
      toast.error('Failed to load marketing report')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Generating fundraising positioning report and LinkedIn cadence analysis...
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
      <Link
        to={`/audit/${deckId}`}
        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Deck Audit
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                USP 10: Fundraising-Specific Marketing
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2">{report?.deck_title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Positioning consistency between pitch deck claims and public founder distribution.
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6">
            <span className="text-[10px] uppercase font-bold text-slate-400">Consistency Score</span>
            <div className="text-3xl font-black text-indigo-600 mt-1">{report?.consistency_score} / 10</div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
              Positioning Category
            </h3>
            <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {report?.positioning}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
              Raise Window Posting Cadence (USP 13 Context)
            </h3>
            <p className="text-xs text-slate-700 bg-indigo-50/60 p-3 rounded-xl border border-indigo-200">
              {report?.posting_cadence_window}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
              Key Strategic Recommendations
            </h3>
            <div className="space-y-2">
              {report?.recommendations?.map((r, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
              Verified Investor Signals
            </h3>
            <div className="space-y-2">
              {report?.investor_signals?.map((s, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

