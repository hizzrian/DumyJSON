import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = parseInt(searchParams.get('skip') || '0');
  const select = searchParams.get('select')?.split(',');

  let result = [...users];

  // Apply pagination
  const paginated = result.slice(skip, skip + limit);

  // Apply field selection if specified
  if (select) {
    result = paginated.map(user => {
      const filtered: any = {};
      select.forEach(field => {
        if (field in user) filtered[field] = user[field as keyof typeof user];
      });
      return filtered;
    });
  } else {
    result = paginated;
  }

  return NextResponse.json({ users: result, total: users.length, skip, limit });
}
