import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Only fetch active user, hide private users from overlay (if is_private logic applies)
    // Actually, if they are active, they are on overlay regardless? 
    // Wait, the prompt says "Private users must NOT appear in public overlay."
    const { data: activeUsers, error } = await supabase
      .from('queue_users')
      .select('registration_number, sender_name, birth_date, donation_amount, is_private')
      .eq('status', 'active')
      .eq('is_private', false)
      .limit(1);

    if (error) throw error;
    
    const activeUser = activeUsers?.[0] || null;

    return NextResponse.json({ activeUser });
  } catch (error: any) {
    console.error('Overlay Error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error', details: error }, { status: 500 });
  }
}
