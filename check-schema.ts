import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing since we're running it outside Next.js
const envPath = path.resolve('frontend/.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: any = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log("Checking profiles table...");
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error("Error fetching profile:", error.message);
    if (error.message.includes("column \"first_name\" does not exist")) {
      console.log("CRITICAL: Columns first_name, last_name, etc. are MISSING!");
    }
  } else if (data && data.length > 0) {
    console.log("Columns found:", Object.keys(data[0]));
    if (!data[0].hasOwnProperty('first_name')) {
      console.log("CRITICAL: first_name column is MISSING from profiles table.");
    } else {
      console.log("Columns look correct!");
    }
  } else {
    console.log("No data in profiles table, but table seems to exist.");
  }
}

checkSchema();
