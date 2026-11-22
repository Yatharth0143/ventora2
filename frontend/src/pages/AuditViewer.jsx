import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  getDeck, 
  getFindings, 
  getFitTable, 
  runAudit,
  queryDeckRag,
  runDeckRagAudit
} from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import FindingCard from '../components/audit/FindingCard'
import FitTable from '../components/audit/FitTable'
import UpgradeModal from '../components/payment/UpgradeModal'
import { 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  ExternalLink, 
  Layers, 
  BarChart3, 
  CheckCircle2,
  Lock,
  ArrowRight,
  Video
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuditViewer() {
  const { deckId } = useParams()
  const { user, isPro } = useAuth()
  const [deck, setDeck] = useState(null)
  const [findingsData, setFindingsData] = useState({ findings: [], total: 0, gated: false, locked_count: 0 })
  const [fitData, setFitData] = useState(null)
  const [activeTab, setActiveTab] = useState('findings') // findings, fit, text, rag
  const [loading, setLoading] = useState(true)
  const [reAuditing, setReAuditing] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [ragQueryText, setRagQueryText] = useState('')
  const [ragQueryResult, setRagQueryResult] = useState(null)
  const [ragQuerying, setRagQuerying] = useState(false)
  const [fullRagReport, setFullRagReport] = useState(null)
  const [fullRagLoading, setFullRagLoading] = useState(false)

  useEffect(() => {
    loadAll()
  }, [deckId, user?.tier])

  const loadAll = async () => {
    try {
      setLoading(true)
      const [dRes, fRes, fitRes] = await Promise.all([
        getDeck(deckId),
        getFindings(deckId),
        getFitTable(deckId),
      ])
      setDeck(dRes.data.deck)
      setFindingsData(fRes.data)
      setFitData(fitRes.data)
    } catch (err) {
      toast.error('Failed to load audit data')
    } finally {
      setLoading(false)
    }
  }

  const handleReAudit = async () => {
    try {
      setReAuditing(true)
      await runAudit(deckId)
      toast.success('Re-audit complete with fresh verification')
      loadAll()
    } catch (err) {
      toast.error('Re-audit error')
    } finally {
      setReAuditing(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Verifying findings against original deck quotes...
      </div>
    )
  }

  const findings = findingsData.findings || []
  const isGated = findingsData.gated

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Deck Audit Report
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Language: {deck?.language?.toUpperCase() || 'EN'}
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-2">{deck?.title || 'Pitch Deck'}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {deck?.sections?.length || 0} slides extracted · Verified in code · Tamper-evident hash logged
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/marketing/${deckId}`}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4 text-slate-500" />
            Marketing Report
          </Link>

          <button
            onClick={handleReAudit}
            disabled={reAuditing}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reAuditing ? 'animate-spin' : ''}`} />
            Re-Audit Deck
          </button>
        </div>
      </div>

      {/* Founder Video Pitch Player if available */}
      {deck?.has_video && deck?.video_url && (
        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-md">
          <div className="p-3 bg-slate-950/90 px-4 flex items-center justify-between border-b border-slate-800">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Video className="w-4 h-4 text-purple-400" />
              Founder Video Pitch Elevator Reel
            </span>
            <span className="text-[10px] text-purple-300 font-semibold px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800">
              Verified Pitch Media
            </span>
          </div>
          <div className="max-h-80 w-full flex items-center justify-center bg-black">
            <video src={deck.video_url} controls playsInline className="max-h-80 w-full object-contain" />
          </div>
        </div>
      )}

      {/* Freemium Banner if Gated (USP 8) */}
      {isGated && (
        <div className="bg-gradient-to-r from-amber-500 to-indigo-600 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span className="font-extrabold text-xs uppercase tracking-wide">Freemium Limit Active</span>
            </div>
            <p className="text-xs text-indigo-100 mt-0.5">
              Showing <strong>3 free verifiable findings</strong>. {findingsData.locked_count || 1} additional finding(s) and direct VC messaging locked.
            </p>
          </div>
          <button
            onClick={() => setShowUpgrade(true)}
            className="px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 font-black text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
          >
            Upgrade to Pro (₹999)
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('findings')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'findings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Audit Findings ({findings.length + (isGated ? findingsData.locked_count || 1 : 0)})
        </button>
        <button
          onClick={() => setActiveTab('fit')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'fit'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Investment Fit Matrix
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'text'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Raw Slide Text & Citations
        </button>
        <button
          onClick={() => setActiveTab('rag')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'rag'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          RAG Audit Pipeline (Sarvam AI)
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {findings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-slate-900">Zero Contradictions Found!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All claims in this pitch deck align consistently across market size, traction, and financial asks.
              </p>
            </div>
          ) : (
            findings.map((f, idx) => (
              <FindingCard key={f._id || idx} finding={f} />
            ))
          )}

          {/* Locked Mock Cards for Free Tier */}
          {isGated && (
            <FindingCard isLocked={true} onUpgradeClick={() => setShowUpgrade(true)} />
          )}

          {/* Audit Verification Footer (USP 6 Precision) */}
          <div className="p-4 bg-slate-100 rounded-xl text-center text-[11px] text-slate-600 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Ventora Quote Validator Active:</strong> 100% of reported contradictions match source slide sentences. Fabricated findings dropped.
            </span>
          </div>
        </div>
      )}

      {activeTab === 'fit' && (
        <FitTable data={fitData} />
      )}

      {activeTab === 'text' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Extracted Pitch Deck Slide Text</h3>
          <p className="text-xs text-slate-500">
            Source text passed to Sarvam AI & Bhashini after prompt injection sanitization.
          </p>
          <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-96">
            {deck?.raw_text || 'No text extracted'}
          </pre>
        </div>
      )}

      {activeTab === 'rag' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Retrieval-Augmented Verification
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Minimal RAG Audit Suite for this Deck
                </h3>
                <p className="text-xs text-slate-500">
                  Slide-level BM25 indexing + Sarvam AI grounded audit synthesis with word-for-word citations.
                </p>
              </div>

              <button
                onClick={async () => {
                  setFullRagLoading(true)
                  try {
                    const res = await runDeckRagAudit(deckId)
                    setFullRagReport(res.data.rag_audit)
                    toast.success('4-Pillar RAG Audit completed!')
                  } catch (err) {
                    toast.error('RAG audit error')
                  } finally {
                    setFullRagLoading(false)
                  }
                }}
                disabled={fullRagLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50 shadow-xs"
              >
                {fullRagLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {fullRagLoading ? 'Auditing with Sarvam...' : 'Run Full 4-Pillar RAG Audit'}
              </button>
            </div>

            {/* Custom RAG Query Input */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Ask a Grounded Audit Question:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ragQueryText}
                  onChange={(e) => setRagQueryText(e.target.value)}
                  placeholder="e.g. Check TAM claims, verify burn rate vs runway, or confirm IP defensibility..."
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && ragQueryText.trim()) {
                      setRagQuerying(true)
                      try {
                        const res = await queryDeckRag(deckId, ragQueryText.trim())
                        setRagQueryResult(res.data.rag_result)
                      } catch (err) {
                        toast.error('Query error')
                      } finally {
                        setRagQuerying(false)
                      }
                    }
                  }}
                />
                <button
                  onClick={async () => {
                    if (!ragQueryText.trim()) return
                    setRagQuerying(true)
                    try {
                      const res = await queryDeckRag(deckId, ragQueryText.trim())
                      setRagQueryResult(res.data.rag_result)
                      toast.success('RAG analysis complete')
                    } catch (err) {
                      toast.error('Query error')
                    } finally {
                      setRagQuerying(false)
                    }
                  }}
                  disabled={ragQuerying || !ragQueryText.trim()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {ragQuerying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  Ask
                </button>
              </div>
            </div>

            {/* Single Query Result */}
            {ragQueryResult && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">Query: "{ragQueryResult.query}"</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    ragQueryResult.verdict === 'RED_FLAG'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : ragQueryResult.verdict === 'VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {ragQueryResult.verdict}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{ragQueryResult.answer}</p>
                {ragQueryResult.citations?.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Grounded Citations:</p>
                    {ragQueryResult.citations.map((c, i) => (
                      <div key={i} className="text-xs font-mono bg-white p-2 rounded-lg border border-slate-200 text-slate-800">
                        <span className="font-bold text-indigo-600">Slide {c.page_number}:</span> "{c.text}"
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Full 4-Pillar RAG Report */}
          {fullRagReport && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">4-Pillar RAG Audit Verdict</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{fullRagReport.verdict_reason}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  fullRagReport.overall_verdict === 'GARBAGE_IDEA'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {fullRagReport.overall_verdict === 'GARBAGE_IDEA' ? 'Garbage Idea (Red Flagged)' : 'Investable / Approved'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {fullRagReport.reports?.map((rep, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{rep.dimension}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rep.verdict === 'RED_FLAG'
                          ? 'bg-rose-100 text-rose-700'
                          : rep.verdict === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {rep.verdict}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rep.answer}</p>
                    {rep.citations?.length > 0 && (
                      <div className="text-[11px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700">
                        <span className="font-bold text-indigo-600">Slide {rep.citations[0].page_number}:</span> "{rep.citations[0].text}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showUpgrade && <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}

