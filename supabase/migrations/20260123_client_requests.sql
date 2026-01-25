-- Client adjustment requests table
-- Tracks requests from clients for website changes/adjustments
CREATE TABLE IF NOT EXISTS client_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    estimated_hours DECIMAL(5,2) DEFAULT 0,
    actual_hours DECIMAL(5,2) DEFAULT 0,
    billable BOOLEAN DEFAULT false,
    hourly_rate DECIMAL(10,2) DEFAULT 100.00,
    -- Request type
    request_type TEXT DEFAULT 'adjustment' CHECK (request_type IN ('adjustment', 'bug_fix', 'new_feature', 'content_update', 'design_change', 'other')),
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    -- Agency response
    agency_notes TEXT DEFAULT '',
    assigned_to TEXT DEFAULT '',
    -- Client feedback
    client_feedback TEXT DEFAULT '',
    client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5)
);

-- Client request messages/comments
CREATE TABLE IF NOT EXISTS client_request_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES client_requests(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'agency')),
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client free hours allocation (1 hour free per month)
CREATE TABLE IF NOT EXISTS client_free_hours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    month_year TEXT NOT NULL, -- Format: '2026-01'
    free_hours_total DECIMAL(5,2) DEFAULT 1.00,
    free_hours_used DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, month_year)
);

-- Enable RLS
ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_request_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_free_hours ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_requests
CREATE POLICY "Client requests are viewable by everyone" ON client_requests
    FOR SELECT USING (true);

CREATE POLICY "Client requests are insertable by authenticated users" ON client_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Client requests are updatable by authenticated users" ON client_requests
    FOR UPDATE USING (true);

CREATE POLICY "Client requests are deletable by authenticated users" ON client_requests
    FOR DELETE USING (true);

-- RLS policies for client_request_messages
CREATE POLICY "Request messages are viewable by everyone" ON client_request_messages
    FOR SELECT USING (true);

CREATE POLICY "Request messages are insertable by authenticated users" ON client_request_messages
    FOR INSERT WITH CHECK (true);

-- RLS policies for client_free_hours
CREATE POLICY "Free hours are viewable by everyone" ON client_free_hours
    FOR SELECT USING (true);

CREATE POLICY "Free hours are insertable by authenticated users" ON client_free_hours
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Free hours are updatable by authenticated users" ON client_free_hours
    FOR UPDATE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_requests_client_id ON client_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_status ON client_requests(status);
CREATE INDEX IF NOT EXISTS idx_client_request_messages_request_id ON client_request_messages(request_id);
CREATE INDEX IF NOT EXISTS idx_client_free_hours_client_id ON client_free_hours(client_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_client_requests_updated_at ON client_requests;
CREATE TRIGGER update_client_requests_updated_at
    BEFORE UPDATE ON client_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_free_hours_updated_at ON client_free_hours;
CREATE TRIGGER update_client_free_hours_updated_at
    BEFORE UPDATE ON client_free_hours
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
