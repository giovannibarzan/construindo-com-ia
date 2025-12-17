-- ================================================
-- CONTACT MESSAGES SCHEMA
-- ================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread', -- 'unread', 'read', 'replied'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (send message)
CREATE POLICY "Anyone can send contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_contact_messages_status 
ON contact_messages(status);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created 
ON contact_messages(created_at DESC);
