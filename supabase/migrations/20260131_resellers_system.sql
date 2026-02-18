-- Resellers management system for admin to track reseller partners
-- Each reseller gets their own account and can see agency view with their assigned clients

-- Create resellers table
CREATE TABLE IF NOT EXISTS resellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    company_name TEXT,
    website_url TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 30.00,
    status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended', 'inactive')),
    notes TEXT,
    -- Financial tracking
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_commission_paid DECIMAL(12,2) DEFAULT 0,
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    onboarded_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create reseller_clients junction table to assign clients to resellers
CREATE TABLE IF NOT EXISTS reseller_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reseller_id UUID NOT NULL REFERENCES resellers(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    monthly_value DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'churned')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    UNIQUE(reseller_id, client_id)
);

-- Create reseller_payouts table to track commission payments
CREATE TABLE IF NOT EXISTS reseller_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reseller_id UUID NOT NULL REFERENCES resellers(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    payment_method TEXT,
    payment_reference TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Create reseller_activity_log for tracking important events
CREATE TABLE IF NOT EXISTS reseller_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reseller_id UUID NOT NULL REFERENCES resellers(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_resellers_status ON resellers(status);
CREATE INDEX IF NOT EXISTS idx_resellers_email ON resellers(email);
CREATE INDEX IF NOT EXISTS idx_reseller_clients_reseller ON reseller_clients(reseller_id);
CREATE INDEX IF NOT EXISTS idx_reseller_clients_client ON reseller_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_reseller_payouts_reseller ON reseller_payouts(reseller_id);
CREATE INDEX IF NOT EXISTS idx_reseller_payouts_status ON reseller_payouts(status);
CREATE INDEX IF NOT EXISTS idx_reseller_activity_reseller ON reseller_activity_log(reseller_id);

-- Enable RLS
ALTER TABLE resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reseller_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reseller_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reseller_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resellers table
-- Admin can see all resellers
CREATE POLICY "Admin can view all resellers" ON resellers
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- Admin can insert resellers
CREATE POLICY "Admin can insert resellers" ON resellers
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- Admin can update resellers
CREATE POLICY "Admin can update resellers" ON resellers
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- Admin can delete resellers
CREATE POLICY "Admin can delete resellers" ON resellers
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- Reseller can view their own record
CREATE POLICY "Reseller can view own record" ON resellers
    FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for reseller_clients table
CREATE POLICY "Admin can manage reseller_clients" ON reseller_clients
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
    );

CREATE POLICY "Reseller can view own clients" ON reseller_clients
    FOR SELECT USING (
        reseller_id IN (SELECT id FROM resellers WHERE user_id = auth.uid())
    );

-- RLS Policies for reseller_payouts table
CREATE POLICY "Admin can manage reseller_payouts" ON reseller_payouts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
    );

CREATE POLICY "Reseller can view own payouts" ON reseller_payouts
    FOR SELECT USING (
        reseller_id IN (SELECT id FROM resellers WHERE user_id = auth.uid())
    );

-- RLS Policies for reseller_activity_log table
CREATE POLICY "Admin can view all activity" ON reseller_activity_log
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
    );

CREATE POLICY "Admin can insert activity" ON reseller_activity_log
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
    );

CREATE POLICY "Reseller can view own activity" ON reseller_activity_log
    FOR SELECT USING (
        reseller_id IN (SELECT id FROM resellers WHERE user_id = auth.uid())
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reseller_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS resellers_updated_at ON resellers;
CREATE TRIGGER resellers_updated_at
    BEFORE UPDATE ON resellers
    FOR EACH ROW
    EXECUTE FUNCTION update_reseller_updated_at();

-- Function to calculate reseller stats
CREATE OR REPLACE FUNCTION get_reseller_stats(p_reseller_id UUID)
RETURNS TABLE (
    total_clients BIGINT,
    active_clients BIGINT,
    monthly_revenue DECIMAL,
    pending_commission DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(rc.id)::BIGINT as total_clients,
        COUNT(rc.id) FILTER (WHERE rc.status = 'active')::BIGINT as active_clients,
        COALESCE(SUM(rc.monthly_value), 0)::DECIMAL as monthly_revenue,
        COALESCE(SUM(rc.monthly_value) * (SELECT commission_rate FROM resellers WHERE id = p_reseller_id) / 100, 0)::DECIMAL as pending_commission
    FROM reseller_clients rc
    WHERE rc.reseller_id = p_reseller_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
