import { NextRequest, NextResponse } from 'next/server';
import { posts } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = parseInt(searchParams.get('skip') || '0');
  const tag = searchParams.get('tag');

  let result = [...posts];

  if (tag) {
    result = result.filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
  }

  const total = result.length;
  const paginated = result.slice(skip, skip + limit);

  return NextResponse.json({ posts: paginated, total, skip, limit });
}
