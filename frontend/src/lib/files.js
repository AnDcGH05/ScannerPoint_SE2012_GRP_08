import { useEffect, useState } from 'react'
import api from '../api/client.js'

/** Uploaded files need the login token, so they are fetched as blobs. */
export async function openFile(url) {
  const res = await api.get(url, { responseType: 'blob' })
  const objectUrl = URL.createObjectURL(res.data)
  window.open(objectUrl, '_blank', 'noopener')
}

/** For previews: returns { src, type, error } for an authenticated file url. */
export function useFileUrl(url) {
  const [state, setState] = useState({ src: null, type: null, error: null })
  useEffect(() => {
    if (!url) {
      setState({ src: null, type: null, error: null })
      return undefined
    }
    let objectUrl
    let cancelled = false
    setState({ src: null, type: null, error: null })
    api
      .get(url, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(res.data)
        setState({ src: objectUrl, type: res.data.type, error: null })
      })
      .catch((e) => !cancelled && setState({ src: null, type: null, error: e }))
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [url])
  return state
}
