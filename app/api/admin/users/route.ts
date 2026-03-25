import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const password = url.searchParams.get('pwd');
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: users, error } = await supabase
      .from('queue_users')
      .select('*')
      .order('status', { ascending: true }) // Group by status somewhat
      .order('priority_score', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Admin Users API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
