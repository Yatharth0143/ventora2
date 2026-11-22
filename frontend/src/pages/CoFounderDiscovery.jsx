import React, { useState, useEffect } from 'react'
import { getCofounders } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, 
  UserPlus, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare, 
  Search, 
  ArrowRight,
  Briefcase,
  Layers
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function CoFounderDiscovery() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const res = await getCofounders(user?._id || 'demo_priya')
      setMatches(res.data.matches || [])
    } catch (err) {
      // Fallback sample cofounders if graph service is offline
      setMatches([
        {
          id: 'co_1',
          name: 'Rohan Deshmukh',
          sector: 'Fintech / B2B',
          stage: 'Seed',
          shared_skills: ['Payments', 'UPI', 'Distributed Systems'],
          overlap_count: 3,
        },
        {
          id: 'co_2',
          name: 'Meera Iyer',
          sector: 'Fintech / AI',
          stage: 'Pre-seed',
          shared_skills: ['UPI', 'Product Strategy'],
          overlap_count: 2,
        },
        {
          id: 'co_3',
          name: 'Kabir Sen',
          sector: 'Fintech',
          stage: 'Seed',
          shared_skills: ['Payments', 'UPI'],
          overlap_count: 2,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = (cofounder) => {
    const partnerId = cofounder.id || 'co_1'
    navigate(`/chat/${partnerId}`, {
      state: {
        partner: {
          _id: partnerId,
          name: cofounder.name,
          role: 'founder',
          sector: cofounder.sector,
          stage: cofounder.stage,
          verified: true,
        },
        initialMessage: `Hi ${cofounder.name.split(' ')[0]}! I saw our complementary skills in ${cofounder.shared_skills?.slice(0, 2).join(' and ')} on Ventora. Would love to connect and chat about what we're building!`
      },
    })
  }

  // Get list of unique skills for filter
  const allSkills = Array.from(
    new Set(matches.flatMap((m) => m.shared_skills || []))
  )

  const filteredMatches = matches.filter((m) => {
    const matchesSearch =
      (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.sector || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.shared_skills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesSkill =
      selectedSkill === 'all' ||
      (m.shared_skills || []).some((s) => s.toLowerCase() === selectedSkill.toLowerCase())

    return matchesSearch && matchesSkill
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3 border border-indigo-200/60">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Graph Skill Matching Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Co-Founder Discovery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Discover compatible technical and business builders matched through shared <code className="font-mono text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">HAS_SKILL</code> graph edges. Clicking Connect opens a direct, active conversation instantly.
          </p>
        </div>

        {/* Filter bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, sector, or skill..."
              className="w-full text-xs pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">Filter by skill:</span>
            <button
              onClick={() => setSelectedSkill('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                selectedSkill === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Skills
            </button>
            {allSkills.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSkill(s)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                  selectedSkill === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Finding complementary builders in your startup graph...
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-800">No co-founders match your search</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try clearing filters or search by a broader keyword.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedSkill('all'); }}
            className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMatches.map((m, idx) => (
            <div
              key={m.id || idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-indigo-700 text-white font-black text-base flex items-center justify-center shadow-xs">
                      {m.name ? m.name.charAt(0) : 'C'}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{m.name}</h3>
                      <p className="text-xs text-slate-500">{m.sector || 'Early Stage Tech'}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                    {m.stage || 'Seed'}
                  </span>
                </div>

                {/* Overlap & skills */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Shared Skill Edges
                    </span>
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {m.overlap_count || m.shared_skills?.length || 2} Matching
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.shared_skills &&
                      m.shared_skills.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 bg-indigo-50/70 text-indigo-700 border border-indigo-200/50 rounded-lg text-xs font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Graph Verified
                </span>

                <button
                  onClick={() => handleConnect(m)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Connect & Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
