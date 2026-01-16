import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLOCKIFY_BASE_URL = 'https://api.clockify.me/api/v1';
const CLOCKIFY_REPORTS_URL = 'https://reports.api.clockify.me/v1';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CLOCKIFY_API_KEY = Deno.env.get('CLOCKIFY_API_KEY');
    if (!CLOCKIFY_API_KEY) {
      console.error('CLOCKIFY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Clockify API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'overview';
    const workspaceId = url.searchParams.get('workspaceId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const headers = {
      'X-Api-Key': CLOCKIFY_API_KEY,
      'Content-Type': 'application/json',
    };

    console.log(`Clockify action: ${action}, workspaceId: ${workspaceId}`);

    // Get current user and workspace
    if (action === 'user') {
      const response = await fetch(`${CLOCKIFY_BASE_URL}/user`, { headers });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Clockify user error:', response.status, errorText);
        throw new Error(`Failed to fetch user: ${response.status}`);
      }
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all workspaces
    if (action === 'workspaces') {
      const response = await fetch(`${CLOCKIFY_BASE_URL}/workspaces`, { headers });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Clockify workspaces error:', response.status, errorText);
        throw new Error(`Failed to fetch workspaces: ${response.status}`);
      }
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get workspace users
    if (action === 'users' && workspaceId) {
      const response = await fetch(`${CLOCKIFY_BASE_URL}/workspaces/${workspaceId}/users`, { headers });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Clockify users error:', response.status, errorText);
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get time entries for a specific user
    if (action === 'timeEntries' && workspaceId) {
      const userId = url.searchParams.get('userId');
      let entriesUrl = `${CLOCKIFY_BASE_URL}/workspaces/${workspaceId}/user/${userId}/time-entries?page-size=200`;
      
      if (startDate) {
        entriesUrl += `&start=${encodeURIComponent(startDate)}`;
      }
      if (endDate) {
        entriesUrl += `&end=${encodeURIComponent(endDate)}`;
      }

      const response = await fetch(entriesUrl, { headers });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Clockify time entries error:', response.status, errorText);
        throw new Error(`Failed to fetch time entries: ${response.status}`);
      }
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get projects
    if (action === 'projects' && workspaceId) {
      const response = await fetch(`${CLOCKIFY_BASE_URL}/workspaces/${workspaceId}/projects?page-size=200`, { headers });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Clockify projects error:', response.status, errorText);
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get summary report
    if (action === 'summary' && workspaceId) {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const reportBody = {
        dateRangeStart: startDate || weekAgo.toISOString(),
        dateRangeEnd: endDate || now.toISOString(),
        summaryFilter: { groups: ['USER', 'PROJECT'] },
        exportType: 'JSON',
      };

      const response = await fetch(`${CLOCKIFY_REPORTS_URL}/workspaces/${workspaceId}/reports/summary`, {
        method: 'POST',
        headers,
        body: JSON.stringify(reportBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Clockify summary error:', response.status, errorText);
        throw new Error(`Failed to fetch summary: ${response.status}`);
      }
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get detailed report
    if (action === 'detailed' && workspaceId) {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const reportBody = {
        dateRangeStart: startDate || weekAgo.toISOString(),
        dateRangeEnd: endDate || now.toISOString(),
        detailedFilter: { page: 1, pageSize: 200 },
        exportType: 'JSON',
      };

      const response = await fetch(`${CLOCKIFY_REPORTS_URL}/workspaces/${workspaceId}/reports/detailed`, {
        method: 'POST',
        headers,
        body: JSON.stringify(reportBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Clockify detailed error:', response.status, errorText);
        throw new Error(`Failed to fetch detailed report: ${response.status}`);
      }
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Overview - get all data for dashboard
    if (action === 'overview') {
      // First get workspaces
      const workspacesRes = await fetch(`${CLOCKIFY_BASE_URL}/workspaces`, { headers });
      if (!workspacesRes.ok) {
        throw new Error('Failed to fetch workspaces');
      }
      const workspaces = await workspacesRes.json();
      
      if (workspaces.length === 0) {
        return new Response(JSON.stringify({ workspaces: [], users: [], timeEntries: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const firstWorkspace = workspaces[0];
      
      // Get users for first workspace
      const usersRes = await fetch(`${CLOCKIFY_BASE_URL}/workspaces/${firstWorkspace.id}/users`, { headers });
      const users = usersRes.ok ? await usersRes.json() : [];
      
      // Get projects
      const projectsRes = await fetch(`${CLOCKIFY_BASE_URL}/workspaces/${firstWorkspace.id}/projects?page-size=200`, { headers });
      const projects = projectsRes.ok ? await projectsRes.json() : [];

      // Get summary report for last 7 days
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const summaryRes = await fetch(`${CLOCKIFY_REPORTS_URL}/workspaces/${firstWorkspace.id}/reports/summary`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          dateRangeStart: weekAgo.toISOString(),
          dateRangeEnd: now.toISOString(),
          summaryFilter: { groups: ['USER', 'PROJECT', 'DATE'] },
          exportType: 'JSON',
        }),
      });
      const summary = summaryRes.ok ? await summaryRes.json() : null;

      return new Response(JSON.stringify({
        workspaces,
        currentWorkspace: firstWorkspace,
        users,
        projects,
        summary,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Clockify function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
