import { NextRequest, NextResponse } from 'next/server';
import { todos } from '@/lib/mockData';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const todo = todos.find(t => t.id === parseInt(id));

  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }

  return NextResponse.json(todo);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = todos.findIndex(t => t.id === parseInt(id));

  if (idx === -1) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    todos[idx] = { ...body, id: parseInt(id) };
    return NextResponse.json(todos[idx]);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = todos.findIndex(t => t.id === parseInt(id));

  if (idx === -1) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    todos[idx] = { ...todos[idx], ...body, id: parseInt(id) };
    return NextResponse.json(todos[idx]);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = todos.findIndex(t => t.id === parseInt(id));

  if (idx === -1) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }

  const [deleted] = todos.splice(idx, 1);
  return NextResponse.json(deleted);
}
