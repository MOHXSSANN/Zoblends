import type { VercelRequest, VercelResponse } from '@vercel/node'

const GOOGLE_CLIENT_ID = '61668975940-m4hvb7gdpikv700qcu4c9r5bpcr5crg4.apps.googleusercontent.com'
const SITE_URL = process.env.VITE_SITE_URL || 'https://zoblends.com'
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, error } = req.query

  if (error || !code || typeof code !== 'string') {
    return res.redirect(`${SITE_URL}/?auth_error=true`)
  }

  try {
    // Exchange authorization code for Google tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${SITE_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })

    const googleTokens = await tokenRes.json() as { id_token?: string }

    if (!googleTokens.id_token) {
      return res.redirect(`${SITE_URL}/?auth_error=true`)
    }

    // Exchange Google id_token for a Supabase session
    const supabaseRes = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=id_token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ provider: 'google', id_token: googleTokens.id_token }),
      }
    )

    const session = await supabaseRes.json() as {
      access_token?: string
      refresh_token?: string
      expires_in?: number
    }

    if (!session.access_token) {
      return res.redirect(`${SITE_URL}/?auth_error=true`)
    }

    // Redirect back to the app — Supabase client auto-processes tokens in the URL hash
    const hash = new URLSearchParams({
      access_token: session.access_token,
      refresh_token: session.refresh_token ?? '',
      token_type: 'bearer',
      expires_in: String(session.expires_in ?? 3600),
      type: 'recovery',
    })

    return res.redirect(`${SITE_URL}/#${hash.toString()}`)
  } catch (err) {
    console.error('Google OAuth callback error:', err)
    return res.redirect(`${SITE_URL}/?auth_error=true`)
  }
}
