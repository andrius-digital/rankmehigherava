-- Telegram Live Chat Integration
-- Tracks conversations between website visitors and you via Telegram

-- Table to store active chat sessions
CREATE TABLE IF NOT EXISTS telegram_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL, -- Browser session identifier
  telegram_message_id BIGINT, -- Last Telegram message ID for threading
  page_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- Table to store chat messages
CREATE TABLE IF NOT EXISTS telegram_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES telegram_chat_sessions(session_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'owner')), -- 'user' = website visitor, 'owner' = you on Telegram
  content TEXT NOT NULL,
  telegram_message_id BIGINT, -- Telegram message ID if from Telegram
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast session lookups
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_session_id ON telegram_chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_active ON telegram_chat_sessions(is_active) WHERE is_active = true;

-- Index for fast message lookups
CREATE INDEX IF NOT EXISTS idx_telegram_messages_session ON telegram_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_unread ON telegram_chat_messages(session_id, is_read) WHERE is_read = false;

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE telegram_chat_messages;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_telegram_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
DROP TRIGGER IF EXISTS trigger_update_telegram_session_timestamp ON telegram_chat_sessions;
CREATE TRIGGER trigger_update_telegram_session_timestamp
  BEFORE UPDATE ON telegram_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_telegram_session_timestamp();

-- RLS Policies (allow public access for chat functionality)
ALTER TABLE telegram_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow insert/select for anonymous users (website visitors)
CREATE POLICY "Allow public insert on telegram_chat_sessions" 
  ON telegram_chat_sessions FOR INSERT 
  TO anon WITH CHECK (true);

CREATE POLICY "Allow public select own session" 
  ON telegram_chat_sessions FOR SELECT 
  TO anon USING (true);

CREATE POLICY "Allow public update own session" 
  ON telegram_chat_sessions FOR UPDATE 
  TO anon USING (true);

CREATE POLICY "Allow public insert on telegram_chat_messages" 
  ON telegram_chat_messages FOR INSERT 
  TO anon WITH CHECK (true);

CREATE POLICY "Allow public select messages" 
  ON telegram_chat_messages FOR SELECT 
  TO anon USING (true);

CREATE POLICY "Allow public update messages" 
  ON telegram_chat_messages FOR UPDATE 
  TO anon USING (true);

-- Service role full access
CREATE POLICY "Service role full access sessions" 
  ON telegram_chat_sessions FOR ALL 
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access messages" 
  ON telegram_chat_messages FOR ALL 
  TO service_role USING (true) WITH CHECK (true);



