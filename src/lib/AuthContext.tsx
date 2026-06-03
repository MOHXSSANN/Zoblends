import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthCtx {
  user: User | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx>({
  user: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    const isLocalhost = window.location.hostname === 'localhost'

    if (isLocalhost) {
      // Local dev: use Supabase's built-in OAuth flow
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: { prompt: 'select_account' },
        },
      })
    } else {
      // Production: custom callback at zoblends.com so Google shows "zoblends.com"
      const params = new URLSearchParams({
        client_id: '61668975940-m4hvb7gdpikv700qcu4c9r5bpcr5crg4.apps.googleusercontent.com',
        redirect_uri: `${import.meta.env.VITE_SITE_URL}/api/auth/google/callback`,
        response_type: 'code',
        scope: 'openid email profile',
        prompt: 'select_account',
        access_type: 'offline',
      })
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <Ctx.Provider value={{ user, signInWithGoogle, signOut }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
