import { NextRequest, NextResponse } from 'next/server';
import { todos, getNextId, applySort } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = parseInt(searchParams.get('skip') || '0');
  const completed = searchParams.get('completed');
  const userId = searchParams.get('userId');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort');
  const order = searchParams.get('order');

  let result = [...todos];

  if (completed !== null) {
    result = result.filter(t => t.completed === (completed === 'true'));
  }
  if (userId) {
    result = result.filter(t => t.userId === parseInt(userId));
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(t => t.todo.toLowerCase().includes(q));
  }

  result = applySort(result, sort, order) as typeof result;

  const total = result.length;
  const paginated = result.slice(skip, skip + limit);

  return NextResponse.json({ todos: paginated, total, skip, limit });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newTodo = { id: getNextId(todos), ...body };
    todos.push(newTodo);
    return NextResponse.json(newTodo, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
