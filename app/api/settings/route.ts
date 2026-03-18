import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import {
  createSupabaseServerClient,
  getAgentPromptSetting,
  saveAgentPromptSetting,
} from '@/lib/supabase-server'
import { resolveAgentPrompt } from '@/lib/openai'

/** Verify the caller is an authenticated dashboard user. */
async function getAuthenticatedUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Middleware handles session refresh — safe to ignore here.
          }
        },
      },
    }
  )
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/** GET /api/settings — return current agent prompt */
export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseServerClient()
  const dbPrompt = await getAgentPromptSetting(supabase)
  const prompt = resolveAgentPrompt(dbPrompt)

  return NextResponse.json({ prompt, source: dbPrompt ? 'database' : 'file' })
}

/** POST /api/settings — save agent prompt */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { prompt?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const prompt = body.prompt?.trim()
  if (!prompt) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  await saveAgentPromptSetting(supabase, prompt)

  return NextResponse.json({ success: true })
}
