-- ================================================
-- TOOL REVIEWS SCHEMA (Replaces tool_discussions)
-- ================================================

-- Drop old table if exists
DROP TABLE IF EXISTS tool_discussions CASCADE;

-- Create tool reviews table
CREATE TABLE IF NOT EXISTS tool_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

-- Create helpful votes tracking table
CREATE TABLE IF NOT EXISTS tool_review_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES tool_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Enable RLS
ALTER TABLE tool_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_review_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tool_reviews
CREATE POLICY "Anyone can view tool reviews"
  ON tool_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can submit reviews"
  ON tool_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON tool_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON tool_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for tool_review_votes
CREATE POLICY "Anyone can view votes"
  ON tool_review_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON tool_review_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own votes"
  ON tool_review_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tool_reviews_tool 
ON tool_reviews(tool_id);

CREATE INDEX IF NOT EXISTS idx_tool_reviews_user 
ON tool_reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_tool_reviews_rating 
ON tool_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_tool_reviews_helpful 
ON tool_reviews(helpful_count DESC);

CREATE INDEX IF NOT EXISTS idx_tool_review_votes_review 
ON tool_review_votes(review_id);

CREATE INDEX IF NOT EXISTS idx_tool_review_votes_user 
ON tool_review_votes(user_id);

-- Function to update helpful_count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tool_reviews 
    SET helpful_count = helpful_count + 1 
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tool_reviews 
    SET helpful_count = helpful_count - 1 
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update helpful_count
CREATE TRIGGER update_helpful_count_trigger
AFTER INSERT OR DELETE ON tool_review_votes
FOR EACH ROW
EXECUTE FUNCTION update_review_helpful_count();

-- Function to calculate tool average rating
CREATE OR REPLACE FUNCTION calculate_tool_rating(tool_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT ROUND(AVG(rating)::numeric, 1)
  INTO avg_rating
  FROM tool_reviews
  WHERE tool_id = tool_uuid;
  
  RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;
