import { supabase } from '@/integrations/supabase/client';

// Types
export interface Reseller {
    id: string;
    user_id: string | null;
    name: string;
    email: string;
    phone: string | null;
    company_name: string | null;
    website_url: string | null;
    commission_rate: number;
    status: 'active' | 'pending' | 'suspended' | 'inactive';
    notes: string | null;
    total_revenue: number;
    total_commission_paid: number;
    created_at: string;
    updated_at: string;
    onboarded_at: string | null;
    last_login_at: string | null;
}

export interface ResellerClient {
    id: string;
    reseller_id: string;
    client_id: string;
    monthly_value: number;
    status: 'active' | 'paused' | 'churned';
    assigned_at: string;
    notes: string | null;
    // Joined client data
    client?: {
        id: string;
        name: string;
        email: string | null;
        company_name: string | null;
        website_url: string | null;
        status: string;
    };
}

export interface ResellerPayout {
    id: string;
    reseller_id: string;
    amount: number;
    period_start: string;
    period_end: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    payment_method: string | null;
    payment_reference: string | null;
    notes: string | null;
    created_at: string;
    paid_at: string | null;
}

export interface ResellerStats {
    total_clients: number;
    active_clients: number;
    monthly_revenue: number;
    pending_commission: number;
}

export interface ResellerWithStats extends Reseller {
    stats?: ResellerStats;
    clients?: ResellerClient[];
}

export interface CreateResellerData {
    name: string;
    email: string;
    phone?: string;
    company_name?: string;
    website_url?: string;
    commission_rate?: number;
    notes?: string;
}

export interface UpdateResellerData {
    name?: string;
    email?: string;
    phone?: string;
    company_name?: string;
    website_url?: string;
    commission_rate?: number;
    status?: 'active' | 'pending' | 'suspended' | 'inactive';
    notes?: string;
}

// Fetch all resellers
export async function fetchResellers(): Promise<Reseller[]> {
    const { data, error } = await supabase
        .from('resellers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Reseller[];
}

// Fetch single reseller by ID
export async function fetchResellerById(id: string): Promise<Reseller | null> {
    const { data, error } = await supabase
        .from('resellers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data as Reseller;
}

// Create new reseller
export async function createReseller(data: CreateResellerData): Promise<Reseller> {
    const { data: reseller, error } = await supabase
        .from('resellers')
        .insert({
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            company_name: data.company_name || null,
            website_url: data.website_url || null,
            commission_rate: data.commission_rate || 30,
            notes: data.notes || null,
            status: 'pending'
        })
        .select()
        .single();

    if (error) throw error;
    return reseller as Reseller;
}

// Update reseller
export async function updateReseller(id: string, data: UpdateResellerData): Promise<Reseller> {
    const { data: reseller, error } = await supabase
        .from('resellers')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return reseller as Reseller;
}

// Delete reseller
export async function deleteReseller(id: string): Promise<void> {
    const { error } = await supabase
        .from('resellers')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// Activate reseller (set status to active and onboarded_at)
export async function activateReseller(id: string): Promise<Reseller> {
    const { data: reseller, error } = await supabase
        .from('resellers')
        .update({
            status: 'active',
            onboarded_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return reseller as Reseller;
}

// Fetch reseller's clients
export async function fetchResellerClients(resellerId: string): Promise<ResellerClient[]> {
    const { data, error } = await supabase
        .from('reseller_clients')
        .select(`
            *,
            client:clients(id, name, email, company_name, website_url, status)
        `)
        .eq('reseller_id', resellerId)
        .order('assigned_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ResellerClient[];
}

// Assign client to reseller
export async function assignClientToReseller(
    resellerId: string,
    clientId: string,
    monthlyValue: number
): Promise<ResellerClient> {
    const { data, error } = await supabase
        .from('reseller_clients')
        .insert({
            reseller_id: resellerId,
            client_id: clientId,
            monthly_value: monthlyValue,
            status: 'active'
        })
        .select()
        .single();

    if (error) throw error;
    return data as ResellerClient;
}

// Update client assignment
export async function updateResellerClient(
    id: string,
    data: { monthly_value?: number; status?: 'active' | 'paused' | 'churned'; notes?: string }
): Promise<ResellerClient> {
    const { data: client, error } = await supabase
        .from('reseller_clients')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return client as ResellerClient;
}

// Remove client from reseller
export async function removeClientFromReseller(id: string): Promise<void> {
    const { error } = await supabase
        .from('reseller_clients')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// Fetch reseller payouts
export async function fetchResellerPayouts(resellerId: string): Promise<ResellerPayout[]> {
    const { data, error } = await supabase
        .from('reseller_payouts')
        .select('*')
        .eq('reseller_id', resellerId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ResellerPayout[];
}

// Create payout
export async function createPayout(
    resellerId: string,
    amount: number,
    periodStart: string,
    periodEnd: string
): Promise<ResellerPayout> {
    const { data, error } = await supabase
        .from('reseller_payouts')
        .insert({
            reseller_id: resellerId,
            amount,
            period_start: periodStart,
            period_end: periodEnd,
            status: 'pending'
        })
        .select()
        .single();

    if (error) throw error;
    return data as ResellerPayout;
}

// Update payout status
export async function updatePayoutStatus(
    id: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    paymentReference?: string
): Promise<ResellerPayout> {
    const updateData: Record<string, unknown> = { status };
    if (status === 'completed') {
        updateData.paid_at = new Date().toISOString();
    }
    if (paymentReference) {
        updateData.payment_reference = paymentReference;
    }

    const { data, error } = await supabase
        .from('reseller_payouts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as ResellerPayout;
}

// Get reseller stats (calculated locally since we might not have the DB function)
export async function getResellerStats(resellerId: string): Promise<ResellerStats> {
    const clients = await fetchResellerClients(resellerId);
    const reseller = await fetchResellerById(resellerId);

    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'active').length;
    const monthlyRevenue = clients
        .filter(c => c.status === 'active')
        .reduce((sum, c) => sum + (c.monthly_value || 0), 0);
    const commissionRate = reseller?.commission_rate || 30;
    const pendingCommission = monthlyRevenue * (commissionRate / 100);

    return {
        total_clients: totalClients,
        active_clients: activeClients,
        monthly_revenue: monthlyRevenue,
        pending_commission: pendingCommission
    };
}

// Fetch all resellers with their stats
export async function fetchResellersWithStats(): Promise<ResellerWithStats[]> {
    const resellers = await fetchResellers();

    const resellersWithStats = await Promise.all(
        resellers.map(async (reseller) => {
            const stats = await getResellerStats(reseller.id);
            return { ...reseller, stats };
        })
    );

    return resellersWithStats;
}

// Fetch available clients (not assigned to any reseller)
export async function fetchAvailableClients(): Promise<Array<{
    id: string;
    name: string;
    email: string | null;
    company_name: string | null;
    website_url: string | null;
    status: string;
}>> {
    // First get all assigned client IDs
    const { data: assignedClients } = await supabase
        .from('reseller_clients')
        .select('client_id');

    const assignedIds = (assignedClients || []).map(c => c.client_id);

    // Then fetch clients not in that list
    let query = supabase
        .from('clients')
        .select('id, name, email, company_name, website_url, status')
        .eq('status', 'ACTIVE')
        .order('name');

    if (assignedIds.length > 0) {
        query = query.not('id', 'in', `(${assignedIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
}
