import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, amount } = body;
    
    if (!user_id || !amount) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Log the donation
    const { error: logError } = await supabase
      .from('donations')
      .insert([{ user_id, amount }]);

    if (logError) throw logError;

    // 2. Fetch the user info
    const { data: user, error: userError } = await supabase
      .from('queue_users')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError || !user) throw new Error('User not found');

    // 3. Update the priority score ONCE
    const newDonationAmount = user.donation_amount + amount;
    // timestamp from created_at
    const timestamp = new Date(user.created_at).getTime();
    const newPriorityScore = (newDonationAmount * 10000) - timestamp;

    // 4. Update the user
    const { error: updateError } = await supabase
      .from('queue_users')
      .update({
        donation_amount: newDonationAmount,
        priority_score: newPriorityScore,
      })
      .eq('id', user_id);

    if (updateError) throw updateError;

    return NextResponse.json({ message: 'Donation successful! Priority boosted.' });

  } catch (error: any) {
    console.error('Donate Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
