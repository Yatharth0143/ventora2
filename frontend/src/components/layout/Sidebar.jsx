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
  FileCheck2,
  Filter,
  User,
  ShieldAlert
} from 'lucide-react'

export default function Sidebar({ isOpen, onClose }) {
  const { user, isFounder, isInvestor } = useAuth()

  const founderLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/upload', label: 'Upload Pitch Deck', icon: UploadCloud },
    { to: '/investors', label: 'Investor Directory', icon: Users },
    { to: '/chat', label: 'Direct Messages', icon: MessageSquare },
    { to: '/cofounders', label: 'Co-Founder Discovery', icon: UserPlus },
    { to: '/pricing', label: 'Pro Membership', icon: CreditCard },
    { to: '/profile', label: 'Profile & Trust', icon: User },
  ]

  const investorLinks = [
    { to: '/dashboard', label: 'Investor Desk', icon: LayoutDashboard },
    { to: '/screener', label: 'Batch Red-Flag Screener', icon: Filter },
    { to: '/chat', label: 'Founder Inquiries', icon: MessageSquare },
    { to: '/profile', label: 'Verification & Portfolio', icon: User },
  ]

  const links = isInvestor ? investorLinks : founderLinks

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden" 
        />
      )}

      <aside className={`
        fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* User Role Card */}
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Role</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold text-white capitalize">{user?.role}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                user?.tier === 'pro' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-700 text-slate-300'
              }`}>
                {user?.tier?.toUpperCase()}
              </span>
            </div>
            {isInvestor && !user?.verified && (
              <div className="mt-2 text-[11px] text-amber-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Verification pending</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Navigation</p>
            {links.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
          <p className="font-semibold text-slate-400">Ventora Protocol v1.0</p>
          <p className="font-mono text-[10px] mt-0.5">Hash-Chain Verified</p>
        </div>
      </aside>
    </>
  )
}

