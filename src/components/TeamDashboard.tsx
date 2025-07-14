"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { AddPlayerModal } from "@/components/AddPlayerModal";
import { BasketballCourt } from "@/components/BasketballCourt";

interface TeamDashboardProps {
  teamId: string;
}

export function TeamDashboard({ teamId }: TeamDashboardProps) {
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  
  const { data: teamData, isLoading, refetch } = trpc.getTeam.useQuery({ teamId });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg text-gray-600">Loading team...</div>
      </div>
    );
  }

  if (!teamData?.team) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg text-red-600">Team not found</div>
      </div>
    );
  }

  const { team } = teamData;

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <Card className="shadow-lg border-l-4 border-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-900">
              🏀 {team.name}
            </div>
            <Button
              onClick={() => setShowAddPlayer(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              + Add Player
            </Button>
          </CardTitle>
          {team.description && (
            <p className="text-gray-600">{team.description}</p>
          )}
        </CardHeader>
      </Card>

      {/* Players Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            👥 Players ({team.players.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {team.players.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No players yet. Add your first player to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.players.map((player) => (
                <Card key={player.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{player.name}</h3>
                        {player.position && (
                          <p className="text-sm text-gray-600">{player.position}</p>
                        )}
                      </div>
                      {player.number && (
                        <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                          #{player.number}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Court Section */}
      <BasketballCourt teamId={teamId} />

      {/* Training Sets Section */}
      <Card className="shadow-lg border-l-4 border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            📋 Basketball Training Sets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Basic Drills */}
              <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🏃‍♂️ Basic Drills</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Dribbling fundamentals</li>
                    <li>• Shooting form practice</li>
                    <li>• Defensive stance</li>
                    <li>• Layup drills</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Offensive Sets */}
              <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">⚡ Offensive Sets</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Pick and roll</li>
                    <li>• Fast break drills</li>
                    <li>• Motion offense</li>
                    <li>• Screen plays</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Defensive Drills */}
              <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🛡️ Defensive Drills</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Man-to-man defense</li>
                    <li>• Zone defense</li>
                    <li>• Help defense</li>
                    <li>• Rebounding drills</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Conditioning */}
              <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">💪 Conditioning</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Suicides</li>
                    <li>• Sprint drills</li>
                    <li>• Agility ladders</li>
                    <li>• Endurance runs</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Team Building */}
              <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🤝 Team Building</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Scrimmage games</li>
                    <li>• Communication drills</li>
                    <li>• Trust exercises</li>
                    <li>• Strategy sessions</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Game Situations */}
              <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🎯 Game Situations</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Inbound plays</li>
                    <li>• End-of-game scenarios</li>
                    <li>• Press break</li>
                    <li>• Free throw situations</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

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