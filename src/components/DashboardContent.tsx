"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { CreateTeamModal } from "@/components/CreateTeamModal";
import { trpc } from "@/lib/trpc";

interface DashboardContentProps {
  locale: string;
}

export function DashboardContent({ locale }: DashboardContentProps) {
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  
  const { data: teamsData, isLoading, refetch } = trpc.getTeams.useQuery();

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
            + Create New Team
          </Button>
          <Button asChild variant="outline">
            <Link href="#">Training Plans</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="#">Statistics</Link>
          </Button>
        </div>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Teams Card */}
        <Card className="shadow-lg border-l-4 border-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              👥 Your Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-gray-500 text-center py-8">Loading teams...</div>
            ) : !teamsData?.teams || teamsData.teams.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No teams yet. Start by creating a new team!
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

        {/* Training Plans Card */}
        <Card className="shadow-lg border-l-4 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              📋 Training Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-500 text-center py-8">
              No training plans yet.
            </div>
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card className="shadow-lg border-l-4 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              📊 Statistics
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