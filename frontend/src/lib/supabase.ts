import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get the current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting session:', error.message)
    return null
  }
  return session
}

// Helper function to get the current user
export const getCurrentUser = async () => {
  const session = await getSession()
  if (!session) return null
  return session.user
}

// Helper function to get the access token
export const getAccessToken = async () => {
  const session = await getSession()
  if (!session) return null
  return session.access_token
} 