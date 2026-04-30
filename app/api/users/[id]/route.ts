import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/mockData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = users.find(u => u.id === parseInt(id));

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const select = searchParams.get('select')?.split(',');

  if (select) {
    const filtered: Record<string, unknown> = {};
    select.forEach(field => {
      if (field in user) filtered[field] = user[field as keyof typeof user];
    });
    return NextResponse.json(filtered);
  }

  return NextResponse.json(user);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = users.findIndex(u => u.id === parseInt(id));

  if (idx === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    users[idx] = { ...body, id: parseInt(id) };
    return NextResponse.json(users[idx]);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = users.findIndex(u => u.id === parseInt(id));

  if (idx === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    users[idx] = { ...users[idx], ...body, id: parseInt(id) };
    return NextResponse.json(users[idx]);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = users.findIndex(u => u.id === parseInt(id));

  if (idx === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const [deleted] = users.splice(idx, 1);
  return NextResponse.json(deleted);
}
