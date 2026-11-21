import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getConversations, getInvestor } from '../services/api'
import ChatWindow from '../components/chat/ChatWindow'
import { MessageSquare, Users, CheckCircle2, ShieldAlert } from 'lucide-react'

export default function ChatPage() {
  const { userId } = useParams()
  const [conversations, setConversations] = useState([])
  const [activePartner, setActivePartner] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [userId])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const res = await getConversations()
      const convos = res.data.conversations || []
      setConversations(convos)

      if (userId) {
        // If navigated directly via /chat/:userId, load that user
        const existing = convos.find((c) => c.user_id === userId)
        if (existing) {
          setActivePartner({
            _id: existing.user_id,
            name: existing.user_name,
            role: existing.user_role,
            verified: existing.user_verified,
          })
        } else {
          try {
            const invRes = await getInvestor(userId)
            setActivePartner(invRes.data.investor)
          } catch (e) {
            // quiet
          }
        }
      } else if (convos.length > 0 && !activePartner) {
        setActivePartner({
          _id: convos[0].user_id,
          name: convos[0].user_name,
          role: convos[0].user_role,
          verified: convos[0].user_verified,
        })
      }
    } catch (err) {
      // quiet
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-150">
      {/* Left Column: Conversations */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="font-black text-sm text-slate-900">Direct Inquiries</h2>
          <p className="text-[11px] text-slate-500">Persisted across reload & hash-chain logged</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No conversations started yet. Message an investor from the directory.
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.user_id}
                onClick={() =>
                  setActivePartner({
                    _id: c.user_id,
                    name: c.user_name,
                    role: c.user_role,
                    verified: c.user_verified,
                  })
                }
                className={`w-full p-4 text-left flex items-start justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                  activePartner?._id === c.user_id ? 'bg-indigo-50/60' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center">
                    {c.user_name ? c.user_name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900">{c.user_name}</span>
                      {c.user_verified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{c.last_message}</p>
                  </div>
                </div>

                {c.unread_count > 0 && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {c.unread_count}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Chat Window */}
      <div className="md:col-span-2">
        <ChatWindow targetUser={activePartner} />
      </div>
    </div>
  )
}

