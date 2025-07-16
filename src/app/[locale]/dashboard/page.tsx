import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { LogoutButton } from "@/components/LogoutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardContent } from "@/components/DashboardContent";
import { Link } from "@/i18n/navigation";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth`);
  }

  const t = await getTranslations({
    locale: locale,
    namespace: "DashboardPage",
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-subtle"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-basketball-orange-50/30 via-basketball-blue-50/30 to-basketball-green-50/30"></div>
      
      {/* Floating Basketball Elements */}
      <div className="absolute top-20 left-10 w-8 h-8 bg-basketball-orange-500 rounded-full opacity-10 animate-bounce-gentle"></div>
      <div className="absolute top-60 right-20 w-6 h-6 bg-basketball-blue-500 rounded-full opacity-10 animate-pulse-subtle"></div>
      <div className="absolute bottom-40 left-20 w-4 h-4 bg-basketball-green-500 rounded-full opacity-10 animate-spin-slow"></div>
      <div className="absolute bottom-80 right-10 w-10 h-10 bg-basketball-orange-400 rounded-full opacity-10 animate-bounce-gentle"></div>
      
      {/* Modern Header */}
      <header className="relative z-10 glass-dark border-b border-white/20 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-3 group">
                <div className="w-12 h-12 gradient-basketball rounded-2xl flex items-center justify-center shadow-basketball group-hover:scale-105 transition-transform">
                  <span className="text-2xl font-bold text-white">🏀</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">Basketball Coach</h1>
                  <p className="text-sm text-gray-600">Dashboard</p>
                </div>
              </Link>
            </div>

            {/* Navigation Items */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="nav-link text-gray-700 hover:text-basketball-blue-600 font-medium">
                Dashboard
              </Link>
              <Link href="/training-set-builder" className="nav-link text-gray-700 hover:text-basketball-blue-600 font-medium">
                Training Sets
              </Link>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">Analytics (Soon)</span>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <Avatar className="w-10 h-10 border-2 border-white/20">
                  <AvatarImage
                    src={user.user_metadata?.avatar_url}
                    alt={user.user_metadata?.name || user.email}
                  />
                  <AvatarFallback className="bg-basketball-blue-500 text-white font-semibold">
                    {(user.user_metadata?.name || user.email)?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    {user.user_metadata?.name || "Coach"}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[120px]">
                    {user.email}
                  </p>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="glass rounded-3xl p-8 backdrop-blur-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {t("welcome")}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl">
                  {t("manageTeams")}
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 gradient-basketball rounded-3xl flex items-center justify-center shadow-basketball hover-scale animate-pulse-subtle">
                  <span className="text-3xl font-bold text-white">🏀</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <DashboardContent locale={locale} />
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 glass-dark border-t border-white/20 backdrop-blur-xl">
        <div className="flex items-center justify-around h-16 px-4">
          <Link href="/dashboard" className="flex flex-col items-center space-y-1 group">
            <div className="w-8 h-8 bg-basketball-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-sm text-white">🏠</span>
            </div>
            <span className="text-xs text-gray-600 group-hover:text-basketball-orange-600">Home</span>
          </Link>
          <Link href="/training-set-builder" className="flex flex-col items-center space-y-1 group">
            <div className="w-8 h-8 bg-basketball-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-sm text-white">📋</span>
            </div>
            <span className="text-xs text-gray-600 group-hover:text-basketball-blue-600">Training</span>
          </Link>
          <div className="flex flex-col items-center space-y-1 opacity-50">
            <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
              <span className="text-sm text-white">📊</span>
            </div>
            <span className="text-xs text-gray-500">Analytics</span>
          </div>
          <div className="flex flex-col items-center space-y-1 group">
            <Avatar className="w-8 h-8 border border-white/20">
              <AvatarImage
                src={user.user_metadata?.avatar_url}
                alt={user.user_metadata?.name || user.email}
              />
              <AvatarFallback className="bg-basketball-green-500 text-white text-xs">
                {(user.user_metadata?.name || user.email)?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600 group-hover:text-basketball-green-600">Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
}
