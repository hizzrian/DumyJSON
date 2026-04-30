import { NextRequest, NextResponse } from 'next/server';
import { posts } from '@/lib/mockData';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = posts.find(p => p.id === parseInt(id));

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = posts.findIndex(p => p.id === parseInt(id));

  if (idx === -1) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    posts[idx] = { ...body, id: parseInt(id) };
    return NextResponse.json(posts[idx]);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = posts.findIndex(p => p.id === parseInt(id));

  if (idx === -1) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    posts[idx] = { ...posts[idx], ...body, id: parseInt(id) };
    return NextResponse.json(posts[idx]);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = posts.findIndex(p => p.id === parseInt(id));

  if (idx === -1) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const [deleted] = posts.splice(idx, 1);
  return NextResponse.json(deleted);
}
