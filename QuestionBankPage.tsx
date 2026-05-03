import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layouts/AppLayout';
import HierarchyTree from '@/components/HierarchyTree';
import MCQCard from '@/components/MCQCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { api } from '@/db/api';
import { Category, Question } from '@/types';
import { toast } from 'sonner';

export default function QuestionBankPage() {
  const { profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);

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
      const data = await api.categories.getByModule('question_bank');
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (categoryId: string) => {
    setQuestionsLoading(true);
    try {
      const data = await api.questions.getByCategory(categoryId);
      setQuestions(data);
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      if (selectedCategory) {
        loadQuestions(selectedCategory.id);
      }
      return;
    }

    setQuestionsLoading(true);
    try {
      const data = await api.questions.search(searchTerm, 'question_bank');
      setQuestions(data);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleFavorite = async (questionId: string) => {
    try {
      await api.favorites.toggle(questionId);
      toast.success('Favorite updated');
    } catch (error) {
      console.error('Failed to update favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const handleMarkReview = async (questionId: string) => {
    try {
      await api.progress.updateProgress(questionId, false, true);
      toast.success('Marked for review');
    } catch (error) {
      console.error('Failed to mark for review:', error);
      toast.error('Failed to mark for review');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Question Bank</h1>
          <p className="text-muted-foreground">
            Browse and study questions organized by categories
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
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch}>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {questionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-40 w-full bg-muted" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : questions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  {selectedCategory
                    ? 'No questions in this category yet'
                    : 'Select a category to view questions'}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <MCQCard
                    key={question.id}
                    question={question}
                    showAnswer={false}
                    onFavorite={() => handleFavorite(question.id)}
                    onMarkReview={() => handleMarkReview(question.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
