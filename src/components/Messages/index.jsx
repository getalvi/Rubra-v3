import { useEffect, useRef, useState } from "react";
import { parseSegments, langColor, fmtSize } from "../../utils/parse";

/* ── Icons ── */
const Ico = ({ d, s=14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const CopyI  = ({ ok }) => ok
  ? <Ico d="M20 6L9 17l-5-5"/>
  : <Ico d="M8 17.9H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M10 21h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z"/>;
const EditI  = () => <Ico d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>;
const RetryI = () => <Ico d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/>;
const DownI  = () => <Ico d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>;
const ExpI   = () => <Ico d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>;
const ExplainI = () => <Ico d="M12 18h.01M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 1.7-2.5 3.2M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>;

/* ── Cursor ── */
const Cursor = () => (
  <span className="inline-block w-0.5 ml-0.5 align-text-bottom" style={{ height:"1em", background:"#e8e8f0", animation:"blink .8s step-start infinite" }}/>
);

/* ── Inline text ── */
function Inline({ text }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>{parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**"))
        return <strong key={i} className="font-semibold text-white">{p.slice(2,-2)}</strong>;
      if (p.startsWith("*") && p.endsWith("*"))
        return <em key={i} className="italic">{p.slice(1,-1)}</em>;
      if (p.startsWith("`") && p.endsWith("`"))
        return <code key={i} className="font-mono text-[0.88em] px-1.5 py-0.5 rounded" style={{ background:"#1a1a2a", color:"#c0c8f0" }}>{p.slice(1,-1)}</code>;
      return <span key={i}>{p}</span>;
    })}</>
  );
}

/* ── Text block ── */
function TextBlock({ text }) {
  if (!text?.trim()) return null;
  return (
    <>{text.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-2"/>;
      if (line.startsWith("# "))  return <h1 key={i} className="font-display font-bold text-lg text-white mt-3 mb-1"><Inline text={line.slice(2)}/></h1>;
      if (line.startsWith("## ")) return <h2 key={i} className="font-display font-bold text-base text-white mt-3 mb-1"><Inline text={line.slice(3)}/></h2>;
      if (line.startsWith("### ")) return <h3 key={i} className="font-semibold text-[#c0c0d8] mt-2 mb-1"><Inline text={line.slice(4)}/></h3>;
      if (line.match(/^[-•*] /)) return <div key={i} className="flex gap-2 my-0.5"><span style={{color:"#3a3a55",flexShrink:0,marginTop:3,fontSize:9}}>●</span><span><Inline text={line.slice(2)}/></span></div>;
      if (line.match(/^\d+\. /)) {
        const [n,...r]=line.split(". ");
        return <div key={i} className="flex gap-2 my-0.5"><span className="text-[#3a3a55] flex-shrink-0 min-w-4 font-medium">{n}.</span><span><Inline text={r.join(". ")}/></span></div>;
      }
      if (line.match(/^---+$/)) return <hr key={i} className="my-3 border-[#1e1e2e]"/>;
      if (line.startsWith("> ")) return <blockquote key={i} className="border-l-2 pl-3 my-1 italic" style={{borderColor:"#e8301f",color:"#6a6a8a"}}><Inline text={line.slice(2)}/></blockquote>;
      return <p key={i} className="leading-relaxed my-0.5"><Inline text={line}/></p>;
    })}</>
  );
}

/* ── Code block ── */
function CodeBlock({ seg, onOpenPanel, onExplain }) {
  const [copied, setCopied] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lines = seg.content.split("\n").length;
  const dot   = langColor(seg.lang);

  const copy = () => {
    navigator.clipboard.writeText(seg.content);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const download = () => {
    const ext = {javascript:"js",typescript:"ts",python:"py",html:"html",css:"css",json:"json",bash:"sh",sql:"sql",rust:"rs",go:"go",java:"java",cpp:"cpp",c:"c"}[seg.lang?.toLowerCase()]||"txt";
    const url = URL.createObjectURL(new Blob([seg.content]));
    Object.assign(document.createElement("a"), { href:url, download:`code.${ext}` }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden text-sm" style={{ background:"#0d0d14", border:"1px solid #1e1e2e" }}>
      {/* header */}
      <div className="flex items-center justify-between px-4 py-2" style={{ background:"#111118", borderBottom:"1px solid #1a1a2a" }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background:dot }}/>
          <span className="text-xs font-medium uppercase tracking-widest" style={{ color:"#4a4a6a" }}>{seg.lang||"code"}</span>
          <span className="text-xs" style={{ color:"#2e2e4e" }}>{lines} lines</span>
        </div>
        <div className="flex items-center gap-1">
          {onExplain && (
            <Btn onClick={() => onExplain(seg)} label="Explain"><ExplainI/></Btn>
          )}
          {lines > 25 && (
            <Btn onClick={() => onOpenPanel?.(seg)} label="Panel"><ExpI/></Btn>
          )}
          <Btn onClick={download} label="Download"><DownI/></Btn>
          <Btn onClick={copy} label={copied?"Copied":"Copy"}>
            <span style={{ color: copied ? "#22c55e" : "currentColor" }}><CopyI ok={copied}/></span>
          </Btn>
          <button onClick={() => setHidden(v=>!v)}
            className="text-xs px-2 py-0.5 rounded transition-colors"
            style={{ color:"#3a3a55" }}
            onMouseEnter={e=>e.target.style.color="#6a6a8a"}
            onMouseLeave={e=>e.target.style.color="#3a3a55"}>
            {hidden?"Show":"Hide"}
          </button>
        </div>
      </div>
      {/* code */}
      {!hidden && (
        <div className="flex overflow-x-auto">
          <div className="py-3.5 px-2 flex-shrink-0 select-none" style={{ borderRight:"1px solid #1a1a2a" }}>
            {seg.content.split("\n").map((_,i) => (
              <div key={i} className="font-mono text-xs leading-relaxed text-right" style={{ color:"#2e2e4e", minWidth:32, paddingRight:6, paddingLeft:10, lineHeight:"1.65em" }}>{i+1}</div>
            ))}
          </div>
          <pre className="flex-1 py-3.5 px-4 font-mono text-xs overflow-x-auto leading-relaxed" style={{ color:"#c0c8f0", whiteSpace:"pre" }}>
            <code>{seg.content}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

function Btn({ onClick, label, children }) {
  const [h,setH]=useState(false);
  return (
    <button onClick={onClick} title={label}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
      style={{ background: h?"#1e1e2e":"transparent", color:"#5a5a7a" }}>
      {children}
      {label && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}

/* ── Presentation view ── */
function PresentView({ segs }) {
  const [s, setS] = useState(0);
  const texts = segs.filter(x => x.type==="text" && x.content.trim());
  if (!texts.length) return null;
  return (
    <div className="rounded-xl overflow-hidden my-2" style={{ background:"#111118", border:"1px solid #1e1e2e" }}>
      <div className="px-6 py-5 min-h-36">
        <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color:"#2e2e4e" }}>
          {s+1} / {texts.length}
        </div>
        <div className="text-sm leading-relaxed" style={{ color:"#c0c0d8" }}>
          <TextBlock text={texts[s].content}/>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop:"1px solid #1a1a2a" }}>
        <button onClick={()=>setS(v=>Math.max(0,v-1))} disabled={s===0}
          className="text-xs px-3 py-1.5 rounded-lg transition-colors" style={{ color:s===0?"#2e2e4e":"#6a6a8a", background:"#1a1a2a", border:"1px solid #222238" }}>
          ← Prev
        </button>
        <div className="flex gap-1.5">
          {texts.map((_,i)=><span key={i} onClick={()=>setS(i)} className="w-1.5 h-1.5 rounded-full cursor-pointer" style={{ background:i===s?"#e8301f":"#2e2e4e" }}/>)}
        </div>
        <button onClick={()=>setS(v=>Math.min(texts.length-1,v+1))} disabled={s===texts.length-1}
          className="text-xs px-3 py-1.5 rounded-lg transition-colors" style={{ color:s===texts.length-1?"#2e2e4e":"#6a6a8a", background:"#1a1a2a", border:"1px solid #222238" }}>
          Next →
        </button>
      </div>
    </div>
  );
}

/* ── Edit modal ── */
function EditModal({ content, onSave, onCancel }) {
  const [val, setVal] = useState(content);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-lg rounded-xl p-5" style={{ background:"#111118", border:"1px solid #1e1e2e" }}>
        <h3 className="font-semibold text-sm text-white mb-3">Edit message</h3>
        <textarea value={val} onChange={e=>setVal(e.target.value)} rows={6} autoFocus
          className="w-full px-3.5 py-2.5 text-sm rounded-lg outline-none resize-none"
          style={{ background:"#0d0d14", border:"1px solid #1e1e2e", color:"#e8e8f0" }}/>
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg transition-colors"
            style={{ background:"#1a1a2a", color:"#6a6a8a", border:"1px solid #1e1e2e" }}>
            Cancel
          </button>
          <button onClick={()=>onSave(val)}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white"
            style={{ background:"#e8301f" }}>
            Save &amp; Resend
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Action row ── */
function ActionRow({ msg, onEdit, onRetry, onCopy }) {
  const [cp, setCp] = useState(false);
  const doCopy = () => { navigator.clipboard.writeText(typeof msg.content==="string"?msg.content:""); setCp(true); setTimeout(()=>setCp(false),2000); };
  return (
    <div className="action-row flex gap-1 mt-1.5 opacity-0 transition-opacity">
      {msg.role==="user"      && <Btn onClick={()=>onEdit(msg)} label="Edit"><EditI/></Btn>}
      {msg.role==="assistant" && <Btn onClick={()=>onRetry(msg)} label="Retry"><RetryI/></Btn>}
      <Btn onClick={doCopy} label={cp?"Copied":"Copy"}><span style={{color:cp?"#22c55e":"currentColor"}}><CopyI ok={cp}/></span></Btn>
    </div>
  );
}

/* ── Step icons ── */
const SearchStepI = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const ToolStepI = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.77z"/>
  </svg>
);
const ChevronI = ({ open }) => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition:"transform .15s" }}>
    <path d="M9 6l6 6-6 6"/>
  </svg>
);
const CheckI = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);
const SpinnerI = () => (
  <span className="inline-block w-2.5 h-2.5 rounded-full border-2 flex-shrink-0"
    style={{ borderColor:"#3a3a55", borderTopColor:"#e8301f", animation:"spin .6s linear infinite" }}/>
);

function stepIcon(type, label) {
  const l = (label || "").toLowerCase();
  if (type === "plan") return <PlanStepI/>;
  if (l.includes("search") || l.includes("web") || l.includes("browse")) return <SearchStepI/>;
  return <ToolStepI/>;
}

const PlanStepI = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

/* ── Claude-style collapsible step list (e.g. "Searched the web >") ── */
function StepsList({ steps, streaming }) {
  const [open, setOpen] = useState(false);
  if (!steps || steps.length === 0) return null;

  const allDone = steps.every(s => s.done);
  const planStep = steps.find(s => s.type === "plan");
  const summary = planStep
    ? `Orchestrated · ${planStep.subTasks?.length || 0} sub-tasks · ${steps.length} steps`
    : steps.length === 1
      ? steps[0].label
      : `Ran ${steps.length} steps`;

  return (
    <div className="mb-3">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs transition-colors"
        style={{ color:"#6a6a8a" }}
        onMouseEnter={e => e.currentTarget.style.color = "#9090b0"}
        onMouseLeave={e => e.currentTarget.style.color = "#6a6a8a"}>
        <ChevronI open={open}/>
        <span>{summary}</span>
        {streaming && !allDone && <SpinnerI/>}
      </button>

      {open && (
        <div className="mt-1.5 pl-1 flex flex-col gap-1.5 border-l" style={{ borderColor:"#1e1e2e", marginLeft:5 }}>
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col gap-1.5 pl-3">
              <div className="flex items-center gap-2 text-xs" style={{ color:"#8080a0" }}>
                <span className="flex-shrink-0" style={{ color:"#5a5a7a" }}>{stepIcon(s.type, s.label)}</span>
                <span className="flex-1 truncate">{s.label}</span>
                {s.done ? <CheckI/> : (streaming ? <SpinnerI/> : null)}
              </div>
              {/* Orchestrator plan: show the sub-task breakdown as a mini checklist */}
              {s.type === "plan" && s.subTasks?.length > 0 && (
                <div className="flex flex-col gap-1 pl-5 mt-0.5">
                  {s.subTasks.map((t, ti) => (
                    <div key={t.id || ti} className="flex items-center gap-2 text-[11px]" style={{ color:"#6a6a8a" }}>
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background:"#3a3a55" }}/>
                      <span className="truncate">{t.desc || t.description || `Task ${ti + 1}`}</span>
                      {t.agent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] flex-shrink-0" style={{ background:"#1a1a2a", color:"#5a5a7a" }}>
                          {t.agent}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Message content ── */
function MsgContent({ content, streaming, steps, onOpenPanel, onOpenProject, onExplain }) {
  const [present, setPresent] = useState(false);
  const safe = typeof content === "string" ? content : String(content ?? "");
  const segs  = parseSegments(safe);
  const codeCount = segs.filter(s => s.type === "code").length;
  const hasCode = codeCount > 0;
  return (
    <div className="text-sm leading-relaxed" style={{ color:"#b0b0c8" }}>
      <StepsList steps={steps} streaming={streaming}/>
      {!streaming && hasCode && (
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <button onClick={()=>setPresent(v=>!v)}
            className="text-xs px-2.5 py-1 rounded-lg transition-colors"
            style={{ background: present?"rgba(232,48,31,0.12)":"#111118", border:`1px solid ${present?"rgba(232,48,31,0.3)":"#1e1e2e"}`, color:present?"#e8301f":"#5a5a7a" }}>
            {present ? "Chat view" : "Presentation view"}
          </button>
          {codeCount > 1 && onOpenProject && (
            <button onClick={onOpenProject}
              className="text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5"
              style={{ background:"#111118", border:"1px solid #1e1e2e", color:"#5a5a7a" }}
              onMouseEnter={e=>e.currentTarget.style.color="#a0a0c0"}
              onMouseLeave={e=>e.currentTarget.style.color="#5a5a7a"}>
              📁 View as Project ({codeCount} files)
            </button>
          )}
        </div>
      )}
      {present
        ? <PresentView segs={segs}/>
        : segs.map((s,i) => s.type==="code"
            ? <CodeBlock key={i} seg={s} onOpenPanel={onOpenPanel} onExplain={onExplain}/>
            : <TextBlock key={i} text={s.content}/>
          )
      }
      {streaming && <Cursor/>}
    </div>
  );
}

/* ── Main export ── */
export default function MessageList({ messages, onEditMessage, onRetry, onOpenFilePanel, onOpenProject, onAskFollowUp, isStreaming }) {
  const botRef = useRef(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => { botRef.current?.scrollIntoView({ behavior:"smooth", block:"end" }); }, [messages]);

  const saveEdit = (v) => { onEditMessage?.(editing.id, v); setEditing(null); };
  const isLastMsg = (idx) => idx === messages.length - 1;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-5 max-w-3xl w-full mx-auto" style={{ boxSizing:"border-box" }}>
      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .msg-wrap:hover .action-row{opacity:1}
      `}</style>

      {messages.map((msg, idx) => (
        <div key={msg.id} className="msg-wrap flex flex-col"
          style={{ alignItems: msg.role==="user" ? "flex-end" : "flex-start" }}>

          {msg.role === "user" ? (
            <>
              <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[70%] text-sm leading-relaxed"
                style={{ background:"#1a1a2a", color:"#e8e8f0", border:"1px solid #222238" }}>
                {msg.content}
              </div>
              <ActionRow msg={msg} onEdit={()=>setEditing(msg)} onRetry={onRetry} onCopy={()=>{}}/>
            </>
          ) : (
            <>
              <div className="max-w-[90%] w-full">
                {msg.error && (
                  <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg mb-2"
                    style={{ background:"#1a0a0a", border:"1px solid #7f1d1d", color:"#fca5a5" }}>
                    ⚠ Backend error — check the connection
                  </div>
                )}
                <MsgContent content={msg.content} streaming={msg.streaming} steps={msg.steps}
                  onOpenPanel={seg=>onOpenFilePanel?.({lang:seg.lang,content:seg.content})}
                  onOpenProject={()=>onOpenProject?.(msg)}
                  onExplain={seg=>onAskFollowUp?.(`Explain this ${seg.lang||""} code:\n\n\`\`\`${seg.lang||""}\n${seg.content}\n\`\`\``)}
                />
              </div>
              {!msg.streaming && (
                <div className="flex items-center gap-2 flex-wrap">
                  <ActionRow msg={msg} onEdit={()=>setEditing(msg)} onRetry={()=>onRetry?.(msg)} onCopy={()=>{}}/>
                  {isLastMsg(idx) && !isStreaming && (
                    <button onClick={()=>onAskFollowUp?.("Continue")}
                      className="text-xs px-2.5 py-1 rounded-lg transition-colors opacity-0 action-row"
                      style={{ background:"#111118", border:"1px solid #1e1e2e", color:"#5a5a7a" }}
                      onMouseEnter={e=>e.currentTarget.style.color="#a0a0c0"}
                      onMouseLeave={e=>e.currentTarget.style.color="#5a5a7a"}>
                      Continue →
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ))}

      <div ref={botRef} style={{ height:1 }}/>
      {editing && <EditModal content={editing.content} onSave={saveEdit} onCancel={()=>setEditing(null)}/>}
    </div>
  );
}
