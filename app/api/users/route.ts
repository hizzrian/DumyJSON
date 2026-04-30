import { NextRequest, NextResponse } from 'next/server';
import { users, getNextId, applySort } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = parseInt(searchParams.get('skip') || '0');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort');
  const order = searchParams.get('order');
  const select = searchParams.get('select')?.split(',');

  let result = [...users];

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(u =>
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    );
  }

  result = applySort(result, sort, order) as typeof result;

  const total = result.length;
  const paginated = result.slice(skip, skip + limit);

  if (select) {
    const selected = paginated.map(user => {
      const filtered: Record<string, unknown> = {};
      select.forEach(field => {
        if (field in user) filtered[field] = user[field as keyof typeof user];
      });
      return filtered;
    });
    return NextResponse.json({ users: selected, total, skip, limit });
  }

  return NextResponse.json({ users: paginated, total, skip, limit });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newUser = { id: getNextId(users), ...body };
    users.push(newUser);
    return NextResponse.json(newUser, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
