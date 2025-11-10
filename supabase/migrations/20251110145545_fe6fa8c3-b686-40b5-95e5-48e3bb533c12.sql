-- Enable RLS on sessions table (managed only by server)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- No policies needed - sessions are managed only by the server/backend
-- RLS is enabled to satisfy security linter, but no user access is allowed