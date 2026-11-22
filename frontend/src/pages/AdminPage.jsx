import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  getAdminStats,
  getAdminDecks,
  removeGarbageDeck,
  purgeAllGarbageDecks,
  purgeExpiredDecks,
  flagDeckGarbage,
  runAdminRagAudit,
  getAdminInvestors,
  warnInvestor,
  blockInvestor,
  unblockInvestor,
  queryDeckRag,
  runDeckRagAudit
} from '../services/api'
import {
  ShieldAlert,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  Clock,
  Sparkles,
  Users,
  FileText,
  UserX,
  RefreshCw,
  Search,
  CheckCircle,
  ExternalLink,
  Ban,
  ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('decks') // 'decks' | 'investors' | 'rag'
  const [stats, setStats] = useState(null)
  const [decks, setDecks] = useState([])
  const [investors, setInvestors] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // RAG tester state
  const [selectedDeckId, setSelectedDeckId] = useState('')
  const [ragPrompt, setRagPrompt] = useState('Total Addressable Market TAM claims and target segment pricing')
  const [ragResult, setRagResult] = useState(null)
  const [ragLoading, setRagLoading] = useState(false)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      setLoading(true)
      const [statsRes, decksRes, investorsRes] = await Promise.all([
        getAdminStats(),
        getAdminDecks(),
        getAdminInvestors()
      ])
      setStats(statsRes.data)
      const dList = decksRes.data.decks || []
      setDecks(dList)
      if (dList.length > 0 && !selectedDeckId) {
        setSelectedDeckId(dList[0]._id)
      }
      setInvestors(investorsRes.data.investors || [])
    } catch (err) {
      toast.error('Failed to load admin management data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadAll()
  }

  // --- Deck Actions ---
  const handleRemoveGarbage = async (deckId, title) => {
    if (!window.confirm(`Remove '${title}' as a Garbage Idea? This will permanently delete the deck and its audit log.`)) {
      return
    }
    try {
      await removeGarbageDeck(deckId)
      toast.success(`Removed garbage idea '${title}'`)
      setDecks(decks.filter((d) => d._id !== deckId))
    } catch (err) {
      toast.error('Failed to remove pitch deck')
    }
  }

  const handlePurgeAllGarbage = async () => {
    if (!window.confirm('Purge ALL pitch decks flagged with red-flag Garbage Idea verdicts?')) {
      return
    }
    try {
      const res = await purgeAllGarbageDecks()
      toast.success(res.data.message || 'Purged all garbage ideas')
      loadAll()
    } catch (err) {
      toast.error('Purge error')
    }
  }

  const handlePurgeExpired = async () => {
    if (!window.confirm('Purge all pitch decks past the 7-day retention period?')) {
      return
    }
    try {
      const res = await purgeExpiredDecks()
      toast.success(res.data.message || 'Purged expired decks')
      loadAll()
    } catch (err) {
      toast.error('Purge error')
    }
  }

  const handleRunAdminRAG = async (deckId) => {
    try {
      toast.loading('Running Sarvam AI RAG Audit...', { id: 'rag-run' })
      const res = await runAdminRagAudit(deckId)
      toast.success('RAG Audit complete! Verdict updated.', { id: 'rag-run' })
      loadAll()
    } catch (err) {
      toast.error('RAG Audit failed: ' + (err.response?.data?.detail || err.message), { id: 'rag-run' })
    }
  }

  // --- Investor Actions ---
  const handleWarnInvestor = async (investorId, name) => {
    const reason = window.prompt(
      `Issue formal 7-day inactivity warning to ${name}:`,
      'Overdue: No response to founder inquiries for 7+ days. Please respond to maintain active status.'
    )
    if (!reason) return

    try {
      await warnInvestor(investorId, reason)
      toast.success(`Warning issued to ${name}`)
      loadAll()
    } catch (err) {
      toast.error('Failed to issue warning')
    }
  }

  const handleBlockInvestor = async (investorId, name) => {
    const reason = window.prompt(
      `Block ${name} for unresponsiveness (>7 days)?`,
      'Account blocked due to unresponsiveness (>7 days without response).'
    )
    if (!reason) return

    try {
      await blockInvestor(investorId, reason)
      toast.success(`Blocked investor ${name}`)
      loadAll()
    } catch (err) {
      toast.error('Failed to block investor')
    }
  }

  const handleUnblockInvestor = async (investorId, name) => {
    try {
      await unblockInvestor(investorId)
      toast.success(`Reinstated investor ${name} to Active status`)
      loadAll()
    } catch (err) {
      toast.error('Failed to unblock investor')
    }
  }

  // --- RAG Tester Action ---
  const handleTestRAG = async () => {
    if (!selectedDeckId) {
      toast.error('Select a deck to query')
      return
    }
    setRagLoading(true)
    setRagResult(null)
    try {
      const res = await queryDeckRag(selectedDeckId, ragPrompt)
      setRagResult(res.data.rag_result)
      toast.success('RAG Audit analysis complete!')
    } catch (err) {
      toast.error('RAG query failed: ' + (err.response?.data?.detail || err.message))
    } finally {
      setRagLoading(false)
    }
  }

  // Filtered lists
  const filteredDecks = decks.filter(
    (d) =>
      d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.founder_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.verdict?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredInvestors = investors.filter(
    (i) =>
      i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.sector?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.status?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading Admin Intelligence Console...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Admin Governance Center
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Sarvam AI Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-2">
            Pitch Deck Verdicts & Investor Enforcement
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pitch deck verdicts stored for 7 days (auto-flagging & removing garbage ideas on red flags) · Investor responsiveness enforcement (warn first, then block after 7 days inactive).
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Decks Monitored</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats?.decks?.total ?? decks.length}</p>
          <p className="text-[11px] text-indigo-600 font-medium mt-1">7-Day Retention Window</p>
        </div>

        <div className="bg-white rounded-2xl border border-rose-200/80 bg-rose-50/20 p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase text-rose-500 tracking-wider">Garbage Ideas (Red Flags)</p>
          <p className="text-2xl font-black text-rose-700 mt-1">{stats?.decks?.garbage_count ?? 0}</p>
          <p className="text-[11px] text-rose-600 font-medium mt-1">Purgeable on Detection</p>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200/80 bg-amber-50/20 p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">Warned Investors</p>
          <p className="text-2xl font-black text-amber-700 mt-1">{stats?.investors?.warned ?? 0}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-1">1st Warning for Inactivity</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Blocked Investors</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats?.investors?.blocked ?? 0}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Blocked (&gt;7 Days Inactive)</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('decks')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'decks'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Pitch Deck Verdicts & 7-Day Purge ({decks.length})
        </button>

        <button
          onClick={() => setActiveTab('investors')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'investors'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Investor Responsiveness & Blocklist ({investors.length})
        </button>

        <button
          onClick={() => setActiveTab('rag')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'rag'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Minimal RAG Audit Terminal (Sarvam AI)
        </button>
      </div>

      {/* Search Bar */}
      {activeTab !== 'rag' && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={activeTab === 'decks' ? 'Filter decks by name, founder or verdict...' : 'Filter investors by name, sector, or status...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: PITCH DECK VERDICTS & 7-DAY RETENTION */}
      {/* ======================================================== */}
      {activeTab === 'decks' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-600">
              <span className="font-bold text-slate-900">7-Day Retention Rule:</span> Pitch decks are held for 7 days. If high-severity contradictions or red flags emerge, they are treated as <b>Garbage Ideas</b> and can be removed immediately.
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePurgeAllGarbage}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Purge All Garbage Ideas
              </button>
              <button
                onClick={handlePurgeExpired}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Clock className="w-3.5 h-3.5" />
                Purge Expired (&gt;7 Days)
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Pitch Deck & Founder</th>
                    <th className="p-4">7-Day Retention</th>
                    <th className="p-4">Verdict Status</th>
                    <th className="p-4">Red Flags & Evidence</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDecks.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400">
                        No pitch decks found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDecks.map((deck) => (
                      <tr key={deck._id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Deck Info */}
                        <td className="p-4">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            {deck.title}
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                              {deck.language}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Founder: <span className="font-medium text-slate-700">{deck.founder_name}</span> ({deck.founder_email || 'founder@ventora.in'})
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {deck.slides_count} slides extracted
                          </div>
                        </td>

                        {/* 7-Day Retention Status */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <Clock className={`w-3.5 h-3.5 ${deck.is_expired ? 'text-rose-500' : 'text-indigo-600'}`} />
                            <span className={`font-bold ${deck.is_expired ? 'text-rose-600' : 'text-slate-800'}`}>
                              {deck.retention_status}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Uploaded: {new Date(deck.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Expires: {new Date(deck.expires_at).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Verdict Status */}
                        <td className="p-4">
                          {deck.verdict === 'GARBAGE_IDEA' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Garbage Idea (Red Flag)
                            </span>
                          ) : deck.verdict === 'EXPIRED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                              <Clock className="w-3 h-3 text-slate-500" />
                              Expired (&gt;7 Days)
                            </span>
                          ) : deck.verdict === 'INVESTABLE' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Investable / Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Under Review
                            </span>
                          )}
                          <p className="text-[10px] text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                            {deck.verdict_reason}
                          </p>
                        </td>

                        {/* Findings Breakdown */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              deck.high_severity_count > 0 ? 'bg-rose-100 text-rose-800 font-black' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {deck.high_severity_count} Critical Red Flags
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                              {deck.findings_count} Total Findings
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {deck.contradiction_count} Contradictions · {deck.numeric_issue_count} Numeric Inconsistencies
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right space-y-1.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleRunAdminRAG(deck._id)}
                              title="Run Minimal RAG Audit with Sarvam AI"
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-lg border border-indigo-200 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-indigo-600" />
                              RAG Audit
                            </button>

                            <Link
                              to={`/audit/${deck._id}`}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <FileText className="w-3 h-3" />
                              Audit View
                            </Link>

                            <button
                              onClick={() => handleRemoveGarbage(deck._id, deck.title)}
                              title="Garbage idea mann kar hata denge"
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3 text-rose-600" />
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: INVESTOR RESPONSIVENESS & BLOCKLIST */}
      {/* ======================================================== */}
      {activeTab === 'investors' && (
        <div className="space-y-4">
          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Investor Responsiveness Protocol:</span> If an investor is not responding to founder inquiries within <b>7 days</b>, platform rules require giving them a <b>formal warning first</b>. If unresponsiveness persists or overdue time exceeds limits, admin can <b>block that investor</b> to protect founders' time.
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Investor Profile</th>
                    <th className="p-4">Inactivity & Overdue Check</th>
                    <th className="p-4">Current Status</th>
                    <th className="p-4">Unanswered Messages</th>
                    <th className="p-4 text-right">Enforcement Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvestors.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400">
                        No investor records found.
                      </td>
                    </tr>
                  ) : (
                    filteredInvestors.map((inv) => (
                      <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Profile */}
                        <td className="p-4">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            {inv.name}
                            {inv.verified && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                          </div>
                          <div className="text-[11px] text-slate-500">{inv.email}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {inv.sector || 'Generalist'} · {inv.stage || 'Seed'}
                          </div>
                        </td>

                        {/* Inactivity & 7-Day Overdue */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <Clock className={`w-3.5 h-3.5 ${inv.is_overdue ? 'text-rose-500' : 'text-slate-400'}`} />
                            <span className={`font-bold ${inv.is_overdue ? 'text-rose-600' : 'text-slate-700'}`}>
                              {inv.days_inactive} days inactive
                            </span>
                            {inv.is_overdue && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-bold border border-rose-200">
                                Overdue (&gt;7d)
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Last Active: {new Date(inv.last_active_at).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          {inv.status === 'blocked' ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                <Ban className="w-3 h-3 text-rose-600" />
                                Blocked
                              </span>
                              {inv.block_reason && (
                                <p className="text-[10px] text-rose-600 mt-1 max-w-xs">{inv.block_reason}</p>
                              )}
                            </div>
                          ) : inv.status === 'warned' ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                Warning Issued
                              </span>
                              {inv.warning_reason && (
                                <p className="text-[10px] text-amber-700 mt-1 max-w-xs">{inv.warning_reason}</p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Active
                            </span>
                          )}
                        </td>

                        {/* Unanswered Inquiries */}
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            inv.unanswered_inquiries > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {inv.unanswered_inquiries} Unread Inquiries
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.status === 'blocked' ? (
                              <button
                                onClick={() => handleUnblockInvestor(inv._id, inv.name)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                              >
                                Unblock Investor
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleWarnInvestor(inv._id, inv.name)}
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-lg border border-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  Issue Warning
                                </button>
                                <button
                                  onClick={() => handleBlockInvestor(inv._id, inv.name)}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg border border-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Ban className="w-3 h-3 text-rose-600" />
                                  Block
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MINIMAL RAG AUDIT TERMINAL (SARVAM AI) */}
      {/* ======================================================== */}
      {activeTab === 'rag' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Minimal RAG Pipeline
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Sarvam AI 105B Grounding
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-2">
                Grounded Pitch Deck Audit Query
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The minimal RAG pipeline retrieves the most relevant slide chunks using BM25 relevance scoring and grounds the Sarvam AI audit reasoning directly against exact slide text.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Pitch Deck:
                </label>
                <select
                  value={selectedDeckId}
                  onChange={(e) => setSelectedDeckId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  {decks.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.title} ({d.founder_name} · {d.slides_count} slides)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Preset Audit Verification Dimensions:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'TAM and Market sizing claims',
                    'Revenue, burn rate & runway sanity',
                    'Competitor moat & IP defensibility',
                    'CAC, LTV and unit economics'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRagPrompt(preset)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Audit Query:
              </label>
              <textarea
                rows="2"
                value={ragPrompt}
                onChange={(e) => setRagPrompt(e.target.value)}
                placeholder="Ask any audit hypothesis to verify against the deck slides..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleTestRAG}
              disabled={ragLoading || !selectedDeckId}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {ragLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Retrieving & Auditing with Sarvam AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Run RAG Audit Query
                </>
              )}
            </button>
          </div>

          {/* RAG Results Display */}
          {ragResult && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    RAG Verdict:
                  </span>
                  {ragResult.verdict === 'RED_FLAG' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      RED FLAG (Garbage Claim Detected)
                    </span>
                  ) : ragResult.verdict === 'VERIFIED' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      VERIFIED (Evidence Substantiated)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      SUSPICIOUS (Lacks Substantiation)
                    </span>
                  )}
                </div>

                <span className="text-xs text-slate-400">
                  Confidence: <b className="text-slate-700">{ragResult.confidence}</b>
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Audit Synthesis</h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {ragResult.answer}
                </p>
              </div>

              {/* Citations */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Grounded Citations from Pitch Deck
                </h3>
                <div className="space-y-2">
                  {ragResult.citations?.map((c, i) => (
                    <div key={i} className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200 text-xs text-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-indigo-700 text-[11px]">Slide {c.page_number}</span>
                        <span className="text-[10px] text-slate-400">Exact Word-for-Word Quote</span>
                      </div>
                      <p className="italic text-slate-700 font-mono text-[11px]">"{c.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
