import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize client only if key is present to prevent build-time crashes
let supabase: any;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not initialized" }, { status: 500 });
    }
    const { data, error } = await supabase
      .from('branch_status')
      .select('*');
    
    if (error) throw error;

    // Convert to a mapping for easy UI consumption: { BRL: 'OPEN', KOT: 'CLOSED' }
    const statusMap = data.reduce((acc: any, curr: any) => {
      acc[curr.branchId] = curr.status;
      return acc;
    }, {});

    return NextResponse.json(statusMap);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { branchId, status } = await request.json();

    if (!branchId || !status) {
      return NextResponse.json({ error: "Missing branchId or status" }, { status: 400 });
    }

    if (!supabase) {
        return NextResponse.json({ error: "Supabase not initialized" }, { status: 500 });
    }
    const { data, error } = await supabase
      .from('branch_status')
      .upsert({
        branchId,
        status,
        updatedAt: new Date().toISOString()
      }, { onConflict: 'branchId' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
