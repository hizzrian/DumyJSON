import { NextRequest, NextResponse } from 'next/server';
import { comments } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = parseInt(searchParams.get('skip') || '0');

  const total = comments.length;
  const paginated = comments.slice(skip, skip + limit);

  return NextResponse.json({ comments: paginated, total, skip, limit });
}
