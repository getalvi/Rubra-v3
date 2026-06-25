import { useState } from "react";

const I = ({ d, s=13, sw=1.8, col="currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const ChevI = ({ open }) => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition:"transform .15s", flexShrink:0 }}>
    <path d="M9 6l6 6-6 6"/>
  </svg>
);
const SpinI  = () => <span className="w-3 h-3 rounded-full border-2 flex-shrink-0 inline-block" style={{ borderColor:"#2a2a3a", borderTopColor:"#e8301f", animation:"spin .6s linear infinite" }}/>;
const CheckI = () => <I d="M20 6L9 17l-5-5" col="#22c55e" sw={2.5}/>;
const XIcon  = () => <I d="M18 6L6 18M6 6l12 12" col="#f87171" sw={2.5}/>;

function stepMeta(type, label="") {
  const l = label.toLowerCase();
  if (type === "plan")        return { col:"#a78bfa", bg:"#1a1628" };
  if (type === "file_failed") return { col:"#f87171", bg:"#1a0808" };
  if (l.includes("edit") || l.includes("file") || l.includes("creat") || type === "tool_result")
                              return { col:"#60a5fa", bg:"#0d1626" };
  if (l.includes("terminal") || l.includes("script") || l.includes("compile") || l.includes("run") || l.includes("command"))
                              return { col:"#34d399", bg:"#0a1a12" };
  if (l.includes("search") || l.includes("web") || l.includes("browse"))
                              return { col:"#fbbf24", bg:"#1a1608" };
  return                             { col:"#6060a0", bg:"#111118" };
}

function FileBadge({ name, added, removed }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono"
      style={{ background:"#0d0d14", border:"1px solid #1e1e2e" }}>
      <span style={{ color:"#8080a0" }}>{name}</span>
      {added   > 0 && <span style={{ color:"#22c55e" }}>+{added}</span>}
      {removed > 0 && <span style={{ color:"#f87171" }}>-{removed}</span>}
    </div>
  );
}

function TerminalBlock({ output }) {
  const [exp, setExp] = useState(false);
  const lines = (output || "").split("\n");
  return (
    <div className="mt-1.5 rounded-lg overflow-hidden" style={{ border:"1px solid #1a2a1a" }}>
      <div className="flex items-center justify-between px-3 py-1.5" style={{ background:"#0a120a" }}>
        <div className="flex items-center gap-1.5">
          {["#ef4444","#f59e0b","#22c55e"].map(c => <span key={c} className="w-2 h-2 rounded-full" style={{ background:c }}/>)}
          <span className="text-[10px] ml-1" style={{ color:"#4a6a4a" }}>Terminal</span>
        </div>
        {lines.length > 4 && (
          <button onClick={() => setExp(v=>!v)} className="text-[10px]" style={{ color:"#4a6a4a" }}>
            {exp ? "collapse" : `${lines.length} lines`}
          </button>
        )}
      </div>
      <pre className="px-3 py-2 text-[11px] font-mono overflow-x-auto"
        style={{ background:"#060e06", color:"#86efac", whiteSpace:"pre-wrap", wordBreak:"break-all",
          maxHeight: exp ? "none" : 80, overflow: exp ? "visible" : "hidden" }}>
        {exp ? output : lines.slice(0,4).join("\n")}
        {!exp && lines.length > 4 && <span style={{ color:"#4a6a4a" }}>{"\n"}…</span>}
      </pre>
    </div>
  );
}

function StepCard({ step, streaming, isLast }) {
  const [open, setOpen] = useState(true);
  const { col, bg } = stepMeta(step.type, step.label);
  const isDone    = step.done && !step.failed;
  const isFailed  = step.failed;
  const isWorking = !step.done && streaming && isLast;
  const hasDetail = step.subTasks?.length > 0 || step.files?.length > 0 || step.output || step.error;

  return (
    <div className="flex gap-2.5 min-w-0">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background:bg, border:`1.5px solid ${col}33` }}>
          {isWorking ? <SpinI/> : isDone ? <CheckI/> : isFailed ? <XIcon/> :
            <span className="w-1.5 h-1.5 rounded-full" style={{ background:col }}/>}
        </div>
        {!isLast && <div className="w-px flex-1 mt-1" style={{ background:"#1e1e2e", minHeight:10 }}/>}
      </div>

      <div className="flex-1 pb-2.5 min-w-0">
        <button onClick={() => hasDetail && setOpen(v=>!v)}
          className="flex items-center gap-1.5 w-full text-left mb-1">
          <span className="text-xs flex-1 truncate" style={{ color: isFailed ? "#f87171" : "#c0c0d8" }}>
            {step.label}
          </span>
          {hasDetail && <ChevI open={open}/>}
        </button>

        {/* file diff badges */}
        {step.files?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {step.files.map((f,i) => <FileBadge key={i} name={f.name} added={f.added} removed={f.removed}/>)}
          </div>
        )}

        {open && (
          <>
            {step.subTasks?.length > 0 && (
              <div className="flex flex-col gap-1 mt-1 pl-2 border-l" style={{ borderColor:"#1e1e2e" }}>
                {step.subTasks.map((t,i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color:"#6a6a8a" }}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background:"#3a3a55" }}/>
                    <span className="flex-1 truncate">{t.desc || t.description || `Task ${i+1}`}</span>
                    {t.agent && <span className="px-1 rounded text-[9px]" style={{ background:"#1a1a2a", color:"#5a5a7a" }}>{t.agent}</span>}
                  </div>
                ))}
              </div>
            )}
            {step.output && <TerminalBlock output={step.output}/>}
            {step.error && (
              <div className="mt-1 text-[11px] px-2 py-1 rounded" style={{ background:"#1a0808", color:"#f87171", border:"1px solid #3a0808" }}>
                {step.error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 px-1 py-1 mb-2">
      <div className="flex gap-1">
        {[0,1,2].map(i => (
          <span key={i} className="w-1.5 h-1.5 rounded-full"
            style={{ background:"#4a4a6a", animation:`pulse3 1.2s ease-in-out ${i*0.22}s infinite` }}/>
        ))}
      </div>
      <span className="text-xs" style={{ color:"#5a5a7a" }}>Thinking…</span>
      <style>{`@keyframes pulse3{0%,100%{opacity:.2}50%{opacity:.9}}`}</style>
    </div>
  );
}

export default function AgentSteps({ steps, streaming, hasTokens }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!steps || steps.length === 0) {
    if (streaming && !hasTokens) return <ThinkingIndicator/>;
    return null;
  }

  const hasFailed = steps.some(s => s.failed);
  const allDone   = steps.every(s => s.done);
  const planStep  = steps.find(s => s.type === "plan");
  const summary   = planStep
    ? `Orchestrated · ${planStep.subTasks?.length || 0} sub-tasks · ${steps.length} steps`
    : hasFailed
      ? `${steps.filter(s=>s.done&&!s.failed).length} done · ${steps.filter(s=>s.failed).length} failed`
      : `${steps.length} step${steps.length!==1?"s":""}`;

  return (
    <div className="mb-4">
      <button onClick={() => setCollapsed(v=>!v)}
        className="flex items-center gap-1.5 mb-2 text-xs"
        style={{ color: hasFailed ? "#f87171" : "#5a5a8a" }}>
        <ChevI open={!collapsed}/>
        {summary}
        {hasFailed && <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background:"rgba(248,113,113,0.12)", color:"#f87171" }}>{steps.filter(s=>s.failed).length} failed</span>}
        {streaming && !allDone && <SpinI/>}
      </button>

      {!collapsed && (
        <div className="pl-1">
          {steps.map((step, i) => (
            <StepCard key={i} step={step} streaming={streaming} isLast={i===steps.length-1}/>
          ))}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
