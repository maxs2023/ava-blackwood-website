import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://adupucnpoceetzuhutog.supabase.co'
// IMPORTANT: Replace with your actual Supabase public anon key
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkdXB1Y25wb2NlZXR6dWh1dG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2OTE1MTcsImV4cCI6MjA2ODI2NzUxN30.2lcLrPSS4-frM9EH-RDVWChX0wjezBQMMZdIEimMZqU' 

export const supabase = createClient(supabaseUrl, supabaseKey)
