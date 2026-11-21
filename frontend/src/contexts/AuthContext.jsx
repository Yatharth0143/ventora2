import React, { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ventora_user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('ventora_token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await getMe()
          setUser(res.data.user)
          localStorage.setItem('ventora_user', JSON.stringify(res.data.user))
        } catch (err) {
          logout()
        }
      }
      setLoading(false)
    }
    verifyAuth()
  }, [token])

  const login = (newToken, newUser) => {
    localStorage.setItem('ventora_token', newToken)
    localStorage.setItem('ventora_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('ventora_token')
    localStorage.removeItem('ventora_user')
    setToken(null)
    setUser(null)
  }

  const updateUser = (updated) => {
    setUser(updated)
    localStorage.setItem('ventora_user', JSON.stringify(updated))
  }

  const isFounder = user?.role === 'founder'
  const isInvestor = user?.role === 'investor'
  const isPro = user?.tier === 'pro'
  const isVerified = user?.verified === true

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isFounder,
        isInvestor,
        isPro,
        isVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

