import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user profile (pending approval)
    const { data: newUser, error } = await supabase
      .from('profiles')
      .insert({
        username,
        email,
        password_hash: passwordHash,
        role: 'user',
        is_approved: false,
        is_active: true,
      })
      .select('id, username, email, role, is_approved')
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Registration successful. Please wait for admin approval.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        isApproved: newUser.is_approved,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
