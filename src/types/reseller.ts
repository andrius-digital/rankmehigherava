// Reseller types for the white-label agency portal

export interface Reseller {
  id: string;
  name: string;
  slug: string; // URL-friendly name (e.g., 'rank-me-higher', 'local-seo-spider')
  email: string;
  phone?: string;
  logo_url?: string;
  brand_color?: string; // Primary brand color
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface ResellerClient {
  id: string;
  reseller_id: string;
  client_id: string;
  tag: string; // Reseller's custom tag for this client
  created_at: string;
}

// For creating a new reseller
export interface CreateResellerInput {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  logo_url?: string;
  brand_color?: string;
}

// For updating a reseller
export interface UpdateResellerInput {
  name?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  brand_color?: string;
  status?: 'active' | 'inactive' | 'pending';
}
