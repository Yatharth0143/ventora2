import React, { useState, useEffect } from 'react'
import { listInvestors, getMatches } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import InvestorCard from '../components/directory/InvestorCard'
import { 
  Search, 
  Filter, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react'
import toast from 'react-hot-toast'

const SECTOR_OPTIONS = [
  { id: 'all', label: 'All Sectors' },
  { id: 'fintech', label: 'Fintech & Payments' },
  { id: 'saas', label: 'SaaS & DevTools' },
  { id: 'health', label: 'Healthtech & AI' },
  { id: 'consumer', label: 'Consumer & D2C' },
  { id: 'logistics', label: 'Logistics' },
]

export default function InvestorDirectory() {
  const { user } = useAuth()
  const [investors, setInvestors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  useEffect(() => {
    fetchInvestors()
  }, [sector, verifiedOnly])

  const fetchInvestors = async () => {
    try {
      setLoading(true)
      if (user?._id) {
        // Fetch matches ranked by conflict (conflicted investors ranked last with Tracxn source)
        const res = await getMatches(user._id)
        let list = res.data.investors || []

        if (verifiedOnly) {
          list = list.filter((i) => i.verified)
        }
        if (sector !== 'all') {
          list = list.filter((i) => (i.sector || '').toLowerCase().includes(sector.toLowerCase()))
        }
        if (search) {
          list = list.filter((i) => (i.name || '').toLowerCase().includes(search.toLowerCase()))
        }
        setInvestors(list)
      } else {
        const res = await listInvestors({ search, sector, verified_only: verifiedOnly })
        setInvestors(res.data.investors || [])
      }
    } catch (err) {
      toast.error('Failed to load investor directory')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchInvestors()
  }

  const conflictedCount = investors.filter((i) => i.has_conflict).length

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3 border border-emerald-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Neo4j Conflict Auto-Ranking Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Verified Investor Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Connect directly with verified angels and seed micro-VCs. Investors who backed direct competitors are automatically detected and ranked last, with source verification links.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by investor name or firm..."
              className="w-full text-xs pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {SECTOR_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSector(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  sector === opt.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}

            <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer select-none ml-auto md:ml-2">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              <span>Verified Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Meta status bar */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <span>
          Showing <strong>{investors.length}</strong> investors
        </span>
        {conflictedCount > 0 && (
          <span className="text-amber-700 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            {conflictedCount} investor with competitor portfolio flagged
          </span>
        )}
      </div>

      {/* Investor Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Ranking investors through Neo4j portfolio graph...
        </div>
      ) : investors.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-800">No investors found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or reset sector filters.
          </p>
          <button
            onClick={() => { setSearch(''); setSector('all'); setVerifiedOnly(false); }}
            className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {investors.map((inv) => (
            <InvestorCard key={inv._id || inv.id} investor={inv} />
          ))}
        </div>
      )}
    </div>
  )
}
