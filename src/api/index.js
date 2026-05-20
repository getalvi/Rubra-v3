/**
 * RUBRA v3 — src/api/index.js (FULLY FIXED)
 * 
 * Fixes:
 *  BUG 1: sendMessage now calls /api/chat/stream (was wrongly /api/chat)
 *  BUG 4: uploadFile now uses res.json() instead of SSE reader
 *  BUG 5: Handles data: [DONE] termination signal properly
 */

const BASE = import.meta.env.VITE_API_URL || ''

/**
 * Core SSE streaming helper.
 * Reads an SSE stream and fires callbacks for each event.
 */
export async function streamSSE(url, body, { onEvent, onDone, onError } = {}) {
  const ctrl = new AbortController()

  try {
    const res = await fetch(`${BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

    const reader  = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''

    const pump = async () => {
      for (;;) {
        const { done, value } = await reader.read()

        if (done) {
          onDone?.()
          break
        }

        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() // keep incomplete line in buffer

        for (const line of lines) {
          const t = line.trim()
          if (!t) continue

          // SSE termination signal — close the stream
          if (t === 'data: [DONE]') {
            onDone?.()
            return
          }

          if (t.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(t.slice(6))
              onEvent?.(parsed)
            } catch {
              // skip malformed JSON
            }
          }
        }
      }
    }

    pump().catch(e => {
      if (e.name !== 'AbortError') onError?.(e)
    })

  } catch (e) {
    if (e.name !== 'AbortError') onError?.(e)
  }

  return () => ctrl.abort()
}


/**
 * FIXED BUG 1: Was calling /api/chat (JSON endpoint).
 * Now correctly calls /api/chat/stream (SSE endpoint).
 */
export function sendMessage({ message, sessionId, taskType, mode }, callbacks) {
  return streamSSE(
    '/api/chat/stream',   // ← FIXED (was /api/chat)
    {
      message,
      session_id: sessionId,
      task_type:  taskType,
      mode,
      stream: true,       // explicitly request streaming
    },
    callbacks
  )
}


/**
 * FIXED BUG 4: Upload returns JSON, NOT SSE.
 * Old code tried to parse the response as SSE → crash.
 * Now correctly calls res.json() and emits a token event.
 */
export async function uploadFile({ file, sessionId, question, mode }, callbacks) {
  const ctrl = new AbortController()

  const form = new FormData()
  form.append('file',       file)
  form.append('session_id', sessionId || '')
  form.append('question',   question  || '')
  form.append('mode',       mode      || '')

  try {
    const res = await fetch(`${BASE}/api/upload`, {
      method: 'POST',
      body:   form,
      signal: ctrl.signal,
    })

    if (!res.ok) throw new Error(`Upload failed: ${res.status}`)

    // FIXED: Upload endpoint returns plain JSON, not SSE
    const data = await res.json()

    callbacks.onEvent?.({
      type:    'token',
      content: data.text || `File processed: ${file.name}`,
    })
    callbacks.onDone?.()

  } catch (e) {
    if (e.name !== 'AbortError') callbacks.onError?.(e)
  }

  return () => ctrl.abort()
}


// ─── Other API calls ──────────────────────────────────────────────────────────

export const getSessions = () =>
  fetch(`${BASE}/api/sessions`).then(r => r.json())

export const deleteSession = id =>
  fetch(`${BASE}/api/sessions/${id}`, { method: 'DELETE' }).then(r => r.json())

export const getWeather = (city = 'Dhaka') =>
  fetch(`${BASE}/api/tools/weather?city=${encodeURIComponent(city)}`)
    .then(r => r.json()).catch(() => null)

export const getCrypto = (coins = 'bitcoin,ethereum') =>
  fetch(`${BASE}/api/tools/crypto?coin=${coins}`)
    .then(r => r.json()).catch(() => null)

export const getLiveFeed = (cat, lim = 8) =>
  fetch(`${BASE}/api/live-feed?limit=${lim}${cat ? `&category=${cat}` : ''}`)
    .then(r => r.json()).catch(() => ({ items: [] }))

export const getStatus = () =>
  fetch(`${BASE}/health`).then(r => r.json()).catch(() => ({ status: 'offline' }))
