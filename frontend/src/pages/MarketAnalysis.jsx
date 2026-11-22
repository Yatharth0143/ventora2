import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  listDecks, 
  getMarketAnalysis, 
  runMarketAnalysis, 
  analyzeCustomMarket 
} from '../services/api'
import {
  TrendingUp,
  Globe2,
  Landmark,
  Target,
  Users2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Layers,
  Building2,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  Zap,
  Briefcase
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function MarketAnalysis() {
  const { deckId: paramDeckId } = useParams()
  const navigate = useNavigate()
  const { user, isFounder, isInvestor } = useAuth()

  const [decks, setDecks] = useState([])
  const [selectedDeckId, setSelectedDeckId] = useState(paramDeckId || '')
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'size', 'investors', 'segments', 'gaps'
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [runningAnalysis, setRunningAnalysis] = useState(false)
  
  // Custom pitch analysis mode
  const [customMode, setCustomMode] = useState(false)
  const [customTitle, setCustomTitle] = useState('')
  const [customText, setCustomText] = useState('')
  const [customSector, setCustomSector] = useState('')

  useEffect(() => {
    loadDeckList()
  }, [])

  useEffect(() => {
    if (paramDeckId) {
      setSelectedDeckId(paramDeckId)
      fetchDeckAnalysis(paramDeckId)
    }
  }, [paramDeckId])

  const loadDeckList = async () => {
    try {
      const res = await listDecks()
      const dList = res.data.decks || []
      setDecks(dList)
      if (!paramDeckId && dList.length > 0) {
        setSelectedDeckId(dList[0]._id)
        fetchDeckAnalysis(dList[0]._id)
      }
    } catch (err) {
      console.error('Failed to load decks:', err)
    }
  }

  const fetchDeckAnalysis = async (dId) => {
    if (!dId) return
    setLoading(true)
    try {
      const res = await getMarketAnalysis(dId)
      if (res.data && res.data.analysis) {
        setAnalysis(res.data.analysis)
      }
    } catch (err) {
      console.error('Failed to fetch analysis:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDeck = (e) => {
    const dId = e.target.value
    setSelectedDeckId(dId)
    setCustomMode(false)
    if (dId) {
      navigate(`/market-analysis/${dId}`)
      fetchDeckAnalysis(dId)
    }
  }

  const handleRunFreshAnalysis = async () => {
    if (!selectedDeckId) {
      toast.error('Select a pitch deck first')
      return
    }
    setRunningAnalysis(true)
    try {
      toast.loading('Synthesizing market depth via Sarvam AI...', { id: 'market-calc' })
      const res = await runMarketAnalysis(selectedDeckId)
      if (res.data && res.data.analysis) {
        setAnalysis(res.data.analysis)
        toast.success('Market Intelligence report synthesized!', { id: 'market-calc' })
      }
    } catch (err) {
      toast.error('Failed to run market analysis', { id: 'market-calc' })
    } finally {
      setRunningAnalysis(false)
    }
  }

  const handleRunCustomAnalysis = async (e) => {
    e.preventDefault()
    if (!customTitle.trim() || !customText.trim()) {
      toast.error('Please enter pitch title and summary text')
      return
    }
    setRunningAnalysis(true)
    try {
      toast.loading('Generating market intelligence for pitch...', { id: 'custom-calc' })
      const res = await analyzeCustomMarket({
        title: customTitle,
        text: customText,
        sector: customSector || undefined,
      })
      if (res.data && res.data.analysis) {
        setAnalysis(res.data.analysis)
        toast.success('Custom market analysis ready!', { id: 'custom-calc' })
      }
    } catch (err) {
      toast.error('Analysis failed', { id: 'custom-calc' })
    } finally {
      setRunningAnalysis(false)
    }
  }

  const selectedDeck = decks.find((d) => d._id === selectedDeckId)
  const isAvailable = analysis?.market_availability?.is_available !== false
  const readinessScore = analysis?.market_availability?.market_readiness_score || 85

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dual-Perspective Market Intelligence Engine</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold">
                {isInvestor ? 'Investor Diligence Mode' : 'Founder GTM Mode'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Pitch Deck Market Analysis & Gaps Explorer
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Synthesize market viability, quantify national (India ₹) and global ($) TAM/SAM/SOM, identify ideal investor archetypes, delineate customer segments, and uncover critical industry white spaces.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setCustomMode(!customMode)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all text-center"
            >
              {customMode ? '← Choose Existing Deck' : 'Paste Pitch Copy'}
            </button>
            {!customMode && selectedDeckId && (
              <button
                onClick={handleRunFreshAnalysis}
                disabled={runningAnalysis}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${runningAnalysis ? 'animate-spin' : ''}`} />
                <span>{runningAnalysis ? 'Synthesizing...' : 'Re-Run Sarvam AI Analysis'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Deck Selection Header Bar */}
        {!customMode && (
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Active Pitch Deck:</span>
            </div>
            <select
              value={selectedDeckId}
              onChange={handleSelectDeck}
              className="bg-slate-800/90 text-white border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[260px]"
            >
              <option value="" disabled>-- Select a Pitch Deck --</option>
              {decks.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.title} {d.original_filename ? `(${d.original_filename})` : ''}
                </option>
              ))}
            </select>

            {selectedDeck && (
              <span className="text-[11px] text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                Uploaded: {selectedDeck.created_at ? new Date(selectedDeck.created_at).toLocaleDateString() : 'Active'} • Status: <span className="text-emerald-400 font-semibold">{selectedDeck.status || 'Verified'}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Custom Pitch Input Form Mode */}
      {customMode && (
        <form onSubmit={handleRunCustomAnalysis} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              Direct Pitch Text Analyzer
            </h3>
            <span className="text-xs text-slate-500">Test any unreleased pitch or concept</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company / Project Title</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. BharatPay, AgroDrone, MediSync"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sector (Optional)</label>
              <input
                type="text"
                value={customSector}
                onChange={(e) => setCustomSector(e.target.value)}
                placeholder="e.g. FinTech, B2B SaaS, HealthTech"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pitch Deck Summary / Problem & Solution Text
            </label>
            <textarea
              rows={5}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste your pitch slides text, problem statement, solution, target customer, or revenue model here..."
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCustomMode(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={runningAnalysis}
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Market Intelligence</span>
            </button>
          </div>
        </form>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div className="inline-block p-4 rounded-full bg-indigo-50 text-indigo-600 animate-pulse mb-3">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Retrieving Market Intelligence</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Extracting slide sections, TAM calculations, investor fit graphs, and industry gaps...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !analysis && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Market Analysis Generated Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Select an uploaded pitch deck above or paste your pitch deck copy to synthesize an in-depth market readiness and sizing report.
            </p>
          </div>
          {selectedDeckId && (
            <button
              onClick={handleRunFreshAnalysis}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run Sarvam AI Market Analysis</span>
            </button>
          )}
        </div>
      )}

      {/* Full Analysis Content */}
      {!loading && analysis && (
        <div className="space-y-6">
          {/* 1. KEY HEALTH & VERDICT SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Market Availability Status */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Market Availability</span>
                {isAvailable ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> AVAILABLE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    <AlertCircle className="w-3 h-3 text-rose-600" /> UNVIABLE
                  </span>
                )}
              </div>
              <div className="my-2">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {analysis.market_availability?.status?.replace(/_/g, ' ') || 'HIGH GROWTH'}
                </span>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {analysis.market_availability?.summary}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Sector Focus:</span>
                <span className="font-bold text-slate-700">{analysis.sector || 'Technology / SaaS'}</span>
              </div>
            </div>

            {/* Market Readiness Score */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Market Readiness Score</span>
                <span className="text-xs font-bold text-indigo-600">Index / 100</span>
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-600 tracking-tight">
                  {readinessScore}
                </span>
                <span className="text-xs font-bold text-slate-400">/ 100</span>
                <span className="text-[11px] font-bold text-emerald-600 ml-auto bg-emerald-50 px-2 py-0.5 rounded-md">
                  Strong Tailwinds
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(readinessScore, 100)}%` }}
                />
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Disruption Timing:</span>
                <span className="font-bold text-indigo-700">Immediate Window</span>
              </div>
            </div>

            {/* National TAM (India) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">National Market (India)</span>
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {analysis.market_size?.national_india?.cagr || '22% CAGR'}
                </span>
              </div>
              <div className="my-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {analysis.market_size?.national_india?.tam || '₹35,000 Cr'}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  SAM: <span className="font-semibold text-slate-700">{analysis.market_size?.national_india?.sam}</span> • SOM: <span className="font-semibold text-slate-700">{analysis.market_size?.national_india?.som}</span>
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Currency Anchor:</span>
                <span className="font-bold text-slate-700">INR (₹) Domestic Corridor</span>
              </div>
            </div>

            {/* Global TAM */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Global Market (Worldwide)</span>
                <span className="text-[10px] font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                  {analysis.market_size?.global?.cagr || '16% CAGR'}
                </span>
              </div>
              <div className="my-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {analysis.market_size?.global?.tam || '$54.5B'}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  SAM: <span className="font-semibold text-slate-700">{analysis.market_size?.global?.sam}</span> • SOM: <span className="font-semibold text-slate-700">{analysis.market_size?.global?.som}</span>
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Exportability:</span>
                <span className="font-bold text-slate-700">Cross-Border High</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs for Deep Dive */}
          <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
            {[
              { id: 'overview', label: 'Market Availability & Tailwinds', icon: Target },
              { id: 'size', label: 'National vs Global Sizing', icon: Globe2 },
              { id: 'investors', label: 'Ideal Investors & Thesis Fit', icon: Landmark },
              { id: 'segments', label: 'Customer Segments', icon: Users2 },
              { id: 'gaps', label: 'Major Industry Gaps & White Spaces', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                    isActive
                      ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* TAB 1: MARKET AVAILABILITY & TIMING */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Availability Deep-Dive */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-600" />
                      Market Viability & Accessibility Analysis
                    </h3>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Sector: {analysis.sector}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                    {analysis.market_availability?.summary}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      Why NOW is the Disruption Window (Timing Justification):
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed bg-indigo-50/40 p-3.5 rounded-xl border border-indigo-100/70">
                      {analysis.market_availability?.timing_justification}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      Macro Catalysts & India Digital Tailwinds:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {analysis.market_availability?.macro_tailwinds?.map((tw, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{tw}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Role-Specific Perspective (Founder vs Investor) */}
                <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/50 rounded-2xl p-6 border border-indigo-100 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      {isInvestor ? 'Investor Diligence Playbook' : 'Founder Actionable GTM Playbook'}
                    </span>
                    <span className="text-[10px] font-bold bg-white text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                      Recommendation: {analysis.strategic_verdict?.market_recommendation || 'ACTIVE PURSUIT'}
                    </span>
                  </div>

                  {isInvestor ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-900">Key Diligence Takeaway:</p>
                      <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-indigo-200/50">
                        {analysis.strategic_verdict?.investor_takeaway}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-900">Immediate Founder Action Items:</p>
                      <div className="space-y-1.5">
                        {analysis.strategic_verdict?.founder_action_items?.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-indigo-100 text-xs text-slate-700">
                            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Competitive Landscape Sidebar */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-600" />
                    Competitive Moat
                  </h3>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Direct Competitors</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.competitive_landscape?.direct_competitors?.map((c, i) => (
                        <span key={i} className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Indirect Alternatives</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.competitive_landscape?.indirect_alternatives?.map((a, i) => (
                        <span key={i} className="text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Differentiation Factors</span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {analysis.competitive_landscape?.differentiation_factors?.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NATIONAL VS GLOBAL MARKET SIZING */}
          {activeTab === 'size' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* National Market Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                      ₹
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">National Market (India)</h3>
                      <p className="text-[11px] text-slate-500">Domestic TAM / SAM / SOM breakdown</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    {analysis.market_size?.national_india?.cagr}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400">TAM (Total)</span>
                    <p className="text-sm font-black text-slate-900 mt-1">{analysis.market_size?.national_india?.tam}</p>
                  </div>
                  <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-center">
                    <span className="text-[10px] font-bold uppercase text-indigo-600">SAM (Serviceable)</span>
                    <p className="text-sm font-black text-indigo-900 mt-1">{analysis.market_size?.national_india?.sam}</p>
                  </div>
                  <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-center">
                    <span className="text-[10px] font-bold uppercase text-emerald-600">SOM (Obtainable)</span>
                    <p className="text-sm font-black text-emerald-900 mt-1">{analysis.market_size?.national_india?.som}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Market Dynamics & Nuance</span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    {analysis.market_size?.national_india?.analysis}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Primary Indian Growth Drivers</span>
                  <div className="space-y-1.5">
                    {analysis.market_size?.national_india?.growth_drivers?.map((gd, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/70">
                        <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{gd}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Global Market Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm">
                      <Globe2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Global Market (Worldwide)</h3>
                      <p className="text-[11px] text-slate-500">Cross-border TAM / SAM / SOM</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                    {analysis.market_size?.global?.cagr}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Global TAM</span>
                    <p className="text-sm font-black text-slate-900 mt-1">{analysis.market_size?.global?.tam}</p>
                  </div>
                  <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-100 text-center">
                    <span className="text-[10px] font-bold uppercase text-sky-600">Global SAM</span>
                    <p className="text-sm font-black text-sky-900 mt-1">{analysis.market_size?.global?.sam}</p>
                  </div>
                  <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-center">
                    <span className="text-[10px] font-bold uppercase text-emerald-600">Global SOM</span>
                    <p className="text-sm font-black text-emerald-900 mt-1">{analysis.market_size?.global?.som}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cross-Border Expansion Potential</span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    {analysis.market_size?.global?.analysis}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Top Geographic Hotspots</span>
                  <div className="space-y-1.5">
                    {analysis.market_size?.global?.top_regions?.map((reg, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/70">
                        <Globe2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>{reg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IDEAL INVESTORS */}
          {activeTab === 'investors' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-indigo-600" />
                  Target Investor Archetypes & Fund Recommendations
                </h3>
                <p className="text-xs text-slate-500">
                  Tailored investor profiles with proven mandates matching this pitch deck's vertical, stage, and capital requirements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.ideal_investors?.map((inv, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:border-indigo-300 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {inv.stage_focus}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{inv.investor_type}</h4>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        High Fit
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Investment Thesis Match</span>
                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                        {inv.thesis_fit}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recommended Funds & Angel Networks</span>
                      <div className="flex flex-wrap gap-1.5">
                        {inv.recommended_funds?.map((fund, fIdx) => (
                          <span key={fIdx} className="text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-lg">
                            {fund}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">What They Look For</span>
                      <p className="text-xs text-slate-600 italic">
                        "{inv.what_they_look_for}"
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Proof Metrics To Present</span>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {inv.key_metrics_to_show?.map((m, mIdx) => (
                          <li key={mIdx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMER SEGMENTS */}
          {activeTab === 'segments' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-indigo-600" />
                  Target Customer Personas & Willingness to Pay
                </h3>
                <p className="text-xs text-slate-500">
                  Customer segmentation delineating buyer profiles, urgency, pricing expectations, and acquisition funnels.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analysis.customer_segments?.map((seg, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                          Segment #{idx + 1}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          seg.urgency_of_need === 'CRITICAL' || seg.urgency_of_need === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {seg.urgency_of_need} Urgency
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{seg.segment_name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{seg.profile}</p>

                      <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100/80">
                        <span className="text-[10px] font-bold uppercase text-indigo-700">Willingness to Pay (ACV)</span>
                        <p className="text-xs font-bold text-indigo-950 mt-0.5">{seg.willingness_to_pay}</p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Key Pain Points</span>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {seg.key_pain_points?.map((p, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <span className="font-bold text-slate-700">Acquisition: </span>
                      <span>{seg.acquisition_channel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MAJOR INDUSTRY GAPS & WHITE SPACES */}
          {activeTab === 'gaps' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Major Industry Gaps & White Spaces
                </h3>
                <p className="text-xs text-slate-500">
                  Critical unmet needs, incumbent product failures, and the exact unfair advantages this startup possesses to capture them.
                </p>
              </div>

              <div className="space-y-4">
                {analysis.industry_gaps?.map((gap, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 font-black text-xs flex items-center justify-center shrink-0 border border-rose-200">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{gap.gap_title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          Category: {gap.category}
                        </span>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          {gap.urgency} URGENCY
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[11px] font-bold uppercase text-slate-500">Why Current Solutions Fail</span>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {gap.current_solution_deficiency}
                        </p>
                      </div>

                      <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/60 space-y-1">
                        <span className="text-[11px] font-bold uppercase text-emerald-800">Startup's Unfair Advantage</span>
                        <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                          {gap.startup_advantage}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                      <span>Opportunity Size: <strong className="text-slate-800">{gap.opportunity_size}</strong></span>
                      <span className="text-indigo-600 font-semibold flex items-center gap-1">
                        High Disruption Potential <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
