
import React, { useEffect, useRef } from 'react';

/**
 * LivingBackground — "Bioluminescent Minimalism"
 * 
 * Not glitchy particles. Not a terminal. A living canvas.
 * Slow, liquid platinum light — like moonlight suspended in zero gravity.
 * Cool radial glows that breathe. Organic, architectural, ultra-premium.
 */

interface Orb {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  alpha: number;
  phase: number;       // offset for sin wave
  speed: number;       // how fast it drifts
  drift: number;       // how far it drifts
  hue: number;         // platinum range: 220-240
}

export const LivingBackground: React.FC<{ mode: 'idle' | 'active' | 'calm' }> = ({ mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animFrame: number;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    // ── Create ambient orbs ──────────────────────────────────
    const orbCount = width < 768 ? 4 : 7;
    const orbs: Orb[] = [];

    for (let i = 0; i < orbCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      orbs.push({
        x,
        y,
        baseX: x,
        baseY: y,
        radius: 150 + Math.random() * 300,
        alpha: 0.012 + Math.random() * 0.025,
        phase: Math.random() * Math.PI * 2,
        speed: 0.0002 + Math.random() * 0.0004,
        drift: 40 + Math.random() * 80,
        hue: 220 + Math.random() * 20, // cool platinum range
      });
    }

    // ── Speed multiplier by mode ─────────────────────────────
    const speedFactor = mode === 'active' ? 1.5 : mode === 'calm' ? 0.6 : 1;

    // ── Animation loop ───────────────────────────────────────
    let t = 0;

    const animate = () => {
      t++;
      ctx.clearRect(0, 0, width, height);

      // 1. The Void — warm-black gradient, NOT flat
      const voidGrad = ctx.createLinearGradient(0, 0, 0, height);
      voidGrad.addColorStop(0, '#060608');   // very slightly cool steel
      voidGrad.addColorStop(0.5, '#050506'); // the core black
      voidGrad.addColorStop(1, '#040405');   // neutral depth
      ctx.fillStyle = voidGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Bioluminescent Orbs — slow, liquid, breathing
      orbs.forEach(orb => {
        const timeOffset = t * orb.speed * speedFactor;
        orb.x = orb.baseX + Math.sin(orb.phase + timeOffset) * orb.drift;
        orb.y = orb.baseY + Math.cos(orb.phase * 0.7 + timeOffset * 0.8) * orb.drift * 0.6;

        // Breathing alpha
        const breathe = 0.6 + Math.sin(timeOffset * 3 + orb.phase) * 0.4;
        const currentAlpha = orb.alpha * breathe;

        const grad = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.radius
        );
        // Platinum bioluminescence — desaturated, ghostly
        grad.addColorStop(0, `hsla(${orb.hue}, 8%, 85%, ${currentAlpha})`);
        grad.addColorStop(0.4, `hsla(${orb.hue}, 5%, 70%, ${currentAlpha * 0.5})`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.fillRect(
          orb.x - orb.radius,
          orb.y - orb.radius,
          orb.radius * 2,
          orb.radius * 2
        );
      });

      // 3. Central warmth — a gentle heart-glow in the center
      const centerGlow = ctx.createRadialGradient(
        width / 2, height * 0.4, 0,
        width / 2, height * 0.4, width * 0.6
      );
      const centerBreath = 0.015 + Math.sin(t * 0.001) * 0.005;
      centerGlow.addColorStop(0, `rgba(226, 226, 232, ${centerBreath})`);
      centerGlow.addColorStop(0.5, `rgba(226, 226, 232, ${centerBreath * 0.3})`);
      centerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, width, height);

      // 4. Subtle grain overlay — organic texture (very faint)
      if (t % 3 === 0) {
        // Only update grain every 3 frames for performance
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
          const noise = (Math.random() - 0.5) * 4;
          data[i] = Math.max(0, Math.min(255, data[i] + noise));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        ctx.putImageData(imgData, 0, 0);
      }

      animFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrame);
    };
  }, [mode]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
export default LivingBackground;
