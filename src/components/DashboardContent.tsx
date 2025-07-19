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


export function DashboardContent() {
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  
  // Always call useTranslations, handle errors in the component
  const t = useTranslations("DashboardPage");
  
  const { data: teamsData, isLoading: isLoadingTeams, error: teamsError, refetch } = trpc.getTeams.useQuery();
  const { data: trainingSetsData, isLoading: isLoadingTrainingSets, error: trainingSetsError, refetch: refetchTrainingSets } = trpc.getAllTrainingSets.useQuery();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              {t("welcome")}
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your basketball teams and training programs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="basketball" className="animate-pulse-subtle">
              🏀 Coach Dashboard
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Teams"
          value={teamsData?.teams?.length || 0}
          icon="👥"
          description="Active basketball teams"
          change={teamsData?.teams?.length ? {
            value: "+2 this month",
            trend: "up"
          } : undefined}
        />
        <StatsCard
          title="Training Sets"
          value={trainingSetsData?.trainingSets?.length || 0}
          icon="📋"
          description="Available training programs"
          change={trainingSetsData?.trainingSets?.length ? {
            value: "+5 this week",
            trend: "up"
          } : undefined}
        />
        <StatsCard
          title="Total Players"
          value={teamsData?.teams?.reduce((sum, team) => sum + team.players.length, 0) || 0}
          icon="🏃‍♂️"
          description="Registered players"
        />
        <StatsCard
          title="Active Sessions"
          value={0}
          icon="⚡"
          description="Ongoing training sessions"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FeatureCard
          icon="🏀"
          title="Create Team"
          description="Add a new basketball team"
          action={
            <Button
              variant="basketball"
              size="sm"
              onClick={() => setShowCreateTeam(true)}
            >
              Create
            </Button>
          }
        />
        <FeatureCard
          icon="📋"
          title="Training Sets"
          description="Design training programs"
          action={
            <Button
              variant="court"
              size="sm"
              asChild
            >
              <Link href="/training-set-builder">
                Create
              </Link>
            </Button>
          }
        />
        <FeatureCard
          icon="📚"
          title="Exercise Library"
          description="Browse and create exercises"
          action={
            <Button
              variant="success"
              size="sm"
              asChild
            >
              <Link href="/exercises">
                Browse
              </Link>
            </Button>
          }
        />
        <FeatureCard
          icon="📊"
          title="Analytics"
          description="View performance metrics"
          action={
            <Button
              variant="outline"
              size="sm"
              disabled
            >
              Coming Soon
            </Button>
          }
        />
        <FeatureCard
          icon="🎯"
          title="Training Plans"
          description="Schedule training sessions"
          action={
            <Button
              variant="outline"
              size="sm"
              disabled
            >
              Coming Soon
            </Button>
          }
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Teams Section */}
        <Card variant="elevated" className="animate-slide-in-left">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                👥 {t("yourTeams")}
                {teamsData?.teams && (
                  <CountBadge count={teamsData.teams.length} />
                )}
              </CardTitle>
              <Button
                variant="basketball"
                size="sm"
                onClick={() => setShowCreateTeam(true)}
              >
                Add Team
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingTeams ? (
              <ListSkeleton items={3} />
            ) : teamsError ? (
              <ErrorState
                title="Failed to load teams"
                message="Please try refreshing the page"
                retry={() => refetch()}
              />
            ) : !teamsData?.teams || teamsData.teams.length === 0 ? (
              <EmptyState
                icon="🏀"
                title={t("noTeams")}
                description="Get started by creating your first basketball team"
                action={
                  <Button
                    variant="basketball"
                    onClick={() => setShowCreateTeam(true)}
                  >
                    Create Your First Team
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {teamsData.teams.map((team, index) => (
                  <div
                    key={team.id}
                    className="animate-slide-in-right"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <TeamCard
                      name={team.name}
                      playerCount={team.players.length}
                      status="active"
                      onView={() => window.location.href = `/team/${team.id}`}
                      onEdit={() => {
                        // TODO: Implement edit functionality
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Training Sets Section */}
        <Card variant="elevated" className="animate-slide-in-right">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                📋 {t("trainingSets")}
                {trainingSetsData?.trainingSets && (
                  <CountBadge count={trainingSetsData.trainingSets.length} />
                )}
              </CardTitle>
              <Button
                variant="court"
                size="sm"
                asChild
              >
                <Link href="/training-set-builder">
                  Create Set
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingTrainingSets ? (
              <ListSkeleton items={3} />
            ) : trainingSetsError ? (
              <ErrorState
                title="Failed to load training sets"
                message="Please try refreshing the page"
                retry={() => refetchTrainingSets()}
              />
            ) : !trainingSetsData?.trainingSets || trainingSetsData.trainingSets.length === 0 ? (
              <EmptyState
                icon="📋"
                title={t("noTrainingSets")}
                description="Create your first training set to get started"
                action={
                  <Button
                    variant="court"
                    asChild
                  >
                    <Link href="/training-set-builder">
                      Create Training Set
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {trainingSetsData.trainingSets.map((trainingSet, index) => (
                  <div
                    key={trainingSet.id}
                    className="animate-slide-in-left"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Card variant="court" interactive className="hover-lift">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{trainingSet.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="court" size="sm">
                                {trainingSet.teamName}
                              </Badge>
                              <Badge variant="outline" size="sm">
                                {trainingSet.exercises.length} exercise{trainingSet.exercises.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-basketball-blue-500 text-lg">
                            →
                          </div>
                        </div>
                      </CardHeader>
                      {trainingSet.description && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {trainingSet.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card variant="elevated" className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Recent Activity
            <Badge variant="outline" size="sm">New</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon="📈"
            title="No recent activity"
            description="Activity will appear here once you start using the platform"
          />
        </CardContent>
      </Card>

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
        onSuccess={() => {
          refetch();
          setShowCreateTeam(false);
        }}
      />
    </div>
  );
}