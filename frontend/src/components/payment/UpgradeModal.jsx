import React, { useState } from 'react'
import { X, Sparkles, Check, ShieldCheck, Lock, CreditCard } from 'lucide-react'
import { subscribe } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function UpgradeModal({ isOpen, onClose }) {
  const { updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111')
  const [expiry, setExpiry] = useState('12/28')
  const [cvv, setCvv] = useState('888')

  if (!isOpen) return null

  const handlePay = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await subscribe({
        plan: 'founder_pro',
        card_number: cardNumber.replace(/\s+/g, ''),
        expiry,
        cvv,
      })

      if (res.data.tier_updated) {
        toast.success('🎉 Upgraded to Founder Pro! Full audit unlocked.')
        updateUser({ ...res.data.payment, tier: 'pro' })
        onClose()
      } else {
        toast.error(res.data.error || 'Payment failed')
      }
    } catch (err) {
      toast.error('Simulation payment error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            FOUNDER PRO
          </div>
          <h2 className="text-2xl font-black">Unlock Full Audit Report</h2>
          <p className="text-indigo-200 text-xs mt-1">Unlimited findings, direct verified investor chat & graph matching.</p>
          
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">₹999</span>
            <span className="text-indigo-200 text-xs">/ month (simulated checkout)</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>All Audit Findings Unlocked:</strong> View full contradiction trace and page references</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Direct Investor Chat:</strong> Initiate conversations with verified VCs</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Conflict Graph Detection:</strong> Automatically rank portfolio conflicts last</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Unlimited Pitch Deck Re-uploads:</strong> Re-audit revised decks instantly</span>
            </li>
          </ul>

          <form onSubmit={handlePay} className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Demo Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="4111 1111 1111 1111"
                  required
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Use 4111... for instant success; 0000... to test failure.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Expiry</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">CVV</label>
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="CVV"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-colors mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Confirm Simulated Payment (₹999)
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

