import { NextRequest, NextResponse } from 'next/server';
import { todos } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = parseInt(searchParams.get('skip') || '0');
  const completed = searchParams.get('completed');
  const userId = searchParams.get('userId');

  let result = [...todos];

  if (completed !== null) {
    result = result.filter(t => t.completed === (completed === 'true'));
  }
  if (userId) {
    result = result.filter(t => t.userId === parseInt(userId));
  }

  const total = result.length;
  const paginated = result.slice(skip, skip + limit);

  return NextResponse.json({ todos: paginated, total, skip, limit });
}
