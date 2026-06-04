import { useEffect, useRef } from "react";

export default function MessageThread({ messages }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!messages || messages.length === 0) return null;

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px 16px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxWidth: 780,
        width: "100%",
        margin: "0 auto",
        boxSizing: "border-box",
        scrollbarWidth: "none",
      }}
    >
      {messages.map((msg, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
          }}
        >
          {msg.role === "user" ? (
            <div
              style={{
                background: "rgba(255,255,255,0.09)",
                backdropFilter: "blur(16px)",
                border: "0.5px solid rgba(255,255,255,0.10)",
                borderRadius: "18px 18px 4px 18px",
                padding: "10px 16px",
                maxWidth: "72%",
                color: "rgba(255,255,255,0.9)",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              {msg.content}
            </div>
          ) : (
            <div
              style={{
                color: "rgba(255,255,255,0.82)",
                fontSize: 14,
                lineHeight: 1.7,
                maxWidth: "85%",
              }}
            >
              {msg.content}
            </div>
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
