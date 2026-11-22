import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Play, Plus, X, ExternalLink, ShieldCheck } from 'lucide-react'

const FEATURED_STORIES = [
  {
    id: 's1',
    founder: 'Priya Sharma',
    startup: 'FinFlow',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    sector: 'Fintech',
    headline: '₹1.2 Cr ARR milestone reached! 🚀',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    deckId: 'finflow',
    hasVideo: true,
  },
  {
    id: 's2',
    founder: 'Arjun Patel',
    startup: 'HealthPulse',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    sector: 'Healthcare',
    headline: '12 Hospital ICU pilots deployed in Gujarat & MH 🏥',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    deckId: 'healthpulse',
    hasVideo: true,
  },
  {
    id: 's3',
    founder: 'Rohan Deshmukh',
    startup: 'AgriScale',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    sector: 'Agritech',
    headline: '15,000 Acres surveyed with drone sensors 🌾',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    deckId: 'agriscale',
    hasVideo: true,
  },
  {
    id: 's4',
    founder: 'Meera Iyer',
    startup: 'CurePulse',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    sector: 'Health AI',
    headline: 'Looking for a Technical Co-Founder (FastAPI + ML)! 🤝',
    videoUrl: '',
    deckId: '',
    hasVideo: false,
    isCofounderSearch: true,
  },
  {
    id: 's5',
    founder: 'Vikram Mehta',
    startup: 'Mehta Ventures',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    sector: 'VC Desk',
    headline: 'Deploying $2M in Seed B2B fintech & AI startups in Q4 💼',
    videoUrl: '',
    deckId: '',
    hasVideo: false,
    isInvestor: true,
  },
]

export default function StoryBar() {
  const [activeStory, setActiveStory] = useState(null)

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Pitch Highlights & Founders
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Stories</span>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-2 pt-1 scrollbar-hide">
          {/* Add story / pitch button */}
          <Link
            to="/upload"
            className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
          >
            <div className="relative w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-indigo-400 flex items-center justify-center group-hover:border-indigo-600 group-hover:bg-indigo-50 transition-all">
              <Plus className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 truncate max-w-[68px]">
              Add Pitch
            </span>
          </Link>

          {/* Stories list */}
          {FEATURED_STORIES.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStory(s)}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer text-left"
            >
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 group-hover:scale-105 transition-transform shadow-xs">
                <div className="p-0.5 bg-white rounded-full">
                  <img
                    src={s.avatar}
                    alt={s.founder}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>
                {s.hasVideo && (
                  <span className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full shadow-xs">
                    <Play className="w-2.5 h-2.5 fill-white" />
                  </span>
                )}
                {s.isInvestor && (
                  <span className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
                    <ShieldCheck className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <div className="text-center">
                <span className="text-[11px] font-bold text-slate-900 block truncate max-w-[70px]">
                  {s.startup}
                </span>
                <span className="text-[9px] font-medium text-indigo-600 block truncate max-w-[70px]">
                  {s.sector}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Story Popup Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {/* Top Bar with author */}
            <div className="p-4 flex items-center justify-between bg-gradient-to-b from-slate-950/90 to-transparent relative z-10">
              <div className="flex items-center gap-3">
                <img
                  src={activeStory.avatar}
                  alt={activeStory.founder}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white">{activeStory.startup}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                      {activeStory.sector}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{activeStory.founder}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveStory(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content area: Video or Highlight card */}
            <div className="p-6 text-center space-y-4">
              {activeStory.videoUrl ? (
                <div className="rounded-2xl overflow-hidden bg-black aspect-video border border-slate-800">
                  <video
                    src={activeStory.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="py-8 px-4 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-800/40">
                  <span className="text-4xl block mb-3">🚀</span>
                  <h4 className="text-base font-bold text-white mb-2">Startup Spotlight</h4>
                  <p className="text-sm text-indigo-200 leading-relaxed font-medium">
                    "{activeStory.headline}"
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeStory.headline}
              </p>

              <div className="pt-2 flex gap-2">
                <Link
                  to="/chat"
                  onClick={() => setActiveStory(null)}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  {activeStory.isInvestor ? 'Send Inbound Pitch' : activeStory.isCofounderSearch ? 'Discuss Co-Founder Role' : 'Connect with Founder'}
                </Link>
                <button
                  onClick={() => setActiveStory(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
