"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateTeamModal({ isOpen, onClose, onSuccess }: CreateTeamModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  
  const createTeamMutation = trpc.createTeam.useMutation({
    onSuccess: () => {
      setName("");
      setDescription("");
      onClose();
      onSuccess?.();
      router.refresh();
    },
    onError: (error) => {
      console.error("Failed to create team:", error);
      alert(`Failed to create team: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    createTeamMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white shadow-2xl border-2 border-gray-200">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-t-lg">
          <CardTitle className="text-white text-lg font-bold">Create New Team</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="teamName" className="block text-sm font-semibold text-gray-800 mb-2">
                Team Name *
              </label>
              <input
                id="teamName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
                placeholder="Enter team name"
                required
              />
            </div>
            <div>
              <label htmlFor="teamDescription" className="block text-sm font-semibold text-gray-800 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="teamDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 h-24 resize-none transition-colors"
                placeholder="Enter team description"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 py-3 border-2 hover:bg-gray-50"
                disabled={createTeamMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={createTeamMutation.isPending || !name.trim()}
              >
                {createTeamMutation.isPending ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}