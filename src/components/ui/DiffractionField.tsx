import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export const DiffractionField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let w = 0;
    let h = 0;
    const dpr = window.devicePixelRatio || 1;

    const particles: Particle[] = [];
    const COUNT = 46;
    const LINK_DIST = 150;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-init particles if empty
      if (particles.length === 0) {
        for (let i = 0; i < COUNT; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.12,
            vy: (Math.random() - 0.5) * 0.12,
            size: 3 + Math.random() * 6
          });
        }
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const drawSpike = (x: number, y: number, s: number) => {
      const arm = s * 0.14;
      ctx.beginPath();
      ctx.moveTo(x, y - s);
      ctx.lineTo(x + arm, y);
      ctx.lineTo(x, y + s);
      ctx.lineTo(x - arm, y);
      ctx.closePath();
      ctx.moveTo(x - s, y);
      ctx.lineTo(x, y - arm);
      ctx.lineTo(x + s, y);
      ctx.lineTo(x, y + arm);
      ctx.closePath();
      ctx.fill();
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = `rgba(0,0,0,${(1 - dist / LINK_DIST) * 0.15})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      for (const p of particles) {
        drawSpike(p.x, p.y, p.size);
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 block w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
};
