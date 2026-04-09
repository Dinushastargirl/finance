import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  const result: any = {
    tableCheck: {},
    columns: null
  };

  // Check which table exists
  const tables = ['clients', 'client'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      result.tableCheck[table] = 'FOUND';
      if (data && data.length > 0) {
        result.columns = Object.keys(data[0]);
      } else {
        // If empty, try to get column names from another way or just try a few selects
        result.columns = "Table is empty, cannot infer columns from data[0]";
      }
    } else {
      result.tableCheck[table] = error.message;
    }
  }

  // Also try specific column checks if we think it's camelCase
  const { error: colError } = await supabase.from('clients').select('createdAt').limit(1);
  result.createdAtCheck = colError ? colError.message : 'FOUND';

  return NextResponse.json(result);
}
