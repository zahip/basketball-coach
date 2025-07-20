"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthDebug() {
  const [authState, setAuthState] = useState<{user?: {id: string} | null; error?: string; event?: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        setAuthState({ user: data.user, error: error?.message });
      } catch (err) {
        setAuthState({ error: err instanceof Error ? err.message : 'Unknown error' });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setAuthState({ user: session?.user, event });
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <div className="font-bold mb-2">Auth Debug</div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <div>User: {authState?.user ? 'Logged in' : 'Not logged in'}</div>
          <div>ID: {authState?.user?.id?.slice(0, 8) || 'None'}</div>
          <div>Event: {authState?.event || 'None'}</div>
          {authState?.error && <div className="text-red-400">Error: {authState.error}</div>}
        </div>
      )}
    </div>
  );
}