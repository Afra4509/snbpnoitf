const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fuhqdrmykampxlfeswfe.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1aHFkcm15a2FtcHhsZmVzd2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTc0MjYsImV4cCI6MjA4OTkzMzQyNn0.g9vSyg3OQc5yO8FGJjFAvNSEEX8F195b0y3ewhYKEok';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  const { data: userData, error: userError } = await supabase.from('queue_users').select('*').limit(1);
  if (userError) {
    console.log('User Error:', userError.message);
  } else if (userData && userData.length > 0) {
    console.log('Queue Users Columns:');
    Object.keys(userData[0]).forEach(key => console.log(`- ${key}`));
  } else {
    console.log('No data in queue_users');
  }
}

checkSchema();
