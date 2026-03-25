import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');
    const amountStr = searchParams.get('amount');

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Determine target origin gracefully
    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || (req.url.startsWith('https') ? 'https' : 'http');
    const origin = `${proto}://${host}`;

    // Attempt to get amount
    const amount = amountStr ? parseInt(amountStr, 10) : 0;
    
    // If amount is missing or invalid, we just redirect to queue without boosting
    if (isNaN(amount) || amount < 1000) {
      return NextResponse.redirect(`${origin}/queue`);
    }

    // 1. Fetch user
    const { data: user, error: userError } = await supabase
      .from('queue_users')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Update if valid amount
    if (amount >= 1000 && user.status === 'waiting') {
      const { error: logError } = await supabase
        .from('donations')
        .insert([{ user_id, amount }]);

      if (!logError) {
        const newDonationAmount = (user.donation_amount || 0) + amount;
        const timestamp = new Date(user.created_at).getTime();
        const newPriorityScore = (newDonationAmount * 10000) - timestamp;

        await supabase
          .from('queue_users')
          .update({
            donation_amount: newDonationAmount,
            priority_score: newPriorityScore,
          })
          .eq('id', user_id);
      }
    }

    return NextResponse.redirect(`${origin}/queue`);

  } catch (error: any) {
    console.error('Donate Confirm Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
