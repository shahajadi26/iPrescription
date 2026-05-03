import { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import HierarchyTree from '@/components/HierarchyTree';
import MCQCard from '@/components/MCQCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { api } from '@/db/api';
import { Category, Question, CorrectAnswer } from '@/types';
import { toast } from 'sonner';

export default function GeographicQuizPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadQuestions(selectedCategory.id);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await api.categories.getByModule('geographic_quiz');
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (categoryId: string) => {
    try {
      const data = await api.questions.getByCategory(categoryId);
      setQuestions(data);
      setCurrentIndex(0);
      setScore(0);
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast.error('Failed to load questions');
    }
  };

  const handleAnswerSelect = async (answer: CorrectAnswer) => {
    const currentQuestion = questions[currentIndex];
    const isCorrect = answer === currentQuestion.correct_answer;

    if (isCorrect) {
      setScore(score + 1);
      toast.success('Correct! ✓');
    } else {
      toast.error('Incorrect ✗');
    }

    try {
      await api.progress.updateProgress(currentQuestion.id, isCorrect);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        toast.success(`Quiz complete! Score: ${score + (isCorrect ? 1 : 0)}/${questions.length}`);
      }
    }, 1500);
  };

  const currentQuestion = questions[currentIndex];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Geographic Quiz</h1>
          <p className="text-muted-foreground">
            Test your knowledge of geography with interactive quizzes
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-full bg-muted" />
                  ))}
                </div>
              ) : (
                <HierarchyTree
                  categories={categories}
                  onSelect={setSelectedCategory}
                  selectedId={selectedCategory?.id}
                />
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            {questions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a category to start the quiz</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        Question {currentIndex + 1} of {questions.length}
                      </Badge>
                      <Badge className="bg-success text-success-foreground">
                        Score: {score} / {questions.length}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <MCQCard
                  question={currentQuestion}
                  showAnswer={false}
                  onAnswerSelect={handleAnswerSelect}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
