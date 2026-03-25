const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fuhqdrmykampxlfeswfe.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1aHFkcm15a2FtcHhsZmVzd2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTc0MjYsImV4cCI6MjA4OTkzMzQyNn0.g9vSyg3OQc5yO8FGJjFAvNSEEX8F195b0y3ewhYKEok';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUser(userId) {
  const { data, error } = await supabase
    .from('queue_users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error.message);
  } else {
    console.log('User Data:', JSON.stringify(data, null, 2));
  }
}

const userId = '620734d0-a9cd-428d-bffa-111f07583d8a';
checkUser(userId);
