import type { StreamEvent, UploadResponse } from '@/types';

const BASE_URL = 'https://getalvi-rubra-v3.hf.space';

function generateSessionId(): string {
  return 'session_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function getSessionId(): string {
  let sid = localStorage.getItem('rubra_session_id');
  if (!sid) {
    sid = generateSessionId();
    localStorage.setItem('rubra_session_id', sid);
  }
  return sid;
}

export function resetSession(): string {
  const sid = generateSessionId();
  localStorage.setItem('rubra_session_id', sid);
  return sid;
}

export async function* streamChat(
  message: string,
  options: {
    mode?: string;
    taskType?: string;
    image?: string;
    imageMime?: string;
    stream?: boolean;
    model?: string;
    forceHermes?: boolean;
  } = {}
): AsyncGenerator<StreamEvent, void, unknown> {
  const sid = getSessionId();

  const payload = {
    message,
    session_id: sid,
    mode: options.mode || 'auto',
    task_type: options.taskType || null,
    image: options.image || null,
    image_mime: options.imageMime || null,
    stream: options.stream !== false,
    model: options.model || null,
    force_hermes: options.forceHermes || false,
  };

  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';

    // Handle SSE streaming
    if (contentType.includes('text/event-stream')) {
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;

            const data = trimmed.slice(6);
            if (data === '[DONE]') return;

            try {
              const event: StreamEvent = JSON.parse(data);
              yield event;
            } catch {
              // Skip invalid JSON
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } else {
      // Handle JSON response (non-streaming)
      const data = await response.json();

      // Yield meta event
      yield {
        type: 'meta',
        intent: data.intent || 'general',
        mode: data.mode || 'auto',
      };

      // Yield agent info
      if (data.agents_used && data.agents_used.length > 0) {
        yield {
          type: 'meta',
          agent: data.agents_used[0],
        };
      }

      // Yield the response as a token
      if (data.response) {
        yield {
          type: 'token',
          content: data.response,
        };
      }

      // Yield done
      yield {
        type: 'token',
        content: data.response || '',
        done: true,
      };
    }
  } catch (error) {
    yield {
      type: 'error',
      message: error instanceof Error ? error.message : 'Failed to connect to RUBRA',
    };
    yield {
      type: 'token',
      content: '',
      done: true,
    };
  }
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchLiveFeed(): Promise<any[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/live-feed`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.feed || [];
  } catch {
    return [];
  }
}

export async function fetchSkills(): Promise<string[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/skills`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.skills || [];
  } catch {
    return [];
  }
}

export async function generateSkill(name: string, task: string): Promise<{ name: string; code: string }> {
  const response = await fetch(`${BASE_URL}/api/skills/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, task }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate skill: ${response.status}`);
  }

  return response.json();
}

export async function executeSkill(name: string, inputData: Record<string, any> = {}): Promise<any> {
  const response = await fetch(`${BASE_URL}/api/skills/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, input_data: inputData }),
  });

  if (!response.ok) {
    throw new Error(`Failed to execute skill: ${response.status}`);
  }

  return response.json();
}

export async function searchRAG(query: string): Promise<any[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/rag/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch {
    return [];
  }
}

export async function fetchCurriculum(): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/api/curriculum`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export function getCurrentSessionId(): string {
  return getSessionId();
}
