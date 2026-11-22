import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import PreferencesModal from '../profile/PreferencesModal'

export default function Layout() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)

  // Show preferences onboarding once if not set yet
  useEffect(() => {
    if (user && !user?.preferences_set && (!user?.preferences || user?.preferences?.length === 0)) {
      const dismissed = sessionStorage.getItem('ventora_prefs_dismissed')
      if (!dismissed) {
        setShowPreferences(true)
      }
    }
  }, [user])

  const handleClosePreferences = () => {
    sessionStorage.setItem('ventora_prefs_dismissed', 'true')
    setShowPreferences(false)
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Profile Creation / First-Login Tech Preferences Prompt */}
      <PreferencesModal
        isOpen={showPreferences}
        onClose={handleClosePreferences}
      />
    </div>
  )
}
