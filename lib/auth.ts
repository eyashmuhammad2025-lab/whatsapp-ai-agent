import { createBrowserClient } from './supabase-client'

export async function signUp(email: string, password: string) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function login(email: string, password: string) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function logout() {
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const supabase = createBrowserClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) return null
  return user
}
