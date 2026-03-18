/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure AGENT_PROMPT.md is bundled with serverless API routes
  // so fs.readFileSync can find it in the Vercel production environment.
  outputFileTracingIncludes: {
    '/api/webhook': ['./AGENT_PROMPT.md'],
    '/api/settings': ['./AGENT_PROMPT.md'],
  },
}

export default nextConfig
