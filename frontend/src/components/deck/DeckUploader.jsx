import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Languages } from 'lucide-react'
import { uploadDeck, runAudit } from '../../services/api'
import toast from 'react-hot-toast'

const INDIAN_LANGUAGES = [
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'en', name: 'English' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
]

export default function DeckUploader({ onUploaded }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState('hi')
  const [uploading, setUploading] = useState(false)
  const [progressText, setProgressText] = useState('')
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please choose a pitch deck PDF')
      return
    }

    setUploading(true)
    setProgressText('Uploading to Cloudinary & Parsing Slides with Sarvam AI...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('language', language)

      const uploadRes = await uploadDeck(formData)
      const deck = uploadRes.data.deck

      setProgressText('Enforcing Trust Layer: Verifying source quotes & numeric claims...')
      await runAudit(deck._id)

      toast.success('🎉 Deck audited with verified evidence!')
      if (onUploaded) {
        onUploaded(deck)
      } else {
        navigate(`/audit/${deck._id}`)
      }
    } catch (err) {
      toast.error('Audit pipeline encountered an error. Check file format.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-900">Upload Pitch Deck for Trust Audit</h2>
        <p className="text-xs text-slate-500 mt-1">
          Supports 22 scheduled Indian languages via Sarvam AI & Bhashini. Quotes verified in code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
            Startup or Pitch Deck Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. FinFlow — Neo-banking for SMEs"
            className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-indigo-600" />
            Deck Primary Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
          >
            {INDIAN_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Drag & drop dropzone */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
            Pitch Deck PDF
          </label>
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 text-center transition-colors bg-slate-50/50">
            <input
              type="file"
              id="deck-upload"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="deck-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-900">
                {file ? file.name : 'Click to select or drag and drop pitch deck (PDF)'}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">Up to 25MB · Multi-page supported</span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{progressText}</span>
            </div>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Upload & Generate 3 Free Verifiable Findings
            </>
          )}
        </button>
      </form>
    </div>
  )
}

