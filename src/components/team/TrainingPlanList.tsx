"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, ListSkeleton } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { trpc } from "@/lib/trpc";

interface TrainingPlanListProps {
  teamId: string;
  onUpdate: () => void;
}

interface TrainingSet {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  exercises: {
    id: string;
    name: string;
    category?: string | null;
    duration?: number | null;
  }[];
}

export function TrainingPlanList({ teamId, onUpdate }: TrainingPlanListProps) {
  const { data: trainingSetsData, isLoading, refetch } = trpc.getTrainingSets.useQuery({ teamId });
  
  const duplicateTrainingSetMutation = trpc.duplicateTrainingSet.useMutation({
    onSuccess: () => {
      refetch();
      onUpdate();
    },
  });

  const handleDuplicate = (trainingSetId: string) => {
    duplicateTrainingSetMutation.mutate({ trainingSetId });
  };

  if (isLoading) {
    return <ListSkeleton items={3} />;
  }

  const trainingSets = trainingSetsData?.trainingSets || [];
  const sortedTrainingSets = trainingSets.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getCategoryColor = (category?: string) => {
    const colors = {
      warmup: "bg-yellow-100 text-yellow-800",
      skills: "bg-blue-100 text-blue-800",
      scrimmage: "bg-green-100 text-green-800",
      conditioning: "bg-red-100 text-red-800",
      ball_handling: "bg-purple-100 text-purple-800",
      shooting: "bg-orange-100 text-orange-800",
      defense: "bg-gray-100 text-gray-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getTotalDuration = (exercises: TrainingSet['exercises']) => {
    return exercises.reduce((total, exercise) => total + (exercise.duration || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Training Plans</h2>
          <p className="text-muted-foreground">
            View and manage training plans for this team
          </p>
        </div>
        <Button variant="success" size="sm" asChild>
          <Link href="/training-set-builder">
            Create New Plan
          </Link>
        </Button>
      </div>

      {/* Training Plans Grid */}
      {sortedTrainingSets.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No training plans yet"
          description="Create your first training plan to organize practice sessions"
          action={
            <Button variant="success" asChild>
              <Link href="/training-set-builder">
                Create First Training Plan
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTrainingSets.map((trainingSet, index) => (
            <Card
              key={trainingSet.id}
              variant="court"
              className="animate-slide-in-up hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{trainingSet.name}</CardTitle>
                    {trainingSet.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {trainingSet.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" size="sm">
                    {trainingSet.exercises.length} exercises
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Exercise Categories */}
                  {trainingSet.exercises.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(trainingSet.exercises.map(e => e.category).filter(Boolean)))
                        .slice(0, 3)
                        .map((category) => (
                        <Badge
                          key={category}
                          size="sm"
                          className={getCategoryColor(category || undefined)}
                        >
                          {category}
                        </Badge>
                      ))}
                      {Array.from(new Set(trainingSet.exercises.map(e => e.category).filter(Boolean))).length > 3 && (
                        <Badge size="sm" variant="outline">
                          +{Array.from(new Set(trainingSet.exercises.map(e => e.category).filter(Boolean))).length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Duration & Date */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      ⏱️ {getTotalDuration(trainingSet.exercises)} min
                    </span>
                    <span>
                      {new Date(trainingSet.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Sample Exercises */}
                  {trainingSet.exercises.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Sample exercises:</p>
                      <div className="space-y-1">
                        {trainingSet.exercises.slice(0, 2).map((exercise) => (
                          <div key={exercise.id} className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                            <span className="truncate">{exercise.name}</span>
                            {exercise.duration && (
                              <Badge variant="outline" size="sm" className="text-xs">
                                {exercise.duration}m
                              </Badge>
                            )}
                          </div>
                        ))}
                        {trainingSet.exercises.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{trainingSet.exercises.length - 2} more exercises
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/training-plan/${trainingSet.id}`}>
                        View Plan
                      </Link>
                    </Button>
                    <Button
                      variant="basketball"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDuplicate(trainingSet.id)}
                      disabled={duplicateTrainingSetMutation.isPending}
                    >
                      {duplicateTrainingSetMutation.isPending ? "Duplicating..." : "Duplicate"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {sortedTrainingSets.length > 0 && (
        <Card variant="filled" className="mt-6">
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {sortedTrainingSets.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Plans</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {sortedTrainingSets.reduce((total, set) => total + set.exercises.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Exercises</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {Math.round(sortedTrainingSets.reduce((total, set) => total + getTotalDuration(set.exercises), 0) / sortedTrainingSets.length) || 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg Duration (min)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {Array.from(new Set(sortedTrainingSets.flatMap(set => set.exercises.map(e => e.category).filter(Boolean)))).length}
                </div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}