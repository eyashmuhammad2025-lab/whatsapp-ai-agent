import { NextRequest, NextResponse } from 'next/server'
import { parseMetaWebhook, sendWhatsAppMessage } from '@/lib/whatsapp'
import { callOpenAI } from '@/lib/openai'
import {
  createSupabaseServerClient,
  getOrCreateConversation,
  insertMessage,
} from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  console.log('[webhook] GET request received - verifying webhook')

  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('[webhook] Webhook verified successfully')
    return new NextResponse(challenge, { status: 200 })
  }

  console.error('[webhook] Webhook verification failed - invalid token or mode')
  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(request: NextRequest) {
  console.log('[webhook] POST request received - processing incoming message')

  let body: unknown
  try {
    body = await request.json()
  } catch (error) {
    console.error('[webhook] Failed to parse request body:', error)
    return new NextResponse('Bad Request', { status: 400 })
  }

  const parsed = parseMetaWebhook(body as Parameters<typeof parseMetaWebhook>[0])

  if (!parsed) {
    console.log('[webhook] No text message found in payload, ignoring')
    return new NextResponse('OK', { status: 200 })
  }

  const { phone_number, text } = parsed
  console.log(`[webhook] Message from ${phone_number}: ${text}`)

  try {
    const aiResponse = await callOpenAI(text)
    console.log(`[webhook] AI response generated for ${phone_number}`)

    await sendWhatsAppMessage(phone_number, aiResponse)
    console.log(`[webhook] WhatsApp message sent to ${phone_number}`)

    const supabase = createSupabaseServerClient()

    const conversation = await getOrCreateConversation(supabase, phone_number)

    await insertMessage(supabase, conversation.id, 'user', text)
    await insertMessage(supabase, conversation.id, 'assistant', aiResponse)

    console.log(`[webhook] Messages stored in Supabase for conversation ${conversation.id}`)
  } catch (error) {
    console.error('[webhook] Error processing message:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }

  return new NextResponse('OK', { status: 200 })
}
