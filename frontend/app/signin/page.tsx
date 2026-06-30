'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, GraduationCap, BookOpen, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';



export default function SignInPage() {
  const router = useRouter();
  const { signIn, studentSignIn, isLoading, isAuthenticated, user } = useAuth();
  const [role, setRole] = useState<'teacher' | 'student' | 'learner'>('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Trim all text fields before submission
    const trimmedEmail = email.trim();
    const trimmedRollNumber = rollNumber.trim();
    const trimmedTeacherCode = teacherCode.trim();

    try {
      if (role === 'teacher' || role === 'learner') {
        await signIn(trimmedEmail, password, role === 'teacher');
        if (role === 'teacher') {
          router.push('/teacher');
        } else {
          router.push('/');
        }
      } else {
        await studentSignIn(trimmedRollNumber, trimmedTeacherCode);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">

        {/* ── Logo ── */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div
            className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
          >
            <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold leading-none"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937', letterSpacing: '-0.02em' }}
            >
              Phonics<span style={{ color: '#0d9488' }}>Bridge</span>
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
              Master your phonics
            </p>
          </div>
        </div>

        {/* ── Card ── */}
        <div
          className="glass-card-flat p-5 sm:p-8"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}
        >
          {/* Card header */}
          <div className="text-center mb-7">
            <h2
              className="text-2xl font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
            >
              Welcome back!
            </h2>
            <p className="text-sm mt-1" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
              Sign in to continue your learning journey
            </p>
          </div>

          {/* ── Role Toggle ── */}
          <div className="pill-tab-container mb-6">
            <button
              id="role-teacher-btn"
              type="button"
              onClick={() => { setRole('teacher'); setError(''); }}
              className={`pill-tab ${role === 'teacher' ? 'active' : ''}`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Teacher
              </span>
            </button>
            <button
              id="role-student-btn"
              type="button"
              onClick={() => { setRole('student'); setError(''); }}
              className={`pill-tab ${role === 'student' ? 'active' : ''}`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Student
              </span>
            </button>
            <button
              id="role-learner-btn"
              type="button"
              onClick={() => { setRole('learner'); setError(''); }}
              className={`pill-tab ${role === 'learner' ? 'active' : ''}`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Learner
              </span>
            </button>
          </div>

          {/* ── Form ── */}
          <form id="signin-form" onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-2xl text-sm animate-fade-in"
                style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48' }}
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>{error}</span>
              </div>
            )}

            {role === 'teacher' || role === 'learner' ? (
              <>
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold block"
                    style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold block"
                    style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label
                    htmlFor="rollNumber"
                    className="text-sm font-semibold block"
                    style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}
                  >
                    Roll Number
                  </label>
                  <Input
                    id="rollNumber"
                    type="text"
                    placeholder="e.g. RN1234"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="teacherCode"
                    className="text-sm font-semibold block"
                    style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}
                  >
                    Teacher Code
                  </label>
                  <Input
                    id="teacherCode"
                    type="text"
                    placeholder="e.g. TCXXXXXX"
                    value={teacherCode}
                    onChange={(e) => setTeacherCode(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <Button
              id="signin-submit-btn"
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span style={{ color: '#9ca3af' }}>Don&apos;t have an account? </span>
            <Link
              href="/signup"
              className="font-bold hover:underline transition-colors"
              style={{ color: '#0d9488' }}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
