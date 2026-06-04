export default function Welcome({ isMobile }) {
  return (
    <div style={{
      flex:1, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      textAlign:"center", padding:"0 28px",
      userSelect:"none", position:"relative", zIndex:1,
    }}>
      {/* Big headline */}
      <div style={{ marginBottom: isMobile ? 8 : 12 }}>
        {isMobile ? (
          // Mobile: stacked like the screenshot
          <>
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              marginBottom:8,
            }}>
              <span style={{
                width:20, height:20, borderRadius:"50%", display:"inline-block", flexShrink:0,
                background:"radial-gradient(circle at 38% 36%,#ff5a48,#c0392b)",
                boxShadow:"0 0 14px rgba(192,57,43,0.7)",
              }}/>
              <span style={{
                fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(26px,9vw,40px)",
                color:"#e74c3c", letterSpacing:"-0.01em",
              }}>How</span>
            </div>
            <h1 style={{
              fontFamily:"'Syne',sans-serif", fontWeight:800,
              fontSize:"clamp(28px,9vw,42px)",
              color:"white", lineHeight:1.15, margin:0,
              letterSpacing:"-0.015em",
            }}>
              Can I assist<br/>you today?
            </h1>
          </>
        ) : (
          // Desktop: single line
          <h1 style={{
            fontFamily:"'Syne',sans-serif", fontWeight:800,
            fontSize:"clamp(34px,3.6vw,56px)",
            color:"white", lineHeight:1.18, margin:0,
            letterSpacing:"-0.02em",
            display:"flex", alignItems:"center", gap:"0.22em", flexWrap:"wrap", justifyContent:"center",
          }}>
            <span style={{ display:"inline-flex", alignItems:"center", gap:10 }}>
              <span style={{
                width:26, height:26, borderRadius:"50%", display:"inline-block", flexShrink:0,
                background:"radial-gradient(circle at 38% 36%,#ff5a48,#c0392b)",
                boxShadow:"0 0 16px rgba(192,57,43,0.65)",
              }}/>
              <span style={{ color:"#e74c3c" }}>How</span>
            </span>
            <span>Can I assist you today?</span>
          </h1>
        )}
      </div>

      {/* Subtle tagline */}
      <p style={{
        fontSize: isMobile ? 13 : 14.5,
        color:"rgba(255,255,255,0.35)",
        marginTop: isMobile ? 14 : 18,
        fontWeight:400, lineHeight:1.6,
        maxWidth:420,
      }}>
        Your Bangladeshi AI — Code, Write, Research, Learn & more.
      </p>
    </div>
  );
}
