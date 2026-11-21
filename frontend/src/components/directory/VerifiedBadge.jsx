import React from 'react'
import { CheckCircle2, ShieldAlert } from 'lucide-react'

export default function VerifiedBadge({ verified, className = "" }) {
  if (verified) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Verified Investor
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}>
      <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
      Not yet verified
    </span>
  )
}

