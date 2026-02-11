
-- Fix: admin_submissions_view is publicly readable - add RLS
ALTER VIEW public.admin_submissions_view SET (security_invoker = true);

-- Since views with security_invoker use the caller's permissions,
-- and the underlying tables (job_submissions, jobs, profiles) already have RLS,
-- only admins who can see all submissions will be able to query this view.
-- But we should also add explicit policies on the view itself if needed.

-- Alternative approach: recreate as a secure view
DROP VIEW IF EXISTS public.admin_submissions_view;

CREATE VIEW public.admin_submissions_view
WITH (security_invoker = true)
AS
SELECT
  js.id,
  js.job_id,
  js.user_id,
  js.status,
  js.payment_amount,
  js.submission_content,
  js.file_url,
  js.file_name,
  js.file_type,
  js.file_size,
  js.worker_file_url,
  js.worker_file_name,
  js.created_at,
  j.title AS job_title,
  p.email AS user_email,
  p.full_name AS user_name,
  COALESCE(js.worker_file_name, js.file_name) AS display_file_name,
  COALESCE(js.worker_file_url, js.file_url) AS display_file_url
FROM job_submissions js
LEFT JOIN jobs j ON js.job_id = j.id
LEFT JOIN profiles p ON js.user_id = p.id;
