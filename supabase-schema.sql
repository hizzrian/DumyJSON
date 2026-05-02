-- Supabase Database Schema for Custom JSON Endpoints
-- Run this in your Supabase SQL Editor

-- Create endpoints table
CREATE TABLE IF NOT EXISTS public.endpoints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL UNIQUE,
  method TEXT NOT NULL DEFAULT 'GET' CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  description TEXT,
  request_schema JSONB,
  response_template JSONB NOT NULL DEFAULT '{}'::jsonb,
  delay_ms INTEGER DEFAULT 0,
  status_code INTEGER DEFAULT 200,
  headers JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
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
CREATE INDEX IF NOT EXISTS idx_endpoint_hits_endpoint_id ON public.endpoint_hits(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_endpoint_hits_created_at ON public.endpoint_hits(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endpoint_hits ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - customize for production)
CREATE POLICY "Allow all operations on endpoints" ON public.endpoints
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on endpoint_hits" ON public.endpoint_hits
  FOR ALL USING (true) WITH CHECK (true);

-- Landing page CMS content table
CREATE TABLE IF NOT EXISTS public.landing_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on landing_content" ON public.landing_content
  FOR ALL USING (true) WITH CHECK (true);

-- Insert sample endpoints
INSERT INTO public.endpoints (path, method, description, response_template, status_code) VALUES
  ('/api/custom/greeting', 'GET', 'Simple greeting endpoint', '{"message": "Hello, World!", "timestamp": "{{now}}"}'::jsonb, 200),
  ('/api/custom/echo', 'POST', 'Echo back the request body', '{"echo": "{{body}}", "received_at": "{{now}}"}'::jsonb, 200),
  ('/api/custom/users', 'GET', 'List of mock users', '{"users": [{"id": 1, "name": "John"}, {"id": 2, "name": "Jane"}]}'::jsonb, 200);
