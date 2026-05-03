export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export type UserRole = 'student' | 'admin';

export interface Profile {
  id: string;
  email: string | null;
  username: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type ModuleType = 'question_bank' | 'practice' | 'geographic_quiz' | 'exam';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  module_type: ModuleType;
  order_index: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

export type CorrectAnswer = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: string;
  category_id: string | null;
  module_type: ModuleType;
  question_text: string;
  question_image_url: string | null;
  option_a: string;
  option_a_image_url: string | null;
  option_b: string;
  option_b_image_url: string | null;
  option_c: string;
  option_c_image_url: string | null;
  option_d: string;
  option_d_image_url: string | null;
  correct_answer: CorrectAnswer;
  explanation: string | null;
  explanation_image_url: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  question_id: string;
  created_at: string;
}

export interface UserQuestionProgress {
  id: string;
  user_id: string;
  question_id: string;
  is_marked_for_review: boolean;
  times_attempted: number;
  times_correct: number;
  last_attempted_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ExamType = 'full' | 'custom';

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  exam_type: ExamType;
  category_id: string | null;
  time_limit_minutes: number | null;
  question_count: number;
  positive_marks: number;
  negative_marks: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExamQuestion {
  id: string;
  exam_id: string;
  question_id: string;
  order_index: number;
}

export interface ExamResult {
  id: string;
  exam_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  time_taken_minutes: number | null;
  rank: number | null;
  started_at: string;
  completed_at: string;
  created_at: string;
}

export interface ExamAnswer {
  id: string;
  result_id: string;
  question_id: string;
  user_answer: CorrectAnswer | null;
  is_correct: boolean | null;
  created_at: string;
}

export type NotificationType = 'general' | 'exam' | 'routine' | 'announcement';

export interface Notification {
  id: string;
  title: string;
  content: string;
  notification_type: NotificationType;
  is_published: boolean;
  scheduled_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserNotificationRead {
  id: string;
  user_id: string;
  notification_id: string;
  read_at: string;
}

export interface Routine {
  id: string;
  title: string;
  description: string | null;
  pdf_url: string | null;
  effective_date: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionCSVRow {
  Question: string;
  OptionA: string;
  OptionB: string;
  OptionC: string;
  OptionD: string;
  CorrectAnswer: string;
  Explanation: string;
  QuestionImageURL?: string;
  OptionAImageURL?: string;
  OptionBImageURL?: string;
  OptionCImageURL?: string;
  OptionDImageURL?: string;
  ExplanationImageURL?: string;
}

export interface ExamConfig {
  categoryId?: string;
  timeLimit?: number;
  questionCount: number;
  positiveMarks: number;
  negativeMarks: number;
  subjectIds?: string[];
}

export interface AnalyticsData {
  mostAttemptedQuestions: Array<Question & { attempt_count: number }>;
  mostWrongQuestions: Array<Question & { wrong_count: number }>;
  userPerformance: {
    totalAttempts: number;
    correctAnswers: number;
    accuracy: number;
  };
  moduleUsage: Array<{
    module_type: ModuleType;
    usage_count: number;
  }>;
}
