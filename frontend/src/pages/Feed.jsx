import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  getFeed, 
  getTrendingTags, 
  likeDeck, 
  bookmarkDeck, 
  recordDeckView,
  getCofounders
} from '../services/api'
import StoryBar from '../components/feed/StoryBar'
import FeedCard from '../components/feed/FeedCard'
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Video, 
  Filter, 
  X, 
  Users, 
  PlusCircle, 
  ShieldCheck, 
  Briefcase, 
  Zap,
  ArrowRight,
  Flame,
  UserPlus
} from 'lucide-react'
import toast from 'react-hot-toast'

const SECTOR_TAGS = [
  { id: 'all', label: '🌟 All Pitches', tag: '' },
  { id: 'healthcare', label: '🏥 Healthcare', tag: 'healthcare' },
  { id: 'fintech', label: '💳 Fintech & UPI', tag: 'fintech' },
  { id: 'ai', label: '🤖 AI & DeepTech', tag: 'ai' },
  { id: 'saas', label: '☁️ B2B SaaS', tag: 'saas' },
  { id: 'agritech', label: '🌾 Agritech', tag: 'agritech' },
  { id: 'cleantech', label: '🌱 Cleantech & EV', tag: 'cleantech' },
  { id: 'edtech', label: '📚 Edtech', tag: 'edtech' },
]

export default function Feed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeSector, setActiveSector] = useState('all')
  const [hasVideoOnly, setHasVideoOnly] = useState(false)
  const [sortBy, setSortBy] = useState('smart')
  const [trendingTags, setTrendingTags] = useState([])
  const [cofounderMatches, setCofounderMatches] = useState([])

  useEffect(() => {
    fetchTrending()
    fetchCofounders()
  }, [])

  useEffect(() => {
    fetchFeedPosts()
  }, [searchKeyword, activeSector, hasVideoOnly, sortBy])

  const fetchTrending = async () => {
    try {
      const res = await getTrendingTags()
      setTrendingTags(res.data.tags || [])
    } catch (e) {
      setTrendingTags([
        { name: 'healthcare', emoji: '🏥' },
        { name: 'fintech', emoji: '💳' },
        { name: 'ai', emoji: '🤖' },
        { name: 'saas', emoji: '☁️' },
        { name: 'agritech', emoji: '🌾' },
        { name: 'cleantech', emoji: '🌱' },
      ])
    }
  }

  const fetchCofounders = async () => {
    try {
      const res = await getCofounders(user?._id || 'demo_priya')
      setCofounderMatches(res.data.matches?.slice(0, 3) || [])
    } catch (e) {
      setCofounderMatches([
        { id: 'co_1', name: 'Rohan Deshmukh', sector: 'Fintech / B2B', shared_skills: ['Payments', 'Distributed Systems'] },
        { id: 'co_2', name: 'Meera Iyer', sector: 'Healthtech / AI', shared_skills: ['ML Systems', 'Product Strategy'] },
      ])
    }
  }

  const fetchFeedPosts = async () => {
    try {
      setLoading(true)
      const params = {
        sort: sortBy,
      }
      if (searchKeyword.trim()) {
        params.search = searchKeyword.trim()
      }
      if (activeSector !== 'all') {
        params.tags = activeSector
      }
      if (hasVideoOnly) {
        params.has_video = true
      }

      const res = await getFeed(params)
      let data = res.data.posts || []

      // If backend database is empty in dev, use rich sample feed so user immediately sees UI
      if (data.length === 0 && !searchKeyword && activeSector === 'all') {
        data = [
          {
            _id: 'finflow_demo',
            founder_id: 'priya_id',
            founder_name: 'Priya Sharma',
            title: 'FinFlow — Neo-Banking for Bharat SMEs',
            description: 'WhatsApp-first invoice discounting and instant working capital for 60M unbanked SMEs across Tier 2/3 India. ₹1.2 Cr ARR with 35% MoM growth.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            thumbnail_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
            tags: ['fintech', 'upi', 'b2b', 'india', 'seed'],
            sectors: ['fintech'],
            stage: 'Seed',
            language: 'HI',
            views: 142,
            likes_count: 24,
            is_liked: false,
            created_at: new Date().toISOString(),
            sections: [
              { quotes: ['भारत में 6 करोड़ एमएसएमई (MSME) हैं जिन्हें औपचारिक बैंकिंग ऋण नहीं मिल पाता।'] }
            ]
          },
          {
            _id: 'healthpulse_demo',
            founder_id: 'arjun_id',
            founder_name: 'Arjun Patel',
            title: 'HealthPulse — AI Remote Diagnostics for Rural ICUs',
            description: 'Continuous acoustic & biometric ML vital telemetry bringing specialist-level ICU care to 70% of underserved rural hospitals across India.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            thumbnail_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
            tags: ['healthcare', 'ai', 'b2b', 'india', 'pre-seed'],
            sectors: ['healthcare', 'ai'],
            stage: 'Pre-Seed',
            language: 'EN',
            views: 218,
            likes_count: 42,
            is_liked: true,
            created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
            sections: [
              { quotes: ['70% of rural ICUs lack dedicated intensivists. $4.5B Indian healthcare diagnostics TAM.'] }
            ]
          },
          {
            _id: 'agriscale_demo',
            founder_id: 'rohan_id',
            founder_name: 'Rohan Deshmukh',
            title: 'AgriScale — Drone-Assisted Precision Crop Yields',
            description: 'Hyperlocal hyperspectral drone imaging and AI pest prediction providing smallholder farmers in Punjab & Haryana guaranteed 22% yield improvement.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            thumbnail_url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80',
            tags: ['agritech', 'ai', 'cleantech', 'india', 'seed'],
            sectors: ['agritech', 'cleantech'],
            stage: 'Seed',
            language: 'EN',
            views: 95,
            likes_count: 18,
            is_liked: false,
            created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
            sections: [
              { quotes: ['Drone imaging for agriculture. 15,000 acres monitored.'] }
            ]
          }
        ]
      }

      setPosts(data)
    } catch (err) {
      // Fallback
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (deckId) => {
    try {
      const res = await likeDeck(deckId)
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === deckId) {
            const willBeLiked = res.data.action === 'liked'
            return {
              ...p,
              is_liked: willBeLiked,
              likes_count: res.data.likes_count ?? (willBeLiked ? p.likes_count + 1 : p.likes_count - 1),
            }
          }
          return p
        })
      )
    } catch (e) {
      // Offline / optimistic toggle
      setPosts((prev) =>
        prev.map((p) =>
          p._id === deckId
            ? { ...p, is_liked: !p.is_liked, likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1 }
            : p
        )
      )
    }
  }

  const handleBookmark = async (deckId) => {
    try {
      const res = await bookmarkDeck(deckId)
      setPosts((prev) =>
        prev.map((p) =>
          p._id === deckId
            ? { ...p, is_bookmarked: res.data.action === 'bookmarked' }
            : p
        )
      )
      toast.success(res.data.action === 'bookmarked' ? '🔖 Pitch saved!' : 'Bookmark removed')
    } catch (e) {
      // Optimistic toggle
      setPosts((prev) =>
        prev.map((p) =>
          p._id === deckId ? { ...p, is_bookmarked: !p.is_bookmarked } : p
        )
      )
    }
  }

  const handleKeywordClick = (tag) => {
    setSearchKeyword(tag)
    setActiveSector('all')
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-150">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Instagram Stories Bar */}
          <StoryBar />

          {/* 2. Intelligent Social Search & Filter Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search by keywords like 'healthcare', 'fintech', 'ai', 'upi'..."
                className="w-full text-xs sm:text-sm pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Sector Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {SECTOR_TAGS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSector(s.tag || 'all')
                    setSearchKeyword('')
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeSector === (s.tag || 'all')
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Algorithm controls & Video filter toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  Feed Algorithm:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="smart">⚡ Smart Algorithm (AI Ranked)</option>
                  <option value="trending">🔥 Trending & High Engagement</option>
                  <option value="latest">⏱️ Latest Pitches First</option>
                  <option value="videos">🎥 With Pitch Video First</option>
                </select>
              </div>

              <label className="inline-flex items-center gap-2 text-slate-700 font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasVideoOnly}
                  onChange={(e) => setHasVideoOnly(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span className="flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-purple-600" />
                  <span>Pitch Videos Only</span>
                </span>
              </label>
            </div>
          </div>

          {/* 3. Feed Cards Feed Stream */}
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <span>Filtering pitch feed with deterministic quote verification...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-slate-800">No startup pitches match your filters</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try searching for general keywords like "healthcare", "fintech", or reset the sector filter.
              </p>
              <button
                onClick={() => {
                  setSearchKeyword('')
                  setActiveSector('all')
                  setHasVideoOnly(false)
                }}
                className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <FeedCard
                  key={post._id}
                  post={post}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                  currentUser={user}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar Widget (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Upload CTA */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-200 border border-white/20">
                Founder Spotlight
              </span>
              <h3 className="font-black text-lg text-white mt-2">Publish Your Pitch Deck & Video</h3>
              <p className="text-xs text-indigo-200 mt-1.5 leading-relaxed">
                Receive instant slide extraction, literal quote enforcement, and direct inbound from verified investors.
              </p>
              <Link
                to="/upload"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-black text-xs rounded-xl shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                <span>Upload Pitch & 60s Video</span>
              </Link>
            </div>
          </div>

          {/* Trending Keywords Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900">Trending Search Keywords</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Click a sector keyword to filter pitches instantly:
            </p>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => handleKeywordClick(t.name)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200/80 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{t.emoji}</span>
                  <span className="capitalize">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Co-Founder Outreach Spotlight */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">Looking for Co-Founders?</h3>
              </div>
              <Link
                to="/cofounders"
                className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center"
              >
                View all <ArrowRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Founders with complementary technical & product skills in your sector:
            </p>

            <div className="space-y-3">
              {cofounderMatches.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{m.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{m.sector}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {m.shared_skills?.slice(0, 2).map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[9px] bg-indigo-100/70 text-indigo-800 px-1.5 py-0.2 rounded"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    to={`/chat/${m.id || 'co_1'}`}
                    className="p-2 rounded-xl bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 border border-slate-200 shadow-2xs transition-colors shrink-0"
                    title="Send Co-Founder Inquiry"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
