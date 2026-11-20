import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// createClient throws when the URL is empty, so without both values we export null and App shows the banner
export const supabase = url && key ? createClient(url, key) : null
