import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, SESSION_KEY } from './api'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(SESSION_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))
  const [expiresAt, setExpiresAt] = useState(0)
  const [sessionError, setSessionError] = useState('')
  const logout = useCallback(() => { localStorage.removeItem(SESSION_KEY); setToken(null); setUser(null); setExpiresAt(0); setLoading(false); setSessionError('') }, [])
  useEffect(() => {
    const expired = () => { logout(); setSessionError('Your session expired. Please log in again.') }
    const sync = event => { if (event.key === SESSION_KEY || event.key === null) { setUser(null); setExpiresAt(0); setToken(localStorage.getItem(SESSION_KEY)); setLoading(Boolean(localStorage.getItem(SESSION_KEY))) } }
    window.addEventListener('session-expired', expired); window.addEventListener('storage', sync)
    return () => { window.removeEventListener('session-expired', expired); window.removeEventListener('storage', sync) }
  }, [logout])
  useEffect(() => {
    if (!token) return
    const controller = new AbortController(); setLoading(true)
    api('me', undefined, { token, signal: controller.signal }).then(result => { setUser(result.user); setExpiresAt(result.expiresAt); setSessionError('') })
      .catch(error => { if (error.name !== 'AbortError') { setUser(null); setSessionError(error.message) } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [token])
  useEffect(() => {
    if (!expiresAt) return
    const timer = setTimeout(() => { logout(); setSessionError('Your session expired. Please log in again.') }, Math.max(0, expiresAt - Date.now()))
    return () => clearTimeout(timer)
  }, [expiresAt, logout])
  async function login(email, password) {
    const result = await api('login', { email, password }, { token: '' })
    localStorage.setItem(SESSION_KEY, result.token); setUser(result.user); setExpiresAt(result.expiresAt); setToken(result.token); setSessionError('')
  }
  return <AuthContext.Provider value={{ user, loading, login, logout, setUser, sessionError }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
