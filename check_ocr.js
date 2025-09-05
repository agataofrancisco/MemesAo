import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient('https://zsiqcnwnisfdkaiibpxf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXFjbnduaXNmZGthaWlicHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDMyNzQsImV4cCI6MjA2NjY3OTI3NH0.mgMcls6TaEkoTuxp6iLOlQ_m4NKri0vHHqEAfUV7lKg'); 
const { data } = await supabase.from('memes').select('id, title, ocr_text').not('ocr_text', 'is', null).limit(5); 
console.log('Memes com OCR:', data); 
