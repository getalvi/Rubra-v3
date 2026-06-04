import { useEffect, useRef } from "react";

export default function WaveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Slow, premium waves — speed values are very low
    const waves = [
      { yRatio: 0.38, amp: 0.11, freqX: 0.0014, phaseOff: 0.0,   speed: 0.0025, r:210, g:35,  b:35,  a:0.55 },
      { yRatio: 0.46, amp: 0.09, freqX: 0.0018, phaseOff: 1.2,   speed: 0.0018, r:150, g:25,  b:90,  a:0.45 },
      { yRatio: 0.54, amp: 0.10, freqX: 0.0012, phaseOff: 2.4,   speed: 0.0020, r:70,  g:30,  b:180, a:0.50 },
      { yRatio: 0.62, amp: 0.08, freqX: 0.0020, phaseOff: 0.8,   speed: 0.0015, r:25,  g:90,  b:220, a:0.42 },
      { yRatio: 0.70, amp: 0.07, freqX: 0.0016, phaseOff: 3.1,   speed: 0.0012, r:0,   g:180, b:210, a:0.35 },
    ];

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;

      // Deep dark base
      ctx.fillStyle = "#060610";
      ctx.fillRect(0, 0, W, H);

      // Ambient glow — red left
      const glowR = ctx.createRadialGradient(W * 0.12, H * 0.40, 0, W * 0.12, H * 0.40, W * 0.50);
      glowR.addColorStop(0, "rgba(160,28,18,0.20)");
      glowR.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glowR;
      ctx.fillRect(0, 0, W, H);

      // Ambient glow — blue right
      const glowB = ctx.createRadialGradient(W * 0.88, H * 0.58, 0, W * 0.88, H * 0.58, W * 0.55);
      glowB.addColorStop(0, "rgba(15,70,210,0.18)");
      glowB.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glowB;
      ctx.fillRect(0, 0, W, H);

      // Cyan accent glow — far right
      const glowC = ctx.createRadialGradient(W * 1.0, H * 0.65, 0, W * 1.0, H * 0.65, W * 0.35);
      glowC.addColorStop(0, "rgba(0,210,200,0.12)");
      glowC.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glowC;
      ctx.fillRect(0, 0, W, H);

      // Draw waves
      waves.forEach((w) => {
        const baseY = H * w.yRatio;
        const ampPx = H * w.amp;
        const phase = frame * w.speed + w.phaseOff;

        ctx.beginPath();
        ctx.moveTo(0, H);

        for (let x = 0; x <= W + 4; x += 4) {
          const nx = x / W;
          const y =
            baseY +
            Math.sin(nx * W * w.freqX + phase) * ampPx +
            Math.sin(nx * W * w.freqX * 1.6 + phase * 0.7) * ampPx * 0.35 +
            Math.sin(nx * W * w.freqX * 0.5 + phase * 1.3) * ampPx * 0.20;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }

        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, baseY - ampPx, 0, baseY + ampPx * 2.5);
        grad.addColorStop(0, `rgba(${w.r},${w.g},${w.b},${w.a})`);
        grad.addColorStop(0.6, `rgba(${w.r},${w.g},${w.b},${w.a * 0.4})`);
        grad.addColorStop(1, `rgba(${w.r},${w.g},${w.b},0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      frame++;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
