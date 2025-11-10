-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create user_roles table for security
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
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

-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  fiscal_code TEXT,
  birth_date DATE,
  gender TEXT,
  birth_place TEXT,
  citizenship TEXT,
  residence_locality TEXT,
  document_type TEXT,
  document_number TEXT,
  document_issued_by TEXT,
  document_issue_place TEXT,
  document_issue_date DATE,
  company_name TEXT,
  vat_number TEXT,
  company_fiscal_code TEXT,
  legal_address TEXT,
  legal_zip_code TEXT,
  legal_city TEXT,
  legal_province TEXT,
  fax TEXT,
  pec TEXT,
  legal_representative JSONB,
  beneficial_owners JSONB,
  main_activity_province TEXT,
  relationship_destination_province TEXT,
  counterparty_area_province TEXT,
  professional_activity TEXT,
  requested_product TEXT,
  requested_capital DECIMAL(12, 2),
  financing_duration TEXT,
  interest_rate_type TEXT,
  mediator_compensation DECIMAL(12, 2),
  compensation_type TEXT,
  commission DECIMAL(12, 2),
  commission_type TEXT,
  instruction_fees DECIMAL(12, 2),
  contract_date DATE,
  email TEXT,
  phone TEXT,
  address TEXT,
  zip_code TEXT,
  city TEXT,
  province TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'attivo'
);

-- Enable RLS on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create sessions table
CREATE TABLE public.sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX idx_session_expire ON public.sessions(expire);

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (id = auth.uid()::UUID);

CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (id = auth.uid()::UUID);

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid()::UUID);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid()::UUID, 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid()::UUID, 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (public.has_role(auth.uid()::UUID, 'admin'));

-- RLS Policies for clients table
CREATE POLICY "Users can view their own clients"
  ON public.clients
  FOR SELECT
  USING (created_by = auth.uid()::UUID);

CREATE POLICY "Admins can view all clients"
  ON public.clients
  FOR SELECT
  USING (public.has_role(auth.uid()::UUID, 'admin'));

CREATE POLICY "Users can insert their own clients"
  ON public.clients
  FOR INSERT
  WITH CHECK (created_by = auth.uid()::UUID);

CREATE POLICY "Users can update their own clients"
  ON public.clients
  FOR UPDATE
  USING (created_by = auth.uid()::UUID);

CREATE POLICY "Admins can update all clients"
  ON public.clients
  FOR UPDATE
  USING (public.has_role(auth.uid()::UUID, 'admin'));

CREATE POLICY "Users can delete their own clients"
  ON public.clients
  FOR DELETE
  USING (created_by = auth.uid()::UUID);

CREATE POLICY "Admins can delete all clients"
  ON public.clients
  FOR DELETE
  USING (public.has_role(auth.uid()::UUID, 'admin'));