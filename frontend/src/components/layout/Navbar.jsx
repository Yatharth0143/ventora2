import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  ShieldCheck, 
  LayoutDashboard, 
  UploadCloud, 
  Users, 
  MessageSquare, 
  Sparkles, 
  LogOut, 
  CheckCircle2, 
  Menu, 
  X,
  CreditCard,
  Layers,
  FileSearch,
  ExternalLink
} from 'lucide-react'
import UpgradeModal from '../payment/UpgradeModal'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, isPro } = useAuth()
  const navigate = useNavigate()
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <>
      <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar} 
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">VENTORA</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                Trust Layer
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Public Hash Chain Verify Link */}
          <a
            href="/api/verify/chain"
            target="_blank"
            rel="noreferrer"
            className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-mono py-1 px-2 rounded-md hover:bg-slate-100 transition-colors"
            title="Inspect tamper-evident SHA-256 hash log live"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Audit Chain Live
            <ExternalLink className="w-3 h-3" />
          </a>

          {!isPro && user?.role === 'founder' && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-lg shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Upgrade to Pro (₹999)
            </button>
          )}

          {isPro && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
              PRO FOUNDER
            </span>
          )}

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">{user?.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
              </div>
            </Link>

            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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

