import { useState, useCallback, useRef } from "react";
import { streamChat } from "../services/api";
import { v4 as uuid } from "uuid";

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId] = useState(() => uuid());
  const streamingIdRef = useRef(null);

  const sendMessage = useCallback(
    async (text, mode = "auto") => {
      if (!text.trim() || isStreaming) return;

      const userMsg = { id: uuid(), role: "user", content: text, ts: Date.now() };
      const assistantId = uuid();
      const assistantMsg = {
        id: assistantId,
        role: "assistant",
        content: "",
        ts: Date.now(),
        streaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);
      streamingIdRef.current = assistantId;

      await streamChat({
        message: text,
        sessionId,
        mode,
        onToken: (_chunk, fullText) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: fullText } : m
            )
          );
        },
        onDone: (fullText) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: fullText || m.content, streaming: false }
                : m
            )
          );
          setIsStreaming(false);
          streamingIdRef.current = null;
        },
        onError: (err) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: `⚠️ Error: ${err.message || "Something went wrong"}`,
                    streaming: false,
                    error: true,
                  }
                : m
            )
          );
          setIsStreaming(false);
        },
      });
    },
    [isStreaming, sessionId]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setIsStreaming(false);
  }, []);

  return { messages, sendMessage, clearChat, isStreaming, sessionId };
}
