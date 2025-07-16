import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { LogoutButton } from "@/components/LogoutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamDashboard } from "@/components/TeamDashboard";
import { Link } from "@/i18n/navigation";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string; teamId: string }>;
}) {
  const { locale, teamId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth`);
  }

  const t = await getTranslations({
    locale: locale,
    namespace: "TeamPage",
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
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="flex items-center space-x-3 group">
                <div className="w-12 h-12 gradient-basketball rounded-2xl flex items-center justify-center shadow-basketball group-hover:scale-105 transition-transform">
                  <span className="text-2xl font-bold text-white">🏀</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">Basketball Coach</h1>
                  <p className="text-sm text-gray-600">{t("teamDashboard")}</p>
                </div>
              </Link>
              
              {/* Breadcrumbs */}
              <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Link href="/dashboard" className="hover:text-basketball-blue-600 transition-colors">
                  Dashboard
                </Link>
                <span>•</span>
                <span className="text-basketball-blue-600 font-medium">Team</span>
              </nav>
            </div>

            {/* Navigation Items */}
            <nav className="hidden md:flex items-center space-x-8">
              <span className="text-gray-700 font-medium">Team Management</span>
              <Link href="/training-set-builder" className="nav-link text-gray-700 hover:text-basketball-blue-600 font-medium">
                Training Sets
              </Link>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">Court Designer (Soon)</span>
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
        <TeamDashboard teamId={teamId} />
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 glass-dark border-t border-white/20 backdrop-blur-xl">
        <div className="flex items-center justify-around h-16 px-4">
          <Link href="/dashboard" className="flex flex-col items-center space-y-1 group">
            <div className="w-8 h-8 bg-basketball-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-sm text-white">🏠</span>
            </div>
            <span className="text-xs text-gray-600 group-hover:text-basketball-orange-600">Dashboard</span>
          </Link>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-8 h-8 bg-basketball-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-sm text-white">👥</span>
            </div>
            <span className="text-xs text-basketball-blue-600 font-medium">Team</span>
          </div>
          <Link href="/training-set-builder" className="flex flex-col items-center space-y-1 group">
            <div className="w-8 h-8 bg-basketball-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-sm text-white">📋</span>
            </div>
            <span className="text-xs text-gray-600 group-hover:text-basketball-green-600">Training</span>
          </Link>
          <div className="flex flex-col items-center space-y-1 group">
            <Avatar className="w-8 h-8 border border-white/20">
              <AvatarImage
                src={user.user_metadata?.avatar_url}
                alt={user.user_metadata?.name || user.email}
              />
              <AvatarFallback className="bg-basketball-orange-400 text-white text-xs">
                {(user.user_metadata?.name || user.email)?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600 group-hover:text-basketball-orange-600">Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
}