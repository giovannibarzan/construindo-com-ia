-- ================================================
-- MIGRATION: Add Premium Controls to Course System
-- ================================================

-- Add is_premium column to course_modules
ALTER TABLE course_modules 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Add is_premium column to course_lessons
ALTER TABLE course_lessons
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Create course_progress table
CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_course_progress_user 
ON course_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_course_progress_course 
ON course_progress(course_id);

-- Enable RLS
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own progress" ON course_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON course_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON course_progress;

-- Create RLS policies
CREATE POLICY "Users can view own progress"
  ON course_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON course_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON course_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Verification
SELECT 'Migration completed successfully!' as status;
