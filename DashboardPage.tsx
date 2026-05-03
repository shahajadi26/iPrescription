import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Dumbbell,
  MapPin,
  FileText,
  Bell,
  Calendar,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/db/api';

const moduleCards = [
  {
    title: 'Question Bank',
    description: 'Browse and study questions by category',
    icon: BookOpen,
    path: '/question-bank',
    color: 'text-primary',
  },
  {
    title: 'Practice Questions',
    description: 'Practice with instant feedback',
    icon: Dumbbell,
    path: '/practice',
    color: 'text-secondary',
  },
  {
    title: 'Geographic Quiz',
    description: 'Interactive map-based learning',
    icon: MapPin,
    path: '/geographic-quiz',
    color: 'text-chart-3',
  },
  {
    title: 'Exams',
    description: 'Take full or custom exams',
    icon: FileText,
    path: '/exams',
    color: 'text-chart-4',
  },
  {
    title: 'My Results',
    description: 'View your performance analytics',
    icon: BarChart3,
    path: '/results',
    color: 'text-chart-1',
  },
  {
    title: 'Notifications',
    description: 'Stay updated with announcements',
    icon: Bell,
    path: '/notifications',
    color: 'text-chart-5',
  },
  {
    title: 'Routine',
    description: 'Check exam schedules and routines',
    icon: Calendar,
    path: '/routine',
    color: 'text-chart-2',
  },
];

export default function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAttempts: 0,
    accuracy: 0,
    recentExams: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!profile) return;

      try {
        const [progress, results] = await Promise.all([
          api.progress.getByUser(profile.id),
          api.results.getByUser(profile.id, 5, 0),
        ]);

        const totalAttempts = progress.reduce((sum, p) => sum + p.times_attempted, 0);
        const totalCorrect = progress.reduce((sum, p) => sum + p.times_correct, 0);
        const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

        setStats({
          totalAttempts,
          accuracy: Math.round(accuracy),
          recentExams: results.length,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [profile]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.username}! 👋
          </h1>
          <p className="text-muted-foreground">
            Continue your BCS exam preparation journey
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalAttempts}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{stats.accuracy}%</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recent Exams</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{stats.recentExams}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Modules</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {moduleCards.map((module) => {
              const Icon = module.icon;
              return (
                <Card
                  key={module.path}
                  className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                  onClick={() => navigate(module.path)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-accent ${module.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{module.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {profile?.role === 'admin' && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Admin Access</CardTitle>
              <CardDescription>
                Manage content, users, and view analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/admin')}>
                Go to Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
