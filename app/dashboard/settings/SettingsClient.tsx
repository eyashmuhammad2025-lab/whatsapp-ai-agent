'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const PLACEHOLDER = `You are a helpful customer support assistant for [Your Business Name].

KEY POLICIES:
- Returns: [Describe your return policy]
- Shipping: [Describe your shipping options]
- Payment: [List accepted payment methods]

TONE: Be friendly, helpful, and concise.`

export default function SettingsClient() {
  const [prompt, setPrompt] = useState('')
  const [originalPrompt, setOriginalPrompt] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings')
        if (!res.ok) throw new Error('Failed to load settings')
        const data = await res.json()
        setPrompt(data.prompt ?? '')
        setOriginalPrompt(data.prompt ?? '')
      } catch (err) {
        setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to save')
      }
      setOriginalPrompt(prompt)
      setStatus({ type: 'success', message: 'Agent prompt saved! It will be used for all new messages.' })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  const isDirty = prompt !== originalPrompt

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <span className="font-semibold text-foreground">WhatsApp AI</span>
        </div>

        <nav className="p-3 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-foreground hover:bg-surface-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Conversations
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground bg-surface-2 border-l-2 border-primary rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Agent Settings</h1>
          <p className="text-sm text-gray-400 mb-8">
            Customize what your AI agent says and how it behaves. Changes take effect immediately for new messages.
          </p>

          {/* Prompt editor */}
          <div className="bg-surface rounded-xl border border-border p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">Agent System Prompt</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  This is the personality and knowledge base for your AI agent. Describe your business, policies, and tone.
                </p>
              </div>
              <span className="text-xs text-gray-500 bg-surface-2 px-2 py-1 rounded font-mono">
                {prompt.length} chars
              </span>
            </div>

            {loading ? (
              <div className="h-64 bg-surface-2 rounded-lg animate-pulse" />
            ) : (
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={PLACEHOLDER}
                rows={18}
                className="w-full px-4 py-3 bg-surface-2 border border-border rounded-lg text-sm text-foreground placeholder-gray-600 font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            )}

            {status && (
              <div
                className={`mt-3 text-sm px-3 py-2 rounded-lg border ${
                  status.type === 'success'
                    ? 'bg-green-400/10 border-green-400/20 text-green-400'
                    : 'bg-red-400/10 border-red-400/20 text-red-400'
                }`}
              >
                {status.message}
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving || loading || !isDirty}
                className="px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? 'Saving…' : 'Save Prompt'}
              </button>
              {isDirty && (
                <button
                  onClick={() => setPrompt(originalPrompt)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-foreground transition-colors"
                >
                  Discard changes
                </button>
              )}
            </div>
          </div>

          {/* Prompt priority info */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-foreground mb-3">How the prompt is loaded</h2>
            <ol className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
                <span>
                  <strong className="text-foreground">AGENT_PROMPT env var</strong> — set this in your hosting platform (Vercel, etc.) to override everything.
                  Best for production deployments where you don&apos;t want DB reads.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
                <span>
                  <strong className="text-foreground">This settings page (Supabase)</strong> — what you edit above.
                  Survives redeployments and is editable without touching code.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">3</span>
                <span>
                  <strong className="text-foreground">AGENT_PROMPT.md file</strong> — the file in your repository root.
                  Useful during local development.
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
