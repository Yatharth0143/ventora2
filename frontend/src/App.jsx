import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import FounderDashboard from './pages/FounderDashboard'
import InvestorDashboard from './pages/InvestorDashboard'
import DeckUpload from './pages/DeckUpload'
import AuditViewer from './pages/AuditViewer'
import InvestorDirectory from './pages/InvestorDirectory'
import ChatPage from './pages/ChatPage'
import Pricing from './pages/Pricing'
import CoFounderDiscovery from './pages/CoFounderDiscovery'
import BatchScreener from './pages/BatchScreener'
import MarketingAnalysis from './pages/MarketingAnalysis'
import Profile from './pages/Profile'
import AdminPage from './pages/AdminPage'
import MarketAnalysis from './pages/MarketAnalysis'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Authenticated Application Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={user?.role === 'investor' ? <InvestorDashboard /> : <FounderDashboard />}
        />
        <Route path="/upload" element={<DeckUpload />} />
        <Route path="/audit/:deckId" element={<AuditViewer />} />
        <Route path="/investors" element={<InvestorDirectory />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:userId" element={<ChatPage />} />
        <Route path="/cofounders" element={<CoFounderDiscovery />} />
        <Route path="/screener" element={<BatchScreener />} />
        <Route path="/marketing/:deckId" element={<MarketingAnalysis />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/market-analysis" element={<MarketAnalysis />} />
        <Route path="/market-analysis/:deckId" element={<MarketAnalysis />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

