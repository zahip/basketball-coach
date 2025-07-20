"use client";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function LogoutButton() {
  const supabase = createClient();
  const t = useTranslations("DashboardPage");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      // First, call our logout API to clear server-side cookies and session
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.warn('Server logout failed, continuing with client logout');
        }
      } catch (apiError) {
        console.warn('Logout API call failed, continuing with client logout:', apiError);
      }
      
      // Also sign out from client-side Supabase
      try {
        await supabase.auth.signOut({
          scope: 'global'
        });
      } catch (clientError) {
        console.warn('Client logout failed:', clientError);
      }

      // Clear all client-side authentication data
      if (typeof window !== 'undefined') {
        // Clear all localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth')) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear session storage
        sessionStorage.clear();
        
        // Clear any cached data
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
          });
        }
      }

      // Force navigation to home page
      window.location.href = '/';
      
    } catch (error) {
      console.error('Unexpected logout error:', error);
      // Fallback: force navigation to home even if logout fails
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="destructive"
      size="sm"
      loading={isLoading}
      disabled={isLoading}
    >
      {t("logout")}
    </Button>
  );
}
