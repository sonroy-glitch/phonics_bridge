'use client';

import { Flame, Target, TrendingUp } from 'lucide-react';

interface StatsRowProps {
  streak: number;
  totalSessions: number;
  averageAccuracy: number;
}

export function StatsRow({ streak, totalSessions, averageAccuracy }: StatsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up delay-100">

      {/* ── Streak ── */}
      <div
        className="stat-gradient-teal rounded-3xl p-5 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 cursor-default"
        style={{ boxShadow: '0 4px 20px rgba(13,148,136,0.08)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
          >
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#0f766e', fontFamily: 'Inter, sans-serif' }}>
              Practice Streak
            </p>
            <p
              className="text-3xl font-extrabold animate-bounce-in leading-none mt-0.5"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#115e59' }}
            >
              {streak}
              <span className="text-sm font-medium ml-1" style={{ color: '#0f766e' }}>days</span>
            </p>
          </div>
        </div>
        <div className="mt-3 h-1 rounded-full" style={{ background: 'rgba(13,148,136,0.12)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(streak * 10, 100)}%`,
              background: 'linear-gradient(90deg, #0d9488, #2dd4bf)',
            }}
          />
        </div>
      </div>

      {/* ── Sessions ── */}
      <div
        className="stat-gradient-coral rounded-3xl p-5 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 cursor-default"
        style={{ boxShadow: '0 4px 20px rgba(251,113,133,0.1)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #fb7185, #e11d48)' }}
          >
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#be123c', fontFamily: 'Inter, sans-serif' }}>
              Total Sessions
            </p>
            <p
              className="text-3xl font-extrabold animate-bounce-in delay-100 leading-none mt-0.5"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#9f1239' }}
            >
              {totalSessions}
            </p>
          </div>
        </div>
        <div className="mt-3 h-1 rounded-full" style={{ background: 'rgba(251,113,133,0.15)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(totalSessions * 5, 100)}%`,
              background: 'linear-gradient(90deg, #fb7185, #fda4af)',
            }}
          />
        </div>
      </div>

      {/* ── Accuracy (amber — per spec) ── */}
      <div
        className="stat-gradient-amber rounded-3xl p-5 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 cursor-default"
        style={{ boxShadow: '0 4px 20px rgba(251,191,36,0.12)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
          >
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#92400e', fontFamily: 'Inter, sans-serif' }}>
              Avg Accuracy
            </p>
            <p
              className="text-3xl font-extrabold animate-bounce-in delay-200 leading-none mt-0.5"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#78350f' }}
            >
              {averageAccuracy}
              <span className="text-sm font-medium ml-0.5" style={{ color: '#92400e' }}>%</span>
            </p>
          </div>
        </div>
        <div className="mt-3 h-1 rounded-full" style={{ background: 'rgba(251,191,36,0.2)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${averageAccuracy}%`,
              background: 'linear-gradient(90deg, #fbbf24, #fde68a)',
            }}
          />
        </div>
      </div>

    </div>
  );
}
