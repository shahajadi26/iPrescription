import { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Download, FileText } from 'lucide-react';
import { api } from '@/db/api';
import { Routine } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function RoutinePage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    try {
      const data = await api.routines.getAll();
      setRoutines(data);
    } catch (error) {
      console.error('Failed to load routines:', error);
      toast.error('Failed to load routines');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (pdfUrl: string, title: string) => {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${title}.pdf`;
    a.target = '_blank';
    a.click();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Routine</h1>
          <p className="text-muted-foreground">
            Check exam schedules and class routines
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 bg-muted" />
                  <Skeleton className="h-4 w-1/2 bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : routines.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No routines available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {routines.map((routine) => (
              <Card key={routine.id}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary text-primary-foreground shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{routine.title}</CardTitle>
                      {routine.effective_date && (
                        <CardDescription>
                          {format(new Date(routine.effective_date), 'MMM dd, yyyy')}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {routine.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {routine.description}
                    </p>
                  )}
                  {routine.pdf_url && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleDownload(routine.pdf_url!, routine.title)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
