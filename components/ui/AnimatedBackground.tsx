"use client";
import React, { useEffect, useRef } from "react";

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    // Particles
    type Particle = {
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; color: string;
    };
    const colors = ["#10b981", "#06b6d4", "#7c3aed", "#3b82f6"];
    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    // Grid dots
    const GRID = 60;
    const gridDots: { x: number; y: number; alpha: number; phase: number }[] = [];
    for (let x = 0; x < W; x += GRID) {
      for (let y = 0; y < H; y += GRID) {
        gridDots.push({ x, y, alpha: Math.random() * 0.15 + 0.03, phase: Math.random() * Math.PI * 2 });
      }
    }

    let t = 0;
    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, W, H);

      // Deep dark gradient background
      const bg = ctx.createRadialGradient(W * 0.3, H * 0.2, 0, W * 0.3, H * 0.2, W * 0.9);
      bg.addColorStop(0, "rgba(10, 5, 30, 1)");
      bg.addColorStop(0.5, "rgba(5, 5, 16, 1)");
      bg.addColorStop(1, "rgba(2, 2, 8, 1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Emerald glow top-left
      const g1 = ctx.createRadialGradient(W * 0.15, H * 0.1, 0, W * 0.15, H * 0.1, W * 0.45);
      g1.addColorStop(0, `rgba(16, 185, 129, ${0.07 + Math.sin(t) * 0.02})`);
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      // Violet glow bottom-right
      const g2 = ctx.createRadialGradient(W * 0.85, H * 0.8, 0, W * 0.85, H * 0.8, W * 0.5);
      g2.addColorStop(0, `rgba(124, 58, 237, ${0.08 + Math.cos(t * 0.7) * 0.02})`);
      g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      // Cyan glow center-top
      const g3 = ctx.createRadialGradient(W * 0.5, -H * 0.1, 0, W * 0.5, -H * 0.1, W * 0.4);
      g3.addColorStop(0, `rgba(6, 182, 212, ${0.05 + Math.sin(t * 1.3) * 0.015})`);
      g3.addColorStop(1, "transparent");
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, W, H);

      // Animated grid dots
      gridDots.forEach((d) => {
        const a = d.alpha * (0.5 + 0.5 * Math.sin(t * 1.2 + d.phase));
        ctx.beginPath();
        ctx.arc(d.x, d.y, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
        ctx.fill();
      });

      // Draw particle connections
      particles.forEach((p, i) => {
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + p.x);
        ctx.fillStyle = p.color + Math.floor(pulse * 180 + 20).toString(16).padStart(2, "0");
        ctx.fill();
      });

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
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
