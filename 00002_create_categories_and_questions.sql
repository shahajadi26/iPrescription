-- Create categories table with unlimited hierarchy
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  module_type text NOT NULL CHECK (module_type IN ('question_bank', 'practice', 'geographic_quiz', 'exam')),
  order_index int DEFAULT 0,
  is_published boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  module_type text NOT NULL CHECK (module_type IN ('question_bank', 'practice', 'geographic_quiz', 'exam')),
  question_text text NOT NULL,
  question_image_url text,
  option_a text NOT NULL,
  option_a_image_url text,
  option_b text NOT NULL,
  option_b_image_url text,
  option_c text NOT NULL,
  option_c_image_url text,
  option_d text NOT NULL,
  option_d_image_url text,
  correct_answer text NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation text,
  explanation_image_url text,
  is_published boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user favorites table
CREATE TABLE public.user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Create user question progress table
CREATE TABLE public.user_question_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  is_marked_for_review boolean DEFAULT false,
  times_attempted int DEFAULT 0,
  times_correct int DEFAULT 0,
  last_attempted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_progress ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Anyone can view published categories" ON categories
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all categories" ON categories
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Questions policies
CREATE POLICY "Anyone can view published questions" ON questions
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all questions" ON questions
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- User favorites policies
CREATE POLICY "Users can view their own favorites" ON user_favorites
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON user_favorites
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON user_favorites
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- User question progress policies
CREATE POLICY "Users can view their own progress" ON user_question_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress" ON user_question_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_module ON categories(module_type);
CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_module ON questions(module_type);
CREATE INDEX idx_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_progress_user ON user_question_progress(user_id);