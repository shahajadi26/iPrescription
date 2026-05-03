-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  notification_type text DEFAULT 'general' CHECK (notification_type IN ('general', 'exam', 'routine', 'announcement')),
  is_published boolean DEFAULT true,
  scheduled_at timestamptz,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user notification reads table
CREATE TABLE public.user_notification_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  notification_id uuid REFERENCES notifications(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  UNIQUE(user_id, notification_id)
);

-- Create routines table
CREATE TABLE public.routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  pdf_url text,
  effective_date date,
  is_published boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Anyone can view published notifications" ON notifications
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- User notification reads policies
CREATE POLICY "Users can view their own reads" ON user_notification_reads
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own reads" ON user_notification_reads
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Routines policies
CREATE POLICY "Anyone can view published routines" ON routines
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all routines" ON routines
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_at);
CREATE INDEX idx_notification_reads_user ON user_notification_reads(user_id);
CREATE INDEX idx_routines_effective_date ON routines(effective_date);