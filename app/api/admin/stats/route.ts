import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const token = request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get user stats
    const { data: userStats, error: userError } = await supabase
      .from('profiles')
      .select('role, is_approved, is_active');

    if (userError) throw userError;

    const totalUsers = userStats?.length || 0;
    const activeUsers = userStats?.filter(u => u.is_active).length || 0;
    const pendingUsers = userStats?.filter(u => !u.is_approved).length || 0;
    const adminUsers = userStats?.filter(u => u.role === 'admin').length || 0;

    // Get endpoint stats
    const { data: endpointStats, error: endpointError } = await supabase
      .from('endpoints')
      .select('method, is_active, hit_count');

    if (endpointError) throw endpointError;

    const totalEndpoints = endpointStats?.length || 0;
    const activeEndpoints = endpointStats?.filter(e => e.is_active).length || 0;
    const totalHits = endpointStats?.reduce((sum, e) => sum + (e.hit_count || 0), 0) || 0;

    const endpointsByMethod = {
      GET: endpointStats?.filter(e => e.method === 'GET').length || 0,
      POST: endpointStats?.filter(e => e.method === 'POST').length || 0,
      PUT: endpointStats?.filter(e => e.method === 'PUT').length || 0,
      DELETE: endpointStats?.filter(e => e.method === 'DELETE').length || 0,
      PATCH: endpointStats?.filter(e => e.method === 'PATCH').length || 0,
    };

    // Get recent hits (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentHits, error: hitsError } = await supabase
      .from('endpoint_hits')
      .select('created_at, method, response_status')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: true });

    if (hitsError) throw hitsError;

    const hitsLast24Hours = recentHits?.length || 0;

    // Group hits by hour for the chart
    const hitsByHour = new Map<string, number>();
    recentHits?.forEach(hit => {
      const hour = new Date(hit.created_at).getHours();
      hitsByHour.set(hour, (hitsByHour.get(hour) || 0) + 1);
    });

    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      hits: hitsByHour.get(i) || 0,
    }));

    // Get top endpoints
    const { data: topEndpoints, error: topError } = await supabase
      .from('endpoints')
      .select('path, method, hit_count')
      .order('hit_count', { ascending: false })
      .limit(10);

    if (topError) throw topError;

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        pending: pendingUsers,
        admins: adminUsers,
      },
      endpoints: {
        total: totalEndpoints,
        active: activeEndpoints,
        totalHits,
        byMethod: endpointsByMethod,
      },
      traffic: {
        hitsLast24Hours,
        hourlyBreakdown: hourlyData,
      },
      topEndpoints: topEndpoints || [],
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
