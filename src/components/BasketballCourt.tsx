"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

interface Player {
  id: string;
  x: number;
  y: number;
  type: "offense" | "defense";
  number?: number;
  name?: string;
}

interface Movement {
  playerId: string;
  x: number;
  y: number;
  timestamp: number;
}

interface Action {
  id: string;
  type: "pass" | "shoot" | "cut" | "block" | "screen" | "dribble";
  playerId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  timestamp: number;
  color: string;
}

interface Recording {
  id: string;
  name: string;
  movements: Movement[];
  actions: Action[];
  players: Player[];
  duration: number;
  created: Date;
}

interface BasketballCourtProps {
  teamId?: string;
}

export function BasketballCourt({ teamId }: BasketballCourtProps) {
  const courtRef = useRef<SVGSVGElement>(null);
  
  // Initial player setup for half court
  const [players, setPlayers] = useState<Player[]>([
    { id: "o1", x: 250, y: 420, type: "offense", number: 1 },
    { id: "o2", x: 150, y: 380, type: "offense", number: 2 },
    { id: "o3", x: 350, y: 380, type: "offense", number: 3 },
    { id: "o4", x: 200, y: 320, type: "offense", number: 4 },
    { id: "o5", x: 300, y: 320, type: "offense", number: 5 },
    { id: "d1", x: 270, y: 400, type: "defense", number: 1 },
    { id: "d2", x: 170, y: 360, type: "defense", number: 2 },
    { id: "d3", x: 330, y: 360, type: "defense", number: 3 },
    { id: "d4", x: 220, y: 300, type: "defense", number: 4 },
    { id: "d5", x: 280, y: 300, type: "defense", number: 5 },
  ]);

  // State management
  const [draggedPlayer, setDraggedPlayer] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<Movement[]>([]);
  const [currentActions, setCurrentActions] = useState<Action[]>([]);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Action drawing states
  const [actionMode, setActionMode] = useState<"none" | "pass" | "shoot" | "cut" | "block" | "screen" | "dribble">("none");
  const [isDrawingAction, setIsDrawingAction] = useState(false);
  const [actionStart, setActionStart] = useState<{x: number, y: number, playerId?: string} | null>(null);
  const [tempAction, setTempAction] = useState<Action | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  
  // Player management
  const [nextPlayerId, setNextPlayerId] = useState(11);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  // tRPC mutations and queries
  const saveRecordingMutation = trpc.savePlayRecording.useMutation({
    onSuccess: () => {
      console.log("Recording saved successfully");
      if (teamId) {
        refetchRecordings();
      }
    },
    onError: (error) => {
      console.error("Failed to save recording:", error);
    },
  });

  const { data: savedRecordings, refetch: refetchRecordings } = trpc.getPlayRecordings.useQuery(
    { teamId: teamId! },
    { enabled: !!teamId }
  );

  const getActionColor = (action: string) => {
    switch (action) {
      case "pass": return "#10B981";
      case "shoot": return "#F59E0B";
      case "cut": return "#3B82F6";
      case "block": return "#EF4444";
      case "screen": return "#8B5CF6";
      case "dribble": return "#06B6D4";
      default: return "#6B7280";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "pass": return "🎯";
      case "shoot": return "🏀";
      case "cut": return "✂️";
      case "block": return "🚫";
      case "screen": return "🛡️";
      case "dribble": return "⚡";
      default: return "📍";
    }
  };

  const handlePlayerMouseDown = (playerId: string, event: React.MouseEvent) => {
    event.preventDefault();
    setDraggedPlayer(playerId);
    setSelectedPlayer(playerId);
    
    if (isRecording) {
      setRecordingStartTime(Date.now());
    }
  };

  const handleCourtMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    if (actionMode === "none") return;
    
    const rect = courtRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((event.clientX - rect.left) / rect.width) * 500;
    const y = ((event.clientY - rect.top) / rect.height) * 470;
    
    setActionStart({ x, y });
    setIsDrawingAction(true);
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!draggedPlayer && !isDrawingAction) return;
    
    const rect = courtRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((event.clientX - rect.left) / rect.width) * 500;
    const y = ((event.clientY - rect.top) / rect.height) * 470;
    
    if (draggedPlayer) {
      setPlayers(prev => prev.map(p => 
        p.id === draggedPlayer 
          ? { ...p, x: Math.max(68, Math.min(432, x)), y: Math.max(68, Math.min(402, y)) }
          : p
      ));
      
      if (isRecording) {
        setCurrentRecording(prev => [...prev, {
          playerId: draggedPlayer,
          x,
          y,
          timestamp: Date.now() - recordingStartTime
        }]);
      }
    }
    
    if (isDrawingAction && actionStart) {
      setTempAction({
        id: `temp-${Date.now()}`,
        type: actionMode as any,
        playerId: "",
        startX: actionStart.x,
        startY: actionStart.y,
        endX: x,
        endY: y,
        timestamp: Date.now(),
        color: getActionColor(actionMode)
      });
    }
  };

  const handleMouseUp = () => {
    if (isDrawingAction && tempAction) {
      setActions(prev => [...prev, { ...tempAction, id: `action-${Date.now()}` }]);
      setTempAction(null);
      setIsDrawingAction(false);
      setActionStart(null);
    }
    setDraggedPlayer(null);
  };

  const addPlayer = (type: "offense" | "defense") => {
    const newPlayer: Player = {
      id: `${type[0]}${nextPlayerId}`,
      x: 250,
      y: 300,
      type,
      number: nextPlayerId,
    };
    setPlayers(prev => [...prev, newPlayer]);
    setNextPlayerId(prev => prev + 1);
  };

  const removePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    setSelectedPlayer(null);
  };

  const startRecording = () => {
    setIsRecording(true);
    setCurrentRecording([]);
    setCurrentActions([]);
    setRecordingStartTime(Date.now());
  };

  const stopRecording = () => {
    setIsRecording(false);
    const duration = Date.now() - recordingStartTime;
    
    const recording: Recording = {
      id: `rec-${Date.now()}`,
      name: `Play ${recordings.length + 1}`,
      movements: currentRecording,
      actions: actions,
      players: players,
      duration,
      created: new Date()
    };
    
    setRecordings(prev => [...prev, recording]);
    setCurrentRecording([]);
    setCurrentActions([]);
    
    // Save to database if teamId is available
    if (teamId) {
      saveRecordingMutation.mutate({
        teamId,
        name: recording.name,
        data: {
          movements: recording.movements,
          actions: recording.actions,
          players: recording.players,
          duration: recording.duration
        }
      });
    }
  };

  const resetCourt = () => {
    setPlayers([
      { id: "o1", x: 250, y: 420, type: "offense", number: 1 },
      { id: "o2", x: 150, y: 380, type: "offense", number: 2 },
      { id: "o3", x: 350, y: 380, type: "offense", number: 3 },
      { id: "o4", x: 200, y: 320, type: "offense", number: 4 },
      { id: "o5", x: 300, y: 320, type: "offense", number: 5 },
      { id: "d1", x: 270, y: 400, type: "defense", number: 1 },
      { id: "d2", x: 170, y: 360, type: "defense", number: 2 },
      { id: "d3", x: 330, y: 360, type: "defense", number: 3 },
      { id: "d4", x: 220, y: 300, type: "defense", number: 4 },
      { id: "d5", x: 280, y: 300, type: "defense", number: 5 },
    ]);
    setActions([]);
    setSelectedPlayer(null);
    setActionMode("none");
  };

  const playRecording = (recording: Recording) => {
    setSelectedRecording(recording);
    setIsPlaying(true);
    setPlaybackTime(0);
    
    // Restore players from recording
    setPlayers(recording.players);
    
    // Animate playback
    const interval = setInterval(() => {
      setPlaybackTime(prev => {
        if (prev >= recording.duration) {
          setIsPlaying(false);
          clearInterval(interval);
          return recording.duration;
        }
        
        // Update player positions based on movements
        const currentMovements = recording.movements.filter(m => m.timestamp <= prev + 50);
        if (currentMovements.length > 0) {
          const latestMovements = currentMovements.reduce((acc, movement) => {
            acc[movement.playerId] = movement;
            return acc;
          }, {} as Record<string, Movement>);
          
          setPlayers(prevPlayers => prevPlayers.map(player => {
            const movement = latestMovements[player.id];
            return movement ? { ...player, x: movement.x, y: movement.y } : player;
          }));
        }
        
        return prev + 50;
      });
    }, 50);
  };

  const renderAction = (action: Action) => {
    const dx = action.endX - action.startX;
    const dy = action.endY - action.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 10) return null;
    
    return (
      <g key={action.id}>
        <defs>
          <marker
            id={`arrow-${action.id}`}
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 0, 8 3, 0 6"
              fill={action.color}
              stroke={action.color}
              strokeWidth="1"
            />
          </marker>
        </defs>
        <line
          x1={action.startX}
          y1={action.startY}
          x2={action.endX}
          y2={action.endY}
          stroke={action.color}
          strokeWidth="3"
          strokeDasharray={action.type === "dribble" ? "5,5" : "none"}
          markerEnd={`url(#arrow-${action.id})`}
          opacity="0.8"
          className="animate-pulse"
        />
        <circle
          cx={action.startX}
          cy={action.startY}
          r="4"
          fill={action.color}
          opacity="0.9"
        />
      </g>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">🏀</span>
            Basketball Court Designer
          </h2>
          <p className="text-gray-600 mt-1">Design plays and strategies with interactive tools</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isRecording ? "destructive" : "success"} className="animate-pulse-subtle">
            {isRecording ? "Recording" : "Design Mode"}
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recording Controls */}
        <Card variant="basketball" className="hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">📹</span>
              Recording
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              {!isRecording ? (
                <Button 
                  onClick={startRecording} 
                  variant="destructive"
                  className="flex-1"
                >
                  <span className="mr-2">●</span>
                  Record
                </Button>
              ) : (
                <Button 
                  onClick={stopRecording} 
                  variant="outline"
                  className="flex-1"
                >
                  <span className="mr-2">⏹</span>
                  Stop
                </Button>
              )}
              <Button onClick={resetCourt} variant="outline" className="flex-1">
                <span className="mr-2">🔄</span>
                Reset
              </Button>
            </div>
            {isRecording && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Recording in progress...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Player Management */}
        <Card variant="court" className="hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">👥</span>
              Players
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button
                onClick={() => addPlayer("offense")}
                variant="basketball"
                size="sm"
                className="flex-1"
              >
                <span className="mr-1">+</span>
                Offense
              </Button>
              <Button
                onClick={() => addPlayer("defense")}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                <span className="mr-1">+</span>
                Defense
              </Button>
            </div>
            {selectedPlayer && (
              <Button
                onClick={() => removePlayer(selectedPlayer)}
                variant="outline"
                size="sm"
                className="w-full text-red-600 hover:text-red-700"
              >
                <span className="mr-1">🗑</span>
                Remove Selected
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Action Tools */}
        <Card variant="success" className="hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">🎯</span>
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {["pass", "shoot", "cut", "block", "screen", "dribble"].map((action) => (
                <Button
                  key={action}
                  onClick={() => setActionMode(actionMode === action ? "none" : action as any)}
                  variant={actionMode === action ? "default" : "outline"}
                  size="sm"
                  className={`${actionMode === action ? "ring-2 ring-offset-2" : ""}`}
                  style={actionMode === action ? { backgroundColor: getActionColor(action) } : {}}
                >
                  <span className="mr-1">{getActionIcon(action)}</span>
                  {action}
                </Button>
              ))}
            </div>
            <Button
              onClick={() => setActions([])}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <span className="mr-1">🗑</span>
              Clear Actions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Court */}
      <Card className="hover-lift">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-basketball-blue-500 rounded-full shadow-sm"></div>
                <span>Offense</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-sm shadow-sm"></div>
                <span>Defense</span>
              </div>
              {actionMode !== "none" && (
                <div className="flex items-center gap-2 font-semibold px-3 py-1 rounded-full text-white text-xs" style={{ backgroundColor: getActionColor(actionMode) }}>
                  <span>{getActionIcon(actionMode)}</span>
                  <span>{actionMode.toUpperCase()} MODE</span>
                </div>
              )}
            </div>

            {/* Basketball Court SVG */}
            <div className="border-2 border-gray-800 rounded-2xl overflow-hidden bg-gradient-to-b from-green-100 to-green-200 shadow-lg">
              <svg
                ref={courtRef}
                width="100%"
                height="470"
                viewBox="0 0 500 470"
                className={`bg-gradient-to-b from-green-100 via-green-200 to-green-300 ${
                  actionMode !== "none" ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"
                }`}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseDown={handleCourtMouseDown}
                onMouseLeave={handleMouseUp}
              >
                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="courtGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#dcfce7", stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: "#bbf7d0", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "#86efac", stopOpacity: 1 }} />
                  </linearGradient>
                </defs>

                {/* Court background */}
                <rect x="0" y="0" width="500" height="470" fill="url(#courtGradient)" />

                {/* Court boundaries - Half court view */}
                <rect x="50" y="50" width="400" height="370" fill="none" stroke="#1f2937" strokeWidth="4" opacity="0.8"/>
                
                {/* Free throw line and lane */}
                <rect x="175" y="50" width="150" height="190" fill="none" stroke="#1f2937" strokeWidth="3" opacity="0.7"/>
                
                {/* Free throw circle */}
                <circle cx="250" cy="240" r="75" fill="none" stroke="#1f2937" strokeWidth="3" opacity="0.7"/>
                
                {/* Free throw line */}
                <line x1="175" y1="240" x2="325" y2="240" stroke="#1f2937" strokeWidth="3" opacity="0.7"/>
                
                {/* Basketball hoop and backboard */}
                <line x1="235" y1="50" x2="265" y2="50" stroke="#1f2937" strokeWidth="6"/>
                <circle cx="250" cy="65" r="12" fill="none" stroke="#ea580c" strokeWidth="4"/>
                <circle cx="250" cy="65" r="8" fill="none" stroke="#ea580c" strokeWidth="2" opacity="0.6"/>
                
                {/* Three-point line */}
                <path d="M 50 140 Q 150 50 250 50 Q 350 50 450 140" stroke="#1f2937" strokeWidth="3" fill="none" opacity="0.7"/>
                
                {/* Center circle (partial for half court) */}
                <path d="M 50 420 Q 150 350 250 350 Q 350 350 450 420" stroke="#1f2937" strokeWidth="3" fill="none" opacity="0.7"/>
                
                {/* Lane hash marks */}
                <line x1="175" y1="100" x2="185" y2="100" stroke="#1f2937" strokeWidth="2" opacity="0.6"/>
                <line x1="315" y1="100" x2="325" y2="100" stroke="#1f2937" strokeWidth="2" opacity="0.6"/>
                <line x1="175" y1="130" x2="185" y2="130" stroke="#1f2937" strokeWidth="2" opacity="0.6"/>
                <line x1="315" y1="130" x2="325" y2="130" stroke="#1f2937" strokeWidth="2" opacity="0.6"/>
                <line x1="175" y1="160" x2="185" y2="160" stroke="#1f2937" strokeWidth="2" opacity="0.6"/>
                <line x1="315" y1="160" x2="325" y2="160" stroke="#1f2937" strokeWidth="2" opacity="0.6"/>
                <line x1="175" y1="190" x2="185" y2="190" stroke="#1f2937" strokeWidth="2" opacity="0.6"/>
                <line x1="315" y1="190" x2="325" y2="190" stroke="#1f2937" strokeWidth="2" opacity="0.6"/>

                {/* Actions */}
                {actions.map(renderAction)}
                {tempAction && renderAction(tempAction)}

                {/* Players */}
                {players.map((player) => (
                  <g key={player.id}>
                    {player.type === "offense" ? (
                      <g className="hover-scale">
                        <circle
                          cx={player.x}
                          cy={player.y}
                          r="20"
                          fill="#1aa3ff"
                          stroke={selectedPlayer === player.id ? "#0088e6" : "#0077cc"}
                          strokeWidth={selectedPlayer === player.id ? "4" : "2"}
                          className="cursor-move hover:fill-basketball-blue-400 transition-all duration-200 shadow-lg"
                          onMouseDown={(e) => handlePlayerMouseDown(player.id, e)}
                          filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
                        />
                        <text
                          x={player.x}
                          y={player.y}
                          textAnchor="middle"
                          dy="6"
                          fill="white"
                          fontSize="14"
                          fontWeight="bold"
                          className="pointer-events-none select-none"
                        >
                          {player.number}
                        </text>
                      </g>
                    ) : (
                      <g className="hover-scale">
                        <rect
                          x={player.x - 18}
                          y={player.y - 18}
                          width="36"
                          height="36"
                          rx="4"
                          fill="#ef4444"
                          stroke={selectedPlayer === player.id ? "#dc2626" : "#b91c1c"}
                          strokeWidth={selectedPlayer === player.id ? "4" : "2"}
                          className="cursor-move hover:fill-red-400 transition-all duration-200 shadow-lg"
                          onMouseDown={(e) => handlePlayerMouseDown(player.id, e)}
                          filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
                        />
                        <text
                          x={player.x}
                          y={player.y}
                          textAnchor="middle"
                          dy="6"
                          fill="white"
                          fontSize="18"
                          fontWeight="bold"
                          className="pointer-events-none select-none"
                        >
                          ×
                        </text>
                      </g>
                    )}
                  </g>
                ))}
              </svg>
            </div>

            {/* Playback Progress */}
            {isPlaying && selectedRecording && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span className="font-medium">Playing: {selectedRecording.name}</span>
                  <span className="text-basketball-blue-600 font-mono">
                    {(playbackTime / 1000).toFixed(1)}s / {(selectedRecording.duration / 1000).toFixed(1)}s
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-basketball-blue-500 to-basketball-blue-600 h-3 rounded-full transition-all duration-100 shadow-sm"
                    style={{ width: `${(playbackTime / selectedRecording.duration) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recordings */}
      {(recordings.length > 0 || (savedRecordings?.recordings.length || 0) > 0) && (
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🎬</span>
              Basketball Plays
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Local Recordings (Session Only) */}
            {recordings.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-lg">💾</span>
                  Current Session
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recordings.map((recording) => (
                    <Card key={recording.id} variant="basketball" className="hover-lift card-hover">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">{recording.name}</h4>
                            <Badge variant="outline" size="sm">
                              {(recording.duration / 1000).toFixed(1)}s
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{recording.movements.length} movements</p>
                            <p>{recording.actions.length} actions</p>
                          </div>
                          <Button
                            onClick={() => playRecording(recording)}
                            disabled={isPlaying}
                            variant="success"
                            size="sm"
                            className="w-full"
                          >
                            {isPlaying && selectedRecording?.id === recording.id ? (
                              <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                Playing...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <span>▶</span>
                                Play
                              </span>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Recordings (Database) */}
            {savedRecordings?.recordings && savedRecordings.recordings.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-lg">🏆</span>
                  Saved Plays
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedRecordings.recordings.map((savedRec) => {
                    const recordingData = savedRec.data as any;
                    const recording: Recording = {
                      id: savedRec.id,
                      name: savedRec.name,
                      movements: recordingData.movements || [],
                      actions: recordingData.actions || [],
                      players: recordingData.players || [],
                      duration: recordingData.duration || 0,
                      created: new Date(savedRec.createdAt),
                    };
                    
                    return (
                      <Card key={savedRec.id} variant="court" className="hover-lift card-hover">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900">{savedRec.name}</h4>
                              <Badge variant="outline" size="sm">
                                {(recordingData.duration / 1000).toFixed(1)}s
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>{recordingData.movements?.length || 0} movements</p>
                              <p>{recordingData.actions?.length || 0} actions</p>
                              <p className="text-xs text-gray-500">
                                {new Date(savedRec.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              onClick={() => playRecording(recording)}
                              disabled={isPlaying}
                              variant="success"
                              size="sm"
                              className="w-full"
                            >
                              {isPlaying && selectedRecording?.id === recording.id ? (
                                <span className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                  Playing...
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <span>▶</span>
                                  Play
                                </span>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}