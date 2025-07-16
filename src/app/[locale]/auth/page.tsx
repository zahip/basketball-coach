"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function AuthPage() {
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations("AuthPage");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      const supabase = createClient();

      if (tab === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });
        if (error) throw error;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-hero opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-basketball-orange-50 via-basketball-blue-50 to-basketball-green-50"></div>
      
      {/* Floating Basketball Elements */}
      <div className="absolute top-20 left-10 w-12 h-12 bg-basketball-orange-500 rounded-full opacity-20 animate-bounce-gentle"></div>
      <div className="absolute top-40 right-20 w-8 h-8 bg-basketball-blue-500 rounded-full opacity-20 animate-pulse-subtle"></div>
      <div className="absolute bottom-40 left-20 w-6 h-6 bg-basketball-green-500 rounded-full opacity-20 animate-spin-slow"></div>
      <div className="absolute bottom-20 right-10 w-10 h-10 bg-basketball-orange-400 rounded-full opacity-20 animate-bounce-gentle"></div>
      
      {/* Back to Home Link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 glass text-basketball-blue-700 font-medium rounded-xl hover:bg-white/20 transition-all duration-200 hover-lift focus-ring"
        >
          <span className="mr-2">←</span>
          {t("backToHome")}
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Auth Card */}
          <div className="glass-dark rounded-3xl p-8 shadow-intense backdrop-blur-xl border border-white/20 animate-scale-in">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 gradient-basketball rounded-2xl flex items-center justify-center shadow-basketball hover-scale">
                  <span className="text-2xl font-bold text-white">🏀</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t("appName")}
              </h1>
              <p className="text-gray-600">
                {tab === "signin" ? "Welcome back, Coach!" : "Join the coaching community"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl animate-fade-in">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full mb-6 glass border border-white/20 text-gray-700 py-3 px-4 rounded-2xl font-medium hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-3 hover-lift focus-ring group disabled:opacity-50"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Continue with Google"
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <span className="px-4 text-gray-500 text-sm font-medium">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {/* Tab Switcher */}
            <div className="flex mb-6 glass rounded-2xl p-1">
              <button
                type="button"
                onClick={() => setTab("signin")}
                className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-200 focus-ring ${
                  tab === "signin"
                    ? "gradient-basketball text-white shadow-basketball"
                    : "text-gray-700 hover:bg-white/20"
                }`}
              >
                {t("signIn")}
              </button>
              <button
                type="button"
                onClick={() => setTab("register")}
                className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-200 focus-ring ${
                  tab === "register"
                    ? "gradient-basketball text-white shadow-basketball"
                    : "text-gray-700 hover:bg-white/20"
                }`}
              >
                {t("register")}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {tab === "register" && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("name")}
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 form-input rounded-2xl border-2 border-transparent focus:border-basketball-blue-500 transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("email")}
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 form-input rounded-2xl border-2 border-transparent focus:border-basketball-blue-500 transition-all duration-200 placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("password")}
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 form-input rounded-2xl border-2 border-transparent focus:border-basketball-blue-500 transition-all duration-200 placeholder-gray-400"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 gradient-court text-white font-semibold rounded-2xl shadow-court hover:shadow-intense transition-all duration-200 hover:-translate-y-1 btn-ripple focus-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>{tab === "signin" ? "Signing in..." : "Creating account..."}</span>
                  </div>
                ) : (
                  <span>{tab === "signin" ? t("signIn") : t("register")}</span>
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {tab === "signin" ? "New to Basketball Coach?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setTab(tab === "signin" ? "register" : "signin")}
                  className="text-basketball-blue-600 hover:text-basketball-blue-700 font-medium transition-colors"
                >
                  {tab === "signin" ? "Create an account" : "Sign in instead"}
                </button>
              </p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-8 glass rounded-2xl p-6 backdrop-blur-xl border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              What you'll get:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-basketball-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-white">👥</span>
                </div>
                <span className="text-sm text-gray-700">Team Management</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-basketball-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-white">📋</span>
                </div>
                <span className="text-sm text-gray-700">Training Plans</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-basketball-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-white">🎯</span>
                </div>
                <span className="text-sm text-gray-700">Court Designer</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-basketball-orange-400 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-white">📊</span>
                </div>
                <span className="text-sm text-gray-700">Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
