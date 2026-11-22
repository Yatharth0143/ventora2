import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  User, 
  CheckCircle2,
  Copy,
  Check,
  Compass,
  Rocket,
  Lock,
  ExternalLink
} from 'lucide-react'
import { googleLogin, demoLogin } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('founder')
  const [emailInput, setEmailInput] = useState('priya@example.com')
  const [nameInput, setNameInput] = useState('Priya Sharma')
  const [loading, setLoading] = useState(false)
  const [copiedKey, setCopiedKey] = useState('')

  // Hardcoded Demo Accounts requested by user
  const DEMO_FOUNDER = {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    role: 'founder',
    badge: 'Founder Account',
    description: 'Pitch Deck Creator · FinFlow SME Payments · Free Tier',
    tags: ['Fintech', 'UPI', 'Seed'],
  }

  const DEMO_INVESTOR = {
    name: 'Vikram Mehta',
    email: 'vikram@example.com',
    role: 'investor',
    badge: 'Verified VC Investor',
    description: 'Mehta Ventures Partner · Healthcare & Fintech Screening Desk',
    tags: ['VC Partner', 'Healthcare', 'Fintech'],
  }

  const handleCopyCredentials = (accountKey, email) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email)
      setCopiedKey(accountKey)
      toast.success(`Copied ${email} to clipboard!`)
      setTimeout(() => setCopiedKey(''), 2000)
    }
  }

  const handleInstantSignIn = async (account) => {
    try {
      setLoading(true)
      const res = await demoLogin(account.email, account.name, account.role)
      login(res.data.token, res.data.user)
      toast.success(`Welcome to Ventora, ${res.data.user.name}! 🎉`)
      navigate('/feed')
    } catch (err) {
      toast.error('Authentication error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true)
      const res = await googleLogin(credentialResponse.credential, role)
      login(res.data.token, res.data.user)
      toast.success(`Welcome to Ventora, ${res.data.user.name}!`)
      navigate('/feed')
    } catch (err) {
      toast.error('Google Sign-In failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCustomSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await demoLogin(emailInput, nameInput, role)
      login(res.data.token, res.data.user)
      toast.success(`Signed in as ${res.data.user.name}`)
      navigate('/feed')
    } catch (err) {
      toast.error('Demo authentication error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
      {/* Decorative gradient glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center relative z-10 mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/40 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="font-black text-2xl tracking-tight text-white">VENTORA</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Sign In to Ventora
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Explore startup pitches on the Social Feed, inspect verified quotes, or screen deals with deterministic AI.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* HARDCODED DEMO CREDENTIALS BOX (Requested by user) */}
          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Demo Hardcoded Credentials
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                1-Click Ready
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-4">
              Click either credential card below to test the platform immediately as a Founder or Verified Investor:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Account 1: Founder */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 hover:border-indigo-500/80 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Founder
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials('founder', DEMO_FOUNDER.email)}
                      className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy email"
                    >
                      {copiedKey === 'founder' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                    {DEMO_FOUNDER.name}
                  </h4>
                  <div className="mt-1 font-mono text-[11px] text-slate-400 bg-black/40 px-2 py-1 rounded border border-slate-800 break-all select-all">
                    {DEMO_FOUNDER.email}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {DEMO_FOUNDER.description}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleInstantSignIn(DEMO_FOUNDER)}
                  className="mt-4 w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Enter as Founder →</span>
                </button>
              </div>

              {/* Account 2: Investor */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/80 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Verified Investor
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials('investor', DEMO_INVESTOR.email)}
                      className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy email"
                    >
                      {copiedKey === 'investor' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                    {DEMO_INVESTOR.name}
                  </h4>
                  <div className="mt-1 font-mono text-[11px] text-slate-400 bg-black/40 px-2 py-1 rounded border border-slate-800 break-all select-all">
                    {DEMO_INVESTOR.email}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {DEMO_INVESTOR.description}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleInstantSignIn(DEMO_INVESTOR)}
                  className="mt-4 w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Enter as Investor →</span>
                </button>
              </div>
            </div>
          </div>

          {/* Google Sign-in */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-slate-800" />
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Or Continue With Google
              </span>
              <div className="flex-1 border-t border-slate-800" />
            </div>

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
          </div>

          {/* Custom Sign-in Form */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Or Enter Custom Name & Email
              </label>
            </div>

            {/* Role switch */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setRole('founder')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  role === 'founder'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Founder Role
              </button>
              <button
                type="button"
                onClick={() => setRole('investor')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  role === 'investor'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Investor Role
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Email Address"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In with Name & Email'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom trust footer */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
          <Link to="/" className="hover:text-slate-300 transition-colors">
            ← Back to Landing
          </Link>
          <span>•</span>
          <a
            href="/api/verify/chain"
            target="_blank"
            rel="noreferrer"
            className="hover:text-indigo-400 transition-colors inline-flex items-center gap-1 font-mono text-[11px]"
          >
            <span>SHA-256 Chain</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
