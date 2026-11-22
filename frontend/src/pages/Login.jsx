import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  User, 
  CheckCircle2,
  AlertTriangle,
  Lock
} from 'lucide-react'
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
    e?.preventDefault()
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

  const selectAndLoginPersona = async (email, name, r) => {
    setDemoEmail(email)
    setDemoName(name)
    setRole(r)
    try {
      setLoading(true)
      const res = await demoLogin(email, name, r)
      login(res.data.token, res.data.user)
      toast.success(`Signed in as ${res.data.user.name}`)
      navigate('/dashboard')
    } catch (err) {
      toast.error('Authentication error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">Sign in to Ventora</h2>
        <p className="text-xs text-slate-400 mt-2">
          Verify pitch deck claims or screen high-trust founders in 22 languages
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-800/80 border border-slate-700/80 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl backdrop-blur-md">
          {/* Quick Demo Personas - 1-Click Login */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Demo Personas
              </label>
              <span className="text-[10px] text-indigo-400 font-semibold">Instant Access</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
              {/* Persona 1: Priya */}
              <button
                type="button"
                onClick={() => selectAndLoginPersona('priya@example.com', 'Priya Sharma', 'founder')}
                className="text-left p-3 rounded-2xl border border-slate-700 bg-slate-900/60 hover:border-indigo-500 hover:bg-indigo-950/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs group-hover:text-indigo-300">
                    Priya Sharma
                  </span>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    Free Founder
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  FinFlow Hindi Deck · 3 Free Findings
                </p>
              </button>

              {/* Persona 2: Arjun */}
              <button
                type="button"
                onClick={() => selectAndLoginPersona('arjun@example.com', 'Arjun Patel', 'founder')}
                className="text-left p-3 rounded-2xl border border-slate-700 bg-slate-900/60 hover:border-amber-500 hover:bg-amber-950/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs group-hover:text-amber-300">
                    Arjun Patel
                  </span>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    Pro Founder
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  All Findings & Direct VC Chat Unlocked
                </p>
              </button>

              {/* Persona 3: Vikram */}
              <button
                type="button"
                onClick={() => selectAndLoginPersona('vikram@example.com', 'Vikram Mehta', 'investor')}
                className="text-left p-3 rounded-2xl border border-slate-700 bg-slate-900/60 hover:border-emerald-500 hover:bg-emerald-950/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs group-hover:text-emerald-300">
                    Vikram Mehta
                  </span>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Investor (Verified)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Planted Conflict with BharatInvoice
                </p>
              </button>

              {/* Persona 4: Harsh */}
              <button
                type="button"
                onClick={() => selectAndLoginPersona('harsh@example.com', 'Harshvardhan Joshi', 'investor')}
                className="text-left p-3 rounded-2xl border border-slate-700 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-800 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs group-hover:text-slate-200">
                    Harshvardhan
                  </span>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                    Unverified VC
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Test Portfolio Verification Flow
                </p>
              </button>
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-3 text-slate-400 font-bold text-[10px]">
                Or Sign In with Google
              </span>
            </div>
          </div>

          {/* Google Sign-in */}
          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Sign-in Failed')}
              theme="filled_blue"
              shape="pill"
              size="large"
              text="continue_with"
            />
          </div>

          {/* Role selector for custom signin */}
          <div className="border-t border-slate-700/80 pt-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Or Custom Sign-in
            </label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setRole('founder')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  role === 'founder'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-900/40 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Founder
              </button>
              <button
                type="button"
                onClick={() => setRole('investor')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  role === 'investor'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-900/40 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Investor
              </button>
            </div>

            <form onSubmit={handleDemoSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <input
                  type="email"
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In with Name & Email'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
