'use client';

import { useAuth } from '@/lib/auth-context';
import { Sparkles } from 'lucide-react';

export function DashboardWelcome() {
  const { user } = useAuth();
  const name = user?.studentData?.name || user?.teacherData?.name || 'there';
  const firstName = name.split(' ')[0];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="animate-fade-in-up">
      {/* Greeting */}
      <div className="flex items-start gap-3 mb-2">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 mt-0.5"
          style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
        >
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1
            className="text-3xl md:text-4xl font-extrabold leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937', letterSpacing: '-0.02em' }}
          >
            {greeting},{' '}
            <span style={{ color: '#0d9488' }}>{firstName}!</span>
          </h1>
          <p className="text-base mt-1" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
            Keep up the great work — every practice session makes you better!
          </p>
        </div>
      </div>

      {/* Decorative accent underline */}
      <div className="ml-15 mt-1" style={{ marginLeft: '60px' }}>
        <div
          style={{
            height: '3px',
            width: '120px',
            background: 'linear-gradient(90deg, #0d9488, #fbbf24, transparent)',
            borderRadius: '9999px',
          }}
        />
      </div>
    </div>
  );
}
