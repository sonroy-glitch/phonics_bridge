'use client';

import { PracticeWord } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus, BookOpen } from 'lucide-react';

interface WordsListProps {
  words: PracticeWord[];
}

export function WordsList({ words }: WordsListProps) {
  if (words.length === 0) return null;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-3.5 h-3.5" />;
      case 'declining':
        return <TrendingDown className="w-3.5 h-3.5" />;
      default:
        return <Minus className="w-3.5 h-3.5" />;
    }
  };

  const getTrendStyle = (trend: string): React.CSSProperties => {
    switch (trend) {
      case 'improving':
        return { background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' };
      case 'declining':
        return { background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' };
      default:
        return { background: '#f3ede4', color: '#6b7280', border: '1px solid #ece7df' };
    }
  };

  return (
    <div className="glass-card p-6 animate-fade-in-up delay-300">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #fffbeb, #fde68a)' }}
        >
          <BookOpen className="w-4 h-4" style={{ color: '#d97706' }} />
        </div>
        <div>
          <h2
            className="text-lg font-bold leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
          >
            Words Practiced
          </h2>
          <p className="text-xs" style={{ color: '#6b7280' }}>
            {words.length} word{words.length !== 1 ? 's' : ''} in your history
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl" style={{ border: '1px solid #ece7df' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(253,248,240,0.8)', borderBottom: '1px solid #ece7df' }}>
              <th className="text-left py-3 px-4" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Word
              </th>
              <th className="text-center py-3 px-3" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Errors
              </th>
              <th className="text-center py-3 px-3" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Attempts
              </th>
              <th className="text-center py-3 px-3" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Trend
              </th>
              <th className="text-right py-3 px-4 hidden sm:table-cell" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Last Practiced
              </th>
            </tr>
          </thead>
          <tbody>
            {words.map((word, i) => (
              <tr
                key={word.id}
                className="transition-colors duration-150"
                style={{
                  borderBottom: i < words.length - 1 ? '1px solid rgba(236,231,223,0.5)' : 'none',
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(253,248,240,0.5)',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.background = 'rgba(240,253,250,0.6)')}
                onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(253,248,240,0.5)')}
              >
                <td className="py-3 px-4 font-bold" style={{ color: '#1f2937', fontFamily: 'Inter, sans-serif' }}>
                  {word.word}
                </td>
                <td className="py-3 px-3 text-center">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                    style={word.errorCount > 0
                      ? { background: '#fff1f2', color: '#e11d48' }
                      : { background: '#f0fdf4', color: '#059669' }
                    }
                  >
                    {word.errorCount}
                  </span>
                </td>
                <td className="py-3 px-3 text-center text-sm font-medium" style={{ color: '#6b7280' }}>
                  {word.totalAttempts}
                </td>
                <td className="py-3 px-3 text-center">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={getTrendStyle(word.trend)}
                  >
                    {getTrendIcon(word.trend)}
                    {word.trend}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-xs hidden sm:table-cell" style={{ color: '#9ca3af' }}>
                  {word.lastPracticed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
