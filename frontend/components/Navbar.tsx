'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { BookOpen, Home, LogOut, GraduationCap } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  // Show landing navbar for unauthenticated users (and hide on signin/signup pages)
  if (!isAuthenticated || !user) {
    // Don't show public navbar on sign in / sign up pages
    if (pathname === '/signin' || pathname === '/signup') return null;

    return (
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(253,248,240,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(236,231,223,0.7)',
          boxShadow: '0 1px 12px rgba(0,0,0,0.04)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-md transition-all duration-200 group-hover:shadow-lg group-hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
              >
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span
                  className="text-xl font-extrabold block leading-tight"
                  style={{ fontFamily: 'Outfit, sans-serif', color: '#0d9488', letterSpacing: '-0.02em' }}
                >
                  PhonicsFlow
                </span>
                <span className="text-xs" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
                  Speak • Practice • Progress
                </span>
              </div>
            </Link>

            {/* Nav links */}
            {/* <nav className="hidden md:flex items-center gap-1">
              {['Features', 'How It Works', 'For Teachers', 'For Students', 'Pricing'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200"
                  style={{ color: '#4b5563', fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color = '#0d9488';
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(13,148,136,0.07)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color = '#4b5563';
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  }}
                >
                  {item}
                </a>
              ))}
            </nav> */}

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className="px-5 py-2 text-sm font-semibold rounded-full border-2 transition-all duration-200 hidden sm:inline-flex"
                style={{
                  borderColor: '#0d9488',
                  color: '#0d9488',
                  fontFamily: 'Inter, sans-serif',
                  background: 'transparent',
                }}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200 inline-flex"
                style={{
                  background: '#0d9488',
                  color: '#ffffff',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 4px 14px rgba(13,148,136,0.35)',
                }}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Authenticated navbar
  const isTeacher = user.role === 'teacher';
  const displayName = isTeacher
    ? user.teacherData?.name || user.email?.split('@')[0]
    : user.studentData?.name || 'Student';

  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(255, 250, 244, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #ece7df',
        boxShadow: '0 1px 12px rgba(0,0,0,0.04)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href={isTeacher ? '/teacher' : '/'}
            className="flex items-center gap-2.5 group"
          >
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-md transition-all duration-200 group-hover:shadow-lg group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
            >
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span
              className="text-xl font-extrabold hidden sm:block"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937', letterSpacing: '-0.02em' }}
            >
              Phonics
              <span style={{ color: '#0d9488' }}> Bridge</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1.5">
            {!isTeacher && (
              <>
                <NavLink href="/" active={pathname === '/'} icon={<Home className="w-4 h-4" />} label="Dashboard" />
                <NavLink href="/practice" active={pathname === '/practice'} icon={<BookOpen className="w-4 h-4" />} label="Practice" />
              </>
            )}

            {/* User section */}
            <div
              className="flex items-center gap-2.5 ml-3 pl-3"
              style={{ borderLeft: '1px solid #ece7df' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
              >
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight" style={{ color: '#1f2937', fontFamily: 'Inter, sans-serif' }}>
                  {displayName}
                </p>
                <p className="text-xs capitalize" style={{ color: '#6b7280' }}>
                  {user.role}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-1 p-2 rounded-xl transition-all duration-200 hover:scale-105"
                style={{ color: '#9ca3af' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#fff1f2';
                  (e.currentTarget as HTMLButtonElement).style.color = '#e11d48';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af';
                }}
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
      style={{
        fontFamily: 'Inter, sans-serif',
        background: active ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
        color: active ? '#0d9488' : '#6b7280',
        boxShadow: active ? '0 1px 4px rgba(13, 148, 136, 0.12)' : 'none',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(13, 148, 136, 0.07)';
          (e.currentTarget as HTMLAnchorElement).style.color = '#0d9488';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
          (e.currentTarget as HTMLAnchorElement).style.color = '#6b7280';
        }
      }}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}
