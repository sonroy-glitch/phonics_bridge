'use client';

export function DoodleBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* Cream base */}
      <div style={{ position: 'absolute', inset: 0, background: '#fdf8f0' }} />

      {/* Large lavender organic blob — top-left */}
      <div
        style={{
          position: 'absolute',
          top: '-8%',
          left: '-10%',
          width: '52vw',
          height: '62vh',
          background: 'radial-gradient(ellipse at 40% 45%, #beb2f8 0%, #998bf4 40%, rgba(153,139,244,0.4) 65%, transparent 80%)',
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 55%',
          opacity: 0.90,
          filter: 'blur(1px)',
        }}
      />

      {/* Large orange organic blob — bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: '-8%',
          right: '-10%',
          width: '52vw',
          height: '62vh',
          background: 'radial-gradient(ellipse at 60% 55%, #f97316 0%, #ea580c 40%, rgba(249,115,22,0.4) 65%, transparent 80%)',
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 55%',
          opacity: 0.90,
          filter: 'blur(1px)',
        }}
      />

      {/* Secondary lavender glow */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '3%',
          width: '32vw',
          height: '38vh',
          background: 'radial-gradient(ellipse, rgba(153, 139, 244, 0.25) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(28px)',
        }}
      />

      {/* Subtle coral bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: '-4%',
          right: '-4%',
          width: '28vw',
          height: '32vh',
          background: 'radial-gradient(ellipse, rgba(251,113,133,0.07) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(18px)',
        }}
      />

      {/* ABC text — top center */}
      <svg style={{ position: 'absolute', top: '3%', left: '40%', opacity: 0.14 }} width="80" height="30" viewBox="0 0 80 30">
        <text x="0" y="24" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="24" fill="#1f2937" letterSpacing="3">ABC</text>
      </svg>

      {/* Pencil — top center-right */}
      <svg style={{ position: 'absolute', top: '3.5%', left: '57%', opacity: 0.16, transform: 'rotate(22deg)' }} width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#374151"/>
      </svg>

      {/* Star — top right */}
      <svg style={{ position: 'absolute', top: '6%', right: '18%', opacity: 0.15 }} width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.83 7.17H22l-6.17 4.5L18.66 21 12 16.83 5.34 21l2.83-7.33L2 9.17h7.17z" stroke="#374151" strokeWidth="1.5" fill="none"/>
      </svg>

      {/* Speech bubble — top right */}
      <svg style={{ position: 'absolute', top: '5%', right: '7%', opacity: 0.14 }} width="38" height="34" viewBox="0 0 38 34" fill="none">
        <rect x="2" y="2" width="30" height="22" rx="8" stroke="#374151" strokeWidth="2.2" fill="none"/>
        <circle cx="10" cy="13" r="2" fill="#374151" opacity="0.7"/>
        <circle cx="19" cy="13" r="2" fill="#374151" opacity="0.7"/>
        <circle cx="28" cy="13" r="2" fill="#374151" opacity="0.7"/>
        <path d="M8 24l-4 7 8-3" stroke="#374151" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>

      {/* Sound wave icon — right of speech bubble */}
      <svg style={{ position: 'absolute', top: '8%', right: '13%', opacity: 0.13 }} width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4v20M10 7v14M6 10v8M18 7v14M22 10v8" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>

      {/* Star small — top far right */}
      <svg style={{ position: 'absolute', top: '7.5%', right: '3%', opacity: 0.15 }} width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.83 7.17H22l-6.17 4.5L18.66 21 12 16.83 5.34 21l2.83-7.33L2 9.17h7.17z" stroke="#374151" strokeWidth="1.5" fill="none"/>
      </svg>

      {/* Book — right side middle */}
      <svg style={{ position: 'absolute', top: '28%', right: '3%', opacity: 0.14, transform: 'rotate(-6deg)' }} width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="#374151" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="#374151" strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="8" y1="7" x2="17" y2="7" stroke="#374151" strokeWidth="1.3" strokeLinecap="round"/>
        <line x1="8" y1="11" x2="14" y2="11" stroke="#374151" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>

      {/* Phoneme /ph/ — left inside blob area */}
      <svg style={{ position: 'absolute', top: '22%', left: '7%', opacity: 0.12 }} width="72" height="38" viewBox="0 0 72 38">
        <text x="2" y="30" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="26" fill="#ffffff">/ph/</text>
      </svg>

      {/* Star — left middle */}
      <svg style={{ position: 'absolute', top: '46%', left: '5%', opacity: 0.14 }} width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.83 7.17H22l-6.17 4.5L18.66 21 12 16.83 5.34 21l2.83-7.33L2 9.17h7.17z" stroke="#374151" strokeWidth="1.5" fill="none"/>
      </svg>

      {/* Pencil — left lower */}
      <svg style={{ position: 'absolute', top: '58%', left: '2.5%', opacity: 0.14, transform: 'rotate(-18deg)' }} width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#374151"/>
      </svg>

      {/* Music note — bottom left */}
      <svg style={{ position: 'absolute', bottom: '22%', left: '5%', opacity: 0.14 }} width="24" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M9 18V5l12-2v13" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="6" cy="18" r="3" stroke="#374151" strokeWidth="1.8" fill="none"/>
        <circle cx="18" cy="16" r="3" stroke="#374151" strokeWidth="1.8" fill="none"/>
      </svg>

      {/* Wavy line — bottom left */}
      <svg style={{ position: 'absolute', bottom: '11%', left: '3%', opacity: 0.12 }} width="60" height="24" viewBox="0 0 60 24" fill="none">
        <path d="M4 12c3-6 6 6 9 0s6-6 9 0 6 6 9 0 6-6 9 0 6 6 9 0" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      </svg>

      {/* Curly doodle — bottom center-left */}
      <svg style={{ position: 'absolute', bottom: '7%', left: '17%', opacity: 0.11 }} width="48" height="26" viewBox="0 0 48 26" fill="none">
        <path d="M4 22 C4 8, 16 2, 24 12 C32 22, 44 16, 44 4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      </svg>

      {/* Speech bubble small — bottom right */}
      <svg style={{ position: 'absolute', bottom: '19%', right: '5%', opacity: 0.13, transform: 'rotate(8deg)' }} width="32" height="28" viewBox="0 0 32 28" fill="none">
        <rect x="2" y="2" width="24" height="18" rx="6" stroke="#374151" strokeWidth="2" fill="none"/>
        <path d="M6 20l-2 5 7-3" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      </svg>

      {/* Sparkle diamond — bottom right */}
      <svg style={{ position: 'absolute', bottom: '6%', right: '3.5%', opacity: 0.22 }} width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path d="M15 2l4 9L28 15l-9 4L15 28l-4-9L2 15l9-4L15 2z" stroke="#0d9488" strokeWidth="1.8" fill="rgba(13,148,136,0.18)"/>
      </svg>

      {/* Music note — bottom right area */}
      <svg style={{ position: 'absolute', bottom: '23%', right: '13%', opacity: 0.13 }} width="22" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 18V5l12-2v13" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="6" cy="18" r="3" stroke="#374151" strokeWidth="1.8" fill="none"/>
        <circle cx="18" cy="16" r="3" stroke="#374151" strokeWidth="1.8" fill="none"/>
      </svg>

      {/* Dots row — bottom center */}
      <svg style={{ position: 'absolute', bottom: '4%', left: '42%', opacity: 0.10 }} width="52" height="12" viewBox="0 0 52 12">
        <circle cx="6" cy="6" r="2.5" fill="#374151"/>
        <circle cx="19" cy="6" r="2.5" fill="#374151"/>
        <circle cx="32" cy="6" r="2.5" fill="#374151"/>
        <circle cx="45" cy="6" r="2.5" fill="#374151"/>
      </svg>

      {/* Wavy squiggle — bottom center-right */}
      <svg style={{ position: 'absolute', bottom: '8%', left: '40%', opacity: 0.10 }} width="120" height="20" viewBox="0 0 120 20" fill="none">
        <path d="M2 10c5-8 9 8 14 0s9-8 14 0 9 8 14 0 9-8 14 0 9 8 14 0 9-8 14 0" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      </svg>
    </div>
  );
}
