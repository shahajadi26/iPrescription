import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, TrendingUp, Award, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/db/api';
import { ExamResult } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ResultsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadResults();
    }
  }, [profile]);

  const loadResults = async () => {
    if (!profile) return;

    try {
      const data = await api.results.getByUser(profile.id);
      setResults(data);
    } catch (error) {
      console.error('Failed to load results:', error);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageScore = () => {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, r) => sum + r.score, 0);
    return Math.round(total / results.length);
  };

  const calculateAccuracy = () => {
    if (results.length === 0) return 0;
    const totalQuestions = results.reduce((sum, r) => sum + r.total_questions, 0);
    const totalCorrect = results.reduce((sum, r) => sum + r.correct_answers, 0);
    return Math.round((totalCorrect / totalQuestions) * 100);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-chart-3';
    if (percentage >= 40) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Results</h1>
          <p className="text-muted-foreground">
            Track your exam performance and progress
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{results.length}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{calculateAverageScore()}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <Award className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{calculateAccuracy()}%</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Exam History</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 bg-muted" />
                    <Skeleton className="h-4 w-1/2 bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : results.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">No exam results yet</p>
                <Button onClick={() => navigate('/exams')}>
                  Take Your First Exam
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {results.map((result) => {
                const percentage = Math.round((result.score / (result.total_questions * 1)) * 100);
                return (
                  <Card
                    key={result.id}
                    className="cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => navigate(`/results/${result.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            Exam Result
                          </CardTitle>
                          <CardDescription>
                            {format(new Date(result.completed_at), 'MMM dd, yyyy • HH:mm')}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className={getScoreColor(percentage)}>
                          {percentage}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Score</p>
                          <p className="font-semibold text-lg">{result.score}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Correct</p>
                          <p className="font-semibold text-lg text-success">
                            {result.correct_answers}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Wrong</p>
                          <p className="font-semibold text-lg text-destructive">
                            {result.wrong_answers}
                          </p>
                        </div>
                        {result.time_taken_minutes && (
                          <div>
                            <p className="text-muted-foreground">Time</p>
                            <p className="font-semibold text-lg flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {result.time_taken_minutes}m
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
