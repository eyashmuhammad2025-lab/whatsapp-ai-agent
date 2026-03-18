# WhatsApp AI Agent

A production-ready **Next.js 16** full-stack application that connects a WhatsApp Business number to an OpenAI GPT-4o powered AI agent, with a real-time business dashboard for monitoring conversations.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Quick Start (Local Dev)](#quick-start-local-dev)
3. [Step 1 — Supabase Setup](#step-1--supabase-setup)
4. [Step 2 — Meta / WhatsApp Business Setup](#step-2--meta--whatsapp-business-setup)
5. [Step 3 — OpenAI API Key](#step-3--openai-api-key)
6. [Step 4 — Deploy to Vercel](#step-4--deploy-to-vercel)
7. [Step 5 — Register the Webhook](#step-5--register-the-webhook)
8. [Customizing the AI Agent](#customizing-the-ai-agent)
9. [Providing This to Other Businesses](#providing-this-to-other-businesses)
10. [Project Structure](#project-structure)
11. [Environment Variables Reference](#environment-variables-reference)

---

## Architecture Overview

```
WhatsApp User
     │
     ▼ (sends message)
Meta Cloud API
     │
     ▼ HTTP POST
/api/webhook  ──► OpenAI GPT-4o ──► reply sent back via Meta Cloud API
     │
     ▼
Supabase (conversations + messages stored)
     │
     ▼
Business Dashboard (Next.js, real-time via Supabase Realtime)
```

**Tech stack:** Next.js 16 · TypeScript · Tailwind CSS · Supabase (Postgres + Realtime + Auth) · OpenAI GPT-4o · Meta WhatsApp Cloud API

---

## Quick Start (Local Dev)

```bash
git clone https://github.com/eyashmuhammad2025-lab/whatsapp-ai-agent.git
cd whatsapp-ai-agent
npm install
cp .env.local.example .env.local
# Fill in .env.local with your credentials (see below)
npm run dev          # http://localhost:3000
```

> For local testing of the webhook you will need a public HTTPS URL.  
> Use [ngrok](https://ngrok.com): `ngrok http 3000` and use the printed URL as your webhook.

---

## Step 1 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Note your **Project URL** and **anon key** (Settings → API)
3. Also copy the **service_role key** (keep this secret — it bypasses RLS)
4. Open the **SQL Editor** and run the entire contents of [`supabase/schema.sql`](supabase/schema.sql)
5. Create a dashboard login account:
   - Go to **Authentication → Users → Invite user** (or sign up via the login page once deployed)

**Environment variables from this step:**

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Step 2 — Meta / WhatsApp Business Setup

### 2a — Create a Meta App

1. Go to [developers.facebook.com](https://developers.facebook.com) → **My Apps → Create App**
2. Choose **Business** as the app type → Next
3. Enter an app name and click **Create App**
4. In the left sidebar find **WhatsApp** and click **Set up**

### 2b — Add a Phone Number

1. Under **WhatsApp → Getting Started**, click **Add phone number**  
   (you can use the free test number for development — it has a 5-number allowlist)
2. Complete the phone number verification
3. Note the **Phone Number ID** shown on the page

### 2c — Generate an Access Token

| Environment | Recommendation |
|---|---|
| Development | Use the temporary token on the Getting Started page (expires in 24 h) |
| Production | Create a **System User** (Business Settings → System Users), assign the WhatsApp app, and generate a **permanent token** |

**Environment variables from this step:**

```
WHATSAPP_ACCESS_TOKEN=EAAxxxxx
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_VERIFY_TOKEN=any_random_secret_string_you_choose
```

> `WHATSAPP_VERIFY_TOKEN` is a string **you invent** — it just needs to match what you enter in the Meta webhook configuration below.

---

## Step 3 — OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **Create new secret key** → copy it

```
OPENAI_API_KEY=sk-proj-...
```

---

## Step 4 — Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. In the **Environment Variables** section, add all variables from `.env.local.example`
4. Click **Deploy**
5. Note your production URL: `https://your-app.vercel.app`

---

## Step 5 — Register the Webhook

1. In the Meta App dashboard go to **WhatsApp → Configuration**
2. Under **Webhook** click **Edit**:
   - **Callback URL:** `https://your-app.vercel.app/api/webhook`
   - **Verify Token:** the same value as `WHATSAPP_VERIFY_TOKEN`
3. Click **Verify and Save** — Meta will call your URL and check the token
4. Under **Webhook Fields**, subscribe to **messages**

✅ Your bot is now live. Send a WhatsApp message to your business number and the AI will reply.

---

## Customizing the AI Agent

The agent's personality, knowledge, and tone are controlled by its **system prompt**. There are three ways to set it, in priority order:

### Option A — Dashboard Settings Page (recommended)

1. Log in to the dashboard at `https://your-app.vercel.app/auth/login`
2. Click **Agent Settings** at the bottom of the sidebar
3. Edit the prompt text and click **Save Prompt**

Changes take effect immediately for the next incoming message — no redeployment needed.

### Option B — `AGENT_PROMPT` Environment Variable

Set `AGENT_PROMPT` in Vercel (or any hosting platform) to your full prompt text.  
This overrides the database and the file. Useful when you want the prompt pinned to a specific deployment.

### Option C — `AGENT_PROMPT.md` File

Edit the `AGENT_PROMPT.md` file in the project root and redeploy.  
Useful during local development.

### Prompt Writing Tips

```markdown
You are a helpful support assistant for [Business Name], a [describe business].

KEY INFORMATION:
- [Policy or fact 1]
- [Policy or fact 2]
- [How to contact a human agent if needed]

TONE: [e.g. friendly and professional, casual, formal]

IMPORTANT: If a customer asks something you don't know, tell them
you'll connect them with a human agent rather than guessing.
```

---

## Providing This to Other Businesses

See **[CUSTOMIZATION.md](CUSTOMIZATION.md)** for the full guide on how to deploy separate instances of this bot for different business clients.

**Summary of approaches:**

| Approach | Best for |
|---|---|
| **One deployment per client** | Simplest — each client gets their own Vercel project, Supabase project, and WhatsApp number |
| **White-label SaaS** | Each client logs into their own instance; you manage deployments via a script or CI |

---

## Project Structure

```
whatsapp-ai-agent/
├── app/
│   ├── api/
│   │   ├── webhook/route.ts     # Meta webhook (GET verify + POST messages)
│   │   └── settings/route.ts   # Dashboard settings API
│   ├── auth/login/page.tsx      # Login page
│   ├── dashboard/
│   │   ├── page.tsx             # Protected dashboard (server component)
│   │   ├── DashboardClient.tsx  # Real-time chat interface (client component)
│   │   └── settings/
│   │       ├── page.tsx         # Settings page (server component)
│   │       └── SettingsClient.tsx # Prompt editor (client component)
│   ├── layout.tsx
│   └── page.tsx                 # Redirects to login or dashboard
├── components/
│   ├── AuthProvider.tsx
│   ├── ChatBubble.tsx
│   └── ConversationSidebar.tsx
├── lib/
│   ├── auth.ts                  # Supabase auth helpers
│   ├── openai.ts                # GPT-4o integration + prompt resolution
│   ├── supabase-client.ts       # Browser Supabase client + realtime
│   ├── supabase-server.ts       # Server Supabase client + DB helpers
│   └── whatsapp.ts              # Meta webhook parser + message sender
├── supabase/
│   └── schema.sql               # Full Postgres schema with RLS policies
├── AGENT_PROMPT.md              # Default agent prompt (editable via dashboard)
├── CUSTOMIZATION.md             # Guide for reselling / multi-client setup
└── .env.local.example           # All required environment variables
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `WHATSAPP_ACCESS_TOKEN` | ✅ | Meta access token for sending messages |
| `WHATSAPP_PHONE_NUMBER_ID` | ✅ | ID of your WhatsApp Business phone number |
| `WHATSAPP_VERIFY_TOKEN` | ✅ | Secret token you choose for webhook verification |
| `OPENAI_API_KEY` | ✅ | OpenAI API key |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-side only) |
| `AGENT_PROMPT` | Optional | Override the agent system prompt without the DB or file |
