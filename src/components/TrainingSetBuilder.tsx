"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/loading";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { ExerciseDatabase } from "@/components/ExerciseDatabase";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/client";

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
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const { data: teamsData, error: teamsError, isLoading: teamsLoading } = trpc.getTeams.useQuery();
  const { data: exerciseTemplatesData, refetch: refetchExercises, error: exercisesError, isLoading: exercisesLoading } = trpc.getExerciseTemplates.useQuery();

  // Get user data
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

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
      console.error("Error creating training set:", error);
    },
  });

  const addExercise = (exercise: any) => {
    const newExercise: ExerciseInSet = {
      id: crypto.randomUUID(),
      name: exercise.name,
      description: exercise.description,
      duration: exercise.duration || 10,
      category: exercise.category,
      difficulty: exercise.difficulty,
      equipment: exercise.equipment,
      instructions: exercise.instructions,
      order: exercisesInSet.length + 1,
      exerciseTemplateId: exercise.id,
    };
    setExercisesInSet([...exercisesInSet, newExercise]);
  };

  const removeExercise = (id: string) => {
    setExercisesInSet(exercisesInSet.filter((ex) => ex.id !== id));
  };

  const handleSubmit = async () => {
    if (!trainingSetName || !selectedTeamId) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await createTrainingSetMutation.mutateAsync({
        name: trainingSetName,
        description: trainingSetDescription,
        teamId: selectedTeamId,
        exercises: exercisesInSet.map((ex) => ({
          name: ex.name,
          description: ex.description || "",
          duration: ex.duration || 10,
          category: ex.category || "",
          difficulty: ex.difficulty || "",
          equipment: ex.equipment || "",
          instructions: ex.instructions || "",
          order: ex.order,
          exerciseTemplateId: ex.exerciseTemplateId,
        })),
      });
    } catch (error) {
      console.error("Error creating training set:", error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-80 glass-dark border-r border-white/20 backdrop-blur-xl relative z-10">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <Link href="/dashboard" className="flex items-center space-x-3 group mb-6">
              <div className="w-12 h-12 gradient-basketball rounded-2xl flex items-center justify-center shadow-basketball group-hover:scale-105 transition-transform">
                <span className="text-2xl font-bold text-white">🏀</span>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Basketball Coach</h1>
                <p className="text-sm text-gray-600">Training Set Builder</p>
              </div>
            </Link>

            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
              <Link href="/dashboard" className="hover:text-basketball-blue-600 transition-colors">
                Dashboard
              </Link>
              <span>•</span>
              <span className="text-basketball-blue-600 font-medium">Training Builder</span>
            </nav>

            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-3 mb-6">
                <Avatar className="w-10 h-10 border-2 border-white/20">
                  <AvatarImage
                    src={user.user_metadata?.avatar_url}
                    alt={user.user_metadata?.name || user.email}
                  />
                  <AvatarFallback className="bg-basketball-blue-500 text-white font-semibold">
                    {(user.user_metadata?.name || user.email)?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.user_metadata?.name || "Coach"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Training Set Form */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              {/* Training Set Details */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Set Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Training Set Name *
                    </label>
                    <input
                      type="text"
                      value={trainingSetName}
                      onChange={(e) => setTrainingSetName(e.target.value)}
                      className="w-full px-4 py-3 form-input rounded-2xl border-2 border-transparent focus:border-basketball-blue-500 transition-all duration-200 placeholder-gray-400"
                      placeholder="Enter training set name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={trainingSetDescription}
                      onChange={(e) => setTrainingSetDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 form-input rounded-2xl border-2 border-transparent focus:border-basketball-blue-500 transition-all duration-200 placeholder-gray-400 resize-none"
                      placeholder="Describe your training set..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Team *
                    </label>
                    {teamsLoading ? (
                      <div className="w-full h-12 skeleton rounded-2xl"></div>
                    ) : teamsError ? (
                      <div className="text-red-600 text-sm">Error loading teams</div>
                    ) : (
                      <select
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        className="w-full px-4 py-3 form-input rounded-2xl border-2 border-transparent focus:border-basketball-blue-500 transition-all duration-200"
                      >
                        <option value="">Choose a team</option>
                        {teamsData?.teams?.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Exercises */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Exercises ({exercisesInSet.length})
                  </h2>
                  <Badge variant="basketball">
                    {exercisesInSet.reduce((sum, ex) => sum + (ex.duration || 0), 0)} min
                  </Badge>
                </div>

                {exercisesInSet.length === 0 ? (
                  <EmptyState
                    icon="📋"
                    title="No exercises added"
                    description="Add exercises from the database to build your training set"
                  />
                ) : (
                  <div className="space-y-3">
                    {exercisesInSet.map((exercise) => (
                      <Card key={exercise.id} variant="court" className="hover-lift">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-basketball-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                {exercise.order}
                              </div>
                              <div>
                                <CardTitle className="text-base">{exercise.name}</CardTitle>
                                <p className="text-sm text-gray-600">
                                  {exercise.duration} min • {exercise.category || 'General'}
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => removeExercise(exercise.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        </CardHeader>
                        {exercise.description && (
                          <CardContent>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {exercise.description}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={() => setShowExerciseDatabase(true)}
                  variant="court"
                  className="w-full"
                >
                  <span className="mr-2">+</span>
                  Add Exercises
                </Button>

                <Button
                  onClick={handleSubmit}
                  disabled={!trainingSetName || !selectedTeamId || exercisesInSet.length === 0 || createTrainingSetMutation.isLoading}
                  variant="basketball"
                  className="w-full"
                >
                  {createTrainingSetMutation.isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <>
                      <span className="mr-2">💾</span>
                      Create Training Set
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/20">
            <div className="flex items-center justify-between">
              <Link 
                href="/dashboard" 
                className="text-sm text-gray-600 hover:text-basketball-blue-600 transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <div className="h-full p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="glass rounded-3xl p-8 backdrop-blur-xl border border-white/20 mb-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Training Set Builder
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Create comprehensive training programs for your basketball team
                </p>
                <div className="flex justify-center space-x-4">
                  <Badge variant="basketball">
                    Step-by-step builder
                  </Badge>
                  <Badge variant="court">
                    Exercise library
                  </Badge>
                  <Badge variant="success">
                    Team-specific
                  </Badge>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="glass rounded-3xl p-8 backdrop-blur-xl border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Training Set Preview</h2>
              
              {!trainingSetName ? (
                <EmptyState
                  icon="📝"
                  title="Start building your training set"
                  description="Fill in the details on the left to see a preview of your training set"
                />
              ) : (
                <div className="space-y-6">
                  {/* Training Set Info */}
                  <Card variant="basketball" className="hover-lift">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">{trainingSetName}</CardTitle>
                          <p className="text-gray-600 mt-1">
                            {selectedTeamId ? teamsData?.teams?.find(t => t.id === selectedTeamId)?.name : 'No team selected'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-basketball-orange-600">
                            {exercisesInSet.reduce((sum, ex) => sum + (ex.duration || 0), 0)}
                          </div>
                          <div className="text-sm text-gray-600">minutes</div>
                        </div>
                      </div>
                      {trainingSetDescription && (
                        <p className="text-gray-600 mt-2">{trainingSetDescription}</p>
                      )}
                    </CardHeader>
                  </Card>

                  {/* Exercise Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Timeline</h3>
                    {exercisesInSet.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No exercises added yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {exercisesInSet.map((exercise, index) => (
                          <div key={exercise.id} className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl">
                            <div className="w-8 h-8 bg-basketball-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                              <p className="text-sm text-gray-600">
                                {exercise.duration} minutes • {exercise.category || 'General'}
                              </p>
                            </div>
                            <Badge variant="outline" size="sm">
                              {exercise.difficulty || 'Medium'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Exercise Database Modal */}
      {showExerciseDatabase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Exercise Database</h2>
              <Button
                onClick={() => setShowExerciseDatabase(false)}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
            </div>
            <ExerciseDatabase onAddExercise={addExercise} />
          </div>
        </div>
      )}
    </div>
  );
}