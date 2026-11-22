import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Building2, 
  Briefcase, 
  MessageSquare, 
  AlertTriangle, 
  ExternalLink,
  ShieldAlert,
  Sparkles,
  CheckCircle2
} from 'lucide-react'
import VerifiedBadge from './VerifiedBadge'
import { useAuth } from '../../contexts/AuthContext'
import UpgradeModal from '../payment/UpgradeModal'
import toast from 'react-hot-toast'

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
      toast.error('Cannot message unverified investors until their portfolio is verified.')
      return
    }
    navigate(`/chat/${investor._id}`, {
      state: {
        partner: {
          _id: investor._id,
          name: investor.name,
          role: 'investor',
          sector: investor.sector,
          stage: investor.stage,
          verified: investor.verified,
        },
      },
    })
  }

  return (
    <>
      <div
        className={`bg-white rounded-2xl border p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
          hasConflict
            ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-200'
            : 'border-slate-200'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-indigo-900 text-white font-black text-base flex items-center justify-center shadow-xs">
                {investor.name ? investor.name.charAt(0) : 'I'}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{investor.name}</h3>
                <p className="text-xs text-slate-500">{investor.sector || 'Early Stage Investor'}</p>
              </div>
            </div>

            <VerifiedBadge verified={investor.verified} />
          </div>

          {/* Graph Conflict Alert */}
          {hasConflict && (
            <div className="mt-4 bg-red-50/90 border border-red-200 rounded-xl p-3 text-xs text-red-900">
              <div className="font-bold flex items-center gap-1.5 text-red-700">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Portfolio Conflict Detected</span>
              </div>
              <p className="mt-1 text-[11px] text-red-800 leading-relaxed">
                {conflictInfo?.message || 'Invested in competing portfolio company.'}
              </p>
              {conflictInfo?.conflicts && conflictInfo.conflicts[0] && (
                <a
                  href={conflictInfo.conflicts[0].source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-red-700 hover:underline bg-white px-2 py-0.5 rounded border border-red-200"
                >
                  <span>Source: {conflictInfo.conflicts[0].portfolio_company} on Tracxn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Data Gap Notice */}
          {investor.conflict_info?.status === 'data_gap' && (
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600">
              <span className="font-bold text-slate-700">Graph Status:</span> Not yet in Neo4j verification graph.
            </div>
          )}

          {/* Details */}
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Investment Stage: <strong>{investor.stage || 'Seed, Pre-Seed'}</strong></span>
            </div>
            {investor.portfolio_url && (
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <a
                  href={investor.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 font-semibold hover:underline truncate"
                >
                  Verified Portfolio Link ↗
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            {investor.fit_score !== undefined ? (
              <div className="text-[11px]">
                <span className="text-slate-400">Match Fit: </span>
                <span className="font-black text-indigo-600">
                  {Math.round(investor.fit_score * 100)}%
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400">Direct Inbound</span>
            )}
          </div>

          <button
            onClick={handleChatClick}
            disabled={!investor.verified}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              investor.verified
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {investor.verified ? 'Direct Message' : 'Unverified'}
          </button>
        </div>
      </div>

      {showUpgrade && (
        <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
      )}
    </>
  )
}
