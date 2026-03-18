import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface Conversation {
  id: string
  phone_number: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export function createSupabaseServerClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function getOrCreateConversation(
  supabase: SupabaseClient,
  phoneNumber: string
): Promise<Conversation> {
  console.log(`[supabase] Looking up conversation for phone: ${phoneNumber}`)
  const { data: existing, error: selectError } = await supabase
    .from('conversations')
    .select('*')
    .eq('phone_number', phoneNumber)
    .single()

  if (selectError && selectError.code !== 'PGRST116') {
    console.error('[supabase] Error selecting conversation:', selectError)
    throw selectError
  }

  if (existing) {
    console.log(`[supabase] Found existing conversation: ${existing.id}`)
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', existing.id)

    if (updateError) {
      console.error('[supabase] Error updating conversation updated_at:', updateError)
    }
    return existing as Conversation
  }

  console.log(`[supabase] Creating new conversation for phone: ${phoneNumber}`)
  const { data: created, error: insertError } = await supabase
    .from('conversations')
    .insert({ phone_number: phoneNumber })
    .select('*')
    .single()

  if (insertError) {
    console.error('[supabase] Error creating conversation:', insertError)
    throw insertError
  }

  console.log(`[supabase] Created new conversation: ${created.id}`)
  return created as Conversation
}

export async function insertMessage(
  supabase: SupabaseClient,
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<Message> {
  console.log(`[supabase] Inserting ${role} message for conversation: ${conversationId}`)
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
    })
    .select('*')
    .single()

  if (error) {
    console.error(`[supabase] Error inserting ${role} message:`, error)
    throw error
  }

  console.log(`[supabase] Inserted ${role} message: ${data.id}`)
  return data as Message
}

/**
 * Loads the agent prompt stored in the `settings` table (key = 'agent_prompt').
 * Returns null if the row does not exist yet.
 */
export async function getAgentPromptSetting(
  supabase: SupabaseClient
): Promise<string | null> {
  console.log('[supabase] Loading agent_prompt from settings table')
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'agent_prompt')
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('[supabase] Error reading agent_prompt setting:', error)
    }
    return null
  }

  return data?.value ?? null
}

/**
 * Persists the agent prompt to the `settings` table (upsert).
 */
export async function saveAgentPromptSetting(
  supabase: SupabaseClient,
  prompt: string
): Promise<void> {
  console.log('[supabase] Saving agent_prompt to settings table')
  const { error } = await supabase.from('settings').upsert(
    { key: 'agent_prompt', value: prompt, updated_at: new Date().toISOString() },
    { onConflict: 'key' }
  )

  if (error) {
    console.error('[supabase] Error saving agent_prompt setting:', error)
    throw error
  }

  console.log('[supabase] agent_prompt saved successfully')
}
