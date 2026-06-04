import { useEffect, useRef } from "react";

export default function WaveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Wave config — matches the red→purple→blue gradient in the PDF
    const waves = [
      { amp: 0.13, freq: 0.0018, speed: 0.008, yBase: 0.42, r: 200, g: 30, b: 30, a: 0.55 },
      { amp: 0.10, freq: 0.0022, speed: 0.011, yBase: 0.50, r: 140, g: 20, b: 80, a: 0.40 },
      { amp: 0.12, freq: 0.0015, speed: 0.007, yBase: 0.58, r: 60,  g: 20, b: 160, a: 0.45 },
      { amp: 0.09, freq: 0.0025, speed: 0.013, yBase: 0.65, r: 20,  g: 80, b: 220, a: 0.35 },
      { amp: 0.08, freq: 0.0020, speed: 0.009, yBase: 0.72, r: 0,   g: 180, b: 200, a: 0.30 },
    ];

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;

      // Deep dark background
      ctx.fillStyle = "#05050a";
      ctx.fillRect(0, 0, W, H);

      // Subtle red radial glow (top-left area like the PDF)
      const glow = ctx.createRadialGradient(W * 0.15, H * 0.35, 0, W * 0.15, H * 0.35, W * 0.45);
      glow.addColorStop(0, "rgba(180, 30, 20, 0.18)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // Blue glow (right side)
      const glowB = ctx.createRadialGradient(W * 0.85, H * 0.55, 0, W * 0.85, H * 0.55, W * 0.5);
      glowB.addColorStop(0, "rgba(20, 80, 220, 0.15)");
      glowB.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glowB;
      ctx.fillRect(0, 0, W, H);

      // Draw each wave
      waves.forEach((w, i) => {
        ctx.beginPath();
        const baseY = H * w.yBase;
        const ampPx = H * w.amp;

        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 3) {
          const y =
            baseY +
            Math.sin(x * w.freq + t * w.speed * 60 + i * 1.2) * ampPx +
            Math.sin(x * w.freq * 1.7 + t * w.speed * 40 + i * 0.8) * ampPx * 0.4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, baseY - ampPx, 0, baseY + ampPx * 2);
        grad.addColorStop(0, `rgba(${w.r},${w.g},${w.b},${w.a})`);
        grad.addColorStop(1, `rgba(${w.r},${w.g},${w.b},0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      t += 1;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
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
