"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";

interface Exercise {
  name: string;
  description: string;
  duration?: number;
  category?: string;
  order: number;
}

interface CreateTrainingSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateTrainingSetModal({ isOpen, onClose, onSuccess }: CreateTrainingSetModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise>({
    name: "",
    description: "",
    duration: undefined,
    category: "",
    order: 0,
  });
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const router = useRouter();

  const { data: teamsData } = trpc.getTeams.useQuery();
  const [selectedTeamId, setSelectedTeamId] = useState("");
  
  const createTrainingSetMutation = trpc.createTrainingSet.useMutation({
    onSuccess: (data) => {
      setName("");
      setDescription("");
      setExercises([]);
      setSelectedTeamId("");
      onClose();
      onSuccess?.();
      router.refresh();
    },
    onError: (error) => {
      console.error("Failed to create training set:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedTeamId) return;
    
    createTrainingSetMutation.mutate({
      teamId: selectedTeamId,
      name: name.trim(),
      description: description.trim() || undefined,
      exercises: exercises,
    });
  };

  const addExercise = () => {
    if (!currentExercise.name.trim()) return;
    
    const newExercise = {
      ...currentExercise,
      order: exercises.length,
    };
    setExercises([...exercises, newExercise]);
    setCurrentExercise({
      name: "",
      description: "",
      duration: undefined,
      category: "",
      order: 0,
    });
    setShowExerciseForm(false);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const categories = ["Warm-up", "Skills", "Conditioning", "Scrimmage", "Cool-down"];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white shadow-2xl border-2 border-gray-200 max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-t-lg">
          <CardTitle className="text-white text-lg font-bold">Create Basketball Training Set</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="teamSelect" className="block text-sm font-semibold text-gray-800 mb-2">
                Select Team *
              </label>
              <select
                id="teamSelect"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
                required
              >
                <option value="">Select a team...</option>
                {teamsData?.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="trainingSetName" className="block text-sm font-semibold text-gray-800 mb-2">
                Training Set Name *
              </label>
              <input
                id="trainingSetName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
                placeholder="Enter training set name"
                required
              />
            </div>

            <div>
              <label htmlFor="trainingSetDescription" className="block text-sm font-semibold text-gray-800 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="trainingSetDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 h-24 resize-none transition-colors"
                placeholder="Enter training set description"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-800">
                  Exercises ({exercises.length})
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExerciseForm(!showExerciseForm)}
                  className="text-orange-500 border-orange-500 hover:bg-orange-50"
                >
                  {showExerciseForm ? "Cancel" : "+ Add Exercise"}
                </Button>
              </div>

              {showExerciseForm && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-4">
                  <input
                    type="text"
                    value={currentExercise.name}
                    onChange={(e) => setCurrentExercise({...currentExercise, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Exercise name"
                  />
                  <textarea
                    value={currentExercise.description}
                    onChange={(e) => setCurrentExercise({...currentExercise, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 h-20 resize-none"
                    placeholder="Exercise description"
                  />
                  <div className="flex gap-3">
                    <select
                      value={currentExercise.category}
                      onChange={(e) => setCurrentExercise({...currentExercise, category: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={currentExercise.duration || ""}
                      onChange={(e) => setCurrentExercise({...currentExercise, duration: e.target.value ? parseInt(e.target.value) : undefined})}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="mins"
                      min="1"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addExercise}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={!currentExercise.name.trim()}
                  >
                    Add Exercise
                  </Button>
                </div>
              )}

              {exercises.length > 0 && (
                <div className="space-y-2">
                  {exercises.map((exercise, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{exercise.name}</span>
                          {exercise.category && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {exercise.category}
                            </span>
                          )}
                          {exercise.duration && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {exercise.duration}min
                            </span>
                          )}
                        </div>
                        {exercise.description && (
                          <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeExercise(index)}
                        className="text-red-500 border-red-500 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 py-3 border-2 hover:bg-gray-50"
                disabled={createTrainingSetMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={createTrainingSetMutation.isPending || !name.trim() || !selectedTeamId}
              >
                {createTrainingSetMutation.isPending ? "Creating..." : "Create Training Set"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}