/**
 * RUBRA v3 — src/api/index.js
 *
 * Fixed:
 *  - streamSSE: cancelRef এ abort function ঠিকমতো return হয়
 *  - pump() properly awaited internally via Promise
 *  - onDone double-call prevented (doneOnce flag)
 *  - AbortError silent handling
 */

const BASE = import.meta.env.VITE_API_URL || ''

/**
 * Core SSE streaming helper.
 * Returns: abort() function (synchronously) — NOT a Promise.
 * cancelRef.current = streamSSE(...) এভাবে call করতে হবে (await ছাড়া)
 */
export function streamSSE(url, body, { onEvent, onDone, onError } = {}) {
  const ctrl = new AbortController()
  let doneOnce = false

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

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      for (;;) {
        const { done: streamDone, value } = await reader.read()

        if (streamDone) {
          done()
          break
        }

        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() // keep incomplete last line

        for (const line of lines) {
          const t = line.trim()
          if (!t) continue

          if (t === 'data: [DONE]') {
            done()
            return   // exit the for loop AND run()
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
    } catch (e) {
      if (e.name === 'AbortError') return  // intentional cancel — silent
      onError?.(e)
    }
  }

  run() // fire and forget — returns abort fn synchronously below

  return () => ctrl.abort()  // caller stores this in cancelRef.current
}


/**
 * Send a chat message via SSE stream.
 * Usage: cancelRef.current = sendMessage(..., callbacks)  ← NO await
 */
export function sendMessage({ message, sessionId, taskType, mode }, callbacks) {
  return streamSSE(
    '/api/chat/stream',
    {
      message,
      session_id: sessionId,
      task_type:  taskType,
      mode:       mode || 'auto',
      stream:     true,
    },
    callbacks
  )
}


/**
 * Upload a file. Returns abort fn (same pattern as streamSSE).
 * Upload endpoint returns plain JSON — NOT SSE.
 * Usage: cancelRef.current = uploadFile(...)  ← NO await
 */
export function uploadFile({ file, sessionId, question, mode }, callbacks) {
  const ctrl = new AbortController()

  const run = async () => {
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

      if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`)

      const data = await res.json()

      callbacks.onEvent?.({
        type:    'token',
        content: data.text || `File processed: ${file.name}`,
      })
      callbacks.onDone?.()

    } catch (e) {
      if (e.name === 'AbortError') return
      callbacks.onError?.(e)
    }
  }

  run()
  return () => ctrl.abort()
}


// ─── Other API calls ───────────────────────────────────────────────────────────

export const getSessions  = () =>
  fetch(`${BASE}/api/sessions`).then(r => r.json())

export const deleteSession = id =>
  fetch(`${BASE}/api/sessions/${id}`, { method: 'DELETE' }).then(r => r.json())

export const getWeather   = (city = 'Dhaka') =>
  fetch(`${BASE}/api/tools/weather?city=${encodeURIComponent(city)}`)
    .then(r => r.json()).catch(() => null)

export const getCrypto    = (coins = 'bitcoin,ethereum') =>
  fetch(`${BASE}/api/tools/crypto?coin=${coins}`)
    .then(r => r.json()).catch(() => null)

export const getLiveFeed  = (cat, lim = 8) =>
  fetch(`${BASE}/api/live-feed?limit=${lim}${cat ? `&category=${cat}` : ''}`)
    .then(r => r.json()).catch(() => ({ items: [] }))

export const getStatus    = () =>
  fetch(`${BASE}/health`).then(r => r.json()).catch(() => ({ status: 'offline' }))
