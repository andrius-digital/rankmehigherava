-- Allow tracking leads that did NOT convert to jobs
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;

ALTER TABLE public.leads
ADD CONSTRAINT leads_status_check
CHECK (
  status = ANY (
    ARRAY[
      'booked'::text,
      'completed'::text,
      'not_converted'::text,
      'cancelled'::text,
      'no_show'::text
    ]
  )
);