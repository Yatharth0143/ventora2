import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  MessageSquare, 
  AlertOctagon, 
  ExternalLink,
  ShieldAlert,
  Sparkles
} from 'lucide-react'
import VerifiedBadge from './VerifiedBadge'
import { useAuth } from '../../contexts/AuthContext'
import UpgradeModal from '../payment/UpgradeModal'

export default function InvestorCard({ investor }) {
  const { user, isPro } = useAuth()
  const navigate = useNavigate()
  const [showUpgrade, setShowUpgrade] = useState(false)

  const hasConflict = investor.has_conflict === true
  const conflictInfo = investor.conflict_info

  const handleChatClick = () => {
    if (!isPro && user?.role === 'founder') {
      setShowUpgrade(true)
      return
    }
    if (!investor.verified) {
      alert("Cannot message unverified investors.")
      return
    }
    navigate(`/chat/${investor._id}`)
  }

  return (
    <>
      <div className={`bg-white rounded-xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
        hasConflict ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
      }`}>
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                {investor.name ? investor.name.charAt(0) : 'I'}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{investor.name}</h3>
                <p className="text-xs text-slate-500">{investor.sector || 'Early Stage Investor'}</p>
              </div>
            </div>

            <VerifiedBadge verified={investor.verified} />
          </div>

          {/* Graph Conflict Alert (USP 4 & 5) */}
          {hasConflict && (
            <div className="mt-3.5 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-900">
              <div className="font-bold flex items-center gap-1.5 text-red-700">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                Neo4j Portfolio Conflict Detected
              </div>
              <p className="mt-1 text-[11px] text-red-800">
                {conflictInfo?.message || "Invested in competing portfolio company."}
              </p>
              {conflictInfo?.conflicts && conflictInfo.conflicts[0] && (
                <a
                  href={conflictInfo.conflicts[0].source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-red-700 hover:underline"
                >
                  Source: {conflictInfo.conflicts[0].portfolio_company} on Tracxn
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Data Gap Notice (Honest Response) */}
          {investor.conflict_info?.status === 'data_gap' && (
            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-600">
              <span className="font-bold">Graph Status:</span> Not found in graph, unverified.
            </div>
          )}

          {/* Details */}
          <div className="mt-4 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Stage: {investor.stage || 'Seed, Pre-Seed'}</span>
            </div>
            {investor.portfolio_url && (
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <a 
                  href={investor.portfolio_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-indigo-600 hover:underline truncate"
                >
                  Portfolio Link
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          {investor.fit_score !== undefined && (
            <div className="text-[11px]">
              <span className="text-slate-400">Match Fit: </span>
              <span className="font-bold text-indigo-600">{Math.round(investor.fit_score * 100)}%</span>
            </div>
          )}

          <button
            onClick={handleChatClick}
            disabled={!investor.verified}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              investor.verified 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {investor.verified ? 'Direct Message' : 'Chat Unavailable'}
          </button>
        </div>
      </div>

      {showUpgrade && <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />}
    </>
  )
}

