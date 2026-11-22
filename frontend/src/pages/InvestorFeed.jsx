import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  getFeed, 
  likeDeck, 
  saveDeckBookmark, 
  commentDeck 
} from '../services/api'
import PreferencesModal, { PREFERENCE_OPTIONS } from '../components/profile/PreferencesModal'
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Video,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  SlidersHorizontal,
  Play,
  Volume2,
  VolumeX,
  ExternalLink,
  Send,
  User,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Tag,
  CheckCircle2,
  MoreVertical
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function InvestorFeed() {
  const { user, isInvestor } = useAuth()
  const navigate = useNavigate()

  const [feedItems, setFeedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('for-you') // 'for-you', 'video-only', 'all', or tag name
  const [activeTag, setActiveTag] = useState('')
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [commentInputs, setCommentInputs] = useState({})
  const [submittingComment, setSubmittingComment] = useState({})
  const [expandedComments, setExpandedComments] = useState({})

  useEffect(() => {
    fetchFeed()
  }, [activeFilter, activeTag])

  const fetchFeed = async () => {
    setLoading(true)
    try {
      const params = {}
      if (activeFilter === 'video-only') {
        params.filter = 'video-only'
      } else if (activeFilter === 'all') {
        params.filter = 'all'
      } else if (activeFilter === 'for-you') {
        params.filter = 'for-you'
      }

      if (activeTag) {
        params.tag = activeTag
      }

      const res = await getFeed(params)
      setFeedItems(res.data.feed || [])
    } catch (err) {
      console.error('Failed to load feed:', err)
      toast.error('Failed to load pitch feed')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLike = async (deckId) => {
    try {
      const res = await likeDeck(deckId)
      setFeedItems((prev) =>
        prev.map((item) =>
          item.id === deckId
            ? { ...item, is_liked: res.data.liked, likes_count: res.data.likes_count }
            : item
        )
      )
      if (res.data.liked) {
        toast('Liked pitch deck!', { icon: '❤️' })
      }
    } catch (err) {
      toast.error('Failed to like post')
    }
  }

  const handleToggleSave = async (deckId) => {
    try {
      const res = await saveDeckBookmark(deckId)
      setFeedItems((prev) =>
        prev.map((item) =>
          item.id === deckId
            ? { ...item, is_saved: res.data.saved, saves_count: res.data.saves_count }
            : item
        )
      )
      toast.success(res.data.saved ? 'Saved to Bookmarks' : 'Removed from Bookmarks')
    } catch (err) {
      toast.error('Failed to save bookmark')
    }
  }

  const handleAddComment = async (deckId) => {
    const text = commentInputs[deckId]?.trim()
    if (!text) return

    setSubmittingComment((prev) => ({ ...prev, [deckId]: true }))
    try {
      const res = await commentDeck(deckId, text)
      if (res.data?.comment) {
        setFeedItems((prev) =>
          prev.map((item) =>
            item.id === deckId
              ? {
                  ...item,
                  comments_count: item.comments_count + 1,
                  comments: [res.data.comment, ...(item.comments || [])]
                }
              : item
          )
        )
        setCommentInputs((prev) => ({ ...prev, [deckId]: '' }))
        setExpandedComments((prev) => ({ ...prev, [deckId]: true }))
        toast.success('Question posted to founder')
      }
    } catch (err) {
      toast.error('Failed to post question')
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [deckId]: false }))
    }
  }

  const handleCopyLink = (deckId) => {
    const url = `${window.location.origin}/audit/${deckId}`
    navigator.clipboard.writeText(url)
    toast.success('Pitch deck link copied!')
  }

  const userPrefs = user?.preferences || []

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Feed Preferences Tune Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                Ventora Pitch Stream
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  Investor Feed
                </span>
              </h1>
              <p className="text-[11px] text-slate-500">
                Personalized deal stream curated by tech preferences and video pitches
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPreferencesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Tune Preferences</span>
          </button>
        </div>

        {/* Current Active Preferences Pills Bar (Stories Style) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => { setActiveFilter('for-you'); setActiveTag(''); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'for-you' && !activeTag
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🔥 For You (Preferences)</span>
          </button>

          <button
            onClick={() => { setActiveFilter('video-only'); setActiveTag(''); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'video-only'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>🎥 Video Pitches</span>
          </button>

          <button
            onClick={() => { setActiveFilter('all'); setActiveTag(''); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'all' && !activeTag
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Decks
          </button>

          {/* Quick sector filters */}
          {['ai', 'software', 'hardware', 'fintech', 'healthtech', 'deeptech'].map((t) => (
            <button
              key={t}
              onClick={() => { setActiveTag(t); setActiveFilter('tag'); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
                activeTag === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-32 h-3.5 bg-slate-200 rounded" />
                  <div className="w-20 h-2.5 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="w-full h-64 bg-slate-100 rounded-2xl" />
              <div className="w-3/4 h-3 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && feedItems.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Pitches Matching This Filter</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try switching your tech preferences or view all recent decks uploaded to the Ventora Trust Chain.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => { setActiveFilter('all'); setActiveTag(''); }}
              className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl"
            >
              View All Decks
            </button>
            <button
              onClick={() => setShowPreferencesModal(true)}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl"
            >
              Update Preferences
            </button>
          </div>
        </div>
      )}

      {/* FEED POSTS (INSTAGRAM STYLE) */}
      {!loading && feedItems.map((item) => {
        const isMatched = item.preference_matched
        const commentsList = item.comments || []
        const isExpanded = expandedComments[item.id]

        return (
          <article 
            key={item.id} 
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all hover:border-slate-300"
          >
            {/* POST HEADER */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-slate-800 text-xs overflow-hidden">
                      {item.founder?.picture ? (
                        <img src={item.founder.picture} alt={item.founder.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{item.founder?.name?.charAt(0) || 'F'}</span>
                      )}
                    </div>
                  </div>
                  {item.founder?.verified && (
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5" title="Verified Founder">
                      <CheckCircle2 className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{item.founder?.name || 'Founder'}</span>
                    <span className="text-[10px] font-semibold text-slate-400">·</span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.2 rounded-full">
                      {item.founder?.role || 'Founder'}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600 mt-0.5 truncate max-w-xs sm:max-w-md">
                    {item.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isMatched && (
                  <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" /> Matches Interests
                  </span>
                )}
                <button
                  onClick={() => handleCopyLink(item.id)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Copy Link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* POST MEDIA: VIDEO PLAYER OR PITCH PRESENTATION HERO */}
            {item.has_video && item.video_url ? (
              <div className="relative bg-black aspect-video sm:aspect-16/10 flex items-center justify-center overflow-hidden group">
                <video
                  src={item.video_url}
                  controls
                  playsInline
                  poster={item.video_thumbnail_url || undefined}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold border border-white/20">
                    <Video className="w-3 h-3 text-purple-400" />
                    Founder Video Pitch
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-indigo-300 border border-white/10">
                      <FileText className="w-3.5 h-3.5" />
                      {item.slides_count || 10} Slide Pitch Presentation
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                      Lang: {item.language?.toUpperCase() || 'EN'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white leading-snug">{item.title}</h3>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                      {item.raw_text_summary || 'Multi-page pitch presentation with verified deterministic contradiction audits.'}
                    </p>
                  </div>

                  {item.sections_preview && item.sections_preview.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.sections_preview.map((sec, i) => (
                        <span key={i} className="text-[10px] font-medium bg-white/10 text-slate-300 px-2 py-0.5 rounded-md">
                          {sec}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between border-t border-white/10">
                    <span className="text-[11px] text-slate-400">Deterministic SHA-256 Verified</span>
                    {item.file_url && (
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-300 hover:text-white"
                      >
                        Open Deck PDF <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* INSTAGRAM ACTION BAR */}
            <div className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                {/* Left Action Buttons */}
                <div className="flex items-center gap-4">
                  {/* Like Button */}
                  <button
                    onClick={() => handleToggleLike(item.id)}
                    className="flex items-center gap-1.5 text-slate-700 hover:text-rose-600 transition-colors cursor-pointer group"
                  >
                    <Heart
                      className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        item.is_liked ? 'text-rose-600 fill-rose-600' : ''
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-700">{item.likes_count || 0}</span>
                  </button>

                  {/* Comment / Inquiry Button */}
                  <button
                    onClick={() => setExpandedComments((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                    className="flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-xs font-bold text-slate-700">{item.comments_count || 0}</span>
                  </button>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => handleToggleSave(item.id)}
                    className="flex items-center gap-1.5 text-slate-700 hover:text-amber-600 transition-colors cursor-pointer"
                  >
                    <Bookmark
                      className={`w-5 h-5 ${item.is_saved ? 'text-amber-600 fill-amber-600' : ''}`}
                    />
                  </button>
                </div>

                {/* Right Direct CTAs: Chat Founder & Inspect Audit */}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/audit/${item.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Audit Claims</span>
                  </Link>

                  {item.founder_id && item.founder_id !== user?._id && (
                    <Link
                      to={`/chat/${item.founder_id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all"
                    >
                      <span>Inquire</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              {/* POST CAPTION & TAGS */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {item.tags?.map((tg, i) => (
                      <button
                        key={i}
                        onClick={() => { setActiveTag(tg); setActiveFilter('tag'); }}
                        className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        #{tg}
                      </button>
                    ))}
                  </div>

                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Readiness: {item.market_readiness_score || 85}/100
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">{item.founder?.name}: </strong>
                  {item.raw_text_summary}
                </p>
              </div>

              {/* COMMENTS SECTION */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                {/* Expand comments toggle */}
                {commentsList.length > 0 && !isExpanded && (
                  <button
                    onClick={() => setExpandedComments((prev) => ({ ...prev, [item.id]: true }))}
                    className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    View all {commentsList.length} questions and investor diligence notes...
                  </button>
                )}

                {/* Expanded comments list */}
                {isExpanded && commentsList.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {commentsList.map((comm) => (
                      <div key={comm.id} className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {comm.user_name?.charAt(0) || 'I'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 mr-1.5">{comm.user_name}:</span>
                          <span>{comm.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input Box */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={commentInputs[item.id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [item.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddComment(item.id)
                    }}
                    placeholder="Ask a diligence question or leave a note..."
                    className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <button
                    onClick={() => handleAddComment(item.id)}
                    disabled={!commentInputs[item.id]?.trim() || submittingComment[item.id]}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-40 transition-all cursor-pointer"
                    title="Send Question"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        )
      })}

      {/* Preferences Modal */}
      <PreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => {
          setShowPreferencesModal(false)
          fetchFeed()
        }}
      />
    </div>
  )
}
