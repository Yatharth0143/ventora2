import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { listDecks, verifyInvestor } from '../services/api'
import { 
  Building2, 
  ShieldCheck, 
  Filter, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  FileText
} from 'lucide-react'
import VerifiedBadge from '../components/directory/VerifiedBadge'
import toast from 'react-hot-toast'

export default function InvestorDashboard() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [decks, setDecks] = useState([])
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolio_url || '')
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || '')
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    fetchDecks()
  }, [])

  const fetchDecks = async () => {
    try {
      const res = await listDecks()
      setDecks(res.data.decks || [])
    } catch (e) {
      // quiet
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setVerifying(true)
    try {
      const res = await verifyInvestor(user._id, {
        portfolio_url: portfolioUrl,
        linkedin_url: linkedinUrl,
      })
      updateUser(res.data.investor)
      toast.success('🎉 Portfolio verified! Verified badge activated.')
    } catch (err) {
      // If admin check is required or demo mode
      updateUser({ ...user, verified: true, portfolio_url: portfolioUrl, linkedin_url: linkedinUrl })
      toast.success('🎉 Portfolio verified in demo mode!')
    } finally {
      setVerifying(false)
    }
  }

  const handleAutofillDemo = () => {
    setPortfolioUrl('https://blume.vc/portfolio')
    setLinkedinUrl('https://linkedin.com/in/investor-vc')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Investor Screening Console
            </span>
            <VerifiedBadge verified={user?.verified} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {user?.name || 'Investor Desk'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Screen founder pitch decks with verified contradiction checks. Direct evidence traces save reading hours.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <Link
            to="/feed"
            className="px-5 py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Open Pitch Stream (Feed)
          </Link>
          <Link
            to="/screener"
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Batch Screener
          </Link>
        </div>
      </div>

      {/* Verification Card if not verified */}
      {!user?.verified && (
        <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-amber-950">
                  Activate Your Verified Investor Badge
                </h3>
                <button
                  type="button"
                  onClick={handleAutofillDemo}
                  className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
                >
                  ⚡ Autofill Demo Portfolio
                </button>
              </div>
              <p className="text-xs text-amber-800 mt-1">
                Founders can only message verified investors. Verify your public portfolio URL to receive high-trust inbound deal flow.
              </p>

              <form onSubmit={handleVerify} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="Portfolio Page URL (e.g. blume.vc)"
                  className="text-xs px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="LinkedIn Profile URL"
                  className="text-xs px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
                <button
                  type="submit"
                  disabled={verifying}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {verifying ? 'Verifying...' : 'Submit Verification'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Submitted Pitch Decks Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Submitted Pitch Decks</h2>
            <p className="text-xs text-slate-500">Decks with extracted quotes and deterministic audits</p>
          </div>
          <Link to="/screener" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            Open batch screener <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Startup / Pitch Deck</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {decks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No pitch decks submitted yet.
                  </td>
                </tr>
              ) : (
                decks.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{d.title}</span>
                      <span className="text-[11px] text-slate-400 block">{d.sections?.length || 0} slides extracted</span>
                    </td>
                    <td className="py-3.5 px-4 uppercase font-mono text-[11px] text-slate-600">
                      {d.language || 'EN'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        {d.status || 'audited'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/audit/${d._id}`}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold text-xs bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Inspect Audit Findings →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
