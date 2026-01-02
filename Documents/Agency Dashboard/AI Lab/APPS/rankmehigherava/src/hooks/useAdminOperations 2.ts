import { supabase } from '@/integrations/supabase/client';

interface AdminOperationResponse<T> {
  data?: T;
  error?: string;
}

export const useAdminOperations = () => {
  const callAdminFunction = async <T>(action: string, data?: Record<string, unknown>): Promise<AdminOperationResponse<T>> => {
    try {
      const { data: result, error } = await supabase.functions.invoke('admin-operations', {
        body: { action, data },
      });

      if (error) {
        console.error('Admin operation error:', error);
        return { error: error.message };
      }

      if (result?.error) {
        return { error: result.error };
      }

      return { data: result?.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { error: errorMessage };
    }
  };

  // Agent operations
  const createAgent = async (agentData: { name: string; email?: string; phone?: string; client_id?: string }) => {
    return callAdminFunction('create_agent', agentData);
  };

  const updateAgent = async (id: string, agentData: { name?: string; email?: string; phone?: string; is_active?: boolean; client_id?: string }) => {
    return callAdminFunction('update_agent', { id, ...agentData });
  };

  const deleteAgent = async (id: string) => {
    return callAdminFunction('delete_agent', { id });
  };

  // Client operations
  const createClient = async (clientData: { 
    name: string; 
    email?: string; 
    phone?: string; 
    daily_rate?: number; 
    weeks_paid?: number;
    campaign_budget?: number;
    campaign_start_date?: string;
    campaign_length?: number;
  }) => {
    return callAdminFunction('create_client', clientData);
  };

  const updateClient = async (id: string, clientData: Record<string, unknown>) => {
    return callAdminFunction('update_client', { id, ...clientData });
  };

  const deleteClient = async (id: string) => {
    return callAdminFunction('delete_client', { id });
  };

  const getClients = async () => {
    return callAdminFunction('get_clients');
  };

  // User role operations
  const assignAdminRole = async (userId: string) => {
    return callAdminFunction('assign_admin_role', { user_id: userId });
  };

  return {
    createAgent,
    updateAgent,
    deleteAgent,
    createClient,
    updateClient,
    deleteClient,
    getClients,
    assignAdminRole,
  };
};
