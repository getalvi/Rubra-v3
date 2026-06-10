import { useEffect, useRef } from "react";

/* Minimal, low-CPU canvas wave — only 3 layers, slow */
export default function WaveBackground() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let raf, f = 0;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const W = [
      { y:.50, a:.08, f:.0012, p:0,   sp:.0015, r:180,g:28,b:28,  o:.40 },
      { y:.60, a:.07, f:.0016, p:1.2, sp:.0011, r:55, g:20,b:155, o:.36 },
      { y:.68, a:.06, f:.0010, p:2.5, sp:.0013, r:15, g:70,b:200, o:.30 },
    ];

    const draw = () => {
      const W2 = c.width, H = c.height;
      ctx.clearRect(0, 0, W2, H);

      /* solid dark bg */
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, W2, H);

      W.forEach(w => {
        const bY = H * w.y, aP = H * w.a, ph = f * w.sp + w.p;
        ctx.beginPath();
        for (let x = 0; x <= W2 + 4; x += 4) {
          const y = bY + Math.sin(x * w.f + ph) * aP + Math.sin(x * w.f * 1.5 + ph * .65) * aP * .28;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.lineTo(W2, H); ctx.lineTo(0, H); ctx.closePath();
        const g = ctx.createLinearGradient(0, bY - aP, 0, bY + aP * 2.5);
        g.addColorStop(0, `rgba(${w.r},${w.g},${w.b},${w.o})`);
        g.addColorStop(1, `rgba(${w.r},${w.g},${w.b},0)`);
        ctx.fillStyle = g;
        ctx.fill();
      });

      f++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}/>;
}
