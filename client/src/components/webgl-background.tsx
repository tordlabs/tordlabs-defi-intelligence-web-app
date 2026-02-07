import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  speed: number;
}

export function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let mouseX = 0;
    let mouseY = 0;
    let animationId: number;
    let particles: Particle[] = [];
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const goldColors = [
      "rgba(212, 175, 55,",
      "rgba(255, 200, 50,",
      "rgba(255, 140, 0,",
      "rgba(180, 150, 40,",
      "rgba(255, 215, 100,",
      "rgba(100, 80, 30,",
      "rgba(60, 50, 25,",
    ];

    const particleCount = 200;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2.5 + 0.5,
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
        alpha: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.5 + 0.2,
      });
    }

    const drawConnections = (ctx: CanvasRenderingContext2D) => {
      const connectionDistance = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.08;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.005;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const grd = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.3, 0,
        canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.6
      );
      grd.addColorStop(0, "rgba(212, 175, 55, 0.03)");
      grd.addColorStop(0.5, "rgba(100, 80, 20, 0.01)");
      grd.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouseInfluence = 80;

      for (const p of particles) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseInfluence * 2) {
          const force = (1 - dist / (mouseInfluence * 2)) * 0.02;
          p.vx += dx * force * 0.01;
          p.vy += dy * force * 0.01;
        }

        p.x += p.vx + Math.sin(time * p.speed + p.y * 0.01) * 0.2;
        p.y += p.vy + Math.cos(time * p.speed + p.x * 0.01) * 0.15;

        p.vx *= 0.99;
        p.vy *= 0.99;

        if (p.x < -50) p.x = canvas.width + 50;
        if (p.x > canvas.width + 50) p.x = -50;
        if (p.y < -50) p.y = canvas.height + 50;
        if (p.y > canvas.height + 50) p.y = -50;

        const pulseAlpha = p.alpha * (0.7 + 0.3 * Math.sin(time * 2 + p.x * 0.01));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.z, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${pulseAlpha})`;
        ctx.fill();

        if (p.size > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.z * 3, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color} ${pulseAlpha * 0.15})`;
          ctx.fill();
        }
      }

      drawConnections(ctx);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ opacity: 0.25 }}
    />
  );
}
