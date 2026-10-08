import axios from 'axios'

/**
 * One Axios instance for the whole app. It adds the JWT to every request and,
 * if the server says 401 (token expired), logs the user out.
 * In development Vite forwards /api to http://localhost:8081 (see vite.config.js).
 */
export const TOKEN_KEY = 'sp_token'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || ''
    if (err.response?.status === 401 && !url.includes('/api/auth/')) {
      window.dispatchEvent(new Event('sp:logout'))
    }
    return Promise.reject(err)
  },
)

/** The readable message from our backend's ApiError body. */
export function errorMessage(err) {
  if (!err) return ''
  if (err.response?.data?.message) return err.response.data.message
  if (err.response) return `Request failed (${err.response.status})`
  return 'Cannot reach the ScannerPoint server. Is the backend running on port 8081?'
}

/** Field-by-field validation messages ({ field: message }). */
export function fieldErrors(err) {
  return err?.response?.data?.fieldErrors || {}
}

export default api
