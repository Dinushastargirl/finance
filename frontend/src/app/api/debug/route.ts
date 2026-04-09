import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  const tables = ['client', 'clients', 'customer', 'customers', 'borrower', 'borrowers', 'profile', 'profiles'];
  const results: any = {};

  for (const table of tables) {
    const { error } = await supabase.from(table).select('count').limit(1);
    if (!error) {
      results[table] = 'FOUND';
    } else {
      results[table] = error.message;
    }
  }

  return NextResponse.json(results);
}
