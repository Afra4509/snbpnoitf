import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { registration_number, birth_date, is_private, sender_name } = body;
    
    // Simple validation
    if (!registration_number || !birth_date || !sender_name) {
      return NextResponse.json({ error: 'Registration number, sender name and birth date are required' }, { status: 400 });
    }

    // Capture IP
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // 1. Check IP cooldown (10 seconds)
    const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();
    const { data: recentEntries, error: ipError } = await supabase
      .from('queue_users')
      .select('id')
      .eq('ip_address', ip)
      .gte('created_at', tenSecondsAgo)
      .limit(1);

    if (ipError) throw ipError;
    if (recentEntries && recentEntries.length > 0) {
      return NextResponse.json({ error: 'Please wait 10 seconds before submitting again.' }, { status: 429 });
    }

    // 2. Check Queue Limit (Max 300 waiting)
    const { count, error: countError } = await supabase
      .from('queue_users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'waiting');
      
    if (countError) throw countError;
    if (count !== null && count >= 300) {
      return NextResponse.json({ error: 'Queue is currently full, please try again later.' }, { status: 503 });
    }

    // 3. Duplicate Prevention
    const { data: existingUser, error: checkError } = await supabase
      .from('queue_users')
      .select('id')
      .eq('registration_number', registration_number)
      .limit(1);
      
    if (checkError) throw checkError;
    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ error: 'This registration number is already in the queue.' }, { status: 409 });
    }

    // 4. Calculate Priority Score
    // priority_score = (donation_amount * 10000) - timestamp (in ms)
    const timestamp = Date.now();
    const priorityScore = (0 * 10000) - timestamp;

    // 5. Insert into Database
    const { data: newUser, error: insertError } = await supabase
      .from('queue_users')
      .insert([
        {
          registration_number,
          sender_name,
          birth_date,
          is_private: is_private || false,
          donation_amount: 0,
          priority_score: priorityScore,
          ip_address: ip,
          status: 'waiting',
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ 
      message: 'You are now in the queue.',
      user: newUser 
    });

  } catch (error: any) {
    console.error('Join Queue Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
