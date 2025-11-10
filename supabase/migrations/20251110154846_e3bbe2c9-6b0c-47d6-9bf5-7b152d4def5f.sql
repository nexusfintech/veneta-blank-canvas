-- Create sessions table for express-session
CREATE TABLE IF NOT EXISTS public.sessions (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  PRIMARY KEY (sid)
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON public.sessions (expire);

-- Enable RLS but allow all operations for session management
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on sessions"
ON public.sessions
FOR ALL
USING (true)
WITH CHECK (true);