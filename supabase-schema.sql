-- Supabase Database Schema for Custom JSON Endpoints
-- Run this in your Supabase SQL Editor

-- ============================================
-- AUTH & USER MANAGEMENT TABLES
-- ============================================

-- Create profiles table (user accounts with roles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENDPOINTS TABLE
-- ============================================

-- Create endpoints table
CREATE TABLE IF NOT EXISTS public.endpoints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  path TEXT NOT NULL UNIQUE,
  method TEXT NOT NULL DEFAULT 'GET' CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  description TEXT,
  request_schema JSONB,
  response_template JSONB NOT NULL DEFAULT '{}'::jsonb,
  delay_ms INTEGER DEFAULT 0,
  status_code INTEGER DEFAULT 200,
  headers JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create endpoint hits log table
CREATE TABLE IF NOT EXISTS public.endpoint_hits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint_id UUID REFERENCES public.endpoints(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  request_headers JSONB,
  request_body JSONB,
  query_params JSONB,
  response_status INTEGER,
  response_body JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster path/method lookups
CREATE INDEX IF NOT EXISTS idx_endpoints_path_method ON public.endpoints(path, method);
CREATE INDEX IF NOT EXISTS idx_endpoints_owner_id ON public.endpoints(owner_id);
CREATE INDEX IF NOT EXISTS idx_endpoint_hits_endpoint_id ON public.endpoint_hits(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_endpoint_hits_created_at ON public.endpoint_hits(created_at);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_endpoints_updated_at
  BEFORE UPDATE ON public.endpoints
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endpoint_hits ENABLE ROW LEVEL SECURITY;

-- Profiles policies (app uses custom JWT auth, not Supabase Auth — allow all for now)
CREATE POLICY "Allow all on profiles" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Endpoints policies (allow all — auth is enforced at API route level)
CREATE POLICY "Allow all on endpoints" ON public.endpoints
  FOR ALL USING (true) WITH CHECK (true);

-- Endpoint hits policies
CREATE POLICY "Allow read on endpoint_hits" ON public.endpoint_hits
  FOR SELECT USING (true);

CREATE POLICY "System can insert endpoint hits" ON public.endpoint_hits
  FOR INSERT WITH CHECK (true);

-- ============================================
-- INITIAL ADMIN USER
-- ============================================

-- Insert default admin user (password: admin123)
INSERT INTO public.profiles (username, email, password_hash, role, is_approved, is_active) VALUES
  ('admin', 'admin@example.com', '$2b$12$INC/NeExMl8zwWbwO8yr8et4B2nKSa8T/PSXa9wkTUmUXioDW.m0q', 'admin', true, true)
ON CONFLICT (username) DO NOTHING;

-- Insert sample endpoints
INSERT INTO public.endpoints (path, method, description, response_template, status_code, is_public) VALUES
  ('/api/custom/greeting', 'GET', 'Simple greeting endpoint', '{"message": "Hello, World!", "timestamp": "{{now}}"}'::jsonb, 200, true),
  ('/api/custom/echo', 'POST', 'Echo back the request body', '{"echo": "{{body}}", "received_at": "{{now}}"}'::jsonb, 200, true),
  ('/api/custom/users', 'GET', 'List of mock users', '{"users": [{"id": 1, "name": "John"}, {"id": 2, "name": "Jane"}]}'::jsonb, 200, true)
ON CONFLICT (path) DO NOTHING;
