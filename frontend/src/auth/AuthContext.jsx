import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { TOKEN_KEY } from '../api/client.js'

const USER_KEY = 'sp_user'
const AuthContext = createContext(null)

/** Where each role lands after logging in. */
export function homePath(role) {
  switch (role) {
    case 'CUSTOMER': return '/app'
    case 'RECEPTIONIST': return '/staff/jobs'
    case 'MECHANIC': return '/staff/my-jobs'
    case 'STOREKEEPER': return '/staff/store'
    case 'ADMIN': return '/staff/reports'
    default: return '/login'
  }
}

function readUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (localStorage.getItem(TOKEN_KEY) ? readUser() : null))

  const save = useCallback(({ token, user: u }) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const login = useCallback(
    async (usernameOrEmail, password) => save((await api.post('/api/auth/login', { usernameOrEmail, password })).data),
    [save],
  )

  const register = useCallback(async (form) => save((await api.post('/api/auth/register', form)).data), [save])

  // refresh the name / role from the server once, and log out when a token expires
  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) {
      api.get('/api/auth/me')
        .then((res) => {
          localStorage.setItem(USER_KEY, JSON.stringify(res.data))
          setUser(res.data)
        })
        .catch(() => {})
    }
    window.addEventListener('sp:logout', logout)
    return () => window.removeEventListener('sp:logout', logout)
  }, [logout])

  const value = useMemo(() => ({ user, login, register, logout, isStaff: !!user && user.role !== 'CUSTOMER' }),
    [user, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
