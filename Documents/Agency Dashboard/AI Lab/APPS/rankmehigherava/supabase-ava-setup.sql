-- AVA TRAINING SYSTEM - DATABASE SETUP
-- Run this in your Supabase SQL Editor

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Main knowledge base table
CREATE TABLE IF NOT EXISTS ava_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('company', 'vsl', 'reel', 'style', 'faq')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  use_count INTEGER DEFAULT 0
);

-- Training examples
CREATE TABLE IF NOT EXISTS ava_training_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  example_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  annotations JSONB DEFAULT '{}',
  performance_score DECIMAL(3,2),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage analytics
CREATE TABLE IF NOT EXISTS ava_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_id UUID REFERENCES ava_knowledge(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  relevance_score DECIMAL(3,2),
  was_helpful BOOLEAN,
  user_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training queue
CREATE TABLE IF NOT EXISTS ava_training_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_id UUID REFERENCES ava_knowledge(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('update', 'review', 'verify', 'expand')),
  reason TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  assigned_to TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON ava_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_active ON ava_knowledge(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_embedding ON ava_knowledge USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_queue_status ON ava_training_queue(status, priority);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON ava_usage_analytics(created_at);

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamps
DROP TRIGGER IF EXISTS update_knowledge_timestamp ON ava_knowledge;
CREATE TRIGGER update_knowledge_timestamp
  BEFORE UPDATE ON ava_knowledge
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_examples_timestamp ON ava_training_examples;
CREATE TRIGGER update_examples_timestamp
  BEFORE UPDATE ON ava_training_examples
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  category text,
  title text,
  content text,
  metadata jsonb,
  tags text[],
  priority text,
  use_count int,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ava_knowledge.id,
    ava_knowledge.category,
    ava_knowledge.title,
    ava_knowledge.content,
    ava_knowledge.metadata,
    ava_knowledge.tags,
    ava_knowledge.priority,
    ava_knowledge.use_count,
    1 - (ava_knowledge.embedding <=> query_embedding) as similarity
  FROM ava_knowledge
  WHERE 
    ava_knowledge.is_active = true
    AND 1 - (ava_knowledge.embedding <=> query_embedding) > match_threshold
    AND (filter_category IS NULL OR ava_knowledge.category = filter_category)
  ORDER BY ava_knowledge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Dashboard summary view
CREATE OR REPLACE VIEW ava_dashboard_summary AS
SELECT 
  (SELECT COUNT(*) FROM ava_knowledge WHERE is_active = true) as total_items,
  (SELECT MAX(updated_at) FROM ava_knowledge) as last_updated,
  (SELECT ROUND((COUNT(*)::DECIMAL / 50) * 100, 2) FROM ava_knowledge WHERE is_active = true) as coverage_score,
  (SELECT COALESCE(AVG(relevance_score), 0.0) FROM ava_usage_analytics WHERE created_at > NOW() - INTERVAL '7 days') as performance_rating,
  (SELECT COUNT(*) FROM ava_training_queue WHERE status = 'pending') as pending_queue_items;

-- Category statistics view
CREATE OR REPLACE VIEW ava_category_stats AS
SELECT 
  category,
  COUNT(*) as item_count,
  MAX(updated_at) as last_updated,
  COALESCE(AVG(use_count), 0) as avg_use_count,
  COUNT(CASE WHEN updated_at < NOW() - INTERVAL '30 days' THEN 1 END) as needs_attention_count
FROM ava_knowledge
WHERE is_active = true
GROUP BY category;

-- Enable Row Level Security (RLS)
ALTER TABLE ava_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE ava_training_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE ava_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ava_training_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your auth setup)
-- Allow authenticated users to read all knowledge
CREATE POLICY "Allow authenticated read access" ON ava_knowledge
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert" ON ava_knowledge
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON ava_knowledge
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete" ON ava_knowledge
  FOR DELETE TO authenticated USING (true);

-- Similar policies for other tables
CREATE POLICY "Allow authenticated read" ON ava_training_examples
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert" ON ava_training_examples
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read" ON ava_usage_analytics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert" ON ava_usage_analytics
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read" ON ava_training_queue
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert" ON ava_training_queue
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON ava_training_queue
  FOR UPDATE TO authenticated USING (true);

-- Insert some starter knowledge
INSERT INTO ava_knowledge (category, title, content, priority, tags) VALUES
('company', 'Company Overview', 'Rank Me Higher is a digital marketing agency specializing in SEO, local search optimization, and custom website development. We use our proprietary platform AVA (Automated Virtual Assistant) to manage websites and deliver exceptional results for our clients.', 'high', ARRAY['company', 'about', 'overview']),
('company', 'AVA Platform', 'AVA is our custom-built platform that manages client websites, handles lead capture, integrates SMS and email marketing, and provides automated reminders. It''s fully customizable and adapts to each client''s unique needs.', 'high', ARRAY['ava', 'platform', 'technology']),
('style', 'Brand Voice', 'Our brand voice is professional yet approachable, tech-forward but not overwhelming. We speak with confidence about our capabilities while remaining humble and focused on client success. We avoid jargon and explain technical concepts in simple terms.', 'high', ARRAY['brand', 'voice', 'communication']),
('faq', 'What makes AVA different?', 'AVA is our proprietary platform that we built from scratch. Unlike WordPress or other CMS platforms, AVA is completely custom, which means we can adapt it to any client need. We own the code, so there are no limitations.', 'medium', ARRAY['ava', 'faq', 'platform'])
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'AVA Training System database setup complete! ✅';
  RAISE NOTICE 'Tables created: ava_knowledge, ava_training_examples, ava_usage_analytics, ava_training_queue';
  RAISE NOTICE 'Views created: ava_dashboard_summary, ava_category_stats';
  RAISE NOTICE 'Functions created: match_knowledge()';
  RAISE NOTICE 'Starter knowledge inserted. Ready to train AVA!';
END $$;




