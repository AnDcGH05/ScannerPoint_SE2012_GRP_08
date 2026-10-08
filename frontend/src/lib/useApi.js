import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../api/client.js'

/**
 * Loads data from the API and keeps loading / error state.
 *   const { data, loading, error, reload } = useApi('/api/vehicles')
 * Pass null as the url to skip loading. pollMs re-loads silently in the background.
 */
export default function useApi(url, { params, pollMs } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(url))
  const [error, setError] = useState(null)
  const key = url ? url + JSON.stringify(params || {}) : null
  const keyRef = useRef(key)
  keyRef.current = key

  const load = useCallback(
    async (silent = false) => {
      if (!url) return
      if (!silent) setLoading(true)
      try {
        const res = await api.get(url, { params })
        if (keyRef.current === key) {
          setData(res.data)
          setError(null)
        }
      } catch (e) {
        if (keyRef.current === key && !silent) setError(e)
      } finally {
        if (keyRef.current === key && !silent) setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!pollMs || !url) return undefined
    const id = setInterval(() => load(true), pollMs)
    return () => clearInterval(id)
  }, [pollMs, url, load])

  return { data, setData, loading, error, reload: () => load(true) }
}
