import React from 'react'
import { Link } from 'react-router-dom'
import { 
  ShieldCheck, 
  Languages, 
  Scale, 
  SearchCheck, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  Lock,
  GitBranch
} from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner */}
      <div className="bg-indigo-600/20 border-b border-indigo-500/30 py-2 px-4 text-center text-xs text-indigo-300">
        <span className="font-bold text-white">Ventora Trust Protocol:</span> Pitch deck findings enforced in code with deterministic lakh/crore normalization.
        <a href="/api/verify/chain" target="_blank" rel="noreferrer" className="ml-2 underline font-mono text-emerald-400">
          View Live SHA-256 Chain ↗
        </a>
      </div>

      {/* Navigation */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/40">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="font-black text-xl tracking-tight text-white">VENTORA</span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/pricing" className="text-xs font-semibold text-slate-300 hover:text-white">
            Pricing
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            Launch Console
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          The Trust Layer for Early-Stage Fundraising in India
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Audit Pitch Decks with <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">Verifiable Evidence</span> in 22 Languages
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          No hallucinations. Every reported contradiction and numeric inconsistency is checked in code and linked back to exact word-for-word slide quotes. Powered by Sarvam AI & Bhashini.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            Upload Deck & Get 3 Free Findings
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            Sign In as Verified Investor
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>₹0 Free Tier</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>22 Scheduled Indian Languages</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Math Check</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Neo4j Conflict Auto-Ranking</span>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <SearchCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Click-to-Quote Anti-Hallucination</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Findings are dropped in CI and code if the quote does not literally exist in the extracted text. Every contradiction links back to the exact slide page.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Languages className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Deep Multilingual AI</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Upload Hindi, Hinglish, Marathi, or Tamil decks. Sarvam AI parses complex slide layouts, and Bhashini provides audits in the founder’s native language while preserving original quotes.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Neo4j Conflict Graph</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Automatically flags if an investor has funded a direct competitor. Conflicted investors are ranked last in matching, backed by public Tracxn/portfolio evidence links.
            </p>
          </div>
        </div>
      </section>

      {/* Live Hash Chain Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center border-t border-slate-800/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          SHA-256 IMMUTABLE LOG
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Tamper-Evident Trust Spine</h2>
        <p className="text-xs text-slate-400 max-w-xl mx-auto mt-2">
          Every deck upload, audit execution, finding review, and founder-investor interaction is committed to an append-only hash chain. Tamper one byte in the database and verification fails.
        </p>
        <div className="mt-6">
          <a
            href="/api/verify/chain"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-mono text-xs rounded-xl border border-slate-700 transition-colors"
          >
            Run Public GET /api/verify/chain Test
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Ventora Trust Layer. All rights reserved.</p>
      </footer>
    </div>
  )
}

