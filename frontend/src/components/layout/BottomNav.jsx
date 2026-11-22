import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Compass, 
  Home, 
  PlusCircle, 
  MessageSquare, 
  User, 
  Filter
} from 'lucide-react'

export default function BottomNav() {
  const { user } = useAuth()

  const links = [
    { to: '/feed', label: 'Feed', icon: Home },
    { to: user?.role === 'investor' ? '/screener' : '/investors', label: 'Explore', icon: Compass },
    { to: '/upload', label: 'Post Pitch', icon: PlusCircle, isMain: true },
    { to: '/chat', label: 'Inquiries', icon: MessageSquare },
    { to: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map((item) => {
          const Icon = item.icon
          if (item.isMain) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-indigo-600 mt-1">
                  {item.label}
                </span>
              </NavLink>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors
                ${isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'}
              `}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
