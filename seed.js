const { createClient } = require('@supabase/supabase-js');

// Menggunakan URL & API Key dari file supabase.ts yang telah disetup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fuhqdrmykampxlfeswfe.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1aHFkcm15a2FtcHhsZmVzd2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTc0MjYsImV4cCI6MjA4OTkzMzQyNn0.g9vSyg3OQc5yO8FGJjFAvNSEEX8F195b0y3ewhYKEok';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  const dummyUsers = [];
  
  for (let i = 1; i <= 500; i++) {
    // 20% kemungkinan user private
    const isPrivate = Math.random() > 0.8;
    
    // Beberapa user berdonasi Rp 10rb atau 20rb, sisanya Rp 0
    const donationAmount = Math.random() > 0.5 ? Math.floor(Math.random() * 2 + 1) * 10000 : 0;
    
    // Bikin timestamp buatan secara berurutan, makin duluan join makin timestampnya kecil (dianggap gabung duluan)
    const artificialTimestamp = Date.now() - (i * 100000); 
    
    // priority_score = (donation_amount * 10000) - timestamp
    const priorityScore = (donationAmount * 10000) - artificialTimestamp;
    
    dummyUsers.push({
      registration_number: `REG-SMART-${Math.floor(10000 + Math.random() * 90000)}-${i}`,
      birth_date: `200${Math.floor(Math.random() * 5)}-0${Math.floor(1 + Math.random() * 8)}-1${Math.floor(Math.random() * 9)}`,
      donation_amount: donationAmount,
      priority_score: priorityScore,
      is_private: isPrivate,
      ip_address: `192.168.1.${i}`,
      status: 'waiting'
    });
  }

  console.log('Menyiapkan 10 data pendaftar antrean...');
  
  const { data, error } = await supabase.from('queue_users').insert(dummyUsers);
  
  if (error) {
    console.error('Error saat membuat data dummy:', error.message);
  } else {
    console.log('✅ Sukses menambahkan 10 pendaftar ke Database!');
    console.log('Sekarang kamu bisa cek http://localhost:3000/afrapunya untuk melihat mereka di Dashboard Antrean.');
  }
}

seed();
