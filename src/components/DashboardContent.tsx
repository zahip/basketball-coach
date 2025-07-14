"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { CreateTeamModal } from "@/components/CreateTeamModal";
import { trpc } from "@/lib/trpc";
import { useTranslations } from "next-intl";

interface DashboardContentProps {
  locale: string;
}

export function DashboardContent({ locale }: DashboardContentProps) {
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const t = useTranslations("DashboardPage");
  
  const { data: teamsData, isLoading, refetch } = trpc.getTeams.useQuery();
  const { data: trainingSetsData, isLoading: isLoadingTrainingSets, refetch: refetchTrainingSets } = trpc.getAllTrainingSets.useQuery();

  return (
    <div className="flex flex-col gap-8">
      {/* Quick Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
        <div className="flex flex-col gap-2 md:flex-row md:gap-4 w-full md:w-auto">
          <Button
            onClick={() => setShowCreateTeam(true)}
            variant="default"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            {t("createTeam")}
          </Button>
          <Button asChild variant="default" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold">
            <Link href="/training-set-builder">
              {t("createTrainingSet")}
            </Link>
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
            {isLoading ? (
              <div className="text-gray-500 text-center py-8">Loading teams...</div>
            ) : !teamsData?.teams || teamsData.teams.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                {t("noTeams")}
              </div>
            ) : (
              <div className="space-y-3">
                {teamsData.teams.map((team) => (
                  <Link
                    key={team.id}
                    href={`/team/${team.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{team.name}</h3>
                        <p className="text-sm text-gray-600">
                          {team.players.length} players
                        </p>
                      </div>
                      <div className="text-orange-500">
                        →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Training Sets Card */}
        <Card className="shadow-lg border-l-4 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              📋 {t("trainingSets")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTrainingSets ? (
              <div className="text-gray-500 text-center py-8">Loading training sets...</div>
            ) : !trainingSetsData?.trainingSets || trainingSetsData.trainingSets.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                {t("noTrainingSets")}
              </div>
            ) : (
              <div className="space-y-3">
                {trainingSetsData.trainingSets.map((trainingSet) => (
                  <div
                    key={trainingSet.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{trainingSet.name}</h3>
                        <p className="text-sm text-gray-600">
                          {trainingSet.teamName} • {trainingSet.exercises.length} exercises
                        </p>
                        {trainingSet.description && (
                          <p className="text-xs text-gray-500 mt-1">{trainingSet.description}</p>
                        )}
                      </div>
                      <div className="text-blue-500">
                        →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              No statistics yet.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
        onSuccess={() => {
          refetch();
        }}
      />

    </div>
  );
}