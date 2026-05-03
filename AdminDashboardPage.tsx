import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Users, Settings, BarChart3, FileText, Bell, Calendar } from 'lucide-react';
import { api } from '@/db/api';

const adminModules = [
  {
    title: 'Content Management',
    description: 'Manage questions, categories, and exams',
    icon: FileText,
    path: '/admin/content',
    color: 'text-primary',
  },
  {
    title: 'User Management',
    description: 'Manage user accounts and roles',
    icon: Users,
    path: '/admin/users',
    color: 'text-secondary',
  },
  {
    title: 'Analytics',
    description: 'View system analytics and reports',
    icon: BarChart3,
    path: '/admin/analytics',
    color: 'text-chart-1',
  },
  {
    title: 'Notifications',
    description: 'Create and manage notifications',
    icon: Bell,
    path: '/admin/notifications',
    color: 'text-chart-5',
  },
  {
    title: 'Routines',
    description: 'Manage exam schedules and routines',
    icon: Calendar,
    path: '/admin/routines',
    color: 'text-chart-2',
  },
  {
    title: 'System Settings',
    description: 'Configure system settings',
    icon: Settings,
    path: '/admin/settings',
    color: 'text-chart-4',
  },
];

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalExams: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    loadStats();
  }, [profile, navigate]);

  const loadStats = async () => {
    try {
      const [users, questions, exams] = await Promise.all([
        api.profiles.getAll(100, 0),
        api.questions.getByModule('question_bank', 1, 0),
        api.exams.getAll(1, 0),
      ]);

      setStats({
        totalUsers: users.length,
        totalQuestions: questions.length,
        totalExams: exams.length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary text-primary-foreground">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your BCS Exam Prep platform
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalExams}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Admin Modules</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {adminModules.map((module) => {
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
      </div>
    </AppLayout>
  );
}
