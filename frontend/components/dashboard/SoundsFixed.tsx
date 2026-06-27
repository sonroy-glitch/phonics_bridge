'use client';

import { PhonemePattern } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';

interface SoundsFixedProps {
  soundsFixed: PhonemePattern[];
}

export function SoundsFixed({ soundsFixed }: SoundsFixedProps) {
  if (soundsFixed.length === 0) return null;

  return (
    <div className="glass-card p-6 animate-fade-in-up delay-400">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #f0fdf4, #bbf7d0)' }}
        >
          {/* Trophy SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
            <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
            <path d="M6 3h12v7a6 6 0 0 1-6 6 6 6 0 0 1-6-6Z" />
            <path d="M8 21h8" />
            <path d="M12 17v4" />
          </svg>
        </div>
        <div>
          <h2
            className="text-lg font-bold leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
          >
            Sounds You&apos;ve Mastered! 🎉
          </h2>
          <p className="text-xs" style={{ color: '#6b7280' }}>
            These phonemes are now in your toolkit
          </p>
        </div>
      </div>

      {/* Sound badges */}
      <div className="flex flex-wrap gap-2">
        {soundsFixed.map((sound) => (
          <div
            key={sound.id}
            className="badge transition-all duration-200 hover:scale-105 hover:-translate-y-0.5"
            style={{
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
              boxShadow: '0 2px 8px rgba(5,150,105,0.1)',
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#059669' }} />
            <span className="font-mono font-bold">{sound.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
