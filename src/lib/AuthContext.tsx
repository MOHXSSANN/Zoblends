import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void
          prompt: () => void
          cancel: () => void
        }
      }
    }
  }
}

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

  // Initialize GIS once the script loads
  useEffect(() => {
    function init() {
      window.google?.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
        callback: async ({ credential }: { credential: string }) => {
          await supabase.auth.signInWithIdToken({ provider: 'google', token: credential })
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      })
    }

    if (window.google?.accounts) {
      init()
    } else {
      const script = document.querySelector('script[src*="accounts.google.com/gsi"]')
      script?.addEventListener('load', init)
    }
  }, [])

  async function signInWithGoogle() {
    if (window.google?.accounts) {
      window.google.accounts.id.prompt()
    } else {
      // Fallback: redirect flow
      const redirectTo = import.meta.env.VITE_SITE_URL ?? window.location.origin
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
    }
  }

  async function signOut() {
    window.google?.accounts.id.cancel()
    await supabase.auth.signOut()
  }

  return (
    <Ctx.Provider value={{ user, signInWithGoogle, signOut }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
