import { supabase } from './supabase';
import type {
  Profile,
  Category,
  Question,
  UserFavorite,
  UserQuestionProgress,
  Exam,
  ExamResult,
  ExamAnswer,
  Notification,
  Routine,
  ModuleType,
  CorrectAnswer,
  ExamConfig,
} from '@/types';

export const api = {
  profiles: {
    async getCurrent() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },

    async getAll(limit = 50, offset = 0) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },

    async updateRole(userId: string, role: 'student' | 'admin') {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as Profile;
    },
  },

  categories: {
    async getByModule(moduleType: ModuleType) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('module_type', moduleType)
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return this.buildHierarchy(Array.isArray(data) ? data : []);
    },

    buildHierarchy(categories: Category[]): Category[] {
      const map = new Map<string, Category>();
      const roots: Category[] = [];

      categories.forEach(cat => {
        map.set(cat.id, { ...cat, children: [] });
      });

      categories.forEach(cat => {
        const node = map.get(cat.id)!;
        if (cat.parent_id) {
          const parent = map.get(cat.parent_id);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(node);
          }
        } else {
          roots.push(node);
        }
      });

      return roots;
    },

    async create(category: Partial<Category>) {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...category,
          created_by: user?.id,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as Category;
    },

    async update(id: string, updates: Partial<Category>) {
      const { data, error } = await supabase
        .from('categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as Category;
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
  },

  questions: {
    async getByCategory(categoryId: string, limit = 50, offset = 0) {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },

    async getByModule(moduleType: ModuleType, limit = 50, offset = 0) {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('module_type', moduleType)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Question | null;
    },

    async search(searchTerm: string, moduleType?: ModuleType, limit = 50) {
      let query = supabase
        .from('questions')
        .select('*')
        .eq('is_published', true)
        .ilike('question_text', `%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (moduleType) {
        query = query.eq('module_type', moduleType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },

    async create(question: Partial<Question>) {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('questions')
        .insert({
          ...question,
          created_by: user?.id,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as Question;
    },

    async bulkCreate(questions: Partial<Question>[]) {
      const { data: { user } } = await supabase.auth.getUser();
      
      const questionsWithUser = questions.map(q => ({
        ...q,
        created_by: user?.id,
      }));

      const { data, error } = await supabase
        .from('questions')
        .insert(questionsWithUser)
        .select();

      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },

    async update(id: string, updates: Partial<Question>) {
      const { data, error } = await supabase
        .from('questions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as Question;
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
  },

  favorites: {
    async getByUser(userId: string) {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*, questions(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },

    async toggle(questionId: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
        return false;
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, question_id: questionId });

        if (error) throw error;
        return true;
      }
    },
  },

  progress: {
    async getByUser(userId: string) {
      const { data, error } = await supabase
        .from('user_question_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_attempted_at', { ascending: false });

      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },

    async updateProgress(
      questionId: string,
      isCorrect: boolean,
      isMarkedForReview?: boolean
    ) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('user_question_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .maybeSingle();

      if (existing) {
        const updates: Partial<UserQuestionProgress> = {
          times_attempted: existing.times_attempted + 1,
          times_correct: isCorrect ? existing.times_correct + 1 : existing.times_correct,
          last_attempted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (isMarkedForReview !== undefined) {
          updates.is_marked_for_review = isMarkedForReview;
        }

        const { data, error } = await supabase
          .from('user_question_progress')
          .update(updates)
          .eq('id', existing.id)
          .select()
          .maybeSingle();

        if (error) throw error;
        return data as UserQuestionProgress;
      } else {
        const { data, error } = await supabase
          .from('user_question_progress')
          .insert({
            user_id: user.id,
            question_id: questionId,
            times_attempted: 1,
            times_correct: isCorrect ? 1 : 0,
            is_marked_for_review: isMarkedForReview || false,
            last_attempted_at: new Date().toISOString(),
          })
          .select()
          .maybeSingle();

        if (error) throw error;
        return data as UserQuestionProgress;
      }
    },
  },

  exams: {
    async getAll(limit = 50, offset = 0) {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('exams')
        .select('*, exam_questions(*, questions(*))')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    async create(exam: Partial<Exam>, questionIds: string[]) {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .insert({
          ...exam,
          created_by: user?.id,
        })
        .select()
        .maybeSingle();

      if (examError) throw examError;

      const examQuestions = questionIds.map((qId, idx) => ({
        exam_id: examData.id,
        question_id: qId,
        order_index: idx,
      }));

      const { error: questionsError } = await supabase
        .from('exam_questions')
        .insert(examQuestions);

      if (questionsError) throw questionsError;

      return examData as Exam;
    },

    async generateCustomExam(config: ExamConfig) {
      let query = supabase
        .from('questions')
        .select('id')
        .eq('is_published', true)
        .eq('module_type', 'exam');

      if (config.categoryId) {
        query = query.eq('category_id', config.categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const questions = Array.isArray(data) ? data : [];
      const shuffled = questions.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, config.questionCount);

      return this.create(
        {
          title: 'Custom Exam',
          exam_type: 'custom',
          category_id: config.categoryId || null,
          time_limit_minutes: config.timeLimit || null,
          question_count: config.questionCount,
          positive_marks: config.positiveMarks,
          negative_marks: config.negativeMarks,
        },
        selected.map(q => q.id)
      );
    },
  },

  results: {
    async getByUser(userId: string, limit = 50, offset = 0) {
      const { data, error } = await supabase
        .from('exam_results')
        .select('*, exams(*)')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('exam_results')
        .select('*, exam_answers(*, questions(*))')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    async create(result: Partial<ExamResult>, answers: Partial<ExamAnswer>[]) {
      const { data: resultData, error: resultError } = await supabase
        .from('exam_results')
        .insert(result)
        .select()
        .maybeSingle();

      if (resultError) throw resultError;

      const answersWithResult = answers.map(a => ({
        ...a,
        result_id: resultData.id,
      }));

      const { error: answersError } = await supabase
        .from('exam_answers')
        .insert(answersWithResult);

      if (answersError) throw answersError;

      return resultData as ExamResult;
    },
  },

  notifications: {
    async getAll(limit = 50, offset = 0) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },

    async create(notification: Partial<Notification>) {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          created_by: user?.id,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as Notification;
    },

    async markAsRead(notificationId: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_notification_reads')
        .insert({
          user_id: user.id,
          notification_id: notificationId,
        });

      if (error && !error.message.includes('duplicate')) throw error;
    },
  },

  routines: {
    async getAll(limit = 50, offset = 0) {
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('is_published', true)
        .order('effective_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },

    async create(routine: Partial<Routine>) {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('routines')
        .insert({
          ...routine,
          created_by: user?.id,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as Routine;
    },

    async update(id: string, updates: Partial<Routine>) {
      const { data, error } = await supabase
        .from('routines')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as Routine;
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('routines')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
  },
};
