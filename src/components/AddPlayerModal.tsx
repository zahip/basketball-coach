"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onSuccess?: () => void;
}

const POSITIONS = [
  { value: "PG", label: "Point Guard (PG)" },
  { value: "SG", label: "Shooting Guard (SG)" },
  { value: "SF", label: "Small Forward (SF)" },
  { value: "PF", label: "Power Forward (PF)" },
  { value: "C", label: "Center (C)" },
];

export function AddPlayerModal({ isOpen, onClose, teamId, onSuccess }: AddPlayerModalProps) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [number, setNumber] = useState("");
  
  const addPlayerMutation = trpc.addPlayer.useMutation({
    onSuccess: () => {
      setName("");
      setPosition("");
      setNumber("");
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Failed to add player:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    addPlayerMutation.mutate({
      teamId,
      name: name.trim(),
      position: position || undefined,
      number: number ? parseInt(number) : undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white shadow-2xl border-2 border-gray-200">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-t-lg">
          <CardTitle className="text-white text-lg font-bold">Add New Player</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="playerName" className="block text-sm font-semibold text-gray-800 mb-2">
                Player Name *
              </label>
              <input
                id="playerName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
                placeholder="Enter player name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="playerPosition" className="block text-sm font-semibold text-gray-800 mb-2">
                Position (Optional)
              </label>
              <select
                id="playerPosition"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
              >
                <option value="">Select position</option>
                {POSITIONS.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="playerNumber" className="block text-sm font-semibold text-gray-800 mb-2">
                Jersey Number (Optional)
              </label>
              <input
                id="playerNumber"
                type="number"
                min="0"
                max="99"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
                placeholder="Enter jersey number"
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 py-3 border-2 hover:bg-gray-50"
                disabled={addPlayerMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={addPlayerMutation.isPending || !name.trim()}
              >
                {addPlayerMutation.isPending ? "Adding..." : "Add Player"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}