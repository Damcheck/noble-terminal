import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Export a single, properly initialized Supabase instance for use across the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
