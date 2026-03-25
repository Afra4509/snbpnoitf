import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const body = await req.json();
    const { action, userId, password } = body;

    // Check password
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'promote') {
      // Complete current active
      await supabase
        .from('queue_users')
        .update({ status: 'completed' })
        .eq('status', 'active');

      // Promote highest priority waiting user
      const { data: topUser } = await supabase
        .from('queue_users')
        .select('id')
        .eq('status', 'waiting')
        .order('priority_score', { ascending: false })
        .limit(1);

      if (topUser && topUser.length > 0) {
        await supabase
          .from('queue_users')
          .update({ status: 'active' })
          .eq('id', topUser[0].id);
      }
      return NextResponse.json({ message: 'Promoted next user' });
    } 
    
    if (action === 'skip') {
      // Mark specific user as skipped
      if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
      await supabase
        .from('queue_users')
        .update({ status: 'skipped' })
        .eq('id', userId);
        
      // If it was the active user, we might want to automatically promote next, 
      // but let's just leave it up to admin to hit "promote next" or just let it be.
      // Wait, let's auto promote if active user was skipped.
      const { data: activeCheck } = await supabase
        .from('queue_users')
        .select('id')
        .eq('status', 'active');
        
      if (!activeCheck || activeCheck.length === 0) {
          const { data: topUser } = await supabase
          .from('queue_users')
          .select('id')
          .eq('status', 'waiting')
          .order('priority_score', { ascending: false })
          .limit(1);
  
        if (topUser && topUser.length > 0) {
          await supabase
            .from('queue_users')
            .update({ status: 'active' })
            .eq('id', topUser[0].id);
        }
      }
      
      return NextResponse.json({ message: 'User skipped' });
    }

    if (action === 'complete') {
      // Mark specific user as completed
      if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
      await supabase
        .from('queue_users')
        .update({ status: 'completed' })
        .eq('id', userId);

      // Auto promote next user if no active user exists
      const { data: activeCheck } = await supabase
        .from('queue_users')
        .select('id')
        .eq('status', 'active');
        
      if (!activeCheck || activeCheck.length === 0) {
          const { data: topUser } = await supabase
          .from('queue_users')
          .select('id')
          .eq('status', 'waiting')
          .order('priority_score', { ascending: false })
          .limit(1);
  
        if (topUser && topUser.length > 0) {
          await supabase
            .from('queue_users')
            .update({ status: 'active' })
            .eq('id', topUser[0].id);
        }
      }

      return NextResponse.json({ message: 'User completed' });
    }

    if (action === 'reset') {
      // Reset queue
      // Complete all waiting and active
      await supabase
        .from('queue_users')
        .update({ status: 'completed' })
        .in('status', ['waiting', 'active']);
      return NextResponse.json({ message: 'Queue reset' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin Action Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
