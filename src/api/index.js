/**
 * RUBRA API Service
 * All backend communication lives here.
 * Change VITE_API_URL in .env to point to your HuggingFace Space.
 */

const BASE_URL = import.meta.env.VITE_API_URL || ''

// ── Helpers ──────────────────────────────────────────────

/**
 * Parse Server-Sent Events stream.
 * onEvent(evt) called for each parsed event object.
 * Returns cleanup function.
 */
export async function streamSSE(url, body, onEvent, onDone, onError) {
  const controller = new AbortController()

  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read()
        if (done) { onDone?.(); break }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') {
            if (trimmed === 'data: [DONE]') onDone?.()
            continue
          }
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6))
              onEvent(data)
            } catch {
              // skip malformed
            }
          }
        }
      }
    }

    pump().catch(err => {
      if (err.name !== 'AbortError') onError?.(err)
    })
  } catch (err) {
    if (err.name !== 'AbortError') onError?.(err)
  }

  return () => controller.abort()
}

// ── Chat ─────────────────────────────────────────────────

/**
 * Send a chat message. Returns cancel function.
 */
export function sendMessage({ message, sessionId, taskType, mode }, callbacks) {
  return streamSSE(
    '/api/chat',
    { message, session_id: sessionId, task_type: taskType, mode },
    callbacks.onEvent,
    callbacks.onDone,
    callbacks.onError
  )
}

// ── File Upload ──────────────────────────────────────────

/**
 * Upload a file for analysis. Returns cancel function.
 */
export async function uploadFile({ file, sessionId, question, mode }, callbacks) {
  const controller = new AbortController()
  const form = new FormData()
  form.append('file', file)
  form.append('session_id', sessionId || '')
  form.append('question', question || '')
  form.append('mode', mode || '')

  try {
    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    })

    if (!res.ok) throw new Error(`Upload failed: ${res.status}`)

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read()
        if (done) { callbacks.onDone?.(); break }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') {
            if (trimmed === 'data: [DONE]') callbacks.onDone?.()
            continue
          }
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6))
              callbacks.onEvent(data)
            } catch { /* skip */ }
          }
        }
      }
    }

    pump().catch(err => {
      if (err.name !== 'AbortError') callbacks.onError?.(err)
    })
  } catch (err) {
    if (err.name !== 'AbortError') callbacks.onError?.(err)
  }

  return () => controller.abort()
}

// ── Sessions ─────────────────────────────────────────────

export async function getSessions() {
  const res = await fetch(`${BASE_URL}/api/sessions`)
  if (!res.ok) throw new Error('Failed to load sessions')
  return res.json()
}

export async function getSession(sessionId) {
  const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}`)
  if (!res.ok) throw new Error('Session not found')
  return res.json()
}

export async function deleteSession(sessionId) {
  const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete session')
  return res.json()
}

// ── Live Feed ────────────────────────────────────────────

export async function getLiveFeed(category = null, limit = 10) {
  const params = new URLSearchParams({ limit })
  if (category) params.set('category', category)
  const res = await fetch(`${BASE_URL}/api/live-feed?${params}`)
  if (!res.ok) return { items: [] }
  return res.json()
}

export async function getTrending() {
  const res = await fetch(`${BASE_URL}/api/trending`)
  if (!res.ok) return {}
  return res.json()
}

// ── Tools ────────────────────────────────────────────────

export async function getWeather(city = 'Dhaka') {
  const res = await fetch(`${BASE_URL}/api/tools/weather?city=${encodeURIComponent(city)}`)
  if (!res.ok) return null
  return res.json()
}

export async function getCrypto(coins = 'bitcoin,ethereum') {
  const res = await fetch(`${BASE_URL}/api/tools/crypto?coins=${coins}`)
  if (!res.ok) return null
  return res.json()
}

export async function getCurrency(base = 'USD') {
  const res = await fetch(`${BASE_URL}/api/tools/currency?base=${base}`)
  if (!res.ok) return null
  return res.json()
}

// ── Status ───────────────────────────────────────────────

export async function getStatus() {
  const res = await fetch(`${BASE_URL}/api/status`)
  if (!res.ok) throw new Error('Backend offline')
  return res.json()
}

// ── TTS ──────────────────────────────────────────────────

export async function textToSpeech(text, lang = 'en') {
  const res = await fetch(`${BASE_URL}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, lang }),
  })
  if (!res.ok) return null
  return res.json()
}

// ── Live SSE Stream ──────────────────────────────────────

export function getLiveStream(sessionId) {
  return `${BASE_URL}/api/live/stream/${sessionId}`
}

export async function sendLiveText(sessionId, text) {
  const res = await fetch(`${BASE_URL}/api/live/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, text }),
  })
  if (!res.ok) return null
  return res.json()
}
