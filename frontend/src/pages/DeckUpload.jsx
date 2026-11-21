import React from 'react'
import DeckUploader from '../components/deck/DeckUploader'
import { ShieldCheck, HelpCircle, CheckCircle2, Languages } from 'lucide-react'

export default function DeckUpload() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Upload Your Pitch Deck</h1>
        <p className="text-xs text-slate-500 mt-2">
          Run automated multi-page slide extraction, currency normalization, and click-to-quote verification.
        </p>
      </div>

      <DeckUploader />

      {/* Explanatory Trust Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
          <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Literal Quote Enforced
          </div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Every finding cites an exact word-for-word quote. Fabricated AI claims are dropped in code.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
          <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
            <Languages className="w-4 h-4 text-indigo-600" />
            Bhashini Translation
          </div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Decks in Hindi, Hinglish, Marathi or Tamil receive findings in their native language with original text saved.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
          <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            Tamper-Evident Trail
          </div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Uploads and audits are appended to the public SHA-256 hash chain with verifiable timestamps.
          </p>
        </div>
      </div>
    </div>
  )
}

