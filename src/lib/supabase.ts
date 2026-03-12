import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const SUPABASE_URL = "https://qgkyjdteeucnhlbzmcor.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFna3lqZHRlZXVjbmhsYnptY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTY2ODAsImV4cCI6MjA4ODgzMjY4MH0.r2Zva6R9DQeQEQNpOzsp2zeEfewi82mTFJi9UiLW2Hc";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);