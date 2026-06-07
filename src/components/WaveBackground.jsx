import { useEffect, useRef } from "react";

export default function WaveBackground() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let raf, f = 0;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const WAVES = [
      { yr:0.36, amp:0.10, fx:0.00130, ph:0.0, sp:0.0022, r:205,g:32,b:32, a:0.52 },
      { yr:0.44, amp:0.08, fx:0.00170, ph:1.3, sp:0.0016, r:145,g:22,b:88, a:0.42 },
      { yr:0.52, amp:0.09, fx:0.00110, ph:2.5, sp:0.0019, r:65, g:28,b:175,a:0.48 },
      { yr:0.60, amp:0.07, fx:0.00195, ph:0.9, sp:0.0013, r:22, g:85,b:218,a:0.40 },
      { yr:0.68, amp:0.06, fx:0.00155, ph:3.2, sp:0.0011, r:0,  g:175,b:205,a:0.32 },
    ];
    const draw = () => {
      const W = c.width, H = c.height;
      ctx.fillStyle = "#080810"; ctx.fillRect(0,0,W,H);
      [[0.13,0.42,0.48,"rgba(160,26,18,0.18)"],[0.88,0.58,0.52,"rgba(14,68,205,0.16)"],[1.02,0.68,0.32,"rgba(0,205,195,0.10)"]]
        .forEach(([cx,cy,r,col])=>{
          const g=ctx.createRadialGradient(W*cx,H*cy,0,W*cx,H*cy,W*r);
          g.addColorStop(0,col); g.addColorStop(1,"rgba(0,0,0,0)");
          ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
        });
      WAVES.forEach(w=>{
        const bY=H*w.yr, aP=H*w.amp, ph=f*w.sp+w.ph;
        ctx.beginPath();
        for(let x=0;x<=W+4;x+=3){
          const y=bY+Math.sin(x*w.fx+ph)*aP+Math.sin(x*w.fx*1.55+ph*0.72)*aP*0.32+Math.sin(x*w.fx*0.48+ph*1.28)*aP*0.18;
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
        const gr=ctx.createLinearGradient(0,bY-aP,0,bY+aP*2.8);
        gr.addColorStop(0,`rgba(${w.r},${w.g},${w.b},${w.a})`);
        gr.addColorStop(0.55,`rgba(${w.r},${w.g},${w.b},${w.a*0.38})`);
        gr.addColorStop(1,`rgba(${w.r},${w.g},${w.b},0)`);
        ctx.fillStyle=gr; ctx.fill();
      });
      f++; raf=requestAnimationFrame(draw);
    };
    draw();
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,width:"100%",height:"100%",zIndex:0,pointerEvents:"none"}}/>;
}
