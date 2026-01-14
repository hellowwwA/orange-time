import React, { useEffect, useRef } from 'react';

const Snowfall: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    // Added vx and vy for individual direction
    const particles: { x: number; y: number; r: number; d: number; vx: number; vy: number }[] = [];
    // Increased density for fuller effect
    const maxParticles = 800;

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      // Significantly smaller radius (0.2 to 1.7)
      const r = Math.random() * 1.5 + 0.2;
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: r, 
        d: Math.random() * maxParticles,
        // Reduced horizontal velocity for gentler sway
        vx: (Math.random() - 0.5) * 0.5,
        // Much slower vertical velocity (falling speed)
        vy: 0.5 + (r / 3) + (Math.random() * 0.1) 
      });
    }

    let animationId: number;
    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      
      // Light blue color (Sky-300) with opacity
      ctx.fillStyle = "rgba(125, 211, 252, 0.8)"; 
      ctx.beginPath();
      
      for (let i = 0; i < maxParticles; i++) {
        const p = particles[i];
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
      }
      ctx.fill();
      update();
      animationId = requestAnimationFrame(draw);
    };

    const update = () => {
      angle += 0.01;
      for (let i = 0; i < maxParticles; i++) {
        const p = particles[i];
        
        // Update coordinates based on individual velocity
        p.x += p.vx + Math.sin(angle + p.d) * 0.2; 
        p.y += p.vy;

        // Reset particle if it leaves the bottom
        if (p.y > h) {
          p.y = -10;
          p.x = Math.random() * w;
          // Re-randomize velocity slightly for variety on respawn
          p.vx = (Math.random() - 0.5) * 0.5;
        }
        
        // Wrap around horizontally to maintain continuous flow
        if (p.x > w + 5) {
          p.x = -5;
        } else if (p.x < -5) {
          p.x = w + 5;
        }
      }
    };

    draw();

    const handleResize = () => {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;
    };

    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-[100]" 
        style={{ pointerEvents: 'none' }}
    />
  );
};

export default Snowfall;