import React, { useState } from 'react'
import { Check, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react'
import UpgradeModal from '../components/payment/UpgradeModal'
import { useAuth } from '../contexts/AuthContext'

export default function Pricing() {
  const { user, isPro } = useAuth()
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-10 animate-in fade-in duration-150">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3 border border-indigo-200">
          <Sparkles className="w-3.5 h-3.5" />
          Transparent Trust Economics
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          One Subscription Powers the Free Tier for 14 Founders
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Free audit cost is under ₹70. We charge ₹999/month for Founder Pro so every Bharat founder can audit their first deck for free.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Free Tier */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900">Founder Free</h3>
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                Always Free
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Get initial proof that your claims hold together.</p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900">₹0</span>
              <span className="text-xs text-slate-400">/ forever</span>
            </div>

            <ul className="mt-6 space-y-3 text-xs text-slate-700">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>3 Verifiable Findings:</strong> Click-to-quote exact slide citations</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>22 Indian Languages:</strong> Sarvam AI + Bhashini pipeline</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>No-Percentages Fit Matrix:</strong> Derived values only</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Tamper-Evident SHA-256 Log:</strong> Public verify endpoint</span>
              </li>
            </ul>
          </div>

          <button
            disabled
            className="w-full mt-8 py-3 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl"
          >
            Included by Default
          </button>
        </div>

        {/* Founder Pro Tier */}
        <div className="bg-gradient-to-b from-indigo-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl relative flex flex-col justify-between border border-indigo-700">
          <div className="absolute -top-3 right-8">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-indigo-950 text-[10px] font-black uppercase tracking-wider shadow-md">
              <Sparkles className="w-3 h-3 fill-indigo-950" />
              Most Popular
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-white">Founder Pro</h3>
            </div>
            <p className="text-xs text-indigo-200 mt-1">Full report, investor matching, and direct verified chat.</p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">₹999</span>
              <span className="text-xs text-indigo-300">/ month (simulated gateway)</span>
            </div>

            <ul className="mt-6 space-y-3 text-xs text-indigo-100">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>All Audit Findings:</strong> Full contradiction trace without limits</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Direct VC Messaging:</strong> Chat with verified investors</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Neo4j Conflict Engine:</strong> Detect portfolio conflicts with source URLs</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Unlimited Re-uploads:</strong> Re-audit revised decks as numbers update</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setShowUpgrade(true)}
            className="w-full mt-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPro ? 'Plan Active (Pro)' : 'Upgrade to Founder Pro (₹999)'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showUpgrade && <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}

