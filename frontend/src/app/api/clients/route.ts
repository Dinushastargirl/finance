import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase.from('clients').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.nic || !body.firstName || !body.lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Database expects a UUID, so we generate a standard one
    const clientId = crypto.randomUUID();

    const { data, error } = await supabase.from('clients').insert([{
      id: clientId,
      nationalId: body.nic,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    }]).select().single();

    if (error) throw error;
    
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
