import { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Clock, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/db/api';
import { Exam } from '@/types';
import { toast } from 'sonner';

export default function ExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const data = await api.exams.getAll();
      setExams(data);
    } catch (error) {
      console.error('Failed to load exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Exams</h1>
            <p className="text-muted-foreground">
              Take full exams or create custom practice tests
            </p>
          </div>
          <Button onClick={() => navigate('/exams/custom')}>
            Create Custom Exam
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-primary cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/exams/custom')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle>Custom Exam</CardTitle>
                  <CardDescription>Configure your own exam</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Choose question count</li>
                <li>• Set time limit</li>
                <li>• Configure marking scheme</li>
                <li>• Select categories</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-secondary cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/results')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle>My Results</CardTitle>
                  <CardDescription>View your performance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track your progress and analyze your exam results
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Available Exams</h2>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
          ) : exams.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No exams available yet. Create a custom exam to get started!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam) => (
                <Card
                  key={exam.id}
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => navigate(`/exams/${exam.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{exam.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {exam.description || 'No description'}
                        </CardDescription>
                      </div>
                      <Badge variant={exam.exam_type === 'full' ? 'default' : 'secondary'}>
                        {exam.exam_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>{exam.question_count} Questions</span>
                    </div>
                    {exam.time_limit_minutes && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{exam.time_limit_minutes} Minutes</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-success">+{exam.positive_marks}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-destructive">-{exam.negative_marks}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
