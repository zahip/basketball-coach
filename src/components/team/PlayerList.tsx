"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { AddPlayerModal } from "@/components/AddPlayerModal";

interface Player {
  id: string;
  name: string;
  position?: string | null;
  number?: number | null;
  createdAt: string;
  updatedAt: string;
}

interface PlayerListProps {
  teamId: string;
  players: Player[];
  onUpdate: () => void;
}

const POSITION_COLORS = {
  PG: "bg-blue-100 text-blue-800",
  SG: "bg-green-100 text-green-800", 
  SF: "bg-yellow-100 text-yellow-800",
  PF: "bg-orange-100 text-orange-800",
  C: "bg-red-100 text-red-800",
} as const;

const POSITION_LABELS = {
  PG: "Point Guard",
  SG: "Shooting Guard",
  SF: "Small Forward", 
  PF: "Power Forward",
  C: "Center",
} as const;

export function PlayerList({ teamId, players, onUpdate }: PlayerListProps) {
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Players</h2>
          <p className="text-muted-foreground">
            Manage your team roster and player information
          </p>
        </div>
        <Button
          onClick={() => setShowAddPlayer(true)}
          variant="basketball"
          size="sm"
        >
          Add Player
        </Button>
      </div>

      {/* Players Grid */}
      {players.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No players yet"
          description="Get started by adding your first player to the team"
          action={
            <Button
              variant="basketball"
              onClick={() => setShowAddPlayer(true)}
            >
              Add Your First Player
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player, index) => (
            <Card
              key={player.id}
              variant="basketball"
              className="animate-slide-in-up hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {player.number && (
                      <div className="bg-basketball-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                        #{player.number}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base">{player.name}</CardTitle>
                      {player.position && (
                        <Badge
                          className={`text-xs mt-1 ${
                            POSITION_COLORS[player.position as keyof typeof POSITION_COLORS] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {POSITION_LABELS[player.position as keyof typeof POSITION_LABELS] || player.position}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Added {new Date(player.createdAt).toLocaleDateString()}</span>
                  <button className="hover:text-foreground transition-colors">
                    Edit
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {players.length > 0 && (
        <Card variant="filled" className="mt-6">
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">{players.length}</div>
                <div className="text-sm text-muted-foreground">Total Players</div>
              </div>
              {Object.entries(POSITION_LABELS).map(([pos]) => {
                const count = players.filter(p => p.position === pos).length;
                return (
                  <div key={pos}>
                    <div className="text-2xl font-bold text-foreground">{count}</div>
                    <div className="text-sm text-muted-foreground">{pos}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Player Modal */}
      <AddPlayerModal
        isOpen={showAddPlayer}
        onClose={() => setShowAddPlayer(false)}
        teamId={teamId}
        onSuccess={() => {
          onUpdate();
          setShowAddPlayer(false);
        }}
      />
    </div>
  );
}