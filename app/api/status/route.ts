import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to disable caching for polling endpoints
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    // Fetch active user
    const { data: activeUsers, error: activeError } = await supabase
      .from('queue_users')
      .select('*')
      .eq('status', 'active')
      .order('priority_score', { ascending: false })
      .limit(1);

    if (activeError) throw activeError;
    const activeUser = activeUsers?.[0] || null;

    let responseData: any = { activeUser };

    // If userId provided, calculate their queue position
    if (userId) {
      const { data: user, error: userError } = await supabase
        .from('queue_users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (!userError && user) {
        responseData.user = user;
        
        if (user.status === 'waiting') {
          // Calculate rank (how many waiting users have a higher priority score?)
          const { count, error: countError } = await supabase
            .from('queue_users')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'waiting')
            .gt('priority_score', user.priority_score);
            
          if (!countError && count !== null) {
            const position = count + 1;
            responseData.position = position;
            responseData.estimated_wait_time = position * 10; // 10 seconds per person
          }
        }
      }
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Status Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
