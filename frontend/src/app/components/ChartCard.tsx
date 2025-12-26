import { motion } from 'motion/react';
import { GlassCard } from './GlassCard';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, description, children, className = '' }: ChartCardProps) {
  return (
    <GlassCard enableParallax={false} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h3 className="mb-1" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#e8e6e1' }}>
            {title}
          </h3>
          {description && (
            <p className="text-[#a8a6a1]" style={{ fontSize: '0.875rem' }}>
              {description}
            </p>
          )}
        </div>
        <div className="w-full">{children}</div>
      </motion.div>
    </GlassCard>
  );
}
