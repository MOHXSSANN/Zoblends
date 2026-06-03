import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

const GOOGLE_CLIENT_ID = '61668975940-m4hvb7gdpikv700qcu4c9r5bpcr5crg4.apps.googleusercontent.com'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void
          renderButton: (el: HTMLElement, cfg: object) => void
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
  const gBtnRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    // Create a hidden container for the real Google button
    const container = document.createElement('div')
    container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;'
    document.body.appendChild(container)
    gBtnRef.current = container

    function init() {
      if (!window.google?.accounts) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }: { credential: string }) => {
          await supabase.auth.signInWithIdToken({ provider: 'google', token: credential })
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      // Render a real Google button off-screen — clicking it opens the full account picker
      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: 'signin_with',
      })
    }

    if (window.google?.accounts) {
      init()
    } else {
      const script = document.querySelector('script[src*="accounts.google.com/gsi"]')
      script?.addEventListener('load', init)
    }

    return () => container.remove()
  }, [])

  async function signInWithGoogle() {
    const btn = gBtnRef.current?.querySelector<HTMLElement>('div[role="button"]')
    if (btn) {
      btn.click()
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
