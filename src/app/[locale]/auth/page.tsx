"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { trpc } from "@/lib/trpc";
import { validatePassword, validateEmail } from "@/lib/security";

export default function AuthPage() {
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const t = useTranslations("AuthPage");

  const supabase = createClient();
  const userUpsert = trpc.userUpsert.useMutation();

  const handleGoogleSignIn = async () => {
    if (isBlocked) {
      setError("Authentication is temporarily blocked. Please try again later.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // Handle rate limiting
        if (error.message.includes('rate limit') || error.message.includes('Too many')) {
          setIsBlocked(true);
          setTimeout(() => setIsBlocked(false), 15 * 60 * 1000); // 15 minutes
        }
        throw error;
      }
    } catch (error: unknown) {
      console.error("Error signing in with Google:", error);
      setError(
        error instanceof Error ? error.message : "Failed to sign in with Google"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (isBlocked) {
      setError("Authentication is temporarily blocked. Please try again later.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setPasswordErrors([]);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    // Client-side validation
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (tab === "register") {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setPasswordErrors(passwordValidation.errors);
        setLoading(false);
        return;
      }
    }

    try {
      if (tab === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          // Handle rate limiting
          if (error.message.includes('rate limit') || error.message.includes('Too many')) {
            setIsBlocked(true);
            setTimeout(() => setIsBlocked(false), 15 * 60 * 1000); // 15 minutes
          }
          throw error;
        }
        
        await userUpsert.mutateAsync();
      } else {
        // Sanitize name input
        const sanitizedName = name?.trim().replace(/[<>]/g, '') || "";
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: sanitizedName,
            },
          },
        });
        
        if (error) {
          // Handle rate limiting
          if (error.message.includes('rate limit') || error.message.includes('Too many')) {
            setIsBlocked(true);
            setTimeout(() => setIsBlocked(false), 15 * 60 * 1000); // 15 minutes
          }
          throw error;
        }
        
        await userUpsert.mutateAsync();
        setError("Please check your email for verification link");
      }
    } catch (error: unknown) {
      console.error("Auth error:", error);
      setError(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (tab === "register") {
      const password = e.target.value;
      const validation = validatePassword(password);
      setPasswordErrors(validation.errors);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-orange-100">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="rounded-full bg-orange-500 w-14 h-14 flex items-center justify-center mb-2 shadow">
            <span className="text-2xl text-white font-bold">🏀</span>
          </div>
          <h2 className="text-2xl font-bold text-blue-900">{t("appName")}</h2>
        </div>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {isBlocked && (
          <div className="w-full mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-sm">
            Authentication is temporarily blocked due to too many failed attempts. Please try again in 15 minutes.
          </div>
        )}

        {passwordErrors.length > 0 && (
          <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            <ul className="list-disc list-inside">
              {passwordErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading || isBlocked}
          className="w-full mb-6 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? "Signing in..." : `Continue with Google`}
        </button>

        <div className="flex items-center w-full mb-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <div className="flex w-full mb-6">
          <button
            className={`flex-1 py-2 rounded-l-lg font-semibold transition ${
              tab === "signin"
                ? "bg-blue-700 text-white"
                : "bg-gray-100 text-blue-700"
            }`}
            onClick={() => {
              setTab("signin");
              setPasswordErrors([]);
            }}
            disabled={loading}
          >
            {t("signIn")}
          </button>
          <button
            className={`flex-1 py-2 rounded-r-lg font-semibold transition ${
              tab === "register"
                ? "bg-blue-700 text-white"
                : "bg-gray-100 text-blue-700"
            }`}
            onClick={() => {
              setTab("register");
              setPasswordErrors([]);
            }}
            disabled={loading}
          >
            {t("register")}
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="w-full flex flex-col gap-4">
          {tab === "register" && (
            <input
              type="text"
              name="name"
              placeholder={t("name")}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || isBlocked}
              maxLength={50}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder={t("email")}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading || isBlocked}
            maxLength={254}
          />
          <input
            type="password"
            name="password"
            placeholder={t("password")}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading || isBlocked}
            maxLength={128}
            minLength={tab === "register" ? 8 : 1}
            onChange={handlePasswordChange}
          />
          
          {tab === "register" && (
            <div className="text-xs text-gray-600">
              <p className="mb-1">Password requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
                <li>One special character</li>
              </ul>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || isBlocked || (tab === "register" && passwordErrors.length > 0)}
            className={`py-2 rounded font-semibold transition disabled:opacity-50 ${
              tab === "signin"
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-blue-700 text-white hover:bg-blue-800"
            }`}
          >
            {loading
              ? "Please wait..."
              : tab === "signin"
              ? t("signIn")
              : t("register")}
          </button>
        </form>

        <Link href="/" className="mt-6 text-blue-700 hover:underline text-sm">
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}
