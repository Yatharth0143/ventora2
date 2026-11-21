import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { ShieldCheck, ArrowRight, UserCheck, Sparkles, Building2, User } from 'lucide-react'
import { googleLogin, demoLogin } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('founder')
  const [demoEmail, setDemoEmail] = useState('priya@example.com')
  const [demoName, setDemoName] = useState('Priya Sharma')
  const [loading, setLoading] = useState(false)

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true)
      const res = await googleLogin(credentialResponse.credential, role)
      login(res.data.token, res.data.user)
      toast.success(`Welcome to Ventora, ${res.data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error('Google Sign-In failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await demoLogin(demoEmail, demoName, role)
      login(res.data.token, res.data.user)
      toast.success(`Signed in as ${res.data.user.name}`)
      navigate('/dashboard')
    } catch (err) {
      toast.error('Demo authentication error')
    } finally {
      setLoading(false)
    }
  }

  const selectPreset = (email, name, r) => {
    setDemoEmail(email)
    setDemoName(name)
    setRole(r)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">Sign in to Ventora</h2>
        <p className="text-xs text-slate-400 mt-2">
          Verify pitch claims or screen high-trust founders
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/80 border border-slate-700/80 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl backdrop-blur-md">
          {/* Role Selector */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('founder')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  role === 'founder'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                Founder
              </button>
              <button
                type="button"
                onClick={() => setRole('investor')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  role === 'investor'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Investor
              </button>
            </div>
          </div>

          {/* Google Sign-in */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Sign-in Failed')}
                theme="filled_blue"
                shape="pill"
                size="large"
                text="continue_with"
              />
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-3 text-slate-400 font-bold text-[10px]">
                  Or One-Click Demo Personas
                </span>
              </div>
            </div>

            {/* Quick Demo Personas */}
            <div className="space-y-2 mb-4">
              <button
                type="button"
                onClick={() => selectPreset('priya@example.com', 'Priya Sharma', 'founder')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-700 bg-slate-900/40 hover:bg-slate-700/50 transition-colors text-xs flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="font-bold text-white">Priya Sharma (Founder)</p>
                  <p className="text-[11px] text-slate-400">FinFlow Hindi Deck · Free Tier</p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  Select
                </span>
              </button>

              <button
                type="button"
                onClick={() => selectPreset('vikram@example.com', 'Vikram Mehta', 'investor')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-700 bg-slate-900/40 hover:bg-slate-700/50 transition-colors text-xs flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="font-bold text-white">Vikram Mehta (Investor)</p>
                  <p className="text-[11px] text-slate-400">Verified · Planted Graph Conflict</p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Select
                </span>
              </button>
            </div>

            {/* Demo Manual Form */}
            <form onSubmit={handleDemoSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {loading ? 'Authenticating...' : 'Sign In with Selected Persona'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

