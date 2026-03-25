import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('--- PAKASIR WEBHOOK RECEIVED ---');
    console.log(JSON.stringify(body, null, 2));

    // Pakasir sends order_id (our userId) and amount
    const { order_id, amount, status } = body;

    if (status !== 'success') {
      return NextResponse.json({ message: 'Ignore non-success status' });
    }

    if (!order_id || !amount) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Fetch the user info
    const { data: user, error: userError } = await supabase
      .from('queue_users')
      .select('*')
      .eq('id', order_id)
      .single();

    if (userError || !user) {
      console.error('Webhook: User not found', order_id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Only update if not already processed (optional check)
    // For now we just use the same logic as confirm route
    if (user.status === 'waiting') {
      const { error: logError } = await supabase
        .from('donations')
        .insert([{ user_id: order_id, amount }]);

      if (!logError) {
        const newDonationAmount = (user.donation_amount || 0) + Number(amount);
        const timestamp = new Date(user.created_at).getTime();
        const newPriorityScore = (newDonationAmount * 10000) - timestamp;

        const { error: updateError } = await supabase
          .from('queue_users')
          .update({
            donation_amount: newDonationAmount,
            priority_score: newPriorityScore,
          })
          .eq('id', order_id);

        if (updateError) {
          console.error('Webhook Update Error:', updateError);
        }
      } else {
        console.error('Webhook Log Error:', logError);
      }
    }

    return NextResponse.json({ status: 'success', message: 'Priority boosted via webhook' });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
