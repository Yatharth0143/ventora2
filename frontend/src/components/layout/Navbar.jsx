import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { demoLogin } from '../../services/api'
import {
  ShieldCheck,
  Sparkles,
  LogOut,
  Menu,
  ExternalLink,
  ChevronDown,
  UserCheck,
  Compass,
  PlusCircle,
  Bell,
  Search
} from 'lucide-react'
import UpgradeModal from '../payment/UpgradeModal'
import toast from 'react-hot-toast'

const DEMO_PERSONAS = [
  { name: 'Priya Sharma', email: 'priya@example.com', role: 'founder', tag: 'Founder (Free)' },
  { name: 'Vikram Mehta', email: 'vikram@example.com', role: 'investor', tag: 'Investor (Verified)' },
  { name: 'Arjun Patel', email: 'arjun@example.com', role: 'founder', tag: 'Founder (Pro)' },
  { name: 'Harshvardhan', email: 'harsh@example.com', role: 'investor', tag: 'Investor (Unverified)' },
]

export default function Navbar({ onToggleSidebar }) {
  const { user, login, logout, isPro } = useAuth()
  const navigate = useNavigate()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showPersonaMenu, setShowPersonaMenu] = useState(false)

  const handleSwitchPersona = async (p) => {
    try {
      const res = await demoLogin(p.email, p.name, p.role)
      login(res.data.token, res.data.user)
      toast.success(`Switched persona to ${p.name}`)
      setShowPersonaMenu(false)
      navigate('/feed')
    } catch (err) {
      toast.error('Failed to switch persona')
    }
  }

  return (
    <>
      <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
        {/* Left: Hamburger + Brand + Feed Quick Nav */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/feed" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-slate-900">VENTORA</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Social Feed
              </span>
            </div>
          </Link>

          {/* Direct Feed pill button in header */}
          <Link
            to="/feed"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition-colors ml-2"
          >
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>Browse Pitches</span>
          </Link>
        </div>

        {/* Right: Upload + Persona Switcher + Chain + Upgrade + Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Post button */}
          <Link
            to="/upload"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200/60 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Pitch</span>
          </Link>

          {/* Quick Demo Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Quickly switch demo personas"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Persona:</span> <strong>{user?.name?.split(' ')[0] || 'User'}</strong>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Demo Persona
                </p>
                <div className="space-y-1 mt-1">
                  {DEMO_PERSONAS.map((p) => (
                    <button
                      key={p.email}
                      onClick={() => handleSwitchPersona(p)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        user?.email === p.email
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-normal">
                        {p.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Public Live Hash Chain Verification */}
          <a
            href="/api/verify/chain"
            target="_blank"
            rel="noreferrer"
            className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 font-mono py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            title="Inspect SHA-256 tamper-evident log"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Audit Chain
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* Pro Upgrade Button */}
          {!isPro && user?.role === 'founder' && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pro</span>
            </button>
          )}

          {isPro && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
              PRO
            </span>
          )}

          {/* User Profile + Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                  {user?.name}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
              </div>
            </Link>

            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {showUpgrade && <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />}
    </>
  )
}
