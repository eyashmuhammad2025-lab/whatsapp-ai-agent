export interface MetaWebhookEntry {
  id: string
  changes: Array<{
    value: {
      messaging_product: string
      metadata: {
        display_phone_number: string
        phone_number_id: string
      }
      contacts?: Array<{
        profile: { name: string }
        wa_id: string
      }>
      messages?: Array<{
        from: string
        id: string
        timestamp: string
        text?: { body: string }
        type: string
      }>
    }
    field: string
  }>
}

export interface MetaWebhookPayload {
  object: string
  entry: MetaWebhookEntry[]
}

export interface ParsedMessage {
  phone_number: string
  text: string
}

export function parseMetaWebhook(payload: MetaWebhookPayload): ParsedMessage | null {
  try {
    const entry = payload.entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value
    const message = value?.messages?.[0]

    if (!message || message.type !== 'text' || !message.text?.body) {
      return null
    }

    return {
      phone_number: message.from,
      text: message.text.body,
    }
  } catch (error) {
    console.error('[whatsapp] Error parsing Meta webhook payload:', error)
    return null
  }
}

export async function sendWhatsAppMessage(
  to: string,
  text: string
): Promise<void> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken || !phoneNumberId) {
    throw new Error('WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID env vars are missing')
  }

  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: text },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`WhatsApp API error: ${response.status} - ${error}`)
  }
}
