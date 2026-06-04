import { useState, useRef } from "react";

const SendIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13" stroke="rgba(255,255,255,0.9)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="rgba(255,255,255,0.9)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const MicIcon = () => (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="none">
    <rect x="9" y="2" width="6" height="11" rx="3" stroke="rgba(255,255,255,0.6)" strokeWidth={1.6}/>
    <path d="M5 10c0 3.87 3.13 7 7 7s7-3.13 7-7" stroke="rgba(255,255,255,0.6)" strokeWidth={1.6} strokeLinecap="round"/>
    <line x1="12" y1="17" x2="12" y2="21" stroke="rgba(255,255,255,0.6)" strokeWidth={1.6} strokeLinecap="round"/>
  </svg>
);
const AttachIcon = () => (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="none">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="rgba(255,255,255,0.55)" strokeWidth={1.6} strokeLinecap="round"/>
  </svg>
);

const WaveBars = ({ active }) => (
  <svg width={30} height={18} viewBox="0 0 30 18">
    {[3,6,4,8,5,9,6,8,4,6,3].map((h,i)=>(
      <rect key={i} x={i*2.6+0.5} y={(18-h)/2} width={1.8} height={h} rx={0.9}
        fill={`rgba(255,255,255,${active?0.7:0.3})`}
        style={active ? { animation: `barPulse ${0.5+i*0.08}s ease-in-out infinite alternate` } : {}}
      />
    ))}
  </svg>
);

const PILLS = ["Code </>", "Write", "Research", "Learn", "News"];

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  const submit = () => {
    const t = value.trim();
    if (!t || disabled) return;
    onSend(t);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const onInput = (e) => {
    setValue(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 150) + "px"; }
  };

  return (
    <div style={{ padding:"0 16px 22px", maxWidth:780, width:"100%", margin:"0 auto", boxSizing:"border-box" }}>
      {/* Glass box */}
      <div style={{
        background:"rgba(255,255,255,0.065)",
        backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)",
        border:"0.5px solid rgba(255,255,255,0.12)",
        borderRadius:18,
        boxShadow:"0 8px 40px rgba(0,0,0,0.45), inset 0 0.5px 0 rgba(255,255,255,0.08)",
        overflow:"hidden",
      }}>
        {/* Input row */}
        <div style={{ display:"flex", alignItems:"flex-start", padding:"14px 14px 6px" }}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={onInput}
            onKeyDown={onKey}
            disabled={disabled}
            placeholder="Type Something here |"
            rows={1}
            style={{
              flex:1, background:"transparent", border:"none", outline:"none",
              color:"rgba(255,255,255,0.88)", fontSize:14.5, fontFamily:"'Inter',sans-serif",
              resize:"none", lineHeight:1.55, minHeight:24, maxHeight:150, overflowY:"auto",
              caretColor:"white", opacity: disabled ? 0.5 : 1,
            }}
          />
          <button
            onClick={submit}
            disabled={disabled || !value.trim()}
            style={{
              marginLeft:10, marginTop:2, background:"transparent", border:"none",
              cursor: disabled || !value.trim() ? "default" : "pointer",
              padding:"3px 5px", borderRadius:8, display:"flex", alignItems:"center",
              opacity: disabled || !value.trim() ? 0.35 : 1,
              transition:"opacity 0.2s",
            }}
          >
            <SendIcon />
          </button>
        </div>

        {/* Bottom controls */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"4px 14px 12px" }}>
          <button style={ghostBtn} title="Attach file">
            <AttachIcon />
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button style={ghostBtn} title="Voice input"><MicIcon /></button>
            <WaveBars active={disabled} />
          </div>
        </div>
      </div>

      {/* Action pills */}
      <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap", justifyContent:"center" }}>
        {PILLS.map((label) => (
          <button
            key={label}
            onClick={() => onSend(label)}
            style={{
              padding:"7px 18px",
              background:"rgba(255,255,255,0.07)",
              backdropFilter:"blur(12px)",
              border:"0.5px solid rgba(255,255,255,0.11)",
              borderRadius:20,
              color:"rgba(255,255,255,0.70)",
              fontSize:13, fontWeight:500, fontFamily:"'Inter',sans-serif",
              cursor:"pointer", whiteSpace:"nowrap",
              transition:"background 0.18s, color 0.18s",
            }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.13)"; e.currentTarget.style.color="white"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.color="rgba(255,255,255,0.70)"; }}
          >
            {label}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes barPulse {
          from { transform: scaleY(0.5); }
          to   { transform: scaleY(1.4); }
        }
      `}</style>
    </div>
  );
}

const ghostBtn = {
  background:"transparent", border:"none", cursor:"pointer",
  padding:5, display:"flex", alignItems:"center", justifyContent:"center",
};
