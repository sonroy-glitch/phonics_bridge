'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BASE_API_URL } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Flame, Calendar, Target } from 'lucide-react';
import type { StudentProfile } from '@/lib/types';
import { PreviousSessions } from '@/components/dashboard/PreviousSessions';

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading } = useAuth();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const studentId = params?.id as string;

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'teacher')) {
      router.push('/signin');
      return;
    }

    if (studentId && user?.id) {
      fetch(`${BASE_API_URL}/teacher-students?userId=${user.id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch students');
          return res.json();
        })
        .then((data: any[]) => {
          const match = data.find((s: any) => s.id === studentId);
          if (match) setStudent(match);
        })
        .catch((err) => console.error(err));

      setLoadingSessions(true);
      fetch(`${BASE_API_URL}/sessions?studentId=${studentId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch sessions');
          return res.json();
        })
        .then((data) => setSessions(data.sessions || []))
        .catch((err) => console.error(err))
        .finally(() => setLoadingSessions(false));
    }
  }, [user, isLoading, studentId, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-3 border-[var(--primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <Button onClick={() => router.push('/teacher')} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="glass-card p-16 text-center">
          <p className="text-[var(--muted-foreground)]">Student not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <Button onClick={() => router.push('/teacher')} variant="ghost" size="sm" className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-[var(--foreground)]">{student.name}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Role #: {student.roleNumber}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up delay-100">
        <div className="stat-gradient-teal rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-teal-600)] flex items-center justify-center shadow-md">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-teal-700)]">Practice Streak</p>
              <p className="text-3xl font-bold font-['Outfit'] text-[var(--color-teal-800)]">
                {student.practiceStreak}
                <span className="text-base font-normal ml-1">days</span>
              </p>
            </div>
          </div>
        </div>

        <div className="stat-gradient-coral rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-coral)] flex items-center justify-center shadow-md">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-rose-700">Practice Days</p>
              <p className="text-3xl font-bold font-['Outfit'] text-rose-800">
                {student.totalPracticeDays}
                <span className="text-base font-normal ml-1">days</span>
              </p>
            </div>
          </div>
        </div>

        <div className="stat-gradient-indigo rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-indigo)] flex items-center justify-center shadow-md">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-700">Sessions</p>
              <p className="text-3xl font-bold font-['Outfit'] text-indigo-800">
                {student.totalPracticeSessions}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card className="animate-fade-in-up delay-200">
        <CardHeader>
          <CardTitle className="text-xl">Student Information</CardTitle>
          <CardDescription>Details about {student.name}&apos;s account and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-[var(--muted-foreground)]">Student ID</label>
              <p className="mt-1 font-mono text-sm bg-[var(--secondary)] rounded-lg px-3 py-2">{student.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--muted-foreground)]">Role Number</label>
              <p className="mt-1 font-mono text-sm bg-[var(--secondary)] rounded-lg px-3 py-2">{student.roleNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--muted-foreground)]">Joined On</label>
              <p className="mt-1 text-sm bg-[var(--secondary)] rounded-lg px-3 py-2">
                {new Date(student.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--muted-foreground)]">Avg Sessions / Day</label>
              <p className="mt-1 text-sm font-semibold bg-[var(--secondary)] rounded-lg px-3 py-2">
                {student.totalPracticeDays > 0
                  ? (student.totalPracticeSessions / student.totalPracticeDays).toFixed(2)
                  : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student's Previous Sessions */}
      <div className="animate-fade-in-up delay-300 pt-4" style={{ borderTop: '1px solid #ece7df' }}>
        <PreviousSessions sessions={sessions} isLoading={loadingSessions} title={`${student.name}'s Previous Sessions`} />
      </div>
    </div>
  );
}
