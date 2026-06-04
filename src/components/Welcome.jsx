export default function Welcome({ isMobile }) {
  return (
    <div style={{
      flex:1, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      textAlign:"center", padding:"0 24px",
      userSelect:"none",
    }}>
      <h1 style={{
        fontFamily:"'Syne',sans-serif",
        fontSize: isMobile ? "clamp(24px,7.5vw,38px)" : "clamp(30px,3.8vw,52px)",
        fontWeight:800,
        color:"white",
        lineHeight:1.18,
        margin:0,
        letterSpacing:"-0.015em",
        display:"flex", alignItems:"center", flexWrap:"wrap", justifyContent:"center", gap:"0.25em",
      }}>
        {/* Red dot + "How" */}
        <span style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
          <span style={{
            display:"inline-block",
            width: isMobile ? 18 : 24,
            height: isMobile ? 18 : 24,
            borderRadius:"50%",
            background:"radial-gradient(circle at 38% 36%, #ff5a48, #c0392b)",
            boxShadow:"0 0 14px rgba(192,57,43,0.65)",
            flexShrink:0,
          }}/>
          <span style={{ color:"#e74c3c" }}>How</span>
        </span>
        <span>Can I assist you today?</span>
      </h1>
    </div>
  );
}
