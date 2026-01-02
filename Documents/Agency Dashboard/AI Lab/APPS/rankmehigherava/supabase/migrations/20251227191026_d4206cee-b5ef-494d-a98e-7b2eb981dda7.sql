-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
$$;

-- RLS policy for user_roles - users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS policy for user_roles - only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Drop existing permissive policies on agents
DROP POLICY IF EXISTS "Allow public delete on agents" ON public.agents;
DROP POLICY IF EXISTS "Allow public insert on agents" ON public.agents;
DROP POLICY IF EXISTS "Allow public read access on agents" ON public.agents;
DROP POLICY IF EXISTS "Allow public update on agents" ON public.agents;

-- Create secure policies for agents - only authenticated users
CREATE POLICY "Authenticated users can view agents"
ON public.agents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert agents"
ON public.agents FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update agents"
ON public.agents FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete agents"
ON public.agents FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing permissive policies on clients
DROP POLICY IF EXISTS "Allow public delete on clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public insert on clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public read access on clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public update on clients" ON public.clients;

-- Create secure policies for clients - only authenticated admins
CREATE POLICY "Admins can view clients"
ON public.clients FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert clients"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update clients"
ON public.clients FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete clients"
ON public.clients FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing permissive policies on call_logs
DROP POLICY IF EXISTS "Allow public delete on call_logs" ON public.call_logs;
DROP POLICY IF EXISTS "Allow public insert on call_logs" ON public.call_logs;
DROP POLICY IF EXISTS "Allow public read access on call_logs" ON public.call_logs;
DROP POLICY IF EXISTS "Allow public update on call_logs" ON public.call_logs;

-- Create secure policies for call_logs
CREATE POLICY "Authenticated users can view call_logs"
ON public.call_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert call_logs"
ON public.call_logs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update call_logs"
ON public.call_logs FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete call_logs"
ON public.call_logs FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing permissive policies on leads
DROP POLICY IF EXISTS "Allow public delete on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public insert on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public read access on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public update on leads" ON public.leads;

-- Create secure policies for leads
CREATE POLICY "Authenticated users can view leads"
ON public.leads FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert leads"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update leads"
ON public.leads FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete leads"
ON public.leads FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing permissive policies on work_days
DROP POLICY IF EXISTS "Allow public delete on work_days" ON public.work_days;
DROP POLICY IF EXISTS "Allow public insert on work_days" ON public.work_days;
DROP POLICY IF EXISTS "Allow public read access on work_days" ON public.work_days;
DROP POLICY IF EXISTS "Allow public update on work_days" ON public.work_days;

-- Create secure policies for work_days
CREATE POLICY "Authenticated users can view work_days"
ON public.work_days FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert work_days"
ON public.work_days FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update work_days"
ON public.work_days FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete work_days"
ON public.work_days FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));