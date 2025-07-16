import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { LogoutButton } from "@/components/LogoutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardContent } from "@/components/DashboardContent";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-100 flex flex-col bg-red-500">
      {/* Header */}
      <header className="w-full border-b bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-4">
          {/* App logo and title */}
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-500 w-12 h-12 flex items-center justify-center shadow">
              <span className="text-2xl text-white font-bold">🏀</span>
            </div>
            <h1 className="text-2xl font-extrabold text-blue-900">
              {t("welcome")}
            </h1>
          </div>
          {/* User info and logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={user.user_metadata?.avatar_url}
                  alt={user.user_metadata?.name || user.email}
                />
                <AvatarFallback>
                  {(user.user_metadata?.name || user.email)?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                  {user.user_metadata?.name || user.email}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">
                  {user.email}
                </p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <DashboardContent locale={locale} />
      </main>
    </div>
  );
}
