import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DEFAULT_LANDING_CONTENT } from '@/lib/defaultLandingContent';

export async function GET() {
  try {
    const { data } = await supabase
      .from('landing_content')
      .select('content')
      .eq('id', 1)
      .single();

    return NextResponse.json(data?.content ?? DEFAULT_LANDING_CONTENT);
  } catch {
    return NextResponse.json(DEFAULT_LANDING_CONTENT);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const content = await request.json();

    const { error } = await supabase
      .from('landing_content')
      .upsert({ id: 1, content, updated_at: new Date().toISOString() });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving landing content:', error);
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}
