
import React, { useEffect, useRef } from 'react';

export const LivingBackground: React.FC<{ mode: 'idle' | 'active' | 'calm' }> = ({ mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Resize handler
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    // Particles representing "Consciousness"
    const particles: any[] = [];
    const particleCount = width < 768 ? 30 : 60; // Fewer on mobile for battery

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2, // Very slow movement
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2,
        alpha: Math.random() * 0.5
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // 1. The "Void" Gradient (Deep, Expensive Black)
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#020617'); // Slate 950
      gradient.addColorStop(1, '#000000'); // Pure Black
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. The "Amber Glow" (Subtle, Safe warmth)
      // Only appears in center to focus attention
      const glow = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
      glow.addColorStop(0, 'rgba(245, 158, 11, 0.03)'); // Very subtle Amber
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // 3. Move Particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Wrap around screen
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.3})`; // Subtle white stars
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
export default LivingBackground;
