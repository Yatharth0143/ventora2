import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// Attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ventora_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-logout if on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('ventora_token')
        localStorage.removeItem('ventora_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// Auth
export const googleLogin = (credential, role = 'founder') => api.post('/auth/google', { credential, role })
export const demoLogin = (email, name, role = 'founder') => api.post('/auth/demo-login', { email, name, role })
export const getMe = () => api.get('/auth/me')
export const updateProfile = (data) => api.put('/auth/profile', data)

// Decks
export const uploadDeck = (formData) => api.post('/deck/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const listDecks = () => api.get('/deck/list')
export const getDeck = (id) => api.get(`/deck/${id}`)

// Audit
export const runAudit = (deckId) => api.post(`/audit/${deckId}/run`)
export const getFindings = (deckId) => api.get(`/audit/${deckId}/findings`)
export const getFitTable = (deckId) => api.get(`/audit/${deckId}/fit`)

// Payments (Mock)
export const subscribe = (data) => api.post('/payment/subscribe', data)
export const getPaymentStatus = () => api.get('/payment/status')
export const cancelSubscription = () => api.post('/payment/cancel')

// Chat
export const sendMessage = (data) => api.post('/chat/send', data)
export const getChatHistory = (userId) => api.get(`/chat/history/${userId}`)
export const getConversations = () => api.get('/chat/conversations')
export const getUserProfile = (userId) => api.get(`/chat/user/${userId}`)

// Investors
export const listInvestors = (params) => api.get('/investors', { params })
export const getInvestor = (id) => api.get(`/investors/${id}`)
export const verifyInvestor = (id, data) => api.post(`/investors/${id}/verify`, data)

// Graph
export const checkConflict = (founderId, investorId) => api.get(`/graph/conflict/${founderId}/${investorId}`)
export const getCofounders = (founderId) => api.get(`/graph/cofounders/${founderId}`)
export const getMatches = (founderId) => api.get(`/graph/matches/${founderId}`)

// Screener
export const batchScreen = (deckIds) => api.post('/screener/batch', { deck_ids: deckIds })

// Trust Chain Verification (Public)
export const verifyChain = () => api.get('/verify/chain')
export const verifyEntry = (entryId) => api.get(`/verify/entry/${entryId}`)

// Marketing
export const getMarketingReport = (deckId) => api.get(`/marketing/${deckId}`)

// RAG Audit Pipeline
export const queryDeckRag = (deckId, query) => api.post(`/audit/${deckId}/rag-query`, { query })
export const runDeckRagAudit = (deckId) => api.post(`/audit/${deckId}/rag-audit`)

// Admin - Pitch Deck Verdicts & 7-Day Retention
export const getAdminStats = () => api.get('/admin/stats')
export const getAdminDecks = () => api.get('/admin/decks')
export const removeGarbageDeck = (deckId) => api.delete(`/admin/decks/${deckId}`)
export const purgeAllGarbageDecks = () => api.post('/admin/decks/purge-garbage')
export const purgeExpiredDecks = () => api.post('/admin/decks/purge-expired')
export const flagDeckGarbage = (deckId, data) => api.post(`/admin/decks/${deckId}/flag-garbage`, data)
export const runAdminRagAudit = (deckId) => api.post(`/admin/decks/${deckId}/run-rag-audit`)

// Admin - Investor Responsiveness, 7-Day Warnings & Blocks
export const getAdminInvestors = () => api.get('/admin/investors')
export const warnInvestor = (investorId, reason) => api.post(`/admin/investors/${investorId}/warn`, { reason })
export const blockInvestor = (investorId, reason) => api.post(`/admin/investors/${investorId}/block`, { reason })
export const unblockInvestor = (investorId) => api.post(`/admin/investors/${investorId}/unblock`)

// Market Intelligence & Analysis (For Founders & Investors)
export const runMarketAnalysis = (deckId) => api.post(`/market-analysis/${deckId}/run`)
export const getMarketAnalysis = (deckId) => api.get(`/market-analysis/${deckId}`)
export const analyzeCustomMarket = (data) => api.post('/market-analysis/custom/analyze', data)
export const getRecentMarketAnalyses = () => api.get('/market-analysis')



