-- Fix agents table - restrict to admins only
DROP POLICY IF EXISTS "Authenticated users can view agents" ON public.agents;
CREATE POLICY "Admins can view agents"
ON public.agents FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix website_submissions - remove public read, restrict to admins
DROP POLICY IF EXISTS "Allow public read on website_submissions" ON public.website_submissions;
CREATE POLICY "Admins can view website_submissions"
ON public.website_submissions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix leads - restrict to agent's own leads or admin
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;

CREATE POLICY "Users can view own leads or admins can view all"
ON public.leads FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert leads"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads"
ON public.leads FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix call_logs - restrict to admins
DROP POLICY IF EXISTS "Authenticated users can view call_logs" ON public.call_logs;
DROP POLICY IF EXISTS "Authenticated users can insert call_logs" ON public.call_logs;
DROP POLICY IF EXISTS "Authenticated users can update call_logs" ON public.call_logs;

CREATE POLICY "Admins can view call_logs"
ON public.call_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert call_logs"
ON public.call_logs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update call_logs"
ON public.call_logs FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix work_days - restrict to admins
DROP POLICY IF EXISTS "Authenticated users can view work_days" ON public.work_days;
DROP POLICY IF EXISTS "Authenticated users can insert work_days" ON public.work_days;
DROP POLICY IF EXISTS "Authenticated users can update work_days" ON public.work_days;

CREATE POLICY "Admins can view work_days"
ON public.work_days FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert work_days"
ON public.work_days FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update work_days"
ON public.work_days FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));