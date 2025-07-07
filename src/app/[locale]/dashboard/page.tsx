import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function DashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${params.locale}/auth`);
  }

  const t = await getTranslations({
    locale: params.locale,
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
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Quick Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <div className="flex flex-col gap-2 md:flex-row md:gap-4 w-full md:w-auto">
            <Button
              asChild
              variant="default"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              <Link href="#">{t("createTeam")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#">{t("trainingPlans")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#">{t("statistics")}</Link>
            </Button>
          </div>
        </div>
        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Teams Card */}
          <Card className="shadow-lg border-l-4 border-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                👥 {t("yourTeams")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-500 text-center py-8">
                {/* Placeholder for teams list */}
                {t("noTeams")}
              </div>
            </CardContent>
          </Card>
          {/* Training Plans Card */}
          <Card className="shadow-lg border-l-4 border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                📋 {t("trainingPlans")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-500 text-center py-8">
                {t("trainingPlansDescription") || "No training plans yet."}
              </div>
            </CardContent>
          </Card>
          {/* Statistics Card */}
          <Card className="shadow-lg border-l-4 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                📊 {t("statistics")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-500 text-center py-8">
                {t("statisticsDescription") || "No statistics yet."}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
