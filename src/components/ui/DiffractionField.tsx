import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  rotSpeed: number;
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
    
    // Cap DPR to 1.5 on mobile/tablets to drastically reduce rendering area, max 2.0 on desktop
    const isMobileDevice = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobileDevice ? 1.5 : 2.0);

    const particles: Particle[] = [];
    
    // Dynamically adjust particle count and link distance based on screen size
    let count = isMobileDevice ? 16 : 46;
    let linkDist = isMobileDevice ? 90 : 150;
    let linkDistSq = linkDist * linkDist;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      
      const newIsMobile = w < 768;
      count = newIsMobile ? 16 : 46;
      linkDist = newIsMobile ? 90 : 150;
      linkDistSq = linkDist * linkDist;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Adjust particle list length on window resize
      if (particles.length > count) {
        particles.length = count;
      } else {
        while (particles.length < count) {
          const isRotating = Math.random() > 0.35;
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.12,
            vy: (Math.random() - 0.5) * 0.12,
            size: 3 + Math.random() * 6,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: isRotating ? (Math.random() - 0.5) * 0.012 : 0,
          });
        }
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const drawSpike = (x: number, y: number, s: number, angle: number) => {
      const arm = s * 0.14;
      ctx.save();
      ctx.translate(x, y);
      if (angle !== 0) {
        ctx.rotate(angle);
      }
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(arm, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-arm, 0);
      ctx.closePath();
      ctx.moveTo(-s, 0);
      ctx.lineTo(0, -arm);
      ctx.lineTo(s, 0);
      ctx.lineTo(0, arm);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.rotSpeed !== 0) {
          p.angle += p.rotSpeed;
        }
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }

      // Hot loop optimized to avoid Math.sqrt unless particles are within threshold
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < linkDistSq) {
            const dist = Math.sqrt(distSq);
            ctx.strokeStyle = `rgba(0,0,0,${(1 - dist / linkDist) * 0.15})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        drawSpike(p.x, p.y, p.size, p.angle);
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
