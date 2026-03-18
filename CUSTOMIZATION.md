# Customization Guide — Providing the Bot to Other Businesses

This guide explains how to offer this WhatsApp AI agent as a service to other business owners.

---

## Overview

Each business needs:

| Resource | Where to get it |
|---|---|
| **WhatsApp Business phone number** | Meta Business Suite — each business registers their own |
| **Meta App + credentials** | Created once per business in Meta for Developers |
| **OpenAI API key** | The business creates their own, or you use one shared key and bill usage separately |
| **Supabase project** | One project per client (free tier works fine) |
| **Deployment** | One Vercel project per client (free tier works fine) |
| **Custom agent prompt** | Configured via the dashboard Settings page — no code changes needed |

---

## Deployment Model: One Instance Per Business (Recommended)

The simplest and most robust approach. Each client gets a fully independent deployment.

```
Client A:  vercel-project-A → supabase-project-A → meta-app-A → phone-number-A
Client B:  vercel-project-B → supabase-project-B → meta-app-B → phone-number-B
```

### Why this is the right default

- ✅ Complete data isolation — no risk of one client seeing another's conversations
- ✅ Each client's WhatsApp number is independent (required by Meta anyway)
- ✅ If one client's OpenAI quota is exhausted, it doesn't affect others
- ✅ You can give each client their own dashboard login credentials
- ✅ Each client can customize their prompt without affecting others
- ✅ Free Vercel + Supabase tiers cover most small businesses

---

## Setup Checklist for Each New Client

Work through these steps for each business you onboard.

### 1 — Fork or clone this repo for the client

```bash
# Option A: work from the same repo (keep client branches)
git checkout -b client/acme-corp

# Option B: deploy directly from the shared repo with per-client env vars
# (use Vercel project per client, each with their own env vars)
```

### 2 — Create a Supabase project for the client

1. Log in to [supabase.com](https://supabase.com) → New project
2. Name it `whatsapp-agent-<clientname>`
3. Open **SQL Editor** → paste and run the full contents of `supabase/schema.sql`
4. Go to **Settings → API** and copy:
   - Project URL
   - `anon` key
   - `service_role` key
5. Go to **Authentication → Users → Invite user** to create the client's dashboard login

### 3 — Set up the client's Meta App and WhatsApp number

> Each client must have their own WhatsApp Business number. The same phone number cannot be registered to two Meta Apps.

1. Ask the client to:
   - Create a Facebook Business account at [business.facebook.com](https://business.facebook.com)
   - Add their WhatsApp Business number
2. You (or the client) creates a Meta App at [developers.facebook.com](https://developers.facebook.com):
   - App type: **Business**
   - Add the **WhatsApp** product
   - Add the client's phone number
3. Generate a **permanent access token** via System User (see README Step 2c)
4. Note the **Phone Number ID**

### 4 — Create a Vercel project for the client

1. Go to [vercel.com](https://vercel.com) → New Project → import this repo
2. **Project Name:** `whatsapp-agent-<clientname>`
3. Add all environment variables:

```
WHATSAPP_ACCESS_TOKEN=<client token>
WHATSAPP_PHONE_NUMBER_ID=<client phone number id>
WHATSAPP_VERIFY_TOKEN=<random string you choose>
OPENAI_API_KEY=<client's or your shared key>
NEXT_PUBLIC_SUPABASE_URL=<client's supabase url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<client's anon key>
SUPABASE_SERVICE_ROLE_KEY=<client's service role key>
```

4. Deploy → note the URL: `https://whatsapp-agent-clientname.vercel.app`

### 5 — Register the webhook for the client

1. In the client's Meta App → **WhatsApp → Configuration → Webhook → Edit**
   - Callback URL: `https://whatsapp-agent-clientname.vercel.app/api/webhook`
   - Verify Token: the `WHATSAPP_VERIFY_TOKEN` you set above
2. Click **Verify and Save**
3. Subscribe to the **messages** field

### 6 — Customize the agent prompt for the client

1. Log in to `https://whatsapp-agent-clientname.vercel.app/auth/login` with the Supabase user you created
2. Click **Agent Settings** in the sidebar
3. Replace the default prompt with the client's business information:

```
You are a helpful support assistant for [Client Business Name].

About us:
[Brief description of the business]

KEY POLICIES:
- [Policy 1]
- [Policy 2]

PRODUCTS/SERVICES:
- [Product or service 1]
- [Product or service 2]

CONTACT: For issues I can't resolve, tell the customer to email [support@client.com]
or call [phone number] during business hours [hours].

TONE: [e.g. friendly, professional, concise]
```

4. Click **Save Prompt** — the bot immediately uses the new prompt.

---

## Prompt Writing Workshop

Use this template as a starting point when onboarding a new client. Fill in the blanks based on information the client provides.

```markdown
You are a helpful customer support assistant for [BUSINESS NAME], 
a [TYPE OF BUSINESS] based in [LOCATION/COUNTRY].

ABOUT US:
[2-3 sentences describing what the business does]

PRODUCTS / SERVICES:
- [Product 1]: [Brief description + price range if applicable]
- [Product 2]: [Brief description]

KEY POLICIES:
- Returns: [Return policy details]
- Refunds: [Refund policy and timeframe]
- Shipping / Delivery: [Delivery times, costs, coverage area]
- Warranty: [If applicable]
- Payment methods: [List accepted payment methods]

BUSINESS HOURS: [e.g. Monday–Friday 9am–6pm EST]

ESCALATION: If you cannot answer a question or the customer is 
upset, say: "I'm connecting you with our team who can help you 
better. You can also reach us at [email] or [phone]."

LANGUAGE: [e.g. Reply in the same language the customer uses]

TONE: Friendly, empathetic, and concise. Never make up information. 
If you are unsure, say so and offer to escalate.
```

---

## Ongoing Management

### Updating a client's agent prompt

The client (or you) can log into their dashboard and edit the prompt at any time via **Agent Settings**. No redeployment needed.

### Monitoring conversations

The dashboard at `/dashboard` shows all incoming conversations and messages in real time. Share the dashboard URL and login credentials with the client's team.

### Scaling (OpenAI costs)

- Each client should ideally have their own OpenAI API key so their usage is billed separately
- If you use a shared key, monitor usage at [platform.openai.com/usage](https://platform.openai.com/usage) and bill clients accordingly
- GPT-4o is cost-efficient: roughly $0.002 per typical customer service exchange

### Meta App approval (for production)

- During development you can only message numbers explicitly added to an allowlist in the Meta App
- To go live and message any WhatsApp user, submit your Meta App for **Business Verification** and apply for the **messages** permission
- This typically takes 1-5 business days

---

## Frequently Asked Questions

**Can one WhatsApp number serve multiple businesses?**  
No. Each WhatsApp Business number can only be linked to one Meta App. Each business must use their own number.

**Does the client need a Facebook/Meta account?**  
Yes. WhatsApp Business API requires the business to have a verified Facebook Business account.

**Can the client change the prompt themselves?**  
Yes — just give them their dashboard login and they can edit the prompt via **Agent Settings**.

**What if the bot doesn't know the answer?**  
Write your prompt to instruct the bot to escalate. Example: _"If you don't know the answer, tell the customer to contact us at support@example.com"_.

**Can the bot handle languages other than English?**  
Yes. Add this to the prompt: _"Detect the language of each message and reply in that same language."_

**How do I test before going live?**  
In the Meta App Getting Started page, add your personal WhatsApp number to the test number allowlist. Send a message from that number to test.

---

## Real World Example: Rock Aliens 🎸

> **Website:** https://www.rockaliens.co.in  
> **Business:** Music-themed restaurant, café, and live events venue (India)

This section walks through how to deploy this bot end-to-end for Rock Aliens.

### What Rock Aliens needs from the bot

- Answer questions about the menu (vegetarian options, pricing, specials)
- Tell customers about upcoming events (live bands, open-mic, DJ nights)
- Handle table reservations and direct group bookings
- Share delivery / takeaway options
- Respond in both Hindi and English
- Escalate complex requests (private events, complaints) to the team

### Environment variables for Rock Aliens' deployment

```
WHATSAPP_ACCESS_TOKEN=EAAxxxx...            # From Rock Aliens' Meta App
WHATSAPP_PHONE_NUMBER_ID=1234567890         # Rock Aliens' WhatsApp Business number ID
WHATSAPP_VERIFY_TOKEN=rockaliens_webhook_2024   # A secret you choose
OPENAI_API_KEY=sk-proj-...                  # Rock Aliens' (or your shared) OpenAI key
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Deploy at, for example: `https://whatsapp-agent-rockaliens.vercel.app`

### The agent prompt to paste into Agent Settings

The full ready-to-use prompt is in [`examples/rock-aliens-agent-prompt.md`](examples/rock-aliens-agent-prompt.md).

Key sections it covers:

| Section | What it contains |
|---|---|
| Business intro | What Rock Aliens is — music-themed dining + events |
| Menu highlights | Burgers, pizzas, Indian fusion, beverages, desserts with price ranges in ₹ |
| Events & live music | Live band nights (Fri/Sat), open-mic (Wed), DJ nights, private bookings |
| Table reservations | How to book, advance notice policy, group booking rules |
| Location & hours | Weekday/weekend hours, holiday policy |
| Ordering & delivery | Dine-in, takeaway, Swiggy/Zomato delivery |
| Payments | UPI, cards, cash — no surcharge on digital payments |
| Cancellations | Reservation and advance payment refund policies |
| Contact | WhatsApp, website, Instagram, email |
| Escalation | How to hand off to the human team |
| Language | Auto-detects Hindi and English |
| Tone | Warm, rock-music-spirited, uses 🤘 |

### Example conversations

**Customer:** Hi, do you have live music tonight?

**Bot:** Hey there! 🤘 We have **live band nights every Friday and Saturday starting at 8:00 PM**. A cover charge of ₹200–₹500 may apply (often redeemable against your bill). Check our Instagram [@rockaliens](https://instagram.com/rockaliens) for the band lineup!

---

**Customer:** Kya aapke paas vegetarian options hain?  
*(Hindi: "Do you have vegetarian options?")*

**Bot:** Bilkul! 🌿 Hamare paas kaafi saare vegetarian options hain — Veg Meteor Patty Burger, Dark Side of the Moon Pizza (7-cheese), Rocking Paneer Tikka, aur bahut kuch! Koi specific requirement hai? 😊🤘

---

**Customer:** I want to book the venue for a corporate party of 50 people

**Bot:** Absolutely, we'd love to host your corporate party! 🎉 Rock Aliens can accommodate private events for up to 200 guests, so 50 is no problem. For a customised experience, please reach out at hello@rockaliens.co.in or share your contact details and I'll flag your interest to the team right now! 🤘

### How to update the prompt when Rock Aliens changes their menu or events

1. Log in to the dashboard → **Agent Settings**
2. Edit the relevant section in the prompt (e.g. update event days, add new menu items, change prices)
3. Click **Save Prompt** — the bot uses the new prompt for the very next message

No redeployment. No code changes. Takes 30 seconds.
