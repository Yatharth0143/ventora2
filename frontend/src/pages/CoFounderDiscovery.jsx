import React, { useState, useEffect } from 'react'
import { getCofounders } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Users, UserPlus, Sparkles, CheckCircle2, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function CoFounderDiscovery() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
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
      toast.error('Failed to load co-founder matches')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            USP 6: Neo4j Graph Traversal
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-2">Graph Co-Founder Discovery</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Matches derived via shared <code className="font-mono text-indigo-600">HAS_SKILL</code> graph edges with complementary startup stage.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Traversing Neo4j skill graph for complementary builders...
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
          No co-founder matches found yet. Update your skills in your profile!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {matches.map((m, idx) => (
            <div
              key={m.id || idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center mb-4">
                  {m.name ? m.name.charAt(0) : 'C'}
                </div>

                <h3 className="font-bold text-base text-slate-900">{m.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{m.sector}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase">
                  Stage: {m.stage}
                </span>

                <div className="mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Shared Graph Skills ({m.overlap_count})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.shared_skills &&
                      m.shared_skills.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-md text-[11px] font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Graph Verified
                </span>
                <button
                  onClick={() => navigate('/chat')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

