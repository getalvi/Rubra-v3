export default function Welcome({ isMobile, displayName }) {
  const fs = isMobile ? "clamp(28px,8vw,42px)" : "clamp(34px,3.8vw,54px)";
  const greeting = displayName ? `Hey ${displayName.split(" ")[0]},` : null;

  return (
    <div style={{
      flex:1,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      textAlign:"center",padding:"0 24px",
      userSelect:"none",position:"relative",zIndex:1,
    }}>
      {greeting && (
        <p style={{
          fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?15:16,
          color:"var(--text2)",marginBottom:10,fontWeight:400,
          animation:"fadeIn 0.4s var(--ease)",
        }}>{greeting}</p>
      )}

      {isMobile ? (
        <div style={{animation:"fadeUp 0.4s var(--ease)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:6}}>
            <span style={{width:20,height:20,borderRadius:"50%",display:"inline-block",flexShrink:0,background:"radial-gradient(circle at 38% 36%,#ff5540,#c0392b)",boxShadow:"0 0 16px rgba(192,57,43,0.65)"}}/>
            <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:fs,color:"var(--accent2)",letterSpacing:"-0.01em"}}>How</span>
          </div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:fs,color:"white",lineHeight:1.15,margin:0,letterSpacing:"-0.015em"}}>
            Can I assist<br/>you today?
          </h1>
        </div>
      ) : (
        <h1 style={{
          fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:fs,
          color:"white",lineHeight:1.15,margin:0,letterSpacing:"-0.02em",
          display:"flex",alignItems:"center",gap:"0.24em",
          flexWrap:"wrap",justifyContent:"center",
          animation:"fadeUp 0.4s var(--ease)",
        }}>
          <span style={{display:"inline-flex",alignItems:"center",gap:10,flexShrink:0}}>
            <span style={{width:26,height:26,borderRadius:"50%",display:"inline-block",background:"radial-gradient(circle at 38% 36%,#ff5540,#c0392b)",boxShadow:"0 0 18px rgba(192,57,43,0.62)"}}/>
            <span style={{color:"var(--accent2)"}}>How</span>
          </span>
          <span>Can I assist you today?</span>
        </h1>
      )}

      <p style={{
        fontSize:isMobile?13:14.5,color:"var(--text3)",
        marginTop:18,lineHeight:1.65,maxWidth:400,fontWeight:400,
        animation:"fadeIn 0.6s var(--ease)",
      }}>
        Your Bangladeshi AI — Code, Write, Research, Learn &amp; more.
      </p>

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>
    </div>
  );
}
