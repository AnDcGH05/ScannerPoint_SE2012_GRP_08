import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'

const MAX = 5 * 1024 * 1024
const TYPES = ['application/pdf', 'image/jpeg', 'image/png']

/** Drag-and-drop box for PDF / JPG / PNG up to 5 MB, with an image preview. */
export default function FileUpload({ file, onChange, label = 'Drag & drop your file here, or browse', hint = 'PDF, JPG or PNG – max 5 MB', error }) {
  const input = useRef(null)
  const [drag, setDrag] = useState(false)
  const [localError, setLocalError] = useState('')
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setPreview(null)
      return undefined
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const pick = (f) => {
    if (!f) return
    if (!TYPES.includes(f.type)) return setLocalError('Only PDF, JPG or PNG files are allowed')
    if (f.size > MAX) return setLocalError('The file is larger than 5 MB')
    setLocalError('')
    onChange(f)
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]) }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-4 py-6 text-center transition-colors ${
          drag ? 'border-orange bg-orange-light' : file ? 'border-success-border bg-success-bg' : 'border-slate-300 bg-page hover:border-navy'}`}
      >
        {preview ? (
          <img src={preview} alt="Selected file preview" className="max-h-40 rounded-control object-contain" />
        ) : (
          <Icon name={file ? 'description' : 'cloud_upload'} size={32} className={file ? 'text-success' : 'text-navy'} />
        )}
        {file ? (
          <p className="text-label-lg text-navy">{file.name} <span className="text-body-sm text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span></p>
        ) : (
          <p className="text-label-lg text-navy">{label}</p>
        )}
        <p className="text-body-sm text-slate-500">{file ? 'Click to choose a different file' : hint}</p>
        <input ref={input} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      {(localError || error) && <p className="mt-1 text-body-sm text-danger">{localError || error}</p>}
    </div>
  )
}
