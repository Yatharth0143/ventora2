import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  LayoutDashboard, 
  UploadCloud, 
  Users, 
  MessageSquare, 
  UserPlus, 
  CreditCard, 
  Filter, 
  User, 
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  TrendingUp
} from 'lucide-react'

export default function Sidebar({ isOpen, onClose }) {
  const { user, isFounder, isInvestor } = useAuth()

  const founderLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/feed', label: 'Pitch Feed (Reels)', icon: Sparkles },
    { to: '/upload', label: 'Upload Pitch Deck', icon: UploadCloud },
    { to: '/market-analysis', label: 'Market Intelligence', icon: TrendingUp },
    { to: '/investors', label: 'Investor Directory', icon: Users },
    { to: '/chat', label: 'Direct Inquiries', icon: MessageSquare },
    { to: '/cofounders', label: 'Co-Founder Discovery', icon: UserPlus },
    { to: '/admin', label: 'Admin & Verdicts', icon: ShieldAlert },
    { to: '/pricing', label: 'Pro Membership', icon: CreditCard },
    { to: '/profile', label: 'Profile & Trust', icon: User },
  ]

  const investorLinks = [
    { to: '/dashboard', label: 'Investor Desk', icon: LayoutDashboard },
    { to: '/feed', label: 'Pitch Stream (Feed)', icon: Sparkles },
    { to: '/market-analysis', label: 'Market Intelligence', icon: TrendingUp },
    { to: '/screener', label: 'Batch Screener', icon: Filter },
    { to: '/chat', label: 'Founder Inquiries', icon: MessageSquare },
    { to: '/admin', label: 'Admin & Verdicts', icon: ShieldAlert },
    { to: '/profile', label: 'Verification & Portfolio', icon: User },
  ]

  const links = isInvestor ? investorLinks : founderLinks

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 md:hidden" 
        />
      )}

      <aside className={`
        fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white text-slate-700 border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* User Status Card */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Type</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold text-slate-900 capitalize flex items-center gap-1.5">
                {user?.role}
                {user?.verified && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                user?.tier === 'pro'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-200/70 text-slate-600'
              }`}>
                {user?.tier?.toUpperCase() || 'FREE'}
              </span>
            </div>

            {isInvestor && !user?.verified && (
              <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>Verification pending</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Workspace
            </p>
            {links.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700 font-bold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-slate-700">Ventora Protocol</span>
          </div>
          <p className="font-mono text-[10px] text-slate-400 mt-0.5">SHA-256 Hash Chain</p>
        </div>
      </aside>
    </>
  )
}
