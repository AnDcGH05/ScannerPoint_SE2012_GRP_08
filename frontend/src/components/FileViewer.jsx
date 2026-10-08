import { useState } from 'react'
import { useFileUrl } from '../lib/files.js'
import Icon from './Icon.jsx'
import { Loading } from './States.jsx'

/** Shows an uploaded slip or document (image or PDF) fetched with the login token, with zoom. */
export default function FileViewer({ url, height = 'h-[460px]' }) {
  const file = useFileUrl(url)
  const [zoom, setZoom] = useState(1)
  if (!url) return null
  return (
    <div className="overflow-hidden rounded-card border border-line bg-slate-800">
      <div className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-2 text-white">
        <span className="flex items-center gap-1 text-body-sm"><Icon name="description" className="text-[18px]" /> Uploaded file</span>
        <div className="flex items-center gap-1">
          {file.type?.startsWith('image/') && (
            <>
              <button type="button" className="rounded p-1 hover:bg-white/10" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} aria-label="Zoom out"><Icon name="zoom_out" /></button>
              <span className="w-12 text-center text-body-sm num">{Math.round(zoom * 100)}%</span>
              <button type="button" className="rounded p-1 hover:bg-white/10" onClick={() => setZoom((z) => Math.min(3, z + 0.25))} aria-label="Zoom in"><Icon name="zoom_in" /></button>
            </>
          )}
          {file.src && <a href={file.src} target="_blank" rel="noreferrer" className="rounded p-1 hover:bg-white/10" title="Open in new tab"><Icon name="open_in_new" /></a>}
        </div>
      </div>
      <div className={`${height} overflow-auto bg-slate-700`}>
        {!file.src && !file.error && <Loading className="text-white" />}
        {file.error && (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-slate-200">
            <Icon name="image_not_supported" size={36} />
            <p className="text-body-md">The file is not on this server (sample data has no real files).</p>
          </div>
        )}
        {file.src && file.type === 'application/pdf' && <iframe title="Uploaded PDF" src={file.src} className="h-full w-full bg-white" />}
        {file.src && file.type?.startsWith('image/') && (
          <div className="flex min-h-full items-center justify-center p-4">
            <img src={file.src} alt="Uploaded slip" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }} className="max-w-full bg-white shadow-overlay transition-transform" />
          </div>
        )}
      </div>
    </div>
  )
}
