import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { listDecks } from '../services/api'
import DeckCard from '../components/deck/DeckCard'
import { 
  UploadCloud, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Users, 
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  UserPlus
} from 'lucide-react'
import UpgradeModal from '../components/payment/UpgradeModal'

export default function FounderDashboard() {
  const { user, isPro } = useAuth()
  const [decks, setDecks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    fetchDecks()
  }, [])

  const fetchDecks = async () => {
    try {
      const res = await listDecks()
      setDecks(res.data.decks || [])
    } catch (err) {
      // quiet
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-bold text-indigo-200 mb-3 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Founder Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || 'Founder'}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-2 leading-relaxed">
            Audit your pitch decks across 22 Indian languages. Every finding is verifiable in code — quotes and numeric claims are checked directly against your slides with zero AI hallucinations.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/feed"
              className="px-5 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-black text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <span>Explore Social Feed</span>
            </Link>

            <Link
              to="/upload"
              className="px-5 py-2.5 bg-indigo-500/30 hover:bg-indigo-500/40 text-white font-bold text-xs rounded-xl border border-indigo-400/30 transition-colors flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4 text-white" />
              Upload Pitch & Video
            </Link>

            <Link
              to="/investors"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-indigo-200" />
              Find Verified Investors
            </Link>

            <Link
              to="/cofounders"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-indigo-200" />
              Co-Founder Discovery
            </Link>

            {!isPro && (
              <button
                onClick={() => setShowUpgrade(true)}
                className="px-5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold text-xs rounded-xl border border-amber-400/30 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Upgrade to Pro (₹999)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Audited Decks</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{decks.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Active evidence pipelines
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Tier</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2 uppercase">
            {user?.tier || 'Free'}
          </p>
          <span className="text-[11px] text-slate-500 mt-1">
            {isPro ? 'All findings & VC chat unlocked' : '3 free verifiable findings per audit'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Investor Network</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">20+ VCs</p>
          <Link to="/investors" className="text-[11px] text-indigo-600 font-bold hover:underline mt-1 inline-block">
            Explore verified directory →
          </Link>
        </div>
      </div>

      {/* Decks Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Your Audited Pitch Decks</h2>
            <p className="text-xs text-slate-500">Inspect citations, fit matrix, and generated reports</p>
          </div>
          <Link
            to="/upload"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Upload Deck <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            Loading pitch decks...
          </div>
        ) : decks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">No pitch decks uploaded yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Upload your pitch deck in Hindi, Hinglish, or English to get instant verifiable findings.
            </p>
            <Link
              to="/upload"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Upload First Deck
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {decks.map((d) => (
              <DeckCard key={d._id} deck={d} />
            ))}
          </div>
        )}
      </div>

      {showUpgrade && <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}
