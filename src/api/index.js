/**
 * RUBRA API Layer
 * All backend communication is centralised here.
 * Set VITE_API_URL in .env → your HuggingFace Space URL.
 */

const BASE = import.meta.env.VITE_API_URL || ''

// ── SSE stream helper ────────────────────────────────────────────
export async function streamSSE(url, body, { onEvent, onDone, onError } = {}) {
  const ctrl = new AbortController()
  try {
    const res = await fetch(`${BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const reader  = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''

    const pump = async () => {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) { onDone?.(); break }
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop()
        for (const line of lines) {
          const t = line.trim()
          if (!t || t === 'data: [DONE]') { if (t === 'data: [DONE]') onDone?.(); continue }
          if (t.startsWith('data: ')) {
            try { onEvent?.(JSON.parse(t.slice(6))) } catch { /* skip */ }
          }
        }
      }
    }
    pump().catch(e => { if (e.name !== 'AbortError') onError?.(e) })
  } catch (e) {
    if (e.name !== 'AbortError') onError?.(e)
  }
  return () => ctrl.abort()
}

// ── Chat ─────────────────────────────────────────────────────────
export function sendMessage({ message, sessionId, taskType, mode }, callbacks) {
  return streamSSE('/api/chat', { message, session_id: sessionId, task_type: taskType, mode }, callbacks)
}

// ── File upload ──────────────────────────────────────────────────
export async function uploadFile({ file, sessionId, question, mode }, callbacks) {
  const ctrl = new AbortController()
  const form = new FormData()
  form.append('file', file)
  form.append('session_id', sessionId || '')
  form.append('question', question || '')
  form.append('mode', mode || '')
  try {
    const res = await fetch(`${BASE}/api/upload`, { method: 'POST', body: form, signal: ctrl.signal })
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
    const reader  = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    const pump = async () => {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) { callbacks.onDone?.(); break }
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop()
        for (const line of lines) {
          const t = line.trim()
          if (!t || t === 'data: [DONE]') { if (t === 'data: [DONE]') callbacks.onDone?.(); continue }
          if (t.startsWith('data: ')) { try { callbacks.onEvent?.(JSON.parse(t.slice(6))) } catch { /* skip */ } }
        }
      }
    }
    pump().catch(e => { if (e.name !== 'AbortError') callbacks.onError?.(e) })
  } catch (e) { if (e.name !== 'AbortError') callbacks.onError?.(e) }
  return () => ctrl.abort()
}

// ── Sessions ─────────────────────────────────────────────────────
export const getSessions  = () => fetch(`${BASE}/api/sessions`).then(r => r.json())
export const deleteSession = id => fetch(`${BASE}/api/sessions/${id}`, { method: 'DELETE' }).then(r => r.json())

// ── Tools ────────────────────────────────────────────────────────
export const getWeather  = (city = 'Dhaka') => fetch(`${BASE}/api/tools/weather?city=${encodeURIComponent(city)}`).then(r => r.json()).catch(() => null)
export const getCrypto   = (coins = 'bitcoin,ethereum') => fetch(`${BASE}/api/tools/crypto?coins=${coins}`).then(r => r.json()).catch(() => null)
export const getLiveFeed = (cat, lim = 8) => fetch(`${BASE}/api/live-feed?limit=${lim}${cat ? `&category=${cat}` : ''}`).then(r => r.json()).catch(() => ({ items: [] }))
export const getStatus   = () => fetch(`${BASE}/api/status`).then(r => r.json())
