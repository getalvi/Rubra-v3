import { useState, useRef } from "react";

const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="6" y="1" width="6" height="10" rx="3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
    <path d="M3 9c0 3.314 2.686 6 6 6s6-2.686 6-6" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="9" y1="15" x2="9" y2="17.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const WaveformIcon = () => (
  <svg width="32" height="18" viewBox="0 0 32 18" fill="none">
    {[4, 7, 5, 9, 6, 11, 7, 9, 5, 8, 6].map((h, i) => (
      <rect
        key={i}
        x={i * 2.8 + 0.5}
        y={(18 - h) / 2}
        width="1.8"
        height={h}
        rx="0.9"
        fill="rgba(255,255,255,0.5)"
      />
    ))}
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M16 9L2 2l3 7-3 7 14-7z" fill="rgba(255,255,255,0.85)" />
  </svg>
);

const PlusCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
    <line x1="10" y1="6" x2="10" y2="14" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="6" y1="10" x2="14" y2="10" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const quickActions = ["Code </>", "Write", "Research", "Learn", "News"];

export default function ChatBar({ onSend }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setValue(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
    }
  };

  return (
    <div
      style={{
        position: "relative",
        zIndex: 10,
        padding: "0 16px 20px",
        maxWidth: 780,
        width: "100%",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Glass input box */}
      <div
        style={{
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(28px)",
          border: "0.5px solid rgba(255,255,255,0.13)",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        {/* Text area row */}
        <div style={{ display: "flex", alignItems: "flex-start", padding: "12px 14px 6px" }}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKey}
            placeholder="Type Something here |"
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "rgba(255,255,255,0.85)",
              fontSize: 14,
              fontFamily: "'Inter', sans-serif",
              resize: "none",
              lineHeight: 1.5,
              minHeight: 24,
              maxHeight: 160,
              overflowY: "auto",
              caretColor: "white",
              "::placeholder": { color: "rgba(255,255,255,0.35)" },
            }}
          />
          <button
            onClick={handleSend}
            style={{
              marginLeft: 8,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "2px 4px",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <SendIcon />
          </button>
        </div>

        {/* Bottom controls row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 14px 10px",
          }}
        >
          <button
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            <PlusCircleIcon />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
              }}
            >
              <MicIcon />
            </button>
            <WaveformIcon />
          </div>
        </div>
      </div>

      {/* Quick action pills */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {quickActions.map((label) => (
          <button
            key={label}
            style={{
              padding: "7px 18px",
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              border: "0.5px solid rgba(255,255,255,0.12)",
              borderRadius: 20,
              color: "rgba(255,255,255,0.75)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.14)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "rgba(255,255,255,0.75)";
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
