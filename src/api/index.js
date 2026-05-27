/**
 * RUBRA v3 — api/index.js
 *
 * SSE normalizer: যেকোনো format এ backend response আসুক,
 * সব normalize করে standard events এ convert করে।
 *
 * Rubra backend পাঠাতে পারে:
 *   {type:'token', content:'...'} 
 *   {type:'status', text:'Synthesizing results...'}
 *   {type:'meta', agent:'CodingAgent'}
 *   {type:'tool_call', name:'web_search', input:{}}
 *   {type:'tool_result', call_id:'...', output:'...'}
 *   {token:'...'} (legacy)
 *   {choices:[{delta:{content:'...'}}]} (OpenAI-style)
 *   plain text chunks (non-JSON)
 */

const BASE = import.meta.env.VITE_API_URL || ''

// ── Normalize any backend event → standard format ─────────────────────────────
function normalize(raw) {
  // Already typed correctly
  if (raw.type === 'token' && raw.content)      return raw
  if (raw.type === 'tool_call')                  return raw
  if (raw.type === 'tool_result')                return raw
  if (raw.type === 'meta')                       return raw
  if (raw.type === 'error')                      return raw

  // Status/synthesizing — treat as status, NOT content
  if (raw.type === 'status')
    return { type: 'status', text: raw.text || raw.message || raw.detail || '', percent: raw.percent || 0 }

  // Progress object
  if (raw.progress)
    return { type: 'status', text: raw.progress.detail || raw.progress.step || '', percent: raw.progress.percent || 0 }

  // Legacy: {token: '...'}
  if (typeof raw.token === 'string')
    return { type: 'token', content: raw.token }

  // OpenAI-style delta
  const delta = raw.choices?.[0]?.delta?.content
  if (typeof delta === 'string' && delta)
    return { type: 'token', content: delta }

  // {content: '...'} without type
  if (typeof raw.content === 'string' && raw.content)
    return { type: 'token', content: raw.content }

  // {text: '...'} that isn't status
  if (typeof raw.text === 'string' && raw.text && !raw.type)
    return { type: 'token', content: raw.text }

  return raw // pass through unknown
}

// ── Core SSE streamer ─────────────────────────────────────────────────────────
export function streamSSE(url, body, { onEvent, onDone, onError } = {}) {
  const ctrl    = new AbortController()
  let doneOnce  = false
  let hasContent = false  // track if real content has arrived

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
      let accumContent = ''  // accumulate full content for token events

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

          if (t.startsWith('data: ')) {
            const raw = t.slice(6)

            // Try JSON parse
            let parsed
            try { parsed = JSON.parse(raw) } catch {
              // Plain text chunk — treat as token
              if (raw && raw !== '[DONE]') {
                accumContent += raw
                hasContent = true
                onEvent?.({ type: 'token', content: accumContent })
              }
              continue
            }

            const evt = normalize(parsed)

            // Token: accumulate for full content
            if (evt.type === 'token') {
              accumContent += evt.content
              hasContent = true
              onEvent?.({ type: 'token', content: accumContent })
            } else if (evt.type === 'status' && hasContent) {
              // Ignore status events AFTER content has started
              // (prevents "Synthesizing results..." showing after response begins)
            } else {
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

// ── File upload → SSE ─────────────────────────────────────────────────────────
export function uploadFile({ file, sessionId, question }, callbacks) {
  const ctrl = new AbortController()

  const run = async () => {
    const form = new FormData()
    form.append('file',       file)
    form.append('session_id', sessionId || '')
    form.append('question',   question  || '')

    try {
      const res = await fetch(`${BASE}/api/upload`, {
        method: 'POST', body: form, signal: ctrl.signal,
      })
      if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`)
      const data = await res.json()
      callbacks.onEvent?.({ type: 'token', content: data.text || data.response || `✅ Processed: ${file.name}` })
      callbacks.onDone?.()
    } catch (e) {
      if (e.name === 'AbortError') return
      callbacks.onError?.(e)
    }
  }

  run()
  return () => ctrl.abort()
}

// ── Other endpoints ───────────────────────────────────────────────────────────
export const getSessions   = () => fetch(`${BASE}/api/sessions`).then(r => r.json()).catch(() => [])
export const deleteSession = id => fetch(`${BASE}/api/sessions/${id}`, { method: 'DELETE' }).then(r => r.json())
export const getWeather    = city => fetch(`${BASE}/api/tools/weather?city=${encodeURIComponent(city || 'Dhaka')}`).then(r => r.json()).catch(() => null)
export const getCrypto     = (coins = 'bitcoin,ethereum') => fetch(`${BASE}/api/tools/crypto?coin=${coins}`).then(r => r.json()).catch(() => null)
export const getLiveFeed   = (cat, lim = 8) => fetch(`${BASE}/api/live-feed?limit=${lim}${cat ? `&category=${cat}` : ''}`).then(r => r.json()).catch(() => ({ items: [] }))
export const getStatus     = () => fetch(`${BASE}/health`).then(r => r.json()).catch(() => ({ status: 'offline' }))
