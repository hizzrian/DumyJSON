import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const token = request.cookies.get('auth-token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Approve user
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error approving user:', error);
      return NextResponse.json(
        { error: 'Failed to approve user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User approved successfully',
    });
  } catch (error) {
    console.error('Approve user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const token = request.cookies.get('auth-token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Reject (soft delete by deactivating) user
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error rejecting user:', error);
      return NextResponse.json(
        { error: 'Failed to reject user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User rejected successfully',
    });
  } catch (error) {
    console.error('Reject user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
