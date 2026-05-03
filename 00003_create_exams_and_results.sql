-- Create exams table
CREATE TABLE public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  exam_type text NOT NULL CHECK (exam_type IN ('full', 'custom')),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  time_limit_minutes int,
  question_count int NOT NULL,
  positive_marks decimal(5,2) DEFAULT 1.0,
  negative_marks decimal(5,2) DEFAULT 0.0,
  is_published boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create exam questions junction table
CREATE TABLE public.exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  order_index int DEFAULT 0,
  UNIQUE(exam_id, question_id)
);

-- Create exam results table
CREATE TABLE public.exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  score decimal(10,2) NOT NULL,
  total_questions int NOT NULL,
  correct_answers int NOT NULL,
  wrong_answers int NOT NULL,
  unanswered int NOT NULL,
  time_taken_minutes int,
  rank int,
  started_at timestamptz NOT NULL,
  completed_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create exam answers table
CREATE TABLE public.exam_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id uuid REFERENCES exam_results(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  user_answer text CHECK (user_answer IN ('A', 'B', 'C', 'D') OR user_answer IS NULL),
  is_correct boolean,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;

-- Exams policies
CREATE POLICY "Anyone can view published exams" ON exams
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all exams" ON exams
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Exam questions policies
CREATE POLICY "Anyone can view exam questions" ON exam_questions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage exam questions" ON exam_questions
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Exam results policies
CREATE POLICY "Users can view their own results" ON exam_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own results" ON exam_results
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all results" ON exam_results
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Exam answers policies
CREATE POLICY "Users can view their own answers" ON exam_answers
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM exam_results er
      WHERE er.id = exam_answers.result_id AND er.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own answers" ON exam_answers
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM exam_results er
      WHERE er.id = exam_answers.result_id AND er.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all answers" ON exam_answers
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_exams_category ON exams(category_id);
CREATE INDEX idx_exam_questions_exam ON exam_questions(exam_id);
CREATE INDEX idx_exam_results_user ON exam_results(user_id);
CREATE INDEX idx_exam_results_exam ON exam_results(exam_id);
CREATE INDEX idx_exam_answers_result ON exam_answers(result_id);