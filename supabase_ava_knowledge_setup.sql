-- Create the ava_knowledge table for AVA Training System
CREATE TABLE IF NOT EXISTS public.ava_knowledge (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('company', 'vsl', 'reel', 'style', 'faq')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding TEXT, -- Store as JSON string for now
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    use_count INTEGER DEFAULT 0
);

-- Create the ava_training_queue table
CREATE TABLE IF NOT EXISTS public.ava_training_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    knowledge_id UUID REFERENCES public.ava_knowledge(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('update', 'review', 'verify', 'expand')),
    reason TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
    assigned_to TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.ava_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ava_training_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable all access for authenticated users" ON public.ava_knowledge
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" ON public.ava_training_queue
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ava_knowledge_category ON public.ava_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_ava_knowledge_is_active ON public.ava_knowledge(is_active);
CREATE INDEX IF NOT EXISTS idx_ava_training_queue_status ON public.ava_training_queue(status);
CREATE INDEX IF NOT EXISTS idx_ava_training_queue_knowledge_id ON public.ava_training_queue(knowledge_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ava_knowledge_updated_at
    BEFORE UPDATE ON public.ava_knowledge
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();




