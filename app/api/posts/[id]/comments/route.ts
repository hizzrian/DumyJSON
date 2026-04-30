import { NextRequest, NextResponse } from 'next/server';
import { posts, comments } from '@/lib/mockData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = parseInt(id);

  if (!posts.find(p => p.id === postId)) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = parseInt(searchParams.get('skip') || '0');

  const result = comments.filter(c => c.postId === postId);
  const total = result.length;
  const paginated = result.slice(skip, skip + limit);

  return NextResponse.json({ comments: paginated, total, skip, limit });
}
