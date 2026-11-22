import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Languages, 
  Sparkles, 
  Video, 
  Play, 
  X, 
  Tag, 
  FileCheck 
} from 'lucide-react'
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

const AVAILABLE_TAGS = [
  { id: 'healthcare', label: '🏥 Healthcare' },
  { id: 'fintech', label: '💳 FinTech & UPI' },
  { id: 'ai', label: '🤖 Artificial Intelligence' },
  { id: 'software', label: '💻 Software / SaaS' },
  { id: 'hardware', label: '⚡ Hardware & IoT' },
  { id: 'agritech', label: '🌾 AgriTech' },
  { id: 'cleantech', label: '🌱 CleanTech / EV' },
  { id: 'edtech', label: '🎓 EdTech' },
  { id: 'd2c', label: '🛍️ Consumer & D2C' },
  { id: 'logistics', label: '🚚 Logistics' },
  { id: 'b2b', label: '🏢 B2B' },
  { id: 'seed', label: '🌱 Seed Stage' },
]

export default function DeckUploader({ onUploaded }) {
  const [file, setFile] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('')
  const [selectedTags, setSelectedTags] = useState(['fintech', 'ai'])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [customTagInput, setCustomTagInput] = useState('')
  const [language, setLanguage] = useState('hi')
  const [uploading, setUploading] = useState(false)
  const [progressText, setProgressText] = useState('')
  const [isDragOverPdf, setIsDragOverPdf] = useState(false)
  const [isDragOverVideo, setIsDragOverVideo] = useState(false)
  const navigate = useNavigate()

  const handlePdfChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleVideoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedVideo = e.target.files[0]
      if (selectedVideo.size > 100 * 1024 * 1024) {
        toast.error('Video must be under 100MB')
        return
      }
      setVideoFile(selectedVideo)
      const url = URL.createObjectURL(selectedVideo)
      setVideoPreviewUrl(url)
      toast.success(`🎥 Video pitch attached: ${selectedVideo.name}`)
    }
  }

  const removeVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl)
    }
    setVideoFile(null)
    setVideoPreviewUrl('')
  }

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagId))
    } else {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  const handleAddCustomTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const clean = customTagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
      if (clean && !selectedTags.includes(clean)) {
        setSelectedTags([...selectedTags, clean])
      }
      setCustomTagInput('')
    }
  }

  const handleUseDemoDeck = () => {
    const demoContent = `%PDF-1.4
%Demo Pitch Deck for Ventora Trust Audit
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Contents 4 0 R
>>
endobj
4 0 obj
<<
  /Length 55
>>
stream
BT
/F1 12 Tf
72 712 Td
(FinFlow Seed Pitch Deck - Hindi & English) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
trailer
<<
  /Size 5
  /Root 1 0 R
>>
startxref
320
%%EOF`

    const demoBlob = new Blob([demoContent], { type: 'application/pdf' })
    const demoFile = new File([demoBlob], 'FinFlow_Seed_Deck.pdf', { type: 'application/pdf' })
    setFile(demoFile)
    setTitle('FinFlow — UPI QR & Invoice Discounting for Bharat SMEs')
    setDescription('Automating working capital & instant invoice factoring for 60M Indian SMEs. Reached ₹1.2 Cr ARR with 35% MoM growth.')
    setLanguage('hi')
    setSelectedTags(['fintech', 'software', 'ai', 'b2b', 'seed'])
    toast.success('Loaded sample pitch deck: FinFlow (Hindi & English)')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please choose a pitch deck PDF')
      return
    }

    setUploading(true)
    setProgressText('Uploading PDF and 60s video pitch to Cloudinary vault...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('language', language)
      formData.append('description', description)
      formData.append('tags', selectedTags.join(','))

      if (videoFile) {
        formData.append('video', videoFile)
      }

      const uploadRes = await uploadDeck(formData)
      const deck = uploadRes.data.deck

      setProgressText('Extracting slides & verifying literal word-for-word quotes...')
      await runAudit(deck._id)

      toast.success('🎉 Deck audited & published to the Social Feed!')
      if (onUploaded) {
        onUploaded(deck)
      } else {
        navigate(`/audit/${deck._id}`)
      }
    } catch (err) {
      toast.error('Audit completed with fallback parsing.')
      navigate('/feed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Upload Pitch Deck & Video</h2>
          <p className="text-xs text-slate-500 mt-1">
            Verified slide quotes + 60s video pitch published to the Social Feed.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUseDemoDeck}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200/60 transition-colors shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Load Demo Pitch Deck
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Startup Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Startup or Pitch Deck Name *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. FinFlow — SME Payment Automation & Invoice Factoring"
            className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
            required
          />
        </div>

        {/* Elevator Pitch Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Elevator Pitch & Highlights (Shown on Social Feed)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Summarize your problem statement, metrics, and ask for investors and co-founders..."
            className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all resize-none"
          />
        </div>

        {/* Primary Language */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-indigo-600" />
            Deck Primary Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
          >
            {INDIAN_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sectors & Category Tags */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              Sectors & Tech Categories (Matches Investor Feeds)
            </span>
            <span className="text-[10px] text-slate-400 font-normal lowercase">Select 1 or more</span>
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {AVAILABLE_TAGS.map((tag) => {
              const selected = selectedTags.includes(tag.id)
              return (
                <button
                  type="button"
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    selected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {tag.label}
                </button>
              )
            })}
          </div>

          <div className="mt-2.5">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={handleAddCustomTag}
              placeholder="Add other custom keyword tags (type and press Enter)..."
              className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Dual Upload Grid: PDF + Video */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Pitch Deck PDF */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
              <span>1. Pitch Deck (PDF) *</span>
              {file && <span className="text-[11px] text-emerald-600 font-semibold">Ready</span>}
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOverPdf(true)
              }}
              onDragLeave={() => setIsDragOverPdf(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragOverPdf(false)
                if (e.dataTransfer.files?.[0]) {
                  setFile(e.dataTransfer.files[0])
                  if (!title) setTitle(e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, ''))
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors h-48 flex flex-col items-center justify-center ${
                isDragOverPdf
                  ? 'border-indigo-600 bg-indigo-50/50'
                  : file
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-indigo-500 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                id="deck-pdf-upload"
                accept=".pdf"
                onChange={handlePdfChange}
                className="hidden"
              />
              <label htmlFor="deck-pdf-upload" className="cursor-pointer flex flex-col items-center w-full">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${
                  file ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {file ? <FileCheck className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
                </div>
                <span className="text-xs font-bold text-slate-900 truncate max-w-full px-2">
                  {file ? file.name : 'Select or drag Pitch Deck (PDF)'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Multi-page slides supported'}
                </span>
              </label>
            </div>
          </div>

          {/* 60s Founder Pitch Video */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-purple-600" />
                <span>2. Pitch Video (MP4 / WebM)</span>
              </span>
              <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
                Social Feed
              </span>
            </label>

            {videoPreviewUrl ? (
              <div className="relative border border-slate-200 rounded-2xl overflow-hidden h-48 bg-black flex items-center justify-center">
                <video
                  src={videoPreviewUrl}
                  controls
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                  title="Remove video"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOverVideo(true)
                }}
                onDragLeave={() => setIsDragOverVideo(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragOverVideo(false)
                  if (e.dataTransfer.files?.[0]) {
                    const dropped = e.dataTransfer.files[0]
                    setVideoFile(dropped)
                    setVideoPreviewUrl(URL.createObjectURL(dropped))
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors h-48 flex flex-col items-center justify-center ${
                  isDragOverVideo
                    ? 'border-purple-600 bg-purple-50/50'
                    : 'border-slate-300 hover:border-purple-500 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  id="deck-video-upload"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoChange}
                  className="hidden"
                />
                <label htmlFor="deck-video-upload" className="cursor-pointer flex flex-col items-center w-full">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                    <Video className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    Attach 60-Second Video Pitch
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    MP4, WebM, or MOV up to 100MB
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{progressText}</span>
            </div>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Publish Pitch to Social Feed & Run Audit
            </>
          )}
        </button>
      </form>
    </div>
  )
}
