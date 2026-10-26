import { supabase } from "@/utils/supabase";
import { Session } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";

// session is null when signed out; isLoading stays true until the first check finishes
type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// wraps the whole app (see _layout.tsx) and keeps the current session in context
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // on startup, pick up an existing session (e.g. after a reload)
    (async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;
        setSession(currentSession ?? null);
      } catch (err) {
        console.warn("AuthProvider: getSession failed", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    // keep the session in sync with sign-in, sign-out and token refresh.
    // this should be the only auth listener in the app
    const { data } = supabase.auth.onAuthStateChange((_event: any, newSession: any) => {
      if (!mounted) return;
      setSession(newSession ?? null);
    });

    return () => {
      mounted = false;
      data?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}