import React, { useState, useEffect, useRef } from 'react'
import { Send, AlertCircle, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react'
import { sendMessage, getChatHistory } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import UpgradeModal from '../payment/UpgradeModal'
import toast from 'react-hot-toast'

export default function ChatWindow({ targetUser }) {
  const { user, isPro } = useAuth()
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const bottomRef = useRef(null)

  const isTargetVerified = targetUser?.verified === true
  const canChat = isPro || user?.role === 'investor'

  useEffect(() => {
    if (targetUser?._id) {
      loadHistory()
      const interval = setInterval(loadHistory, 4000)
      return () => clearInterval(interval)
    }
  }, [targetUser])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadHistory = async () => {
    if (!targetUser?._id) return
    try {
      const res = await getChatHistory(targetUser._id)
      setMessages(res.data.messages || [])
    } catch (err) {
      // quiet
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    if (!canChat) {
      setShowUpgrade(true)
      return
    }

    if (!isTargetVerified && targetUser?.role === 'investor') {
      toast.error('Cannot message an unverified investor.')
      return
    }

    const optimisticMsg = {
      _id: 'temp_' + Date.now(),
      sender_id: user._id,
      receiver_id: targetUser._id,
      text: inputText,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])
    setInputText('')

    try {
      await sendMessage({
        receiver_id: targetUser._id,
        text: optimisticMsg.text,
      })
      loadHistory()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Message sending failed')
      loadHistory()
    }
  }

  if (!targetUser) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-slate-400">
        Select a verified partner to view message history.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold flex items-center justify-center text-xs">
            {targetUser.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900">{targetUser.name}</h3>
            <p className="text-[11px] text-slate-500 capitalize">{targetUser.sector || targetUser.role}</p>
          </div>
        </div>

        {targetUser.verified ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5" />
            Not yet verified
          </span>
        )}
      </div>

      {/* Trust Gating Alert Banner */}
      {!canChat && (
        <div className="bg-amber-50 border-b border-amber-200 p-3 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Direct investor messaging requires an active <strong>Founder Pro</strong> plan.</span>
          </div>
          <button
            onClick={() => setShowUpgrade(true)}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
          >
            Upgrade (₹999)
          </button>
        </div>
      )}

      {!isTargetVerified && targetUser.role === 'investor' && (
        <div className="bg-slate-100 border-b border-slate-200 p-2.5 text-xs text-slate-600 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
          <span>This investor has not verified their portfolio and cannot receive inbound pitches.</span>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No messages yet. Send a verifiable inquiry directly.
          </div>
        ) : (
          messages.map((m, idx) => {
            const isMe = m.sender_id === user._id
            return (
              <div
                key={m._id || idx}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            !canChat
              ? 'Upgrade to Founder Pro to send messages...'
              : !isTargetVerified && targetUser.role === 'investor'
              ? 'Recipient is unverified...'
              : 'Write a message with verifiable metrics...'
          }
          disabled={!canChat || (!isTargetVerified && targetUser.role === 'investor')}
          className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || !canChat || (!isTargetVerified && targetUser.role === 'investor')}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {showUpgrade && <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}

