import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase.from('clients').select('*');
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

    const clientId = `CLI-${Date.now().toString().slice(-6)}`;

    const { data, error } = await supabase.from('clients').insert([{
      id: clientId,
      national_id: body.nic,
      first_name: body.firstName,
      last_name: body.lastName,
      phone: body.phone,
      status: 'ACTIVE'
    }]).select().single();

    if (error) throw error;
    
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
