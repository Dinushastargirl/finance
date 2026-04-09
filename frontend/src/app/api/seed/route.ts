import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for seeding operations.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const branchData = [
  { name: "Borella", id: "BRL", email: "branch.brl@rupasinghe.com", password: "Borella123" },
  { name: "Kotikawatta", id: "KOT", email: "branch.kot@rupasinghe.com", password: "Kotikawatta123" },
  { name: "Dematagoda", id: "DMT", email: "branch.dmt@rupasinghe.com", password: "Dematagoda123" },
  { name: "Wattala", id: "WAT", email: "branch.wat@rupasinghe.com", password: "Wattala123" },
  { name: "Kiribathgoda", id: "KIR", email: "branch.kir@rupasinghe.com", password: "Kiribathgoda123" },
  { name: "Kadawatha", id: "KDW", email: "branch.kdw@rupasinghe.com", password: "Kadawatha123" },
  { name: "Dehiwala", id: "DHW", email: "branch.dhw@rupasinghe.com", password: "Dehiwala123" },
  { name: "Panadura", id: "PND", email: "branch.pnd@rupasinghe.com", password: "Panadura123" },
  { name: "Kottawa", id: "KTW", email: "branch.ktw@rupasinghe.com", password: "Kottawa123" },
  { name: "Homagama", id: "HMG", email: "branch.hmg@rupasinghe.com", password: "Homagama123" },
];

export async function GET(request: Request) {
  return POST(request);
}

export async function POST(request: Request) {
  try {
    const results: any[] = [];

    // 1. Ensure the head office admin profile exists
    // We assume the auth user already exists as the user used it to log in
    // admin@rupasinghe.com
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const adminUser = authUsers?.users.find(u => u.email === 'admin@rupasinghe.com');
    
    if (adminUser) {
      await supabase.from('profiles').upsert({
        id: adminUser.id,
        email: adminUser.email,
        branchId: 'HQ',
        branchName: 'Head Office',
        role: 'ADMIN'
      });
      results.push({ email: 'admin@rupasinghe.com', status: 'Admin Profile Updated' });
    }

    // 2. Create the 10 branch users
    for (const branch of branchData) {
      // Check if user already exists
      const existingUser = authUsers?.users.find(u => u.email === branch.email);
      let userId = existingUser?.id;

      if (!existingUser) {
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: branch.email,
          password: branch.password,
          email_confirm: true
        });
        
        if (createError) {
          results.push({ email: branch.email, status: 'Error', error: createError.message });
          continue;
        }
        userId = newUser.user.id;
      }

      // Create/Update profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email: branch.email,
        branchId: branch.id,
        branchName: branch.name,
        role: 'TELLER'
      });

      if (profileError) {
        results.push({ email: branch.email, status: 'Profile Error', error: profileError.message });
      } else {
        results.push({ email: branch.email, status: existingUser ? 'Profile Updated' : 'User Created' });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("Seed Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
