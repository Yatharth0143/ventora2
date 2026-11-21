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
  AlertOctagon 
} from 'lucide-react'
import toast from 'react-hot-toast'

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
        // Fetch matches ranked by conflict (USP 4: conflicted ranked last!)
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

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            Graph-Backed Matching
          </span>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            USP 4 & 5 Auto-Ranking Active
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-2">Verified Investor Directory</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Connect with angels and micro-VCs. Conflicted investors who funded competing companies are automatically ranked last with source links.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by investor name or focus area..."
            className="w-full text-xs pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Sectors</option>
            <option value="fintech">Fintech & Payments</option>
            <option value="saas">SaaS & DevTools</option>
            <option value="health">Healthtech & AI</option>
            <option value="consumer">Consumer & D2C</option>
          </select>

          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span>Verified only</span>
          </label>
        </div>
      </div>

      {/* Investor Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Querying Neo4j portfolio relationships and conflict auto-ranking...
        </div>
      ) : investors.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
          No investors match your filter criteria.
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

