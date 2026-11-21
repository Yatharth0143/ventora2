import React, { useState, useEffect } from 'react'
import { listDecks, batchScreen } from '../services/api'
import { Filter, AlertTriangle, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BatchScreener() {
  const [decks, setDecks] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [results, setResults] = useState([])
  const [screening, setScreening] = useState(false)

  useEffect(() => {
    loadDecks()
  }, [])

  const loadDecks = async () => {
    try {
      const res = await listDecks()
      const dList = res.data.decks || []
      setDecks(dList)
      setSelectedIds(dList.map((d) => d._id)) // preselect all
    } catch (e) {
      // quiet
    }
  }

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleScreen = async () => {
    if (selectedIds.length === 0) {
      toast.error('Select at least one pitch deck to screen')
      return
    }

    setScreening(true)
    try {
      const res = await batchScreen(selectedIds)
      setResults(res.data.results || [])
      toast.success('Batch red-flag screening complete!')
    } catch (err) {
      toast.error('Screening error')
    } finally {
      setScreening(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            USP 14: Investor Toolkit
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-2">Batch Red-Flag Screener</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Screen 3+ pitch decks simultaneously to extract ranked red flags before dedicating partner reading hours.
        </p>
      </div>

      {/* Select Decks */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 mb-3">Select Decks to Batch Screen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {decks.map((d) => (
            <label
              key={d._id}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                selectedIds.includes(d._id)
                  ? 'bg-indigo-50/70 border-indigo-400 text-indigo-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(d._id)}
                  onChange={() => handleToggleSelect(d._id)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-bold text-xs truncate max-w-[180px]">{d.title}</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-white px-2 py-0.5 rounded border border-slate-200">
                {d.language}
              </span>
            </label>
          ))}
        </div>

        <button
          onClick={handleScreen}
          disabled={screening || selectedIds.length === 0}
          className="mt-5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {screening ? 'Screening Red Flags...' : `Run Batch Screener (${selectedIds.length} Decks)`}
        </button>
      </div>

      {/* Screening Output */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">Ranked Red-Flag Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {results.map((r) => (
              <div key={r.deck_id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{r.title}</h3>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      r.risk_score === 'High'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    Risk: {r.risk_score}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {r.red_flags.length === 0 ? (
                    <p className="text-xs text-slate-400">No high/medium red flags found.</p>
                  ) : (
                    r.red_flags.map((rf, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{rf.title}</span>
                          <span className="text-[10px] uppercase font-bold text-red-600">{rf.severity}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{rf.reason}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

