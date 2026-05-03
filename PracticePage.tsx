import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layouts/AppLayout';
import HierarchyTree from '@/components/HierarchyTree';
import MCQCard from '@/components/MCQCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/db/api';
import { Category, Question, CorrectAnswer } from '@/types';
import { toast } from 'sonner';

export default function PracticePage() {
  const { profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, CorrectAnswer>>(new Map());
  const [mode, setMode] = useState<'practice' | 'exam'>('practice');
  const [showResults, setShowResults] = useState(false);
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
      const data = await api.categories.getByModule('practice');
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
      setUserAnswers(new Map());
      setShowResults(false);
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast.error('Failed to load questions');
    }
  };

  const handleAnswerSelect = async (answer: CorrectAnswer) => {
    const currentQuestion = questions[currentIndex];
    const newAnswers = new Map(userAnswers);
    newAnswers.set(currentQuestion.id, answer);
    setUserAnswers(newAnswers);

    const isCorrect = answer === currentQuestion.correct_answer;
    
    try {
      await api.progress.updateProgress(currentQuestion.id, isCorrect);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }

    if (mode === 'practice') {
      toast.success(isCorrect ? 'Correct! ✓' : 'Incorrect ✗');
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      const userAnswer = userAnswers.get(q.id);
      if (userAnswer === q.correct_answer) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    };
  };

  const currentQuestion = questions[currentIndex];
  const userAnswer = currentQuestion ? userAnswers.get(currentQuestion.id) : null;
  const showAnswer = mode === 'practice' && userAnswer !== undefined;

  if (showResults) {
    const score = calculateScore();
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Practice Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-primary">{score.percentage}%</div>
                <p className="text-xl">
                  {score.correct} out of {score.total} correct
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowResults(false);
                    setCurrentIndex(0);
                    setUserAnswers(new Map());
                  }}
                >
                  Review Answers
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowResults(false);
                    setCurrentIndex(0);
                    setUserAnswers(new Map());
                    if (selectedCategory) {
                      loadQuestions(selectedCategory.id);
                    }
                  }}
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Practice Questions</h1>
          <p className="text-muted-foreground">
            Practice with instant feedback or exam mode
          </p>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'practice' | 'exam')}>
          <TabsList>
            <TabsTrigger value="practice">Practice Mode</TabsTrigger>
            <TabsTrigger value="exam">Exam Mode</TabsTrigger>
          </TabsList>
        </Tabs>

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
                  Select a category to start practicing
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">
                        Question {currentIndex + 1} of {questions.length}
                      </Badge>
                      <Badge>
                        {userAnswers.size} / {questions.length} Answered
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <MCQCard
                  question={currentQuestion}
                  showAnswer={showAnswer}
                  userAnswer={userAnswer}
                  onAnswerSelect={handleAnswerSelect}
                  showExplanation={showAnswer}
                />

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="flex-1"
                      >
                        Previous
                      </Button>
                      {currentIndex === questions.length - 1 ? (
                        <Button onClick={handleFinish} className="flex-1">
                          Finish
                        </Button>
                      ) : (
                        <Button onClick={handleNext} className="flex-1">
                          Next
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
