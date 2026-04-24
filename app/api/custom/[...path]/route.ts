import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Catch-all route handler for custom endpoints
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const path = '/api/custom/' + pathSegments.join('/');

  return handleRequest('GET', path, request);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const path = '/api/custom/' + pathSegments.join('/');

  return handleRequest('POST', path, request);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const path = '/api/custom/' + pathSegments.join('/');

  return handleRequest('PUT', path, request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const path = '/api/custom/' + pathSegments.join('/');

  return handleRequest('DELETE', path, request);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const path = '/api/custom/' + pathSegments.join('/');

  return handleRequest('PATCH', path, request);
}

async function handleRequest(method: string, path: string, request: NextRequest) {
  try {
    // Find matching endpoint
    const { data: endpoint, error } = await supabase
      .from('endpoints')
      .select('*')
      .eq('path', path)
      .eq('method', method)
      .eq('is_active', true)
      .single();

    if (error || !endpoint) {
      return NextResponse.json(
        { error: 'Endpoint not found', path, method },
        { status: 404 }
      );
    }

    // Apply delay if configured
    if (endpoint.delay_ms && endpoint.delay_ms > 0) {
      await new Promise(resolve => setTimeout(resolve, endpoint.delay_ms));
    }

    // Parse request body for POST/PUT/PATCH
    let requestBody = null;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        requestBody = await request.json();
      } catch {
        requestBody = await request.text();
      }
    }

    // Get query parameters
    const queryParams = Object.fromEntries(request.nextUrl.searchParams);

    // Process response template
    let responseBody = endpoint.response_template;

    // Replace template variables
    const now = new Date().toISOString();
    const templateStr = JSON.stringify(responseBody)
      .replace(/{{now}}/g, now)
      .replace(/{{method}}/g, method)
      .replace(/{{path}}/g, path)
      .replace(/{{body}}/g, requestBody ? JSON.stringify(requestBody) : 'null')
      .replace(/{{query\.(\w+)}}/g, (_, key) => {
        const value = queryParams[key];
        return value !== undefined ? JSON.stringify(value) : 'null';
      });

    responseBody = JSON.parse(templateStr);

    // Increment hit count
    await supabase
      .from('endpoints')
      .update({ hit_count: endpoint.hit_count + 1 })
      .eq('id', endpoint.id);

    // Log the hit
    await supabase.from('endpoint_hits').insert({
      endpoint_id: endpoint.id,
      method,
      path,
      request_headers: Object.fromEntries(request.headers),
      request_body: requestBody,
      query_params: queryParams,
      response_status: endpoint.status_code,
      response_body: responseBody
    });

    // Build response headers
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'application/json');
    if (endpoint.headers) {
      const customHeaders = endpoint.headers as Record<string, string>;
      Object.entries(customHeaders).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });
    }

    return NextResponse.json(responseBody, {
      status: endpoint.status_code || 200,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('Error handling custom endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
