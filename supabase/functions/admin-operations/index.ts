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

    // Check if user is admin (email allowlist + user_roles table)
    const ADMIN_EMAILS = ['andrius@cdlagency.com', 'rubbail@rankmehigher.com'];
    const isAdminByEmail = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

    if (!isAdminByEmail) {
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

      case 'create_reseller_user': {
        const { email: resellerEmail, password: resellerPassword, full_name: resellerName, reseller_id: resellerId } = data;

        // Create the auth user with email confirmed
        const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
          email: resellerEmail,
          password: resellerPassword,
          email_confirm: true,
          user_metadata: { full_name: resellerName || '' },
        });
        if (createUserError) throw createUserError;

        const newUserId = newUser.user.id;

        // Assign 'reseller' role via RPC (bypasses PostgREST enum cache issues)
        const { error: roleError } = await supabaseAdmin.rpc('assign_reseller_role', {
          _user_id: newUserId,
        });
        if (roleError) throw roleError;

        // Wait a moment for the profile trigger, then set up reseller profile via RPC
        await new Promise(resolve => setTimeout(resolve, 500));
        const { error: profileError } = await supabaseAdmin.rpc('setup_reseller_profile', {
          _user_id: newUserId,
          _email: resellerEmail,
          _full_name: resellerName || null,
          _reseller_id: resellerId,
        });
        if (profileError) throw profileError;

        result = { user_id: newUserId, email: resellerEmail, reseller_id: resellerId };
        break;
      }

      case 'list_reseller_users': {
        // Get all users with reseller role, joined with profile data
        const { data: resellerRoles, error: listRolesError } = await supabaseAdmin
          .from('user_roles')
          .select('user_id')
          .eq('role', 'reseller');
        if (listRolesError) throw listRolesError;

        if (!resellerRoles || resellerRoles.length === 0) {
          result = [];
          break;
        }

        const userIds = resellerRoles.map((r: { user_id: string }) => r.user_id);
        const { data: profiles, error: profilesError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .in('user_id', userIds);
        if (profilesError) throw profilesError;

        result = profiles || [];
        break;
      }

      case 'change_user_password': {
        const { user_id: pwUserId, password: newPassword } = data;
        if (!pwUserId || !newPassword) throw new Error('user_id and password are required');
        if (newPassword.length < 6) throw new Error('Password must be at least 6 characters');

        const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(pwUserId, {
          password: newPassword,
        });
        if (pwError) throw pwError;

        result = { success: true };
        break;
      }

      case 'delete_reseller_user': {
        const { user_id: deleteUserId } = data;

        // Remove role
        const { error: removeRoleError } = await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', deleteUserId)
          .eq('role', 'reseller');
        if (removeRoleError) throw removeRoleError;

        // Delete the auth user (this cascades to profile via FK)
        const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(deleteUserId);
        if (deleteUserError) throw deleteUserError;

        result = { success: true };
        break;
      }

      case 'create_team_portal_member': {
        const { email: teamEmail, password: teamPassword, name: teamName, role: teamRole, permissions: teamPermissions } = data;
        if (!teamEmail || !teamPassword || !teamName) throw new Error('email, password, and name are required');

        const { data: newTeamUser, error: createTeamError } = await supabaseAdmin.auth.admin.createUser({
          email: teamEmail,
          password: teamPassword,
          email_confirm: true,
          user_metadata: { full_name: teamName },
        });
        if (createTeamError) throw createTeamError;

        const teamUserId = newTeamUser.user.id;

        const { error: teamRoleError } = await supabaseAdmin.rpc('assign_team_role', { _user_id: teamUserId });
        if (teamRoleError) throw teamRoleError;

        const { data: teamMemberRow, error: teamInsertError } = await supabaseAdmin
          .from('team_portal_members')
          .insert({
            user_id: teamUserId,
            name: teamName,
            email: teamEmail,
            role: teamRole || 'Team Member',
            permissions: teamPermissions || [],
          })
          .select()
          .single();
        if (teamInsertError) throw teamInsertError;

        result = { ...teamMemberRow, auth_user_id: teamUserId };
        break;
      }

      case 'list_team_portal_members': {
        const { data: teamList, error: teamListError } = await supabaseAdmin
          .from('team_portal_members')
          .select('*')
          .order('created_at', { ascending: false });
        if (teamListError) throw teamListError;
        result = teamList || [];
        break;
      }

      case 'update_team_portal_member': {
        const { id: teamMemberId, permissions: updPerms, role: updRole, name: updName, password: updPassword } = data;
        if (!teamMemberId) throw new Error('id is required');

        const updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (updPerms !== undefined) updateFields.permissions = updPerms;
        if (updRole !== undefined) updateFields.role = updRole;
        if (updName !== undefined) updateFields.name = updName;

        const { data: updatedTeam, error: updTeamError } = await supabaseAdmin
          .from('team_portal_members')
          .update(updateFields)
          .eq('id', teamMemberId)
          .select()
          .single();
        if (updTeamError) throw updTeamError;

        if (updPassword && updatedTeam.user_id) {
          const { error: pwErr } = await supabaseAdmin.auth.admin.updateUserById(updatedTeam.user_id, { password: updPassword });
          if (pwErr) throw pwErr;
        }

        result = updatedTeam;
        break;
      }

      case 'delete_team_portal_member': {
        const { id: delTeamId } = data;
        if (!delTeamId) throw new Error('id is required');

        const { data: memberToDelete, error: fetchDelError } = await supabaseAdmin
          .from('team_portal_members')
          .select('user_id')
          .eq('id', delTeamId)
          .single();
        if (fetchDelError) throw fetchDelError;

        await supabaseAdmin.from('team_portal_members').delete().eq('id', delTeamId);
        await supabaseAdmin.from('user_roles').delete().eq('user_id', memberToDelete.user_id).eq('role', 'team');
        await supabaseAdmin.auth.admin.deleteUser(memberToDelete.user_id);

        result = { success: true };
        break;
      }

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
