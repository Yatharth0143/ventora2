import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Share2, 
  Eye, 
  Play, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  UserPlus, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function FeedCard({ post, onLike, onBookmark, currentUser }) {
  const navigate = useNavigate()
  const [isPlaying, setIsPlaying] = useState(false)
  const [copied, setCopied] = useState(false)

  const isLiked = post.is_liked || false
  const likesCount = post.likes_count || 0
  const isBookmarked = post.is_bookmarked || false

  const founderName = post.founder_name || 'Founder'
  const founderInitials = founderName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      })
    : 'Recent'

  const handleShare = () => {
    const url = `${window.location.origin}/audit/${post._id}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('🔗 Pitch link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleConnect = () => {
    // Navigate straight to chat with this founder
    const targetId = post.founder_id || 'demo_priya'
    navigate(`/chat/${targetId}`, {
      state: {
        partner: {
          _id: targetId,
          name: founderName,
          role: 'founder',
          sector: post.sectors?.[0] || 'Startup',
          stage: post.stage || 'Seed',
          verified: true,
        },
        initialMessage: `Hi ${founderName.split(' ')[0]}! I reviewed your pitch for "${post.title}" on the Ventora Feed. Would love to connect and discuss potential synergies / investment!`,
      },
    })
  }

  const handleCofounderConnect = () => {
    const targetId = post.founder_id || 'demo_priya'
    navigate(`/chat/${targetId}`, {
      state: {
        partner: {
          _id: targetId,
          name: founderName,
          role: 'founder',
          sector: post.sectors?.[0] || 'Startup',
          stage: post.stage || 'Seed',
          verified: true,
        },
        initialMessage: `Hi ${founderName.split(' ')[0]}! I saw "${post.title}" on the Feed and noticed strong alignment with my background. I'm exploring complementary co-founder roles—let's chat!`,
      },
    })
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* 1. Header: Founder avatar, Name, Stage & Follow/Connect button */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
            {founderInitials}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors">
                {founderName}
              </h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified Pitch
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{post.stage || 'Seed'}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-slate-400" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="uppercase font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                {post.language || 'EN'}
              </span>
            </div>
          </div>
        </div>

        {/* Connect Action Button */}
        <div className="flex items-center gap-2">
          {currentUser?.role === 'founder' ? (
            <button
              onClick={handleCofounderConnect}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer border border-indigo-200/60"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Co-Founder Outreach</span>
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Pitch Content & Description */}
      <div className="px-4 sm:px-5 pt-4 pb-3">
        <Link to={`/audit/${post._id}`}>
          <h3 className="font-black text-base sm:text-lg text-slate-900 hover:text-indigo-600 transition-colors leading-snug">
            {post.title}
          </h3>
        </Link>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          {post.description ||
            `Building scalable technology for the Indian market with verified unit economics and slide metrics.`}
        </p>

        {/* Sector & Tag Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {post.tags &&
            post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.8 rounded-lg bg-indigo-50/70 text-indigo-700 border border-indigo-200/40 text-[11px] font-semibold"
              >
                #{tag}
              </span>
            ))}
          {post.sectors &&
            post.sectors.map((sec, idx) => (
              <span
                key={`sec-${idx}`}
                className="px-2.5 py-0.8 rounded-lg bg-emerald-50/70 text-emerald-800 border border-emerald-200/40 text-[11px] font-semibold capitalize"
              >
                {sec}
              </span>
            ))}
        </div>
      </div>

      {/* 3. Media Preview (Pitch Video OR Slide Deck Preview) */}
      <div className="mx-4 sm:mx-5 mb-3 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/60 relative group">
        {post.video_url ? (
          <div className="relative aspect-video bg-black flex items-center justify-center">
            {isPlaying ? (
              <video
                src={post.video_url}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                onClick={() => setIsPlaying(true)}
                className="relative w-full h-full cursor-pointer flex items-center justify-center bg-cover bg-center"
                style={{
                  backgroundImage: post.thumbnail_url
                    ? `url(${post.thumbnail_url})`
                    : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                }}
              >
                <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/30 transition-colors" />
                <div className="relative z-10 w-16 h-16 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5">
                  <Play className="w-3 h-3 fill-white" />
                  <span>Watch 60s Founder Pitch Video</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/10 text-indigo-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {post.sections?.length || 4} Slide Extracted Deck
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Direct Quote & Math Verification Active
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                Deterministic Audit
              </span>
            </div>

            {/* Slide snippet quotes */}
            <div className="space-y-2 bg-white/5 rounded-xl p-3 border border-white/10 text-xs">
              <div className="text-[10px] font-mono uppercase text-indigo-300 tracking-wider">
                Key Slide Citation:
              </div>
              <p className="italic text-slate-200 text-xs line-clamp-2">
                "{post.sections?.[0]?.quotes?.[0] || post.description || 'Extracted word-for-word citations available.'}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Action bar: Like, Chat, Bookmark, Share, View Audit */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={() => onLike(post._id)}
            className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
              isLiked ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            <Heart
              className={`w-5 h-5 transition-transform active:scale-125 ${
                isLiked ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
            <span>{likesCount}</span>
          </button>

          {/* Comment / Direct Chat */}
          <button
            onClick={currentUser?.role === 'founder' ? handleCofounderConnect : handleConnect}
            className="flex items-center gap-1.5 font-bold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="hidden sm:inline">Inquire</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Share pitch link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Bookmark */}
          <button
            onClick={() => onBookmark(post._id)}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-amber-600 bg-amber-50'
                : 'text-slate-400 hover:text-amber-600 hover:bg-slate-50'
            }`}
            title="Save Pitch"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>

          {/* View Audit button */}
          <Link
            to={`/audit/${post._id}`}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <span>Inspect Audit</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
