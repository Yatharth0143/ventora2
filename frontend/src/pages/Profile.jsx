import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile } from '../services/api'
import { User, ShieldCheck, Sparkles, Building2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [sector, setSector] = useState(user?.sector || '')
  const [stage, setStage] = useState(user?.stage || '')
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolio_url || '')
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updateProfile({
        name,
        sector,
        stage,
        portfolio_url: portfolioUrl,
        linkedin_url: linkedinUrl,
      })
      updateUser(res.data.user)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-150">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Profile & Trust Credentials</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your account identity, sector classification, and verification links.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-black text-xl flex items-center justify-center">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {user?.role}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                Tier: {user?.tier}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Sector</label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="e.g. Fintech, SaaS, D2C"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Stage</label>
              <input
                type="text"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                placeholder="e.g. Pre-Seed, Seed"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Portfolio Page URL</label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://yourfirm.com/portfolio"
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">LinkedIn Profile</label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer mt-4"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

