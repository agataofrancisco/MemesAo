import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient('https://zsiqcnwnisfdkaiibpxf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXFjbnduaXNmZGthaWlicHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDMyNzQsImV4cCI6MjA2NjY3OTI3NH0.mgMcls6TaEkoTuxp6iLOlQ_m4NKri0vHHqEAfUV7lKg'); 
const { data, error } = await supabase.from('profiles').select('*').eq('role', 'admin'); 
console.log('Admins:', data); 
