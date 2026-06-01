/**
 * RUBRA v3 — api/index.js
 * Universal SSE normalizer — handles ALL backend formats
 * Fix: all content values forced to string before yielding
 */

const BASE = import.meta.env.VITE_API_URL || ''

// ── Safe string conversion ────────────────────────────────────────────────────
function toStr(val) {
  if (val === null || val === undefined) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'number' || typeof val === 'boolean') return String(val)
  // object/array → pretty JSON
  try { return JSON.stringify(val, null, 2) } catch { return String(val) }
}

// ── Normalize any backend event → standard {type, ...} ───────────────────────
function normalize(raw) {
  if (!raw || typeof raw !== 'object') return { type: 'unknown' }

  // Already correct type
  if (raw.type === 'tool_call')   return raw
  if (raw.type === 'tool_result') return raw
  if (raw.type === 'meta')        return raw
  if (raw.type === 'error')       return raw

  // Status — NOT content
  if (raw.type === 'status')
    return { type: 'status', text: toStr(raw.text || raw.message || raw.detail || ''), percent: raw.percent || 0 }

  // Progress object
  if (raw.progress)
    return { type: 'status', text: toStr(raw.progress.detail || raw.progress.step || ''), percent: raw.progress.percent || 0 }

  // Token with content
  if (raw.type === 'token') {
    const c = toStr(raw.content)
    return c ? { type: 'token', content: c } : { type: 'unknown' }
  }

  // Legacy {token: '...'}
  if (typeof raw.token === 'string')
    return { type: 'token', content: raw.token }

  // OpenAI-style delta: {choices:[{delta:{content:'...'}}]}
  const delta = raw.choices?.[0]?.delta?.content
  if (delta !== undefined && delta !== null) {
    const c = toStr(delta)
    return c ? { type: 'token', content: c } : { type: 'unknown' }
  }

  // {content: '...'} without type
  if (raw.content !== undefined && raw.content !== null && raw.type !== 'status') {
    const c = toStr(raw.content)
    return c ? { type: 'token', content: c } : { type: 'unknown' }
  }

  // {text: '...'} that isn't status
  if (typeof raw.text === 'string' && raw.text && !raw.type)
    return { type: 'token', content: raw.text }

  return { type: 'unknown', _raw: raw }
}

// ── Core SSE streamer ─────────────────────────────────────────────────────────
export function streamSSE(url, body, { onEvent, onDone, onError } = {}) {
  const ctrl    = new AbortController()
  let doneOnce  = false
  let hasContent = false
  let accumContent = ''

  const done = () => {
    if (doneOnce) return
    doneOnce = true
    onDone?.()
  }

  const run = async () => {
    try {
      const res = await fetch(`${BASE}${url}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
        signal:  ctrl.signal,
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      for (;;) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) { done(); break }

        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop()

        for (const line of lines) {
          const t = line.trim()
          if (!t) continue
          if (t === 'data: [DONE]') { done(); return }
          // SSE keep-alive comment
          if (t.startsWith(':')) continue

          if (t.startsWith('data: ')) {
            const raw = t.slice(6).trim()
            if (!raw || raw === '[DONE]') continue

            let parsed
            try { parsed = JSON.parse(raw) } catch {
              // Plain text chunk
              if (raw) {
                const chunk = toStr(raw)
                accumContent += chunk
                hasContent = true
                onEvent?.({ type: 'token', content: accumContent })
              }
              continue
            }

            const evt = normalize(parsed)

            if (evt.type === 'token') {
              const chunk = toStr(evt.content)
              if (chunk) {
                accumContent += chunk
                hasContent = true
                onEvent?.({ type: 'token', content: accumContent })
              }
            } else if (evt.type === 'status') {
              // Only emit status if content hasn't started yet
              if (!hasContent) onEvent?.(evt)
            } else if (evt.type !== 'unknown') {
              onEvent?.(evt)
            }
          }
        }
      }
    } catch (e) {
      if (e.name === 'AbortError') return
      onError?.(e)
    }
  }

  run()
  return () => ctrl.abort()
}

// ── Chat message ──────────────────────────────────────────────────────────────
export function sendMessage({ message, sessionId, mode }, callbacks) {
  return streamSSE(
    '/api/chat/stream',
    { message, session_id: sessionId, mode: mode || 'auto', stream: true },
    callbacks
  )
}

// ── File upload ───────────────────────────────────────────────────────────────
export function uploadFile({ file, sessionId, question }, callbacks) {
  const ctrl = new AbortController()
  const run  = async () => {
    const form = new FormData()
    form.append('file',       file)
    form.append('session_id', sessionId || '')
    form.append('question',   question  || '')
    try {
      const res = await fetch(`${BASE}/api/upload`, { method: 'POST', body: form, signal: ctrl.signal })
      if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`)
      const data = await res.json()
      callbacks.onEvent?.({ type: 'token', content: toStr(data.text || data.response || `✅ Processed: ${file.name}`) })
      callbacks.onDone?.()
    } catch (e) {
      if (e.name === 'AbortError') return
      callbacks.onError?.(e)
    }
  }
  run()
  return () => ctrl.abort()
}

export const getSessions   = () => fetch(`${BASE}/api/sessions`).then(r => r.json()).catch(() => [])
export const deleteSession = id => fetch(`${BASE}/api/sessions/${id}`, { method: 'DELETE' }).then(r => r.json())
export const getStatus     = () => fetch(`${BASE}/health`).then(r => r.json()).catch(() => ({ status: 'offline' }))
