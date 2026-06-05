export default function Welcome({ isMobile }) {
  const fs = isMobile ? "clamp(26px,8.5vw,40px)" : "clamp(32px,3.5vw,52px)";

  return (
    <div style={{
      flex:1, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      textAlign:"center", padding:"0 24px",
      userSelect:"none", position:"relative", zIndex:1,
    }}>
      {isMobile ? (
        /* Mobile: stacked layout matching screenshot */
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:6 }}>
            <span style={{
              width:20, height:20, borderRadius:"50%", display:"inline-block", flexShrink:0,
              background:"radial-gradient(circle at 38% 36%,#ff5540,#c0392b)",
              boxShadow:"0 0 16px rgba(192,57,43,0.65)",
            }}/>
            <span style={{
              fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:fs,
              color:"var(--accent)", letterSpacing:"-0.01em",
            }}>How</span>
          </div>
          <h1 style={{
            fontFamily:"'Syne',sans-serif", fontWeight:800,
            fontSize:fs, color:"white", lineHeight:1.15, margin:0,
            letterSpacing:"-0.015em",
          }}>Can I assist<br/>you today?</h1>
        </div>
      ) : (
        /* Desktop: single row */
        <h1 style={{
          fontFamily:"'Syne',sans-serif", fontWeight:800,
          fontSize:fs, color:"white", lineHeight:1.15, margin:0,
          letterSpacing:"-0.02em",
          display:"flex", alignItems:"center", gap:"0.25em",
          flexWrap:"wrap", justifyContent:"center",
        }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <span style={{
              width:26, height:26, borderRadius:"50%", display:"inline-block",
              background:"radial-gradient(circle at 38% 36%,#ff5540,#c0392b)",
              boxShadow:"0 0 18px rgba(192,57,43,0.62)",
            }}/>
            <span style={{ color:"var(--accent)" }}>How</span>
          </span>
          <span>Can I assist you today?</span>
        </h1>
      )}

      <p style={{
        fontSize:isMobile ? 13 : 14.5,
        color:"var(--text-dim)",
        marginTop:18, lineHeight:1.65,
        maxWidth:400, fontWeight:400,
      }}>
        Your Bangladeshi AI — Code, Write, Research, Learn &amp; more.
      </p>
    </div>
  );
}
