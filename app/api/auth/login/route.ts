import { NextRequest, NextResponse } from 'next/server';
import { authUsers } from '@/lib/mockData';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const user = authUsers.find(
      u => u.username === username || u.email === username
    );

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate a mock JWT-like token
    const token = crypto
      .createHash('sha256')
      .update(`${user.id}-${Date.now()}-${Math.random()}`)
      .digest('hex');

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      token,
      expiresIn: 3600
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
