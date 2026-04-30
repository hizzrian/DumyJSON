import { NextRequest, NextResponse } from 'next/server';
import { posts, getNextId, applySort } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = parseInt(searchParams.get('skip') || '0');
  const tag = searchParams.get('tag');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort');
  const order = searchParams.get('order');

  let result = [...posts];

  if (tag) {
    result = result.filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.body.toLowerCase().includes(q)
    );
  }

  result = applySort(result, sort, order) as typeof result;

  const total = result.length;
  const paginated = result.slice(skip, skip + limit);

  return NextResponse.json({ posts: paginated, total, skip, limit });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newPost = { id: getNextId(posts), ...body };
    posts.push(newPost);
    return NextResponse.json(newPost, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
