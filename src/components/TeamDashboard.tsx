"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, StatsCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/loading";
import { trpc } from "@/lib/trpc";
import { AddPlayerModal } from "@/components/AddPlayerModal";
import { BasketballCourt } from "@/components/BasketballCourt";
import { Link } from "@/i18n/navigation";

interface TeamDashboardProps {
  teamId: string;
}

export function TeamDashboard({ teamId }: TeamDashboardProps) {
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  
  const { data: teamData, isLoading, refetch } = trpc.getTeam.useQuery({ teamId });
  
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="glass rounded-3xl p-8 backdrop-blur-xl border border-white/20">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-2 border-basketball-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-lg text-gray-600">Loading team...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!teamData?.team) {
    return (
      <div className="space-y-8">
        <div className="glass rounded-3xl p-8 backdrop-blur-xl border border-white/20">
          <ErrorState 
            message="Team not found or you don't have access to this team"
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  const { team } = teamData;

  return (
    <div className="space-y-8">
      {/* Team Header */}
      <div className="glass rounded-3xl p-8 backdrop-blur-xl border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 gradient-basketball rounded-3xl flex items-center justify-center shadow-basketball">
              <span className="text-3xl font-bold text-white">🏀</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{team.name}</h1>
              <div className="flex items-center space-x-4">
                <Badge variant="basketball" className="animate-pulse-subtle">
                  {team.players?.length || 0} Players
                </Badge>
                <Badge variant="outline">
                  Active Team
                </Badge>
              </div>
              {team.description && (
                <p className="text-gray-600 mt-2 max-w-2xl">{team.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowAddPlayer(true)}
              variant="basketball"
              className="hover-lift"
            >
              <span className="mr-2">+</span>
              Add Player
            </Button>
            <Button variant="outline" className="hover-lift">
              <span className="mr-2">⚙️</span>
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Team Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Players"
          value={team.players?.length || 0}
          icon="👥"
          variant="basketball"
          loading={false}
          trend={team.players?.length ? "All active" : "Add players"}
        />
        <StatsCard
          title="Training Sets"
          value={team.trainingSets?.length || 0}
          icon="📋"
          variant="court"
          loading={false}
          trend={team.trainingSets?.length ? "Available" : "Create sets"}
        />
        <StatsCard
          title="Court Designs"
          value={team.recordings?.length || 0}
          icon="🎯"
          variant="success"
          loading={false}
          trend={team.recordings?.length ? "Saved" : "Design plays"}
        />
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Players Section */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Players</h2>
            <Button
              onClick={() => setShowAddPlayer(true)}
              variant="basketball"
              size="sm"
              className="hover-lift"
            >
              <span className="mr-2">+</span>
              Add Player
            </Button>
          </div>

          <div className="space-y-4">
            {team.players?.length === 0 ? (
              <EmptyState
                icon="👥"
                title="No players yet"
                description="Add your first player to start building your team roster"
                action={
                  <Button
                    onClick={() => setShowAddPlayer(true)}
                    variant="basketball"
                    className="mt-4"
                  >
                    <span className="mr-2">+</span>
                    Add Your First Player
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {team.players?.map((player) => (
                  <Card 
                    key={player.id} 
                    variant="basketball" 
                    className="hover-lift card-hover"
                    interactive
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-basketball-orange-500 rounded-2xl flex items-center justify-center text-white font-bold">
                            {player.number || '?'}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{player.name}</CardTitle>
                            <p className="text-sm text-gray-600">
                              {player.position || 'No position'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" size="sm">
                          #{player.number || '?'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            Position: {player.position || 'Not set'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team Actions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Team Actions</h2>
          <div className="space-y-4">
            {/* Training Sets */}
            <Card variant="court" className="hover-lift">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-basketball-blue-500 rounded-2xl flex items-center justify-center">
                      <span className="text-xl text-white">📋</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">Training Sets</CardTitle>
                      <p className="text-sm text-gray-600">
                        {team.trainingSets?.length || 0} sets available
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  asChild 
                  variant="court" 
                  size="sm" 
                  className="w-full"
                >
                  <Link href="/training-set-builder">
                    <span className="mr-2">📝</span>
                    Create Training Set
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Court Designer */}
            <Card variant="success" className="hover-lift">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-basketball-green-500 rounded-2xl flex items-center justify-center">
                      <span className="text-xl text-white">🎯</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">Court Designer</CardTitle>
                      <p className="text-sm text-gray-600">
                        {team.recordings?.length || 0} plays saved
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="success" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    // Scroll to court designer section
                    const courtSection = document.getElementById('court-designer');
                    if (courtSection) {
                      courtSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <span className="mr-2">🎨</span>
                  Design Plays
                </Button>
              </CardContent>
            </Card>

            {/* Team Stats */}
            <Card variant="default" className="hover-lift">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-500 rounded-2xl flex items-center justify-center">
                      <span className="text-xl text-white">📊</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">Team Analytics</CardTitle>
                      <p className="text-sm text-gray-600">
                        Performance insights
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  disabled
                >
                  <span className="mr-2">🔧</span>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Basketball Court Designer */}
      <section id="court-designer">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Basketball Court Designer</h2>
          <Badge variant="success" className="animate-pulse-subtle">
            Interactive
          </Badge>
        </div>
        <div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
          <BasketballCourt teamId={teamId} />
        </div>
      </section>

      {/* Add Player Modal */}
      <AddPlayerModal
        isOpen={showAddPlayer}
        onClose={() => setShowAddPlayer(false)}
        teamId={teamId}
        onSuccess={() => {
          refetch();
          setShowAddPlayer(false);
        }}
      />
    </div>
  );
}