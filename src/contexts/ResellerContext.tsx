import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Reseller, CreateResellerInput, UpdateResellerInput, ResellerClient } from '@/types/reseller';

// Initial resellers as requested
const INITIAL_RESELLERS: Reseller[] = [
  {
    id: 'reseller-rmh-001',
    name: 'Rank Me Higher',
    slug: 'rank-me-higher',
    email: 'admin@rankmehigher.com',
    phone: '',
    logo_url: '',
    brand_color: '#00D4FF',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'reseller-lss-002',
    name: 'Local SEO Spider',
    slug: 'local-seo-spider',
    email: 'admin@localseospider.com',
    phone: '',
    logo_url: '',
    brand_color: '#8B5CF6',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

interface ResellerContextType {
  resellers: Reseller[];
  currentReseller: Reseller | null;
  resellerClients: ResellerClient[];
  isLoading: boolean;

  // Admin functions
  createReseller: (input: CreateResellerInput) => Promise<Reseller>;
  updateReseller: (id: string, input: UpdateResellerInput) => Promise<Reseller | null>;
  deleteReseller: (id: string) => Promise<boolean>;
  getResellerBySlug: (slug: string) => Reseller | null;
  getResellerById: (id: string) => Reseller | null;

  // Reseller functions
  setCurrentReseller: (reseller: Reseller | null) => void;
  tagClient: (resellerId: string, clientId: string, tag: string) => Promise<ResellerClient>;
  untagClient: (resellerId: string, clientId: string) => Promise<boolean>;
  getClientsByReseller: (resellerId: string) => ResellerClient[];
  getResellerTag: (resellerId: string, clientId: string) => string | null;
}

const ResellerContext = createContext<ResellerContextType | undefined>(undefined);

const STORAGE_KEY = 'ava_resellers';
const CLIENTS_STORAGE_KEY = 'ava_reseller_clients';

export const ResellerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [currentReseller, setCurrentReseller] = useState<Reseller | null>(null);
  const [resellerClients, setResellerClients] = useState<ResellerClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load resellers from localStorage on mount
  useEffect(() => {
    const loadResellers = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setResellers(parsed);
        } else {
          // Initialize with default resellers
          setResellers(INITIAL_RESELLERS);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RESELLERS));
        }

        const storedClients = localStorage.getItem(CLIENTS_STORAGE_KEY);
        if (storedClients) {
          setResellerClients(JSON.parse(storedClients));
        }
      } catch (error) {
        console.error('Error loading resellers:', error);
        setResellers(INITIAL_RESELLERS);
      } finally {
        setIsLoading(false);
      }
    };

    loadResellers();
  }, []);

  // Save resellers to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && resellers.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resellers));
    }
  }, [resellers, isLoading]);

  // Save reseller clients to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(resellerClients));
    }
  }, [resellerClients, isLoading]);

  const createReseller = useCallback(async (input: CreateResellerInput): Promise<Reseller> => {
    const newReseller: Reseller = {
      id: `reseller-${Date.now()}`,
      ...input,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setResellers(prev => [...prev, newReseller]);
    return newReseller;
  }, []);

  const updateReseller = useCallback(async (id: string, input: UpdateResellerInput): Promise<Reseller | null> => {
    let updated: Reseller | null = null;

    setResellers(prev => prev.map(r => {
      if (r.id === id) {
        updated = {
          ...r,
          ...input,
          updated_at: new Date().toISOString(),
        };
        return updated;
      }
      return r;
    }));

    return updated;
  }, []);

  const deleteReseller = useCallback(async (id: string): Promise<boolean> => {
    setResellers(prev => prev.filter(r => r.id !== id));
    setResellerClients(prev => prev.filter(rc => rc.reseller_id !== id));
    return true;
  }, []);

  const getResellerBySlug = useCallback((slug: string): Reseller | null => {
    return resellers.find(r => r.slug === slug) || null;
  }, [resellers]);

  const getResellerById = useCallback((id: string): Reseller | null => {
    return resellers.find(r => r.id === id) || null;
  }, [resellers]);

  const tagClient = useCallback(async (resellerId: string, clientId: string, tag: string): Promise<ResellerClient> => {
    // Check if already tagged
    const existing = resellerClients.find(rc => rc.reseller_id === resellerId && rc.client_id === clientId);

    if (existing) {
      // Update existing tag
      const updated: ResellerClient = { ...existing, tag };
      setResellerClients(prev => prev.map(rc =>
        rc.reseller_id === resellerId && rc.client_id === clientId ? updated : rc
      ));
      return updated;
    }

    // Create new tag
    const newResellerClient: ResellerClient = {
      id: `rc-${Date.now()}`,
      reseller_id: resellerId,
      client_id: clientId,
      tag,
      created_at: new Date().toISOString(),
    };

    setResellerClients(prev => [...prev, newResellerClient]);
    return newResellerClient;
  }, [resellerClients]);

  const untagClient = useCallback(async (resellerId: string, clientId: string): Promise<boolean> => {
    setResellerClients(prev => prev.filter(rc =>
      !(rc.reseller_id === resellerId && rc.client_id === clientId)
    ));
    return true;
  }, []);

  const getClientsByReseller = useCallback((resellerId: string): ResellerClient[] => {
    return resellerClients.filter(rc => rc.reseller_id === resellerId);
  }, [resellerClients]);

  const getResellerTag = useCallback((resellerId: string, clientId: string): string | null => {
    const rc = resellerClients.find(rc => rc.reseller_id === resellerId && rc.client_id === clientId);
    return rc?.tag || null;
  }, [resellerClients]);

  return (
    <ResellerContext.Provider value={{
      resellers,
      currentReseller,
      resellerClients,
      isLoading,
      createReseller,
      updateReseller,
      deleteReseller,
      getResellerBySlug,
      getResellerById,
      setCurrentReseller,
      tagClient,
      untagClient,
      getClientsByReseller,
      getResellerTag,
    }}>
      {children}
    </ResellerContext.Provider>
  );
};

export const useReseller = () => {
  const context = useContext(ResellerContext);
  if (context === undefined) {
    throw new Error('useReseller must be used within a ResellerProvider');
  }
  return context;
};
