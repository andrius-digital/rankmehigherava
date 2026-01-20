-- Create table for storing Vapi voice call data
CREATE TABLE IF NOT EXISTS public.ava_voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vapi call information
  vapi_call_id TEXT UNIQUE,
  assistant_id TEXT,
  
  -- Caller/Lead information
  caller_phone TEXT,
  caller_email TEXT,
  caller_name TEXT,
  
  -- Call details
  call_status TEXT DEFAULT 'initiated', -- initiated, active, completed, failed
  call_duration_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  
  -- Conversation data
  transcript JSONB, -- Store full conversation transcript
  summary TEXT, -- AI-generated summary of the call
  sentiment TEXT, -- positive, neutral, negative
  
  -- Lead qualification
  is_qualified_lead BOOLEAN DEFAULT false,
  lead_score INTEGER DEFAULT 0, -- 0-100
  interested_in_services TEXT[], -- Array of services mentioned
  
  -- Business information captured
  business_name TEXT,
  business_website TEXT,
  business_phone TEXT,
  
  -- Follow-up
  needs_follow_up BOOLEAN DEFAULT false,
  follow_up_notes TEXT,
  follow_up_scheduled_at TIMESTAMPTZ,
  
  -- Metadata
  call_recording_url TEXT,
  metadata JSONB, -- Store any additional Vapi metadata
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for storing individual messages in calls
CREATE TABLE IF NOT EXISTS public.ava_voice_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES public.ava_voice_calls(id) ON DELETE CASCADE,
  
  -- Message details
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  
  -- Audio/Speech details
  duration_seconds NUMERIC,
  confidence_score NUMERIC, -- Transcription confidence (0-1)
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ava_voice_calls_vapi_call_id ON public.ava_voice_calls(vapi_call_id);
CREATE INDEX IF NOT EXISTS idx_ava_voice_calls_status ON public.ava_voice_calls(call_status);
CREATE INDEX IF NOT EXISTS idx_ava_voice_calls_started_at ON public.ava_voice_calls(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ava_voice_calls_qualified_lead ON public.ava_voice_calls(is_qualified_lead);
CREATE INDEX IF NOT EXISTS idx_ava_voice_messages_call_id ON public.ava_voice_messages(call_id);

-- Enable RLS
ALTER TABLE public.ava_voice_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ava_voice_messages ENABLE ROW LEVEL SECURITY;

-- Create policies (allow authenticated users to access)
CREATE POLICY "Enable all for authenticated users" ON public.ava_voice_calls 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON public.ava_voice_messages 
  FOR ALL USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_ava_voice_calls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_ava_voice_calls_updated_at
  BEFORE UPDATE ON public.ava_voice_calls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ava_voice_calls_updated_at();

-- Create view for recent qualified leads from voice calls
CREATE OR REPLACE VIEW public.ava_qualified_voice_leads AS
SELECT 
  id,
  caller_name,
  caller_email,
  caller_phone,
  business_name,
  business_website,
  interested_in_services,
  lead_score,
  call_duration_seconds,
  summary,
  started_at,
  needs_follow_up,
  follow_up_notes
FROM public.ava_voice_calls
WHERE is_qualified_lead = true
ORDER BY started_at DESC;





