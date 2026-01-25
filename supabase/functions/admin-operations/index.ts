import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client for elevated operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user client to verify auth
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, data } = await req.json();

    let result;

    switch (action) {
      case 'create_agent':
        const { data: newAgent, error: createError } = await supabaseAdmin
          .from('agents')
          .insert(data)
          .select()
          .single();
        if (createError) throw createError;
        result = newAgent;
        break;

      case 'update_agent':
        const { id: agentId, ...updateData } = data;
        const { data: updatedAgent, error: updateError } = await supabaseAdmin
          .from('agents')
          .update(updateData)
          .eq('id', agentId)
          .select()
          .single();
        if (updateError) throw updateError;
        result = updatedAgent;
        break;

      case 'delete_agent':
        const { error: deleteError } = await supabaseAdmin
          .from('agents')
          .delete()
          .eq('id', data.id);
        if (deleteError) throw deleteError;
        result = { success: true };
        break;

      case 'create_client':
        const { data: newClient, error: createClientError } = await supabaseAdmin
          .from('clients')
          .insert(data)
          .select()
          .single();
        if (createClientError) throw createClientError;
        result = newClient;
        break;

      case 'update_client':
        const { id: clientId, ...clientUpdateData } = data;
        const { data: updatedClient, error: updateClientError } = await supabaseAdmin
          .from('clients')
          .update(clientUpdateData)
          .eq('id', clientId)
          .select()
          .single();
        if (updateClientError) throw updateClientError;
        result = updatedClient;
        break;

      case 'delete_client':
        const { error: deleteClientError } = await supabaseAdmin
          .from('clients')
          .delete()
          .eq('id', data.id);
        if (deleteClientError) throw deleteClientError;
        result = { success: true };
        break;

      case 'get_clients':
        const { data: clients, error: getClientsError } = await supabaseAdmin
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });
        if (getClientsError) throw getClientsError;
        result = clients;
        break;

      case 'assign_admin_role':
        const { data: newRole, error: assignError } = await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: data.user_id, role: 'admin' })
          .select()
          .single();
        if (assignError) throw assignError;
        result = newRole;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Admin action ${action} completed by user ${user.id}`);

    return new Response(
      JSON.stringify({ data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admin operations error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
