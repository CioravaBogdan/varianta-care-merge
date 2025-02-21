import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bmszhjjkcqooewyackgn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtc3poamprY3Fvb2V3eWFja2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0NzQ3MjQsImV4cCI6MjA1NTA1MDcyNH0.EN3MgNtfb5hikjVgAf-PoB1rCruGSYvtZVbTN6VW3Gg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);