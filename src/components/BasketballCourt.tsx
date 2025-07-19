"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  initialPlayers: Player[];
  duration: number;
  created: Date;
}

interface BasketballCourtProps {
  teamId?: string;
  onDataChange?: (data: {
    players: Player[];
    actions: Action[];
    recordings: Recording[];
  }) => void;
  showSaveButton?: boolean;
}

export function BasketballCourt({ teamId, onDataChange, showSaveButton = true }: BasketballCourtProps) {
  const courtRef = useRef<SVGSVGElement>(null);
  
  // Initial player setup for half court
  const [players, setPlayers] = useState<Player[]>([
    { id: crypto.randomUUID(), x: 250, y: 420, type: "offense", number: 1 },
    { id: crypto.randomUUID(), x: 150, y: 380, type: "offense", number: 2 },
    { id: crypto.randomUUID(), x: 350, y: 380, type: "offense", number: 3 },
    { id: crypto.randomUUID(), x: 200, y: 320, type: "offense", number: 4 },
    { id: crypto.randomUUID(), x: 300, y: 320, type: "offense", number: 5 },
    { id: crypto.randomUUID(), x: 270, y: 400, type: "defense", number: 1 },
    { id: crypto.randomUUID(), x: 170, y: 360, type: "defense", number: 2 },
    { id: crypto.randomUUID(), x: 330, y: 360, type: "defense", number: 3 },
    { id: crypto.randomUUID(), x: 220, y: 300, type: "defense", number: 4 },
    { id: crypto.randomUUID(), x: 280, y: 300, type: "defense", number: 5 },
  ]);

  // State management
  const [draggedPlayer, setDraggedPlayer] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<Movement[]>([]);
  const [currentActions, setCurrentActions] = useState<Action[]>([]);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [recordingInitialPlayers, setRecordingInitialPlayers] = useState<Player[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [playbackInterval, setPlaybackInterval] = useState<NodeJS.Timeout | null>(null);
  
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
  const saveRecordingMutation = trpc.savePlayRecording.useMutation();

  // Test database connection
  const { data: testData, error: testError } = trpc.testConnection.useQuery(undefined, {
    retry: false,
  });
  
  // Log test results
  if (testData) {
    console.log("Database test result:", testData);
  }
  if (testError) {
    console.error("Database test failed:", testError);
  }

  const { data: savedRecordings, refetch: refetchRecordings, error: recordingsError } = trpc.getPlayRecordings.useQuery(
    { teamId: teamId || "" },
    { 
      enabled: !!teamId,
      retry: false,
    }
  );

  // Log recordings error
  if (recordingsError) {
    console.error("Failed to load saved recordings:", recordingsError);
  }

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "pass": return "#10B981"; // Green
      case "shoot": return "#F59E0B"; // Orange
      case "cut": return "#3B82F6"; // Blue
      case "block": return "#EF4444"; // Red
      case "screen": return "#8B5CF6"; // Purple
      case "dribble": return "#6B7280"; // Gray
      default: return "#000000";
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setCurrentRecording([]);
    setCurrentActions([]);
    setRecordingStartTime(Date.now());
    // Capture initial player positions when recording starts
    setRecordingInitialPlayers([...players]);
  };

  const stopRecording = () => {
    if (currentRecording.length > 0 || currentActions.length > 0) {
      const recordingName = `Play ${recordings.length + 1}`;
      const newRecording: Recording = {
        id: crypto.randomUUID(),
        name: recordingName,
        movements: currentRecording,
        actions: currentActions,
        players: [...players], // Final positions (for reference)
        initialPlayers: [...recordingInitialPlayers], // Initial positions when recording started
        duration: Date.now() - recordingStartTime,
        created: new Date(),
      };
      
      setRecordings([...recordings, newRecording]);
      
      // Notify parent component about data changes
      if (onDataChange) {
        onDataChange({
          players: [...players],
          actions: [...actions],
          recordings: [...recordings, newRecording],
        });
      }
      
      // Save to database if teamId is provided (optional, won't block local recording)
      if (teamId && saveRecordingMutation) {
        setTimeout(async () => {
          try {
            await saveRecordingMutation.mutateAsync({
              teamId,
              name: recordingName,
              data: {
                movements: currentRecording,
                actions: currentActions,
                players: [...players],
                duration: Date.now() - recordingStartTime,
              }
            });
            console.log("Recording saved successfully");
            if (teamId) {
              refetchRecordings();
            }
          } catch (error) {
            console.error("Failed to save recording to database:", error);
          }
        }, 100); // Delay to ensure local recording is saved first
      }
    }
    setIsRecording(false);
    setCurrentRecording([]);
    setCurrentActions([]);
  };

  const addPlayer = (type: "offense" | "defense") => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      x: type === "offense" ? 250 : 270,
      y: 350,
      type,
      number: Math.floor(nextPlayerId / 2),
    };
    setPlayers([...players, newPlayer]);
    setNextPlayerId(nextPlayerId + 1);
  };

  const removePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId));
    if (selectedPlayer === playerId) {
      setSelectedPlayer(null);
    }
  };

  const handlePlayerMouseDown = (playerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (actionMode === "none") {
      setDraggedPlayer(playerId);
      setSelectedPlayer(playerId);
    } else {
      // Start action from this player
      if (!courtRef.current) return;
      const rect = courtRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setIsDrawingAction(true);
      setActionStart({ x, y, playerId });
    }
  };

  const handleCourtMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (actionMode !== "none" && !isDrawingAction && courtRef.current) {
      const rect = courtRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setIsDrawingAction(true);
      setActionStart({ x, y });
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!courtRef.current) return;
    
    const rect = courtRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle player dragging
    if (draggedPlayer) {
      // Record movement if recording (only record significant position changes)
      if (isRecording) {
        setCurrentRecording(prev => {
          const lastMovement = prev
            .filter(m => m.playerId === draggedPlayer)
            .pop();
          
          // Only record if position changed significantly (more than 5 pixels)
          if (!lastMovement || 
              Math.abs(lastMovement.x - x) > 5 || 
              Math.abs(lastMovement.y - y) > 5) {
            const movement: Movement = {
              playerId: draggedPlayer,
              x,
              y,
              timestamp: Date.now() - recordingStartTime,
            };
            return [...prev, movement];
          }
          return prev;
        });
      }

      // Update player position
      setPlayers(prev =>
        prev.map(player =>
          player.id === draggedPlayer ? { ...player, x, y } : player
        )
      );
    }

    // Handle action drawing
    if (isDrawingAction && actionStart && actionMode !== "none") {
      const tempAct: Action = {
        id: "temp",
        type: actionMode,
        playerId: actionStart.playerId || "",
        startX: actionStart.x,
        startY: actionStart.y,
        endX: x,
        endY: y,
        color: getActionColor(actionMode),
        timestamp: Date.now() - recordingStartTime,
      };
      setTempAction(tempAct);
    }
  }, [draggedPlayer, isRecording, recordingStartTime, isDrawingAction, actionStart, actionMode]);

  const handleMouseUp = () => {
    if (isDrawingAction && actionStart && tempAction && courtRef.current) {
      const finalAction: Action = {
        ...tempAction,
        id: crypto.randomUUID(),
      };
      
      setActions(prev => [...prev, finalAction]);
      
      if (isRecording) {
        setCurrentActions(prev => [...prev, finalAction]);
      }
    }
    
    setDraggedPlayer(null);
    setIsDrawingAction(false);
    setActionStart(null);
    setTempAction(null);
  };

  const resetCourt = () => {
    setPlayers([
      { id: crypto.randomUUID(), x: 250, y: 420, type: "offense", number: 1 },
      { id: crypto.randomUUID(), x: 150, y: 380, type: "offense", number: 2 },
      { id: crypto.randomUUID(), x: 350, y: 380, type: "offense", number: 3 },
      { id: crypto.randomUUID(), x: 200, y: 320, type: "offense", number: 4 },
      { id: crypto.randomUUID(), x: 300, y: 320, type: "offense", number: 5 },
      { id: crypto.randomUUID(), x: 270, y: 400, type: "defense", number: 1 },
      { id: crypto.randomUUID(), x: 170, y: 360, type: "defense", number: 2 },
      { id: crypto.randomUUID(), x: 330, y: 360, type: "defense", number: 3 },
      { id: crypto.randomUUID(), x: 220, y: 300, type: "defense", number: 4 },
      { id: crypto.randomUUID(), x: 280, y: 300, type: "defense", number: 5 },
    ]);
    setActions([]);
    setActionMode("none");
    setSelectedPlayer(null);
  };

  const playRecording = (recording: Recording) => {
    // Stop any existing playback
    if (playbackInterval) {
      clearInterval(playbackInterval);
    }
    
    setSelectedRecording(recording);
    setPlaybackTime(0);
    setIsPlaying(true);
    setIsPaused(false);
    
    // Set initial player positions from when recording started
    setPlayers([...recording.initialPlayers]);
    setActions([]);
    
    startPlaybackAnimation(recording);
  };

  const startPlaybackAnimation = (recording: Recording) => {
    const interval = setInterval(() => {
      setPlaybackTime(prev => {
        const timeIncrement = 50 * playbackSpeed; // Adjust speed
        const newTime = prev + timeIncrement;
        
        if (newTime >= recording.duration) {
          setIsPlaying(false);
          setIsPaused(false);
          clearInterval(interval);
          setPlaybackInterval(null);
          // Show final state with all actions
          setActions(recording.actions);
          return recording.duration;
        }
        
        // Apply movements up to current time with interpolation
        const currentMovements = recording.movements.filter(m => m.timestamp <= newTime);
        
        // Update player positions with interpolation for smooth movement
        setPlayers(prevPlayers => {
          return prevPlayers.map(player => {
            // Get all movements for this player up to current time
            const playerMovements = currentMovements.filter(m => m.playerId === player.id);
            
            if (playerMovements.length === 0) {
              return player; // No movements recorded for this player yet
            }
            
            // Get the latest movement for this player
            const latestMovement = playerMovements[playerMovements.length - 1];
            
            // If we have more than one movement, interpolate between the last two
            if (playerMovements.length > 1) {
              const secondLatest = playerMovements[playerMovements.length - 2];
              const timeDiff = latestMovement.timestamp - secondLatest.timestamp;
              const currentTimeDiff = newTime - secondLatest.timestamp;
              
              if (timeDiff > 0 && currentTimeDiff < timeDiff) {
                // Interpolate between secondLatest and latest
                const progress = currentTimeDiff / timeDiff;
                const interpolatedX = secondLatest.x + (latestMovement.x - secondLatest.x) * progress;
                const interpolatedY = secondLatest.y + (latestMovement.y - secondLatest.y) * progress;
                
                return {
                  ...player,
                  x: interpolatedX,
                  y: interpolatedY,
                };
              }
            }
            
            // Use the latest recorded position
            return {
              ...player,
              x: latestMovement.x,
              y: latestMovement.y,
            };
          });
        });
        
        // Apply actions up to current time
        const currentActions = recording.actions.filter(a => a.timestamp <= newTime);
        setActions(currentActions);
        
        return newTime;
      });
    }, 50);
    
    setPlaybackInterval(interval);
  };

  const pausePlayback = () => {
    if (playbackInterval) {
      clearInterval(playbackInterval);
      setPlaybackInterval(null);
    }
    setIsPaused(true);
    setIsPlaying(false);
  };

  const resumePlayback = () => {
    if (selectedRecording && isPaused) {
      setIsPaused(false);
      setIsPlaying(true);
      startPlaybackAnimation(selectedRecording);
    }
  };

  const stopPlayback = () => {
    if (playbackInterval) {
      clearInterval(playbackInterval);
      setPlaybackInterval(null);
    }
    setIsPlaying(false);
    setIsPaused(false);
    setSelectedRecording(null);
    setPlaybackTime(0);
    resetCourt();
  };

  const restartPlayback = () => {
    if (selectedRecording) {
      playRecording(selectedRecording);
    }
  };

  const renderAction = (action: Action) => {
    const dx = action.endX - action.startX;
    const dy = action.endY - action.startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length < 10) return null;
    
    const actionStyles = {
      pass: { strokeDasharray: "none", markerEnd: "url(#passArrow)" },
      shoot: { strokeDasharray: "5,5", markerEnd: "url(#shootArrow)" },
      cut: { strokeDasharray: "10,5", markerEnd: "url(#cutArrow)" },
      block: { strokeDasharray: "none", markerEnd: "none" },
      screen: { strokeDasharray: "15,5", markerEnd: "none" },
      dribble: { strokeDasharray: "3,3", markerEnd: "none" },
    };
    
    const style = actionStyles[action.type];
    
    return (
      <g key={action.id}>
        <line
          x1={action.startX}
          y1={action.startY}
          x2={action.endX}
          y2={action.endY}
          stroke={action.color}
          strokeWidth="3"
          strokeDasharray={style.strokeDasharray}
          markerEnd={style.markerEnd}
        />
        {action.type === "screen" && (
          <rect
            x={action.endX - 8}
            y={action.endY - 8}
            width="16"
            height="16"
            fill={action.color}
            opacity="0.7"
          />
        )}
      </g>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🏀 Basketball Court Designer</span>
          <div className="flex gap-2">
            {!isRecording ? (
              <Button onClick={startRecording} className="bg-red-500 hover:bg-red-600">
                ● Record
              </Button>
            ) : (
              <Button onClick={stopRecording} className="bg-gray-500 hover:bg-gray-600">
                ⏹ Stop Recording
              </Button>
            )}
            <Button onClick={resetCourt} variant="outline">
              🔄 Reset
            </Button>
          </div>
        </CardTitle>
        
        {/* Player Management */}
        <div className="flex gap-2 mt-2">
          <Button
            onClick={() => addPlayer("offense")}
            className="bg-blue-500 hover:bg-blue-600"
            size="sm"
          >
            + Add Offense
          </Button>
          <Button
            onClick={() => addPlayer("defense")}
            className="bg-red-500 hover:bg-red-600"
            size="sm"
          >
            + Add Defense
          </Button>
          {selectedPlayer && (
            <Button
              onClick={() => removePlayer(selectedPlayer)}
              variant="destructive"
              size="sm"
            >
              🗑 Remove Player
            </Button>
          )}
        </div>

        {/* Action Tools */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {["pass", "shoot", "cut", "block", "screen", "dribble"].map((action) => (
            <Button
              key={action}
              onClick={() => setActionMode(actionMode === action ? "none" : action as typeof actionMode)}
              variant={actionMode === action ? "default" : "outline"}
              className={actionMode === action ? `bg-${getActionColor(action).replace('#', '')} hover:bg-${getActionColor(action).replace('#', '')}/80` : ""}
              size="sm"
            >
              {action === "pass" && "🎯 Pass"}
              {action === "shoot" && "🏀 Shoot"}
              {action === "cut" && "✂️ Cut"}
              {action === "block" && "🚫 Block"}
              {action === "screen" && "🛡️ Screen"}
              {action === "dribble" && "⚡ Dribble"}
            </Button>
          ))}
          <Button
            onClick={() => setActions([])}
            variant="outline"
            size="sm"
          >
            🗑 Clear Actions
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Offense</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 flex items-center justify-center text-white text-xs font-bold">×</div>
              <span>Defense</span>
            </div>
            {actionMode !== "none" && (
              <div className="flex items-center gap-2 font-semibold" style={{ color: getActionColor(actionMode) }}>
                <span>{actionMode.toUpperCase()} Mode</span>
              </div>
            )}
            {isRecording && (
              <div className="flex items-center gap-2 text-red-600 font-semibold">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Recording...</span>
              </div>
            )}
          </div>

          {/* Basketball Court SVG */}
          <div className="border-2 border-gray-800 rounded-lg overflow-hidden bg-orange-50">
            <svg
              ref={courtRef}
              width="500"
              height="470"
              viewBox="0 0 500 470"
              className={`bg-gradient-to-b from-orange-100 to-orange-200 ${actionMode !== "none" ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"}`}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseDown={handleCourtMouseDown}
              onMouseLeave={handleMouseUp}
            >
              {/* Arrow marker definitions */}
              <defs>
                <marker id="passArrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
                </marker>
                <marker id="shootArrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#F59E0B" />
                </marker>
                <marker id="cutArrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
                </marker>
              </defs>

              {/* Court boundaries - Half court view */}
              <rect x="50" y="50" width="400" height="370" fill="none" stroke="#000" strokeWidth="4"/>
              
              {/* Free throw line and lane */}
              <rect x="175" y="50" width="150" height="190" fill="none" stroke="#000" strokeWidth="3"/>
              
              {/* Free throw circle */}
              <circle cx="250" cy="240" r="75" fill="none" stroke="#000" strokeWidth="3"/>
              
              {/* Free throw line */}
              <line x1="175" y1="240" x2="325" y2="240" stroke="#000" strokeWidth="3"/>
              
              {/* Basketball hoop and backboard */}
              <line x1="235" y1="50" x2="265" y2="50" stroke="#000" strokeWidth="6"/>
              <circle cx="250" cy="65" r="12" fill="none" stroke="#FF4500" strokeWidth="3"/>
              
              {/* Three-point line */}
              <path d="M 50 140 Q 150 50 250 50 Q 350 50 450 140" stroke="#000" strokeWidth="3" fill="none"/>
              
              {/* Center circle (partial for half court) */}
              <path d="M 50 420 Q 150 350 250 350 Q 350 350 450 420" stroke="#000" strokeWidth="3" fill="none"/>
              
              {/* Lane hash marks */}
              <line x1="175" y1="100" x2="185" y2="100" stroke="#000" strokeWidth="2"/>
              <line x1="315" y1="100" x2="325" y2="100" stroke="#000" strokeWidth="2"/>
              <line x1="175" y1="130" x2="185" y2="130" stroke="#000" strokeWidth="2"/>
              <line x1="315" y1="130" x2="325" y2="130" stroke="#000" strokeWidth="2"/>
              <line x1="175" y1="160" x2="185" y2="160" stroke="#000" strokeWidth="2"/>
              <line x1="315" y1="160" x2="325" y2="160" stroke="#000" strokeWidth="2"/>
              <line x1="175" y1="190" x2="185" y2="190" stroke="#000" strokeWidth="2"/>
              <line x1="315" y1="190" x2="325" y2="190" stroke="#000" strokeWidth="2"/>

              {/* Actions */}
              {actions.map(renderAction)}
              {tempAction && renderAction(tempAction)}

              {/* Players */}
              {players.map((player) => (
                <g key={player.id}>
                  {player.type === "offense" ? (
                    <g>
                      <circle
                        cx={player.x}
                        cy={player.y}
                        r="18"
                        fill="#3B82F6"
                        stroke={selectedPlayer === player.id ? "#1E40AF" : "#1E3A8A"}
                        strokeWidth={selectedPlayer === player.id ? "4" : "2"}
                        className="cursor-move hover:fill-blue-400 transition-colors"
                        onMouseDown={(e) => handlePlayerMouseDown(player.id, e)}
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
                    <g>
                      <rect
                        x={player.x - 16}
                        y={player.y - 16}
                        width="32"
                        height="32"
                        fill="#EF4444"
                        stroke={selectedPlayer === player.id ? "#DC2626" : "#B91C1C"}
                        strokeWidth={selectedPlayer === player.id ? "4" : "2"}
                        className="cursor-move hover:fill-red-400 transition-colors"
                        onMouseDown={(e) => handlePlayerMouseDown(player.id, e)}
                      />
                      <text
                        x={player.x}
                        y={player.y}
                        textAnchor="middle"
                        dy="6"
                        fill="white"
                        fontSize="16"
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

          {/* Recordings */}
          {showSaveButton && (recordings.length > 0 || (savedRecordings?.recordings.length || 0) > 0) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Basketball Plays</h3>
              
              {/* Local Recordings (Session Only) */}
              {recordings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Current Session</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {recordings.map((recording) => (
                      <Card key={recording.id} className="border border-gray-200 bg-blue-50">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">{recording.name}</h4>
                            <p className="text-sm text-gray-600">
                              Duration: {(recording.duration / 1000).toFixed(1)}s
                            </p>
                            <p className="text-xs text-gray-500">
                              {recording.movements.length} movements, {recording.actions.length} actions
                            </p>
                            <Button
                              onClick={() => playRecording(recording)}
                              disabled={isPlaying}
                              className="w-full bg-green-500 hover:bg-green-600"
                              size="sm"
                            >
                              {isPlaying && selectedRecording?.id === recording.id ? "Playing..." : "▶ Play"}
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
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Saved Plays</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {savedRecordings.recordings.map((savedRec: any) => {
                      const recordingData = savedRec.data as {
                        movements: Movement[];
                        actions: Action[];
                        players: Player[];
                        initialPlayers?: Player[];
                        duration: number;
                      };
                      const recording: Recording = {
                        id: savedRec.id,
                        name: savedRec.name,
                        movements: recordingData.movements || [],
                        actions: recordingData.actions || [],
                        players: recordingData.players || [],
                        initialPlayers: recordingData.initialPlayers || recordingData.players || [],
                        duration: recordingData.duration || 0,
                        created: new Date(savedRec.createdAt),
                      };
                      
                      return (
                        <Card key={savedRec.id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900">{savedRec.name}</h4>
                              <p className="text-sm text-gray-600">
                                Duration: {(recordingData.duration / 1000).toFixed(1)}s
                              </p>
                              <p className="text-xs text-gray-500">
                                {recordingData.movements?.length || 0} movements, {recordingData.actions?.length || 0} actions
                              </p>
                              <p className="text-xs text-gray-400">
                                Saved: {new Date(savedRec.createdAt).toLocaleDateString()}
                              </p>
                              <Button
                                onClick={() => playRecording(recording)}
                                disabled={isPlaying}
                                className="w-full bg-green-500 hover:bg-green-600"
                                size="sm"
                              >
                                {isPlaying && selectedRecording?.id === recording.id ? "Playing..." : "▶ Play"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Animation Controls and Playback Progress */}
          {(isPlaying || isPaused) && selectedRecording && (
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Playing: {selectedRecording.name}</span>
                <span className="text-sm text-gray-600">{(playbackTime / 1000).toFixed(1)}s / {(selectedRecording.duration / 1000).toFixed(1)}s</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${(playbackTime / selectedRecording.duration) * 100}%` }}
                ></div>
              </div>

              {/* Animation Control Buttons */}
              <div className="flex items-center gap-2 justify-center">
                {isPaused ? (
                  <Button
                    onClick={resumePlayback}
                    className="bg-green-500 hover:bg-green-600"
                    size="sm"
                  >
                    ▶ Resume
                  </Button>
                ) : (
                  <Button
                    onClick={pausePlayback}
                    className="bg-yellow-500 hover:bg-yellow-600"
                    size="sm"
                  >
                    ⏸ Pause
                  </Button>
                )}
                
                <Button
                  onClick={restartPlayback}
                  variant="outline"
                  size="sm"
                >
                  ⏮ Restart
                </Button>
                
                <Button
                  onClick={stopPlayback}
                  className="bg-red-500 hover:bg-red-600"
                  size="sm"
                >
                  ⏹ Stop
                </Button>

                {/* Speed Control */}
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-gray-600">Speed:</span>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value={0.25}>0.25x</option>
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}