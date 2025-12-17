-- ================================================
-- TOOL DISCUSSIONS SCHEMA
-- ================================================

CREATE TABLE IF NOT EXISTS tool_discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  parent_id UUID REFERENCES tool_discussions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tool_discussions ENABLE ROW LEVEL SECURITY;

-- Anyone can view discussions
CREATE POLICY "Anyone can view tool discussions"
  ON tool_discussions FOR SELECT
  USING (true);

-- Authenticated users can send messages
CREATE POLICY "Authenticated users can send messages"
  ON tool_discussions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
  ON tool_discussions FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tool_discussions_tool 
ON tool_discussions(tool_id);

CREATE INDEX IF NOT EXISTS idx_tool_discussions_user 
ON tool_discussions(user_id);

CREATE INDEX IF NOT EXISTS idx_tool_discussions_parent 
ON tool_discussions(parent_id);

CREATE INDEX IF NOT EXISTS idx_tool_discussions_created 
ON tool_discussions(created_at DESC);
