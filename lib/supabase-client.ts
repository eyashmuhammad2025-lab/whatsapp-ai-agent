import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr'
import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'

export function createBrowserClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createSSRBrowserClient(supabaseUrl, supabaseAnonKey)
}

export function subscribeToMessages(
  supabase: SupabaseClient,
  conversationId: string,
  onMessage: (message: Record<string, unknown>) => void
): RealtimeChannel {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(payload.new as Record<string, unknown>)
      }
    )
    .subscribe()
}

export function subscribeToConversations(
  supabase: SupabaseClient,
  onConversation: (conversation: Record<string, unknown>) => void
): RealtimeChannel {
  return supabase
    .channel('conversations')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
      },
      (payload) => {
        onConversation(payload.new as Record<string, unknown>)
      }
    )
    .subscribe()
}
