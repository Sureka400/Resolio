import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, BookOpen, Coffee, Sparkles, Loader2, Info } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { getAuthToken } from '../api';

interface ScheduleItem {
  time: string;
  activity: string;
  type: 'class' | 'study' | 'break';
  reason?: string;
}

interface AiScheduleProps {
  studentId: string;
}

export function AiSchedule({ studentId }: AiScheduleProps) {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/ai/schedule/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to generate schedule');
      const data = await response.json();
      setSchedule(data.schedule || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate your personalized schedule. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchSchedule();
    }
  }, [studentId]);

  const getTypeIcon = (type: ScheduleItem['type']) => {
    switch (type) {
      case 'class': return <BookOpen className="w-4 h-4 text-[#FFD600]" />;
      case 'study': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'break': return <Coffee className="w-4 h-4 text-green-400" />;
      default: return <Calendar className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type: ScheduleItem['type']) => {
    switch (type) {
      case 'class': return 'bg-[#FFD600]/10 border-[#FFD600]/20';
      case 'study': return 'bg-blue-500/10 border-blue-500/20';
      case 'break': return 'bg-green-500/10 border-green-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#e8e6e1] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#FFD600]" />
            AI Personalized Schedule
          </h2>
          <p className="text-[#a8a6a1]">Tailored to your behavioral data, upcoming deadlines, and stress levels</p>
        </div>
        <button
          onClick={fetchSchedule}
          disabled={loading}
          className="px-4 py-2 bg-[#FFD600] text-black rounded-xl font-semibold hover:bg-[#FFD600]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Regenerate
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-[#FFD600] animate-spin" />
          <p className="text-[#a8a6a1] animate-pulse">Syncing with your behavior patterns and course loads...</p>
        </div>
      ) : error ? (
        <GlassCard className="p-8 text-center text-red-400 border-red-500/20">
          <p>{error}</p>
          <button 
            onClick={fetchSchedule}
            className="mt-4 text-[#FFD600] hover:underline"
          >
            Try Again
          </button>
        </GlassCard>
      ) : schedule.length > 0 ? (
        <div className="grid gap-4">
          {schedule.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className={`p-4 border-l-4 ${getTypeColor(item.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-[#e8e6e1] font-mono text-sm w-20 pt-1">
                      {item.time}
                    </div>
                    <div className="h-12 w-px bg-white/10 hidden md:block" />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[#e8e6e1] font-medium">{item.activity}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider flex items-center gap-1 ${getTypeColor(item.type)} text-[#e8e6e1]`}>
                          {getTypeIcon(item.type)}
                          {item.type}
                        </span>
                      </div>
                      {item.reason && (
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-[#a8a6a1] italic">
                          <Info className="w-3 h-3 mt-0.5 shrink-0" />
                          <span>{item.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <GlassCard className="p-12 text-center text-[#a8a6a1]">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Your personalized schedule is ready to be generated.</p>
          <button
            onClick={fetchSchedule}
            className="mt-4 text-[#FFD600] font-semibold hover:underline"
          >
            Create My Schedule
          </button>
        </GlassCard>
      )}
    </div>
  );
}
