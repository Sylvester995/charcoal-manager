import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uvgffgzxtoipaplvfszd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2Z2ZmZ3p4dG9pcGFwbHZmc3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzE1NDMsImV4cCI6MjA4ODA0NzU0M30.u-0frx5wawIZIvgmEdqTUtGPibzEYZbuKgvQA-T4Lts';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);