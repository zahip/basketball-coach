"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, TeamCard, StatsCard, FeatureCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/loading";
import { Badge, CountBadge } from "@/components/ui/badge";
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
  
  const { data: teamsData, isLoading: isLoadingTeams, error: teamsError, refetch } = trpc.getTeams.useQuery();
  const { data: trainingSetsData, isLoading: isLoadingTrainingSets, error: trainingSetsError, refetch: refetchTrainingSets } = trpc.getAllTrainingSets.useQuery();

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Teams" 
          value={teamsData?.teams?.length || 0}
          icon="👥"
          variant="basketball"
          loading={isLoadingTeams}
          trend="+2 this month"
        />
        <StatsCard 
          title="Training Sets" 
          value={trainingSetsData?.trainingSets?.length || 0}
          icon="📋"
          variant="court"
          loading={isLoadingTrainingSets}
          trend="+5 this week"
        />
        <StatsCard 
          title="Active Players" 
          value={teamsData?.teams?.reduce((acc, team) => acc + (team.players?.length || 0), 0) || 0}
          icon="🏀"
          variant="success"
          loading={isLoadingTeams}
          trend="All active"
        />
        <StatsCard 
          title="Court Designs" 
          value={12}
          icon="🎯"
          variant="default"
          loading={false}
          trend="New feature"
        />
      </section>

      {/* Quick Actions */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
          <Badge variant="basketball" className="animate-pulse-subtle">
            Get Started
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon="🏀"
            title="Create Team"
            description="Add a new basketball team and start managing your roster"
            gradient="gradient-basketball"
            action={
              <Button
                variant="basketball"
                size="sm"
                onClick={() => setShowCreateTeam(true)}
                className="w-full"
              >
                <span className="mr-2">+</span>
                Create Team
              </Button>
            }
          />
          <FeatureCard
            icon="📋"
            title="Training Sets"
            description="Design comprehensive training programs and exercises"
            gradient="gradient-court"
            action={
              <Button
                variant="court"
                size="sm"
                asChild
                className="w-full"
              >
                <Link href="/training-set-builder">
                  <span className="mr-2">📝</span>
                  Build Training
                </Link>
              </Button>
            }
          />
          <FeatureCard
            icon="🎯"
            title="Court Designer"
            description="Create plays and strategies with interactive basketball court"
            gradient="gradient-success"
            action={
              <Button
                variant="success"
                size="sm"
                disabled
                className="w-full"
              >
                <span className="mr-2">🔧</span>
                Coming Soon
              </Button>
            }
          />
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Teams Section */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">{t("yourTeams")}</h3>
            <Button
              variant="basketball"
              size="sm"
              onClick={() => setShowCreateTeam(true)}
              className="hover-lift"
            >
              <span className="mr-2">+</span>
              {t("createTeam")}
            </Button>
          </div>
          
          <div className="space-y-4">
            {isLoadingTeams ? (
              <ListSkeleton count={3} />
            ) : teamsError ? (
              <ErrorState 
                message="Failed to load teams" 
                onRetry={refetch}
              />
            ) : teamsData?.teams?.length === 0 ? (
              <EmptyState 
                icon="👥"
                title="No teams yet"
                description={t("noTeams")}
                action={
                  <Button
                    variant="basketball"
                    onClick={() => setShowCreateTeam(true)}
                    className="mt-4"
                  >
                    <span className="mr-2">+</span>
                    Create Your First Team
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {teamsData?.teams?.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    playerCount={team.players?.length || 0}
                    variant="basketball"
                    className="hover-lift card-hover"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Training Sets Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">{t("trainingSets")}</h3>
            <Button
              variant="court"
              size="sm"
              asChild
              className="hover-lift"
            >
              <Link href="/training-set-builder">
                <span className="mr-2">+</span>
                Create Set
              </Link>
            </Button>
          </div>
          
          <div className="space-y-4">
            {isLoadingTrainingSets ? (
              <ListSkeleton count={3} />
            ) : trainingSetsError ? (
              <ErrorState 
                message="Failed to load training sets" 
                onRetry={refetchTrainingSets}
              />
            ) : trainingSetsData?.trainingSets?.length === 0 ? (
              <EmptyState 
                icon="📋"
                title="No training sets"
                description={t("noTrainingSets")}
                action={
                  <Button
                    variant="court"
                    asChild
                    className="mt-4"
                  >
                    <Link href="/training-set-builder">
                      <span className="mr-2">+</span>
                      Create Training Set
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {trainingSetsData?.trainingSets?.map((trainingSet) => (
                  <Card 
                    key={trainingSet.id} 
                    variant="court" 
                    className="hover-lift card-hover"
                    interactive
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{trainingSet.name}</CardTitle>
                        <CountBadge count={trainingSet.exercises?.length || 0} />
                      </div>
                      {trainingSet.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {trainingSet.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {trainingSet.exercises?.length || 0} exercises
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            {trainingSet.team?.name || "No team"}
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="glass rounded-2xl p-6 backdrop-blur-xl border border-white/20">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Activity Timeline Coming Soon
            </h4>
            <p className="text-gray-600 mb-4">
              Track your coaching activities, training sessions, and team progress.
            </p>
            <Badge variant="outline">Feature in Development</Badge>
          </div>
        </div>
      </section>

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
        onSuccess={refetch}
      />
    </div>
  );
}