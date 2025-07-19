"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, ListSkeleton } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { PlayerList } from "@/components/team/PlayerList";
import { PracticeList } from "@/components/team/PracticeList";
import { TrainingPlanList } from "@/components/team/TrainingPlanList";
import { NotesSection } from "@/components/team/NotesSection";

interface TeamDashboardProps {
  teamId: string;
}

const tabs = ["players", "practices", "trainingPlans", "notes"] as const;
type TabType = typeof tabs[number];

export function TeamDashboard({ teamId }: TeamDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("players");
  
  const { data: teamData, isLoading, error, refetch } = trpc.getTeam.useQuery({ teamId });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        </div>
        <ListSkeleton items={4} />
      </div>
    );
  }

  if (error || !teamData?.team) {
    return (
      <ErrorState
        title="Failed to load team"
        message="Team not found or you don't have access to it"
        retry={() => refetch()}
      />
    );
  }

  const { team } = teamData;

  const tabConfig = {
    players: {
      label: "Players",
      icon: "👥",
      component: <PlayerList teamId={teamId} players={team.players} onUpdate={refetch} />
    },
    practices: {
      label: "Practices",
      icon: "🗓️",
      component: <PracticeList teamId={teamId} onUpdate={refetch} />
    },
    trainingPlans: {
      label: "Training Plans",
      icon: "📚",
      component: <TrainingPlanList teamId={teamId} onUpdate={refetch} />
    },
    notes: {
      label: "Notes",
      icon: "📝",
      component: <NotesSection teamId={teamId} onUpdate={refetch} />
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
              🏀 {team.name}
            </h1>
            <p className="text-muted-foreground text-lg">
              {team.description || "Team dashboard and management"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="basketball" className="animate-pulse-subtle">
              {team.players.length} Player{team.players.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="court">
              Coach: {team.coach.name}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="basketball" className="animate-slide-in-left">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              👥 Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.players.length}</div>
            <p className="text-sm text-muted-foreground">Active players</p>
          </CardContent>
        </Card>
        
        <Card variant="court" className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              📋 Training Sets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team._count.trainingSets}</div>
            <p className="text-sm text-muted-foreground">Training programs</p>
          </CardContent>
        </Card>
        
        <Card variant="success" className="animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              📹 Recordings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team._count.recordings}</div>
            <p className="text-sm text-muted-foreground">Play recordings</p>
          </CardContent>
        </Card>
        
        <Card variant="warning" className="animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              ⚡ Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Upcoming sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const config = tabConfig[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab
                    ? 'border-basketball-orange-500 text-basketball-orange-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span>{config.icon}</span>
                  {config.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {tabConfig[activeTab].component}
      </div>
    </div>
  );
}