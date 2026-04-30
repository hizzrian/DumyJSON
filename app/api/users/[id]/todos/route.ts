import { NextRequest, NextResponse } from 'next/server';
import { users, todos, applySort } from '@/lib/mockData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = parseInt(id);

  if (!users.find(u => u.id === userId)) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = parseInt(searchParams.get('skip') || '0');
  const completed = searchParams.get('completed');
  const sort = searchParams.get('sort');
  const order = searchParams.get('order');

  let result = todos.filter(t => t.userId === userId);

  if (completed !== null) {
    result = result.filter(t => t.completed === (completed === 'true'));
  }

  result = applySort(result, sort, order) as typeof result;

  const total = result.length;
  const paginated = result.slice(skip, skip + limit);

  return NextResponse.json({ todos: paginated, total, skip, limit });
}
