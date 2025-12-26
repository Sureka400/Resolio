import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  accentColor?: string;
}

export function TabNavigation({ tabs, activeTab, onTabChange, accentColor = '#FFD600' }: TabNavigationProps) {
  return (
    <div className="glass-card rounded-2xl p-2 mb-8">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}10 100%)`
                  : 'transparent',
              }}
            >
              <Icon
                className="w-5 h-5 transition-colors"
                style={{ color: isActive ? accentColor : '#a8a6a1' }}
              />
              <span
                className="transition-colors"
                style={{
                  color: isActive ? accentColor : '#a8a6a1',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {tab.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl border-2"
                  style={{ borderColor: accentColor }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
