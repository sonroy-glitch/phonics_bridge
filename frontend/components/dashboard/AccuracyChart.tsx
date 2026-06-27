'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { accuracyData as mockAccuracyData } from '@/lib/mock-data';
import { AccuracyDataPoint } from '@/lib/types';
import { TrendingUp } from 'lucide-react';

interface AccuracyChartProps {
  accuracyData?: AccuracyDataPoint[];
}

export function AccuracyChart({ accuracyData = [] }: AccuracyChartProps) {
  const displayData = accuracyData.length > 0 ? accuracyData : mockAccuracyData;

  const avg =
    displayData.length > 0
      ? Math.round(
          displayData.reduce((a: number, b: AccuracyDataPoint) => a + b.accuracy, 0) /
            displayData.length
        )
      : 0;

  return (
    <div className="glass-card p-6 animate-fade-in-up delay-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)' }}
          >
            <TrendingUp className="w-4 h-4" style={{ color: '#0d9488' }} />
          </div>
          <div>
            <h2
              className="text-lg font-bold leading-tight"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
            >
              Accuracy Trend
            </h2>
            <p className="text-xs" style={{ color: '#6b7280' }}>
              Your pronunciation progress over time
            </p>
          </div>
        </div>
        {/* Average badge */}
        <div
          className="px-3 py-1.5 rounded-full text-sm font-bold"
          style={{ background: 'rgba(13,148,136,0.1)', color: '#0d9488', fontFamily: 'Outfit, sans-serif' }}
        >
          avg {avg}%
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={displayData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 4" stroke="rgba(236,231,223,0.8)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            style={{ fontSize: '11px', fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
            tick={{ dy: 6 }}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '11px', fontFamily: 'Inter' }}
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 250, 244, 0.97)',
              border: '1px solid #ece7df',
              borderRadius: '16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              fontFamily: 'Inter',
              padding: '10px 14px',
            }}
            labelStyle={{ color: '#1f2937', fontWeight: 700, fontSize: '13px' }}
            formatter={(value) => [`${value}%`, 'Accuracy']}
          />
          <Area
            type="monotone"
            dataKey="accuracy"
            stroke="#0d9488"
            strokeWidth={2.5}
            fill="url(#tealGradient)"
            dot={{ fill: '#0d9488', r: 4, strokeWidth: 2, stroke: '#fffaf4' }}
            activeDot={{ r: 6, fill: '#0d9488', stroke: '#fffaf4', strokeWidth: 3 }}
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
