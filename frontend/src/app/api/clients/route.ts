import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Safe initialization to prevent build-time crashes when secrets are unavailable
let supabase: any;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not initialized (Key missing during build)" }, { status: 500 });
    }
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const role = searchParams.get('role');

    let query = supabase.from('clients').select('*').order('created_at', { ascending: false });

    // Multi-tenant isolation: Tellers can ONLY see their own branch
    if (role === 'TELLER' && branchId) {
      query = query.eq('branch_id', branchId);
    } 
    // Admins can see specific branches if filtered
    else if (branchId && branchId !== 'HQ') {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not initialized (Key missing during build)" }, { status: 500 });
    }
    const body = await request.json();
    const { nic, firstName, lastName, phone, branchId, createdByUserId } = body;
    
    if (!nic || !firstName || !lastName || !branchId || !createdByUserId) {
      return NextResponse.json({ error: "Missing required fields (nic, firstName, lastName, branchId, createdByUserId)" }, { status: 400 });
    }

    // Database expects a UUID, so we generate a standard one
    const clientId = crypto.randomUUID();

    const { data, error } = await supabase.from('clients').insert([{
      id: clientId,
      national_id: nic,
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      branch_id: branchId,
      created_by_user_id: createdByUserId,
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    }]).select().single();

    if (error) throw error;
    
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
