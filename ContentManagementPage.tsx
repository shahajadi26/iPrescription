import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layouts/AppLayout';
import HierarchyTree from '@/components/HierarchyTree';
import CSVUpload from '@/components/CSVUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/db/api';
import { Category, ModuleType, Question, QuestionCSVRow } from '@/types';
import { toast } from 'sonner';

const CSV_COLUMNS = [
  'Question',
  'OptionA',
  'OptionB',
  'OptionC',
  'OptionD',
  'CorrectAnswer',
  'Explanation',
  'QuestionImageURL',
  'OptionAImageURL',
  'OptionBImageURL',
  'OptionCImageURL',
  'OptionDImageURL',
  'ExplanationImageURL',
];

export default function ContentManagementPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [moduleType, setModuleType] = useState<ModuleType>('question_bank');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', parent_id: null as string | null });
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A' as 'A' | 'B' | 'C' | 'D',
    explanation: '',
  });

  useEffect(() => {
    if (profile?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    loadCategories();
  }, [profile, navigate, moduleType]);

  const loadCategories = async () => {
    try {
      const data = await api.categories.getByModule(moduleType);
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleAddCategory = (parentId: string | null) => {
    setCategoryForm({ name: '', description: '', parent_id: parentId });
    setShowCategoryDialog(true);
  };

  const handleSaveCategory = async () => {
    try {
      await api.categories.create({
        ...categoryForm,
        module_type: moduleType,
      });
      toast.success('Category created successfully');
      setShowCategoryDialog(false);
      loadCategories();
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error('Failed to create category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await api.categories.delete(categoryId);
      toast.success('Category deleted successfully');
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleSaveQuestion = async () => {
    if (!selectedCategory) {
      toast.error('Please select a category first');
      return;
    }

    try {
      await api.questions.create({
        ...questionForm,
        category_id: selectedCategory.id,
        module_type: moduleType,
      });
      toast.success('Question created successfully');
      setShowQuestionDialog(false);
      setQuestionForm({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        explanation: '',
      });
    } catch (error) {
      console.error('Failed to create question:', error);
      toast.error('Failed to create question');
    }
  };

  const handleCSVUpload = async (data: unknown[]) => {
    if (!selectedCategory) {
      toast.error('Please select a category first');
      return;
    }

    const questions = (data as QuestionCSVRow[]).map((row) => ({
      category_id: selectedCategory.id,
      module_type: moduleType,
      question_text: row.Question,
      option_a: row.OptionA,
      option_b: row.OptionB,
      option_c: row.OptionC,
      option_d: row.OptionD,
      correct_answer: row.CorrectAnswer as 'A' | 'B' | 'C' | 'D',
      explanation: row.Explanation || null,
      question_image_url: row.QuestionImageURL || null,
      option_a_image_url: row.OptionAImageURL || null,
      option_b_image_url: row.OptionBImageURL || null,
      option_c_image_url: row.OptionCImageURL || null,
      option_d_image_url: row.OptionDImageURL || null,
      explanation_image_url: row.ExplanationImageURL || null,
    }));

    try {
      await api.questions.bulkCreate(questions);
      toast.success(`${questions.length} questions uploaded successfully`);
    } catch (error) {
      console.error('Failed to upload questions:', error);
      throw error;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Content Management</h1>
          <p className="text-muted-foreground">
            Manage categories and questions for all modules
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Module</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={moduleType} onValueChange={(v) => setModuleType(v as ModuleType)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="question_bank">Question Bank</TabsTrigger>
                <TabsTrigger value="practice">Practice</TabsTrigger>
                <TabsTrigger value="geographic_quiz">Geographic Quiz</TabsTrigger>
                <TabsTrigger value="exam">Exam</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <HierarchyTree
                categories={categories}
                onAddChild={handleAddCategory}
                onDelete={handleDeleteCategory}
                onSelect={setSelectedCategory}
                selectedId={selectedCategory?.id}
                isAdmin
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Question</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedCategory ? (
                  <p className="text-muted-foreground text-center py-4">
                    Select a category to add questions
                  </p>
                ) : (
                  <>
                    <Button onClick={() => setShowQuestionDialog(true)} className="w-full">
                      Add Question Manually
                    </Button>
                    <CSVUpload
                      onUpload={handleCSVUpload}
                      templateColumns={CSV_COLUMNS}
                      moduleName={moduleType}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
              <DialogDescription>Create a new category for {moduleType}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCategory}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Question</DialogTitle>
              <DialogDescription>Create a new question manually</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="optionA">Option A</Label>
                  <Input
                    id="optionA"
                    value={questionForm.option_a}
                    onChange={(e) => setQuestionForm({ ...questionForm, option_a: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="optionB">Option B</Label>
                  <Input
                    id="optionB"
                    value={questionForm.option_b}
                    onChange={(e) => setQuestionForm({ ...questionForm, option_b: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="optionC">Option C</Label>
                  <Input
                    id="optionC"
                    value={questionForm.option_c}
                    onChange={(e) => setQuestionForm({ ...questionForm, option_c: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="optionD">Option D</Label>
                  <Input
                    id="optionD"
                    value={questionForm.option_d}
                    onChange={(e) => setQuestionForm({ ...questionForm, option_d: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="correct">Correct Answer</Label>
                <Select
                  value={questionForm.correct_answer}
                  onValueChange={(v) => setQuestionForm({ ...questionForm, correct_answer: v as 'A' | 'B' | 'C' | 'D' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="explanation">Explanation</Label>
                <Textarea
                  id="explanation"
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveQuestion}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
