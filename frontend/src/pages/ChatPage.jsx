import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { getConversations, getUserProfile, getInvestor } from '../services/api'
import ChatWindow from '../components/chat/ChatWindow'
import { MessageSquare, Users, CheckCircle2, Search, ArrowLeft, PlusCircle } from 'lucide-react'

export default function ChatPage() {
  const { userId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [activePartner, setActivePartner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterQuery, setFilterQuery] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)

  // Grab route state if navigated from "Connect" or "Direct Message"
  const routePartner = location.state?.partner
  const initialMessage = location.state?.initialMessage

  useEffect(() => {
    loadConversationsAndPartner()
  }, [userId])

  const loadConversationsAndPartner = async () => {
    try {
      setLoading(true)
      let convos = []
      try {
        const res = await getConversations()
        convos = res.data.conversations || []
      } catch (err) {
        convos = []
      }

      let selected = null

      // Case 1: Route state passed directly (e.g. from CoFounder "Connect" or InvestorCard)
      if (routePartner && (!userId || routePartner._id === userId || routePartner.id === userId)) {
        selected = {
          _id: routePartner._id || routePartner.id,
          name: routePartner.name,
          role: routePartner.role || 'founder',
          sector: routePartner.sector || '',
          stage: routePartner.stage || '',
          verified: routePartner.verified ?? true,
        }
      }
      // Case 2: Navigated via URL /chat/:userId
      else if (userId) {
        const existing = convos.find((c) => c.user_id === userId)
        if (existing) {
          selected = {
            _id: existing.user_id,
            name: existing.user_name,
            role: existing.user_role,
            sector: existing.user_sector || '',
            stage: existing.user_stage || '',
            verified: existing.user_verified,
          }
        } else {
          // Fetch user profile via API
          try {
            const profileRes = await getUserProfile(userId)
            if (profileRes.data?.user) {
              selected = profileRes.data.user
            }
          } catch (e) {
            try {
              const invRes = await getInvestor(userId)
              if (invRes.data?.investor) {
                selected = invRes.data.investor
              }
            } catch (err) {
              // Fallback
              selected = {
                _id: userId,
                name: userId.startsWith('co_') ? 'Co-Founder' : 'User',
                role: 'founder',
                verified: true,
              }
            }
          }
        }
      }
      // Case 3: No userId, pick the first existing conversation
      else if (convos.length > 0) {
        selected = {
          _id: convos[0].user_id,
          name: convos[0].user_name,
          role: convos[0].user_role,
          sector: convos[0].user_sector || '',
          stage: convos[0].user_stage || '',
          verified: convos[0].user_verified,
        }
      }

      // If selected partner is not in convos list, prepend them so they show in sidebar
      if (selected && !convos.some((c) => c.user_id === selected._id)) {
        convos = [
          {
            user_id: selected._id,
            user_name: selected.name,
            user_role: selected.role,
            user_sector: selected.sector || '',
            user_stage: selected.stage || '',
            user_verified: selected.verified,
            last_message: initialMessage ? 'Drafting connection message...' : 'Start a new conversation',
            unread_count: 0,
          },
          ...convos,
        ]
      }

      setConversations(convos)
      setActivePartner(selected)
      if (selected) {
        setShowMobileChat(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPartner = (c) => {
    const partner = {
      _id: c.user_id,
      name: c.user_name,
      role: c.user_role,
      sector: c.user_sector || '',
      stage: c.user_stage || '',
      verified: c.user_verified,
    }
    setActivePartner(partner)
    setShowMobileChat(true)
    navigate(`/chat/${c.user_id}`, { replace: true, state: { partner } })
  }

  const handleMessageSent = (newText) => {
    // Refresh conversations list to update preview
    if (activePartner) {
      setConversations((prev) => {
        const existingIdx = prev.findIndex((c) => c.user_id === activePartner._id)
        if (existingIdx >= 0) {
          const updated = [...prev]
          updated[existingIdx] = {
            ...updated[existingIdx],
            last_message: newText,
            last_timestamp: new Date().toISOString(),
          }
          return updated
        }
        return [
          {
            user_id: activePartner._id,
            user_name: activePartner.name,
            user_role: activePartner.role,
            user_verified: activePartner.verified,
            last_message: newText,
            last_timestamp: new Date().toISOString(),
            unread_count: 0,
          },
          ...prev,
        ]
      })
    }
  }

  const filteredConversations = conversations.filter((c) =>
    (c.user_name || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
    (c.last_message || '').toLowerCase().includes(filterQuery.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-8.5rem)] grid grid-cols-1 md:grid-cols-12 gap-5 animate-in fade-in duration-150">
      {/* Left Column: Conversations List */}
      <div
        className={`md:col-span-4 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden ${
          showMobileChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Direct Inquiries
            </h2>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full">
              {conversations.length} Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Tamper-evident SHA-256 hash logged
          </p>

          {/* Search filter */}
          <div className="relative mt-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading inquiries...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">No conversations yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Message an investor from the directory or connect with a co-founder.
              </p>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = activePartner?._id === c.user_id
              return (
                <button
                  key={c.user_id}
                  onClick={() => handleSelectPartner(c)}
                  className={`w-full p-4 text-left flex items-start justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {c.user_name ? c.user_name.charAt(0) : 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {c.user_name}
                        </span>
                        {c.user_verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 capitalize block">
                        {c.user_role || 'Founder'}
                      </span>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {c.last_message}
                      </p>
                    </div>
                  </div>

                  {c.unread_count > 0 && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {c.unread_count}
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right Column: Chat Window */}
      <div
        className={`md:col-span-8 lg:col-span-8 ${
          !showMobileChat ? 'hidden md:block' : 'block'
        }`}
      >
        <ChatWindow
          targetUser={activePartner}
          initialMessage={initialMessage}
          onBack={() => setShowMobileChat(false)}
          onMessageSent={handleMessageSent}
        />
      </div>
    </div>
  )
}
