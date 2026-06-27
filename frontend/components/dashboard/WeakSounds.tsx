'use client';

import { PhonemePattern } from '@/lib/types';
import { Zap } from 'lucide-react';

interface WeakSoundsProps {
  weakSounds: PhonemePattern[];
}

export function WeakSounds({ weakSounds }: WeakSoundsProps) {
  if (weakSounds.length === 0) return null;

  return (
    <div className="glass-card p-6 animate-fade-in-up delay-200">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #fff1f2, #fecdd3)' }}
        >
          <Zap className="w-4 h-4" style={{ color: '#fb7185' }} />
        </div>
        <div>
          <h2
            className="text-lg font-bold leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
          >
            Sounds to Practice
          </h2>
          <p className="text-xs" style={{ color: '#6b7280' }}>
            Focus on these to boost your score
          </p>
        </div>
      </div>

      {/* Sound badges */}
      <div className="flex flex-wrap gap-2">
        {weakSounds.map((sound) => (
          <div
            key={sound.id}
            className="badge transition-all duration-200 hover:scale-105 hover:-translate-y-0.5"
            style={
              sound.status === 'needs-work'
                ? {
                    background: '#fff1f2',
                    color: '#e11d48',
                    border: '1px solid #fecdd3',
                    boxShadow: '0 2px 8px rgba(251,113,133,0.15)',
                  }
                : {
                    background: '#fffbeb',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                    boxShadow: '0 2px 8px rgba(251,191,36,0.15)',
                  }
            }
          >
            <span className="font-mono font-bold">{sound.name}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-bold ml-1"
              style={
                sound.status === 'needs-work'
                  ? { background: '#fecdd3', color: '#be123c' }
                  : { background: '#fde68a', color: '#78350f' }
              }
            >
              {sound.errorCount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
