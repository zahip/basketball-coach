"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ListSkeleton } from "@/components/ui/loading";
import { Link } from "@/i18n/navigation";
import { trpc } from "@/lib/trpc";
import { 
  Clock, 
  ArrowLeft, 
  Flame, 
  Zap, 
  CheckCircle,
  Calendar,
  Users,
  Timer,
  ChevronDown,
  ChevronUp,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainingPlanViewProps {
  trainingSetId: string;
}

type TrainingSection = "warmup" | "main" | "summary";

export function TrainingPlanView({ trainingSetId }: TrainingPlanViewProps) {
  const [expandedSections, setExpandedSections] = useState<Record<TrainingSection, boolean>>({
    warmup: true,
    main: true,
    summary: true,
  });
  const { data: trainingSetData, isLoading, error } = trpc.getTrainingSetById.useQuery({ 
    id: trainingSetId 
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
        </div>
        <ListSkeleton items={3} />
      </div>
    );
  }

  if (error || !trainingSetData?.trainingSet) {
    return (
      <EmptyState
        icon="❌"
        title="Training plan not found"
        description="The requested training plan could not be found or you don't have access to it."
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        }
      />
    );
  }

  const trainingSet = trainingSetData.trainingSet;

  // Section configuration
  const sectionConfig = {
    warmup: {
      title: "Warm-up",
      description: "Preparation and activation exercises",
      icon: Flame,
      color: "orange",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      iconColor: "text-orange-500",
    },
    main: {
      title: "Main Training",
      description: "Skills training, drills, tactics, and scrimmage",
      icon: Zap,
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-500",
    },
    summary: {
      title: "Cool Down",
      description: "Recovery and reflection exercises",
      icon: CheckCircle,
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-500",
    },
  };

  // Helper functions
  const getExercisesBySection = (section: TrainingSection) => {
    return trainingSet.exercises
      .filter(ex => ex.section === section)
      .sort((a, b) => a.sectionOrder - b.sectionOrder);
  };

  const getSectionDuration = (section: TrainingSection) => {
    const exercises = getExercisesBySection(section);
    return exercises.reduce((total, exercise) => total + (exercise.duration || 0), 0);
  };

  const getTotalDuration = () => {
    return trainingSet.exercises.reduce((total, exercise) => total + (exercise.duration || 0), 0);
  };

  const getCategoryColor = (category?: string) => {
    const colors = {
      warmup: "bg-yellow-100 text-yellow-800",
      skills: "bg-blue-100 text-blue-800",
      scrimmage: "bg-green-100 text-green-800",
      conditioning: "bg-red-100 text-red-800",
      ball_handling: "bg-purple-100 text-purple-800",
      shooting: "bg-orange-100 text-orange-800",
      defense: "bg-gray-100 text-gray-800",
      numerical_advantage: "bg-indigo-100 text-indigo-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const toggleSection = (section: TrainingSection) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/team/${trainingSet.team.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team
          </Link>
        </Button>
      </div>

      {/* Training Set Info */}
      <Card variant="elevated" className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{trainingSet.name}</CardTitle>
              {trainingSet.description && (
                <p className="text-lg text-muted-foreground mb-4">
                  {trainingSet.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{trainingSet.team.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  <span>{getTotalDuration()} minutes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  <span>{trainingSet.exercises.length} exercises</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(trainingSet.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Training Sections */}
      <div className="space-y-6">
        {(["warmup", "main", "summary"] as TrainingSection[]).map((section) => {
          const exercises = getExercisesBySection(section);
          const config = sectionConfig[section];
          const sectionDuration = getSectionDuration(section);
          const isExpanded = expandedSections[section];
          const IconComponent = config.icon;

          if (exercises.length === 0) return null;

          return (
            <Card
              key={section}
              className={cn(
                "transition-all duration-200",
                config.borderColor,
                config.bgColor
              )}
            >
              <CardHeader
                className="cursor-pointer hover:bg-opacity-80 transition-colors"
                onClick={() => toggleSection(section)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      `bg-${config.color}-100`
                    )}>
                      <IconComponent className={cn("w-5 h-5", config.iconColor)} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{config.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {config.description} • {exercises.length} exercises • {sectionDuration} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white">
                      {sectionDuration} min
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  <div className="space-y-4">
                    {exercises.map((exercise, index) => (
                      <Card
                        key={exercise.id}
                        variant="outlined"
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" size="sm">
                                  {index + 1}
                                </Badge>
                                <h4 className="font-semibold text-lg">{exercise.name}</h4>
                                {exercise.category && (
                                  <Badge size="sm" className={getCategoryColor(exercise.category)}>
                                    {exercise.category}
                                  </Badge>
                                )}
                              </div>
                              
                              {exercise.description && (
                                <p className="text-muted-foreground mb-3">
                                  {exercise.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {exercise.duration && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{exercise.duration} minutes</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Training Summary */}
      <Card variant="filled" className="mt-8">
        <CardHeader>
          <CardTitle>Training Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">
                {getTotalDuration()}
              </div>
              <div className="text-sm text-muted-foreground">Total Duration (min)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {trainingSet.exercises.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Exercises</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {getExercisesBySection("warmup").length}
              </div>
              <div className="text-sm text-muted-foreground">Warm-up Exercises</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {getExercisesBySection("main").length}
              </div>
              <div className="text-sm text-muted-foreground">Main Exercises</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}