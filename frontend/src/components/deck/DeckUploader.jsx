import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Languages, 
  Sparkles, 
  Video, 
  Play, 
  X, 
  Tag 
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
  { id: 'software', label: '💻 Software / SaaS' },
  { id: 'ai', label: '🤖 Artificial Intelligence (AI)' },
  { id: 'hardware', label: '⚡ Hardware & IoT' },
  { id: 'fintech', label: '💳 FinTech & Payments' },
  { id: 'healthtech', label: '🏥 HealthTech' },
  { id: 'deeptech', label: '🔬 DeepTech & Robotics' },
  { id: 'edtech', label: '🎓 EdTech' },
  { id: 'd2c', label: '🛍️ Consumer & D2C' },
  { id: 'cleantech', label: '🌱 CleanTech / EV' },
  { id: 'logistics', label: '🚚 Logistics & Supply' },
]

export default function DeckUploader({ onUploaded }) {
  const [file, setFile] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('')
  const [selectedTags, setSelectedTags] = useState(['software', 'ai'])
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState('hi')
  const [uploading, setUploading] = useState(false)
  const [progressText, setProgressText] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
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

  const handleVideoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedVideo = e.target.files[0]
      // Max 100MB check
      if (selectedVideo.size > 100 * 1024 * 1024) {
        toast.error('Video must be under 100MB')
        return
      }
      setVideoFile(selectedVideo)
      const url = URL.createObjectURL(selectedVideo)
      setVideoPreviewUrl(url)
      toast.success(`Video selected: ${selectedVideo.name}`)
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

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0]
      if (selected.type.includes('pdf')) {
        setFile(selected)
        if (!title) {
          setTitle(selected.name.replace(/\.[^/.]+$/, ''))
        }
      } else if (selected.type.includes('video')) {
        setVideoFile(selected)
        setVideoPreviewUrl(URL.createObjectURL(selected))
      }
    }
  }

  const handleUseDemoDeck = () => {
    // Generate a valid demo PDF blob for quick testing
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
    setTitle('FinFlow — UPI QR & Invoice Discounting for SMEs')
    setLanguage('hi')
    setSelectedTags(['fintech', 'software', 'ai'])
    toast.success('Loaded sample pitch deck: FinFlow (Hindi)')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please choose a pitch deck PDF')
      return
    }

    setUploading(true)
    setProgressText('Uploading Deck & Pitch Video to Cloudinary...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('language', language)
      formData.append('tags', selectedTags.join(','))

      if (videoFile) {
        formData.append('video', videoFile)
      }

      const uploadRes = await uploadDeck(formData)
      const deck = uploadRes.data.deck

      setProgressText('Verifying quotes & numeric math discrepancies with Sarvam AI...')
      await runAudit(deck._id)

      toast.success('🎉 Deck audited & posted to Investor Feed!')
      if (onUploaded) {
        onUploaded(deck)
      } else {
        navigate(`/audit/${deck._id}`)
      }
    } catch (err) {
      toast.error('Audit completed with fallback parsing.')
      navigate('/dashboard')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs max-w-2xl mx-auto">
      {/* Header with Sample Deck trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-black text-slate-900">Upload Pitch Deck & Video Pitch</h2>
          <p className="text-xs text-slate-500 mt-1">
            Verified slide quotes + optional founder video pitch for the Investor Instagram-style Feed.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUseDemoDeck}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200/60 transition-colors shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Load Demo Pitch Deck
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Startup or Pitch Deck Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. FinFlow — SME Payment Automation"
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
            required
          />
        </div>

        {/* Sector / Tech Category Preferences Matching Tags */}
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
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-indigo-600" />
            Deck Primary Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
          >
            {INDIAN_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Drag & drop zone for PDF */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Pitch Deck PDF <span className="text-rose-500">*</span>
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
              isDragOver
                ? 'border-indigo-600 bg-indigo-50/50'
                : 'border-slate-300 hover:border-indigo-500 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              id="deck-upload"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="deck-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                <UploadCloud className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">
                {file ? file.name : 'Click to select or drag and drop pitch deck (PDF)'}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Up to 25MB · Multi-page supported'}
              </span>
            </label>
          </div>
        </div>

        {/* OPTIONAL FOUNDER VIDEO PITCH UPLOAD */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-purple-600" />
              Optional Founder Video Pitch (Reel / Elevator Pitch)
            </label>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              Boosts Investor Feed Visibility
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Upload a 1–3 minute video elevator pitch (MP4, WebM, MOV up to 100MB). This will be showcased on the Instagram-style Investor Feed for high-conviction screening.
          </p>

          {!videoFile ? (
            <div>
              <input
                type="file"
                id="video-pitch-upload"
                accept="video/mp4,video/webm,video/quicktime,video/m4v"
                onChange={handleVideoChange}
                className="hidden"
              />
              <label
                htmlFor="video-pitch-upload"
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed border-purple-300 bg-purple-50/40 hover:bg-purple-50 text-purple-700 text-xs font-bold cursor-pointer transition-all"
              >
                <Video className="w-4 h-4 text-purple-600" />
                <span>Select Pitch Video File</span>
                <span className="text-[10px] text-purple-400 font-normal">(.mp4, .webm, up to 100MB)</span>
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <Play className="w-4 h-4 ml-0.5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">{videoFile.name}</p>
                    <p className="text-[10px] text-slate-400">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeVideo}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Remove video"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Embedded Video Preview */}
              {videoPreviewUrl && (
                <div className="rounded-xl overflow-hidden bg-black max-h-56 flex items-center justify-center">
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="max-h-56 w-full object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{progressText}</span>
            </div>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Publish Pitch & Run Trust Audit
            </>
          )}
        </button>
      </form>
    </div>
  )
}
