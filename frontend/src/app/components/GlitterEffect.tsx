import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  left: number;
  color: string;
  duration: number;
  delay: number;
}

export function GlitterEffect() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ['#FFD600', '#FFF8DC', '#FFB800'];
    const newParticles: Particle[] = [];

    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 15 + Math.random() * 10,
        delay: Math.random() * 5,
      });
    }

    setParticles(newParticles);
  }, []);

  return (
    <div className="glitter-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="glitter-particle"
          style={{
            left: `${particle.left}%`,
            backgroundColor: particle.color,
            boxShadow: `0 0 4px ${particle.color}`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
