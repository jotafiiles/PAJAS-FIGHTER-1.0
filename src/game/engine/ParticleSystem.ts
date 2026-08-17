import { HitParticle } from '../../types';

export class ParticleSystem {
  private particles: HitParticle[] = [];

  public spawnHitSparks(x: number, y: number, color: string = '#fbbf24', count: number = 14) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 4,
        life: 0,
        maxLife: 15 + Math.random() * 10,
        shape: Math.random() > 0.5 ? 'spark' : 'star',
      });
    }

    // Expanding shockwave ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      color: '#ffffff',
      size: 6,
      life: 0,
      maxLife: 12,
      shape: 'ring',
    });
  }

  public spawnDust(x: number, y: number, count: number = 6) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y - 2,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2,
        color: 'rgba(200, 200, 210, 0.4)',
        size: 4 + Math.random() * 6,
        life: 0,
        maxLife: 18,
        shape: 'smoke',
      });
    }
  }

  public update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.92;
      p.vy *= 0.92;

      if (p.shape === 'ring') {
        p.size += 3.5;
      }

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(p => {
      const progress = p.life / p.maxLife;
      const alpha = 1 - progress;

      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.shape === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'smoke') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + progress), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'star') {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else {
        // Spark line
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  public clear() {
    this.particles = [];
  }
}
