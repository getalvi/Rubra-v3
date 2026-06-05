import { useState, useRef } from "react";

/* Icons */
const SendI = () => (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13" stroke="rgba(255,255,255,0.9)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="rgba(255,255,255,0.9)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const MicI = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <rect x="9" y="2" width="6" height="11" rx="3" stroke="rgba(255,255,255,0.55)" strokeWidth={1.6}/>
    <path d="M5 10c0 3.87 3.13 7 7 7s7-3.13 7-7" stroke="rgba(255,255,255,0.55)" strokeWidth={1.6} strokeLinecap="round"/>
    <line x1="12" y1="17" x2="12" y2="21" stroke="rgba(255,255,255,0.55)" strokeWidth={1.6} strokeLinecap="round"/>
  </svg>
);
const AttachI = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="rgba(255,255,255,0.48)" strokeWidth={1.6} strokeLinecap="round"/>
  </svg>
);

const Bars = ({ active }) => (
  <svg width={28} height={16} viewBox="0 0 28 16">
    {[3,5,4,7,5,8,6,7,4,5,3].map((h,i)=>(
      <rect key={i} x={i*2.5+0.4} y={(16-h)/2} width={1.7} height={h} rx={0.85}
        fill={`rgba(255,255,255,${active?0.65:0.28})`}
        style={active?{animation:`barPulse ${0.45+i*0.07}s ease-in-out infinite alternate`,transformOrigin:"center"}:{}}
      />
    ))}
  </svg>
);

const PILLS = ["Code </>","Write","Research","Learn","News"];

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const ref = useRef(null);

  const submit = () => {
    const t = value.trim();
    if (!t || disabled) return;
    onSend(t); setValue("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const onKey = e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); submit(); } };

  const onInput = e => {
    setValue(e.target.value);
    const ta = ref.current;
    if (ta) { ta.style.height="auto"; ta.style.height=Math.min(ta.scrollHeight,148)+"px"; }
  };

  const canSend = value.trim() && !disabled;

  return (
    <div style={{ padding:"0 16px 22px", maxWidth:780, width:"100%", margin:"0 auto", boxSizing:"border-box" }}>
      {/* Glass input */}
      <div style={{
        background:"rgba(255,255,255,0.055)",
        backdropFilter:"var(--blur)", WebkitBackdropFilter:"var(--blur)",
        border:"0.5px solid rgba(255,255,255,0.11)",
        borderRadius:"var(--radius-lg)",
        boxShadow:"0 8px 40px rgba(0,0,0,0.4), inset 0 0.5px 0 rgba(255,255,255,0.07)",
        transition:"border-color 0.2s",
      }}
      onFocusCapture={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.20)"}
      onBlurCapture={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.11)"}
      >
        {/* Textarea row */}
        <div style={{ display:"flex", alignItems:"flex-start", padding:"13px 13px 5px" }}>
          <textarea
            ref={ref} value={value} onChange={onInput} onKeyDown={onKey}
            disabled={disabled}
            placeholder="Type Something here |"
            rows={1}
            style={{
              flex:1, background:"transparent", border:"none", outline:"none",
              color:"var(--text-primary)", fontSize:14.5, fontFamily:"'DM Sans',sans-serif",
              resize:"none", lineHeight:1.55, minHeight:24, maxHeight:148,
              overflowY:"auto", caretColor:"white",
              opacity: disabled ? 0.5 : 1,
            }}
          />
          <button
            onClick={submit} disabled={!canSend}
            style={{
              marginLeft:10, marginTop:2, background:"transparent", border:"none",
              cursor: canSend ? "pointer" : "default", padding:"3px 4px",
              borderRadius:8, display:"flex", alignItems:"center",
              opacity: canSend ? 1 : 0.28,
              transition:"opacity 0.2s, transform 0.15s",
            }}
            onMouseEnter={e=>{ if(canSend) e.currentTarget.style.transform="scale(1.08)"; }}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
          >
            <SendI />
          </button>
        </div>

        {/* Bottom row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"4px 13px 11px" }}>
          <button style={ghost} title="Attach"><AttachI /></button>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button style={ghost} title="Voice"><MicI /></button>
            <Bars active={disabled} />
          </div>
        </div>
      </div>

      {/* Pills */}
      <div style={{ display:"flex", gap:7, marginTop:11, flexWrap:"wrap", justifyContent:"center" }}>
        {PILLS.map(label => (
          <button
            key={label}
            onClick={() => { onSend(label); }}
            style={{
              padding:"7px 17px",
              background:"rgba(255,255,255,0.065)",
              backdropFilter:"blur(12px)",
              border:"0.5px solid var(--border)",
              borderRadius:20,
              color:"var(--text-muted)",
              fontSize:13, fontWeight:500, fontFamily:"inherit",
              cursor:"pointer", whiteSpace:"nowrap",
              transition:"background 0.18s, color 0.18s",
            }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.12)";e.currentTarget.style.color="white";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.065)";e.currentTarget.style.color="var(--text-muted)";}}
          >{label}</button>
        ))}
      </div>

      <style>{`
        @keyframes barPulse { from{transform:scaleY(0.4)} to{transform:scaleY(1.3)} }
      `}</style>
    </div>
  );
}

const ghost = {
  background:"transparent", border:"none", cursor:"pointer",
  padding:5, display:"flex", alignItems:"center", justifyContent:"center",
};
