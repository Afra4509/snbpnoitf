const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fuhqdrmykampxlfeswfe.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1aHFkcm15a2FtcHhsZmVzd2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTc0MjYsImV4cCI6MjA4OTkzMzQyNn0.g9vSyg3OQc5yO8FGJjFAvNSEEX8F195b0y3ewhYKEok';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const firstNames = ['Andi','Budi','Citra','Dewi','Eko','Fira','Galih','Hana','Irfan','Joko',
  'Kartika','Lina','Maya','Nisa','Omar','Putri','Qori','Rina','Sari','Tono',
  'Umar','Vina','Wahyu','Xena','Yusuf','Zahra','Arif','Bella','Cahya','Dimas',
  'Elia','Fajar','Gina','Haris','Indah','Jihan','Kiki','Lukman','Mega','Nabil',
  'Okta','Pandu','Raka','Sinta','Tiara','Uli','Vera','Wanda','Yani','Zaki'];

const lastNames = ['Pratama','Sari','Wijaya','Putra','Lestari','Kurniawan','Saputra','Rahayu',
  'Hidayat','Wibowo','Susanto','Handayani','Setiawan','Fitri','Nugroho','Permana',
  'Dewi','Ramadhan','Utami','Santoso'];

function randomName() {
  const f = firstNames[Math.floor(Math.random() * firstNames.length)];
  const l = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${f} ${l}`;
}

async function seed() {
  const dummyUsers = [];
  
  for (let i = 1; i <= 100; i++) {
    const isPrivate = Math.random() > 0.85;
    const donationAmount = Math.random() > 0.6 ? [5000, 10000, 20000][Math.floor(Math.random() * 3)] : 0;
    const artificialTimestamp = Date.now() - (i * 60000);
    const priorityScore = (donationAmount * 10000) - artificialTimestamp;
    
    dummyUsers.push({
      sender_name: randomName(),
      registration_number: `${Math.floor(100000000000 + Math.random() * 899999999999)}`,
      birth_date: `${2000 + Math.floor(Math.random() * 7)}-${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}-${String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')}`,
      donation_amount: donationAmount,
      priority_score: priorityScore,
      is_private: isPrivate,
      ip_address: `192.168.${Math.floor(Math.random() * 255)}.${i}`,
      status: 'waiting'
    });
  }

  console.log('Menambahkan 100 dummy users...');
  
  const { data, error } = await supabase.from('queue_users').insert(dummyUsers);
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('✅ 100 dummy users berhasil ditambahkan!');
    console.log('Cek di http://localhost:3000/afrapunya');
  }
}

seed();
