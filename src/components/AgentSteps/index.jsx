import { useState } from "react";

/* ── Spinner ── */
const SpinI = () => (
  <span className="inline-block w-3 h-3 rounded-full border-2 flex-shrink-0"
    style={{ borderColor:"#2a2a3a", borderTopColor:"#e8301f", animation:"spin .6s linear infinite" }}/>
);
const ChevI = ({ open }) => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
    strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(90deg)" : "rotate(0)", transition:"transform .15s", flexShrink:0 }}>
    <path d="M9 6l6 6-6 6"/>
  </svg>
);
const CheckI = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);
const WarnI = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
  </svg>
);

/* ── What is the agent currently doing? Human-readable summary ── */
function summarizeStep(step) {
  const l = (step.label || "").toLowerCase();
  if (step.type === "plan")        return "Planning task breakdown…";
  if (step.type === "file_failed") return `Failed: ${step.label}`;
  if (step.type === "project_complete") return "Project ready";
  if (l.includes("search") || l.includes("web") || l.includes("browse")) return "Searching the web…";
  if (l.includes("compil") || l.includes("check") || l.includes("test")) return "Running checks…";
  if (l.includes("edit") || l.includes("file") || l.includes("write") || l.includes("generat")) return "Writing files…";
  if (l.includes("fix"))    return "Auto-fixing issues…";
  if (l.includes("validat")) return "Validating output…";
  if (l.includes("think") || l.includes("analys")) return "Thinking…";
  if (step.label) return step.label;
  return "Processing…";
}

/* ── Pulsing "Thinking…" before first token ── */
export function ThinkingIndicator({ label = "Thinking…" }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="flex gap-1">
        {[0,1,2].map(i => (
          <span key={i} className="w-1.5 h-1.5 rounded-full"
            style={{ background:"#4a4a6a", animation:`pulse3 1.2s ease-in-out ${i*0.22}s infinite` }}/>
        ))}
      </div>
      <span className="text-xs" style={{ color:"#6a6a8a" }}>{label}</span>
      <style>{`@keyframes pulse3{0%,100%{opacity:.2}50%{opacity:.9}}`}</style>
    </div>
  );
}

/* ── Main export ── */
export default function AgentSteps({ steps, streaming, hasTokens, mode }) {
  const [expanded, setExpanded] = useState(false);

  // Fast mode → never show steps (they're just noise for quick replies)
  if (mode === "fast" || mode === "auto" || !mode) {
    return null;
  }

  // No steps yet but streaming → show thinking indicator
  if ((!steps || steps.length === 0) && streaming && !hasTokens) {
    const label = mode === "agent" ? "Rubra Agent working…" : "Thinking…";
    return <ThinkingIndicator label={label}/>;
  }

  if (!steps || steps.length === 0) return null;

  const allDone    = steps.every(s => s.done);
  const hasFailed  = steps.some(s => s.failed);
  const planStep   = steps.find(s => s.type === "plan");
  const lastActive = [...steps].reverse().find(s => !s.done) || steps[steps.length - 1];

  // Current activity label (shown inline while streaming)
  const currentLabel = streaming && !allDone && lastActive
    ? summarizeStep(lastActive)
    : null;

  // Collapsed summary
  const summary = planStep
    ? `${planStep.subTasks?.length || 0} sub-tasks`
    : hasFailed
      ? `${steps.filter(s=>s.done&&!s.failed).length} done · ${steps.filter(s=>s.failed).length} failed`
      : `${steps.filter(s=>s.done).length}/${steps.length} steps`;

  return (
    <div className="mb-3">
      {/* ── Inline activity while streaming ── */}
      {currentLabel && (
        <div className="flex items-center gap-2 mb-1.5">
          <SpinI/>
          <span className="text-xs" style={{ color:"#7070a0" }}>{currentLabel}</span>
        </div>
      )}

      {/* ── Collapsible summary row ── */}
      <button onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-1.5 text-xs select-none"
        style={{ color: hasFailed ? "#f87171" : "#4a4a6a" }}
        onMouseEnter={e => e.currentTarget.style.color = hasFailed ? "#fca5a5" : "#7070a0"}
        onMouseLeave={e => e.currentTarget.style.color = hasFailed ? "#f87171" : "#4a4a6a"}>
        <ChevI open={expanded}/>
        <span>{summary}</span>
        {hasFailed && (
          <span className="px-1.5 py-0.5 rounded text-[10px]"
            style={{ background:"rgba(248,113,113,0.12)", color:"#f87171" }}>
            {steps.filter(s=>s.failed).length} failed
          </span>
        )}
        {streaming && !allDone && !currentLabel && <SpinI/>}
      </button>

      {/* ── Expanded step list ── */}
      {expanded && (
        <div className="mt-2 pl-1 flex flex-col gap-1.5 border-l" style={{ borderColor:"#1e1e2e", marginLeft:5 }}>
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col gap-1 pl-3">
              <div className="flex items-center gap-2 text-xs" style={{ color: s.failed ? "#f87171" : "#8080a0" }}>
                <span className="flex-shrink-0">
                  {s.failed ? <WarnI/> : s.done ? <CheckI/> : (streaming ? <SpinI/> : <span className="w-1.5 h-1.5 rounded-full inline-block" style={{background:"#3a3a55"}}/>)}
                </span>
                <span className="flex-1 truncate">{summarizeStep(s)}</span>
                {/* file badges */}
                {s.files?.map((f,j) => (
                  <span key={j} className="font-mono text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ background:"#0d0d14", color:"#6a6a8a", border:"1px solid #1e1e2e" }}>
                    {f.name}
                    {f.added>0 && <span style={{color:"#22c55e"}}> +{f.added}</span>}
                    {f.removed>0 && <span style={{color:"#f87171"}}> -{f.removed}</span>}
                  </span>
                ))}
              </div>
              {/* sub-tasks for plan step */}
              {s.type === "plan" && s.subTasks?.map((t,j) => (
                <div key={j} className="flex items-center gap-2 text-[11px] pl-5" style={{ color:"#5a5a7a" }}>
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{background:"#2a2a3a"}}/>
                  <span className="truncate">{t.desc || t.description || `Task ${j+1}`}</span>
                  {t.agent && <span className="text-[10px] px-1 rounded" style={{background:"#1a1a2a",color:"#4a4a6a"}}>{t.agent}</span>}
                </div>
              ))}
              {/* terminal output */}
              {s.output && (
                <pre className="mt-1 px-2.5 py-1.5 rounded text-[10px] font-mono overflow-x-auto"
                  style={{ background:"#060e06", color:"#86efac", border:"1px solid #1a2a1a", maxHeight:60 }}>
                  {s.output.split("\n").slice(0,4).join("\n")}
                </pre>
              )}
              {s.error && (
                <div className="mt-0.5 text-[10px] px-2 py-1 rounded" style={{background:"#1a0808",color:"#f87171",border:"1px solid #3a0808"}}>
                  {s.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
