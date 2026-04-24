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
    const filtered: any = {};
    select.forEach(field => {
      if (field in user) filtered[field] = user[field as keyof typeof user];
    });
    return NextResponse.json(filtered);
  }

  return NextResponse.json(user);
}
