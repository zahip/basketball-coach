"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { trpc } from "@/lib/trpc";
import { ExerciseDatabase } from "@/components/ExerciseDatabase";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";

interface TrainingSetBuilderProps {
  locale: string;
}

interface ExerciseInSet {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  category?: string;
  difficulty?: string;
  equipment?: string;
  instructions?: string;
  order: number;
  exerciseTemplateId?: string;
}

export function TrainingSetBuilder({ locale }: TrainingSetBuilderProps) {
  const [trainingSetName, setTrainingSetName] = useState("");
  const [trainingSetDescription, setTrainingSetDescription] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [exercisesInSet, setExercisesInSet] = useState<ExerciseInSet[]>([]);
  const [showExerciseDatabase, setShowExerciseDatabase] = useState(false);
  const router = useRouter();

  const { data: teamsData, error: teamsError, isLoading: teamsLoading } = trpc.getTeams.useQuery();
  const { data: exerciseTemplatesData, refetch: refetchExercises, error: exercisesError, isLoading: exercisesLoading } = trpc.getExerciseTemplates.useQuery();

  // Debug logging
  useEffect(() => {
    console.log("Teams data:", teamsData);
    console.log("Teams error:", teamsError);
    console.log("Exercises data:", exerciseTemplatesData);
    console.log("Exercises error:", exercisesError);
  }, [teamsData, teamsError, exerciseTemplatesData, exercisesError]);

  const createTrainingSetMutation = trpc.createTrainingSet.useMutation({
    onSuccess: (data) => {
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Failed to create training set:", error);
    },
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === "exercise-database" && destination.droppableId === "training-set") {
      // Adding exercise from database to training set
      const exerciseTemplate = exerciseTemplatesData?.exerciseTemplates.find(
        (ex) => ex.id === result.draggableId
      );
      
      if (exerciseTemplate) {
        const newExercise: ExerciseInSet = {
          id: `${exerciseTemplate.id}-${Date.now()}`,
          name: exerciseTemplate.name,
          description: exerciseTemplate.description || undefined,
          duration: exerciseTemplate.duration || undefined,
          category: exerciseTemplate.category || undefined,
          difficulty: exerciseTemplate.difficulty || undefined,
          equipment: exerciseTemplate.equipment || undefined,
          instructions: exerciseTemplate.instructions || undefined,
          order: exercisesInSet.length,
          exerciseTemplateId: exerciseTemplate.id,
        };
        setExercisesInSet([...exercisesInSet, newExercise]);
      }
    } else if (source.droppableId === "training-set" && destination.droppableId === "training-set") {
      // Reordering exercises within the training set
      const items = Array.from(exercisesInSet);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      
      const reorderedItems = items.map((item, index) => ({
        ...item,
        order: index,
      }));
      
      setExercisesInSet(reorderedItems);
    }
  };

  const removeExercise = (exerciseId: string) => {
    setExercisesInSet(exercisesInSet.filter(ex => ex.id !== exerciseId));
  };

  const handleCreateTrainingSet = () => {
    if (!trainingSetName.trim() || !selectedTeamId) return;

    const exercises = exercisesInSet.map((ex) => ({
      name: ex.name,
      description: ex.description,
      duration: ex.duration,
      category: ex.category,
      order: ex.order,
    }));

    createTrainingSetMutation.mutate({
      teamId: selectedTeamId,
      name: trainingSetName.trim(),
      description: trainingSetDescription.trim() || undefined,
      exercises,
    });
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "Warm-up": return "bg-orange-100 text-orange-800";
      case "Skills": return "bg-blue-100 text-blue-800";
      case "Conditioning": return "bg-purple-100 text-purple-800";
      case "Scrimmage": return "bg-green-100 text-green-800";
      case "Cool-down": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-100">
      {/* Header */}
      <header className="w-full border-b bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-500 w-10 h-10 flex items-center justify-center shadow">
                <span className="text-xl text-white font-bold">🏀</span>
              </div>
              <h1 className="text-xl font-bold text-blue-900">
                Training Set Builder
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowExerciseDatabase(!showExerciseDatabase)}
            >
              {showExerciseDatabase ? "Hide" : "Show"} Exercise Database
            </Button>
            <Button
              onClick={handleCreateTrainingSet}
              disabled={!trainingSetName.trim() || !selectedTeamId || createTrainingSetMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {createTrainingSetMutation.isPending ? "Creating..." : "Create Training Set"}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Training Set Details */}
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Training Set Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select Team *
                    </label>
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                      required
                    >
                      <option value="">
                        {teamsLoading ? "Loading teams..." : teamsError ? "Error loading teams" : "Select a team..."}
                      </option>
                      {teamsData?.teams?.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Training Set Name *
                    </label>
                    <input
                      type="text"
                      value={trainingSetName}
                      onChange={(e) => setTrainingSetName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="Enter training set name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={trainingSetDescription}
                      onChange={(e) => setTrainingSetDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 h-24 resize-none"
                      placeholder="Enter training set description"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Training Set Exercises */}
              <Card>
                <CardHeader>
                  <CardTitle>Training Set Exercises ({exercisesInSet.length})</CardTitle>
                  <p className="text-sm text-gray-600">
                    Drag exercises from the database to add them here, or reorder by dragging within this area.
                  </p>
                  {/* Debug info */}
                  {exercisesError && (
                    <div className="text-red-500 text-sm">
                      Error loading exercises: {exercisesError.message}
                    </div>
                  )}
                  {exercisesLoading && (
                    <div className="text-blue-500 text-sm">
                      Loading exercises...
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Droppable droppableId="training-set">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`min-h-32 space-y-2 p-4 rounded-lg border-2 border-dashed transition-colors ${
                          snapshot.isDraggingOver
                            ? "border-orange-400 bg-orange-50"
                            : "border-gray-300 bg-gray-50"
                        }`}
                      >
                        {exercisesInSet.length === 0 ? (
                          <div className="text-center text-gray-500 py-8">
                            No exercises added yet. Drag exercises from the database to get started!
                          </div>
                        ) : (
                          exercisesInSet.map((exercise, index) => (
                            <Draggable key={exercise.id} draggableId={exercise.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white p-4 rounded-lg border shadow-sm transition-shadow ${
                                    snapshot.isDragging ? "shadow-lg" : ""
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold text-gray-900">{exercise.name}</span>
                                        {exercise.category && (
                                          <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(exercise.category)}`}>
                                            {exercise.category}
                                          </span>
                                        )}
                                        {exercise.difficulty && (
                                          <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(exercise.difficulty)}`}>
                                            {exercise.difficulty}
                                          </span>
                                        )}
                                        {exercise.duration && (
                                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                            {exercise.duration}min
                                          </span>
                                        )}
                                      </div>
                                      {exercise.description && (
                                        <p className="text-sm text-gray-600 mb-1">{exercise.description}</p>
                                      )}
                                      {exercise.equipment && (
                                        <p className="text-xs text-gray-500">Equipment: {exercise.equipment}</p>
                                      )}
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeExercise(exercise.id)}
                                      className="text-red-500 border-red-500 hover:bg-red-50"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </div>

            {/* Exercise Database */}
            {showExerciseDatabase && (
              <div className="lg:col-span-1">
                <ExerciseDatabase
                  onRefetch={refetchExercises}
                  exerciseTemplates={exerciseTemplatesData?.exerciseTemplates || []}
                />
              </div>
            )}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}