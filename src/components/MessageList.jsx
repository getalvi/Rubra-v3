import { useEffect, useRef } from "react";

function TypingCursor() {
  return (
    <span style={{
      display:"inline-block", width:2, height:"1em",
      background:"rgba(255,255,255,0.75)", marginLeft:2, verticalAlign:"text-bottom",
      animation:"blink 0.85s step-start infinite",
    }} />
  );
}

function UserBubble({ content }) {
  return (
    <div style={{ display:"flex", justifyContent:"flex-end" }}>
      <div style={{
        background:"rgba(255,255,255,0.08)",
        backdropFilter:"blur(16px)",
        border:"0.5px solid rgba(255,255,255,0.10)",
        borderRadius:"18px 18px 5px 18px",
        padding:"10px 16px",
        maxWidth:"70%",
        color:"rgba(255,255,255,0.90)",
        fontSize:14, lineHeight:1.6,
        fontFamily:"'Inter',sans-serif",
      }}>
        {content}
      </div>
    </div>
  );
}

function AssistantBubble({ content, streaming, error }) {
  return (
    <div style={{ display:"flex", justifyContent:"flex-start" }}>
      <div style={{
        maxWidth:"85%",
        color: error ? "rgba(255,100,100,0.85)" : "rgba(255,255,255,0.85)",
        fontSize:14.5, lineHeight:1.72,
        fontFamily:"'Inter',sans-serif",
        whiteSpace:"pre-wrap",
        wordBreak:"break-word",
      }}>
        {content || (streaming ? "" : "…")}
        {streaming && <TypingCursor />}
      </div>
    </div>
  );
}

export default function MessageList({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth", block:"end" });
  }, [messages]);

  if (!messages.length) return null;

  return (
    <div style={{
      flex:1, overflowY:"auto", padding:"24px 16px 8px",
      display:"flex", flexDirection:"column", gap:22,
      maxWidth:780, width:"100%", margin:"0 auto",
      boxSizing:"border-box", scrollbarWidth:"none",
    }}>
      {messages.map((msg) =>
        msg.role === "user"
          ? <UserBubble key={msg.id} content={msg.content} />
          : <AssistantBubble key={msg.id} content={msg.content} streaming={msg.streaming} error={msg.error} />
      )}
      <div ref={bottomRef} style={{ height:1 }} />
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        div::-webkit-scrollbar { display:none; }
      `}</style>
    </div>
  );
}
