import React, { useState, useEffect, useRef } from 'react'
import { 
  Send, 
  AlertCircle, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft,
  Briefcase,
  FileText
} from 'lucide-react'
import { sendMessage, getChatHistory } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import UpgradeModal from '../payment/UpgradeModal'
import toast from 'react-hot-toast'

export default function ChatWindow({ targetUser, initialMessage, onBack, onMessageSent }) {
  const { user, isPro } = useAuth()
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const bottomRef = useRef(null)

  const isInvestorTarget = targetUser?.role === 'investor'
  const isTargetVerified = targetUser?.verified === true

  // Trust Gating: Only messaging an investor requires Pro for founders
  // Messaging co-founders/founders is completely free!
  const isGated = isInvestorTarget && !isPro && user?.role === 'founder'
  const isUnverifiedInvestor = isInvestorTarget && !isTargetVerified

  useEffect(() => {
    if (initialMessage) {
      setInputText(initialMessage)
    }
  }, [initialMessage, targetUser?._id])

  useEffect(() => {
    if (targetUser?._id) {
      loadHistory()
      const interval = setInterval(loadHistory, 4000)
      return () => clearInterval(interval)
    }
  }, [targetUser?._id])

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
    e?.preventDefault()
    if (!inputText.trim()) return

    if (isGated) {
      setShowUpgrade(true)
      return
    }

    if (isUnverifiedInvestor) {
      toast.error('Cannot message an unverified investor.')
      return
    }

    const textToSend = inputText.trim()
    const optimisticMsg = {
      _id: 'temp_' + Date.now(),
      sender_id: user?._id || 'me',
      receiver_id: targetUser._id,
      text: textToSend,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, optimisticMsg])
    setInputText('')
    setSending(true)

    try {
      await sendMessage({
        receiver_id: targetUser._id,
        text: textToSend,
      })
      if (onMessageSent) {
        onMessageSent(textToSend)
      }
      loadHistory()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send message')
      loadHistory()
    } finally {
      setSending(false)
    }
  }

  const handleSelectIcebreaker = (text) => {
    setInputText(text)
  }

  if (!targetUser) {
    return (
      <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-sm text-slate-800">Select a Conversation</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Pick a contact from the inquiries list, or connect with verified investors and co-founders.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
            {targetUser.name?.charAt(0) || 'U'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">{targetUser.name}</h3>
              {targetUser.verified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                  <ShieldAlert className="w-3 h-3" />
                  Unverified
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 capitalize">
              {targetUser.sector ? `${targetUser.sector} · ` : ''}
              {targetUser.role || 'Member'}
              {targetUser.stage ? ` (${targetUser.stage})` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Trust Gating Alert Banner ONLY for Free Founders messaging Investors */}
      {isGated && (
        <div className="bg-amber-50 border-b border-amber-200 p-3.5 text-xs text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Direct investor messaging requires an active <strong>Founder Pro</strong> plan (₹999/mo).
            </span>
          </div>
          <button
            onClick={() => setShowUpgrade(true)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs shrink-0"
          >
            Upgrade to Pro
          </button>
        </div>
      )}

      {isUnverifiedInvestor && (
        <div className="bg-slate-100 border-b border-slate-200 p-3 text-xs text-slate-600 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
          <span>This investor has not verified their portfolio yet and cannot receive inbound pitches.</span>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/40">
        {messages.length === 0 ? (
          <div className="text-center py-8 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Start the Conversation</h4>
            <p className="text-xs text-slate-500 mt-1">
              {isInvestorTarget
                ? 'Pitch your audited metrics directly. Inquiries are tamper-evident logged.'
                : 'Connect with your co-founder match on skills, roadmap, and vision.'}
            </p>

            {/* Icebreaker Suggestions */}
            <div className="mt-4 space-y-2 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                Suggested icebreakers:
              </span>
              <button
                type="button"
                onClick={() =>
                  handleSelectIcebreaker(
                    isInvestorTarget
                      ? `Hi ${targetUser.name.split(' ')[0]}, we audited our pitch deck on Ventora and verified our financial metrics. Would love to share our deck.`
                      : `Hi ${targetUser.name.split(' ')[0]}, saw your background in ${targetUser.sector || 'tech'} and would love to connect about building together!`
                  )
                }
                className="w-full p-2.5 bg-white hover:bg-indigo-50/60 border border-slate-200 rounded-xl text-xs text-slate-700 hover:text-indigo-900 hover:border-indigo-200 text-left transition-colors cursor-pointer"
              >
                💡 {isInvestorTarget
                  ? `Share audited metrics with ${targetUser.name.split(' ')[0]}`
                  : `Discuss co-founding synergies in ${targetUser.sector || 'tech'}`}
              </button>
            </div>
          </div>
        ) : (
          messages.map((m, idx) => {
            const isMe = m.sender_id === user?._id || m.sender_id === 'me'
            return (
              <div
                key={m._id || idx}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {m.timestamp
                    ? new Date(m.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Just now'}
                </span>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isGated
              ? 'Upgrade to Founder Pro to send messages to investors...'
              : isUnverifiedInvestor
              ? 'Investor is unverified...'
              : 'Write a message with verifiable metrics...'
          }
          disabled={isGated || isUnverifiedInvestor}
          className="flex-1 text-xs px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:bg-slate-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isGated || isUnverifiedInvestor || sending}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {showUpgrade && (
        <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
      )}
    </div>
  )
}
