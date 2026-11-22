import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { setPreferences } from '../../services/api'
import { Sparkles, Check, X, Compass, Cpu, Layers, Laptop } from 'lucide-react'
import toast from 'react-hot-toast'

export const PREFERENCE_OPTIONS = [
  { id: 'software', label: 'Software & SaaS', icon: '💻', desc: 'Enterprise SaaS, workflow automation, PLG' },
  { id: 'technology', label: 'Technology', icon: '🌐', desc: 'Core infrastructure, developer tools, cloud' },
  { id: 'ai', label: 'Artificial Intelligence', icon: '🤖', desc: 'LLMs, AI agents, computer vision, GenAI' },
  { id: 'hardware', label: 'Hardware & IoT', icon: '⚡', desc: 'Connected devices, sensors, semiconductors' },
  { id: 'fintech', label: 'FinTech & Payments', icon: '💳', desc: 'UPI, lending, neobanks, cross-border flows' },
  { id: 'healthtech', label: 'HealthTech', icon: '🏥', desc: 'Telehealth, diagnostic AI, biotech, pharma' },
  { id: 'deeptech', label: 'DeepTech & Robotics', icon: '🔬', desc: 'Drones, space tech, quantum, advanced engineering' },
  { id: 'cleantech', label: 'CleanTech & Climate', icon: '🌱', desc: 'EV ecosystem, solar, carbon management' },
  { id: 'edtech', label: 'EdTech & Upskilling', icon: '🎓', desc: 'K-12, higher ed, vernacular job readiness' },
  { id: 'd2c', label: 'Consumer & D2C', icon: '🛍️', desc: 'Digital-first brands, omnichannel retail' },
  { id: 'logistics', label: 'Logistics & Supply Chain', icon: '🚚', desc: 'Fleet tracking, warehousing, Bharat freight' },
  { id: 'cybersecurity', label: 'Cybersecurity', icon: '🛡️', desc: 'Zero trust, fraud defense, data privacy' }
]

export default function PreferencesModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth()
  const [selected, setSelected] = useState(user?.preferences || ['software', 'ai'])
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const togglePreference = (id) => {
    if (selected.includes(id)) {
      if (selected.length === 1) {
        toast.error('Please keep at least one category selected')
        return
      }
      setSelected(selected.filter((item) => item !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await setPreferences(selected)
      if (res.data?.user) {
        updateUser(res.data.user)
      } else {
        updateUser({ ...user, preferences: selected, preferences_set: true })
      }
      toast.success('Your feed preferences have been updated!')
      onClose()
    } catch (err) {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Personalized Deal & Pitch Feed</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Select Your Tech & Sector Preferences
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Customize what you see in the Instagram-style pitch feed. We'll prioritize verified decks and founder video pitches matching these tags.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preferences Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {PREFERENCE_OPTIONS.map((opt) => {
            const isChecked = selected.includes(opt.id)
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => togglePreference(opt.id)}
                className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isChecked
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <span className="text-xl shrink-0 mt-0.5">{opt.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold truncate ${isChecked ? 'text-indigo-950' : 'text-slate-900'}`}>
                      {opt.label}
                    </p>
                    {isChecked && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 ml-1">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{opt.desc}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected count info & action buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Selected: <strong className="text-indigo-600">{selected.length}</strong> categories
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Tune My Feed'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
