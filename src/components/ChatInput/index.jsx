import { useState, useRef } from "react";

const SendI = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const AttI = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);

const PILLS = ["Code </>", "Write", "Research", "Learn", "News"];

export default function ChatInput({ onSend, disabled }) {
  const [val, setVal] = useState("");
  const ref = useRef(null);

  const submit = () => {
    const t = val.trim(); if (!t || disabled) return;
    onSend(t); setVal("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const onKey  = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } };
  const onInput = e => {
    setVal(e.target.value);
    const ta = ref.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 140) + "px"; }
  };

  const can = val.trim() && !disabled;

  return (
    <div className="px-4 pb-5 max-w-3xl w-full mx-auto">
      {/* input box */}
      <div className="rounded-xl overflow-hidden"
        style={{ background:"#111118", border:"1px solid #1e1e2e" }}>

        <div className="flex items-start px-3.5 pt-3 pb-1.5 gap-2">
          <textarea
            ref={ref} value={val} onChange={onInput} onKeyDown={onKey}
            disabled={disabled} placeholder="Type something…" rows={1}
            className="flex-1 resize-none outline-none text-sm leading-relaxed bg-transparent"
            style={{ color:"#e8e8f0", caretColor:"#e8301f", minHeight:24, maxHeight:140, opacity: disabled ? 0.5 : 1 }}
          />
          <button onClick={submit} disabled={!can}
            className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center transition-opacity duration-150"
            style={{ background: can ? "#e8301f" : "#1e1e2e", color: can ? "white" : "#3a3a55", opacity: can ? 1 : 0.6, cursor: can ? "pointer" : "default" }}>
            <SendI/>
          </button>
        </div>

        <div className="flex items-center px-3 pb-2.5 gap-1.5">
          <button className="text-[#3a3a55] hover:text-[#6a6a8a] transition-colors" title="Attach">
            <AttI/>
          </button>
          {disabled && (
            <div className="flex items-center gap-0.5 ml-1">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="w-0.5 rounded-full inline-block"
                  style={{ height: 8 + Math.sin(i) * 4, background:"#3a3a55", animation:`barP ${.4+i*.08}s ease-in-out infinite alternate` }}/>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* pills */}
      <div className="flex gap-2 mt-2.5 flex-wrap justify-center">
        {PILLS.map(p => (
          <button key={p} onClick={() => onSend(p)}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-100"
            style={{ background:"#111118", border:"1px solid #1e1e2e", color:"#5a5a7a" }}
            onMouseEnter={e => { e.currentTarget.style.background="#1a1a2a"; e.currentTarget.style.color="#a0a0c0"; }}
            onMouseLeave={e => { e.currentTarget.style.background="#111118"; e.currentTarget.style.color="#5a5a7a"; }}>
            {p}
          </button>
        ))}
      </div>

      <style>{`@keyframes barP { from{transform:scaleY(.4)} to{transform:scaleY(1.4)} }`}</style>
    </div>
  );
}
