"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Link } from "@/i18n/navigation";
import { trpc } from "@/lib/trpc";
import { ExerciseDatabase } from "@/components/ExerciseDatabase";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Clock, ChevronDown, ChevronUp, Flame, Zap, CheckCircle, Timer, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseInSet {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  category?: string;
  difficulty?: string;
  equipment?: string;
  instructions?: string;
  section: "warmup" | "main" | "summary";
  sectionOrder: number;
  exerciseTemplateId?: string;
}

interface TrainingSetBuilderProps {
  locale: string;
}

type TrainingSection = "warmup" | "main" | "summary";

export function TrainingSetBuilder({ }: TrainingSetBuilderProps) {
  const [trainingSetName, setTrainingSetName] = useState("");
  const [trainingSetDescription, setTrainingSetDescription] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [exercisesInSet, setExercisesInSet] = useState<ExerciseInSet[]>([]);
  const [showExerciseDatabase, setShowExerciseDatabase] = useState(true);
  const [totalDuration, setTotalDuration] = useState([90]); // Duration in minutes
  const [warmupDuration, setWarmupDuration] = useState(15);
  const [mainDuration, setMainDuration] = useState(60);
  const [summaryDuration, setSummaryDuration] = useState(15);
  const [expandedSections, setExpandedSections] = useState<Record<TrainingSection, boolean>>({
    warmup: true,
    main: true,
    summary: true,
  });
  const router = useRouter();
  const t = useTranslations("TrainingBuilder");

  const { data: teamsData, error: teamsError } = trpc.getTeams.useQuery();
  const { data: exerciseTemplatesData, refetch: refetchExercises, error: exercisesError } = trpc.getExerciseTemplates.useQuery();

  // Section configuration
  const sectionConfig = {
    warmup: {
      title: t("sections.warmup"),
      description: t("sectionDescriptions.warmup"),
      icon: Flame,
      color: "orange",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      iconColor: "text-orange-500",
    },
    main: {
      title: t("sections.main"),
      description: t("sectionDescriptions.main"),
      icon: Zap,
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-500",
    },
    summary: {
      title: t("sections.summary"),
      description: t("sectionDescriptions.summary"),
      icon: CheckCircle,
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-500",
    },
  };

  // Helper functions
  const getExercisesBySection = (section: TrainingSection) => {
    return exercisesInSet
      .filter(ex => ex.section === section)
      .sort((a, b) => a.sectionOrder - b.sectionOrder);
  };

  const getSectionDuration = (section: TrainingSection) => {
    const exercises = getExercisesBySection(section);
    return exercises.reduce((total, ex) => total + (ex.duration || 0), 0);
  };

  const getTotalAllocatedTime = () => {
    return warmupDuration + mainDuration + summaryDuration;
  };

  const autoAllocateTime = () => {
    const total = totalDuration[0];
    const newWarmup = Math.round(total * 0.15); // 15%
    const newSummary = Math.round(total * 0.1);  // 10%
    const newMain = total - newWarmup - newSummary; // Remaining 75%
    
    setWarmupDuration(newWarmup);
    setMainDuration(newMain);
    setSummaryDuration(newSummary);
  };

  const toggleSection = (section: TrainingSection) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Debug logging
  useEffect(() => {
    console.log("Teams data:", teamsData);
    console.log("Teams error:", teamsError);
    console.log("Exercises data:", exerciseTemplatesData);
    console.log("Exercises error:", exercisesError);
  }, [teamsData, teamsError, exerciseTemplatesData, exercisesError]);

  const createTrainingSetMutation = trpc.createTrainingSet.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Failed to create training set:", error);
    },
  });

  const handleDragEnd = (result: {
    destination?: { index: number; droppableId: string };
    source: { index: number; droppableId: string };
    draggableId: string;
  }) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Adding exercise from database to a section
    if (source.droppableId === "exercise-database" && 
        (destination.droppableId === "warmup" || destination.droppableId === "main" || destination.droppableId === "summary")) {
      
      const exerciseTemplate = exerciseTemplatesData?.exerciseTemplates.find(
        (ex) => ex.id === result.draggableId
      );
      
      if (exerciseTemplate) {
        const targetSection = destination.droppableId as TrainingSection;
        const existingExercisesInSection = getExercisesBySection(targetSection);
        
        const newExercise: ExerciseInSet = {
          id: `${exerciseTemplate.id}-${Date.now()}`,
          name: exerciseTemplate.name,
          description: exerciseTemplate.description || undefined,
          duration: exerciseTemplate.duration || undefined,
          category: exerciseTemplate.category || undefined,
          difficulty: exerciseTemplate.difficulty || undefined,
          equipment: exerciseTemplate.equipment || undefined,
          instructions: exerciseTemplate.instructions || undefined,
          section: targetSection,
          sectionOrder: existingExercisesInSection.length,
          exerciseTemplateId: exerciseTemplate.id,
        };
        setExercisesInSet([...exercisesInSet, newExercise]);
      }
    } 
    // Reordering within the same section
    else if (source.droppableId === destination.droppableId && 
             (source.droppableId === "warmup" || source.droppableId === "main" || source.droppableId === "summary")) {
      
      const section = source.droppableId as TrainingSection;
      const sectionExercises = getExercisesBySection(section);
      const [reorderedItem] = sectionExercises.splice(source.index, 1);
      sectionExercises.splice(destination.index, 0, reorderedItem);
      
      // Update section order for all exercises in this section
      const updatedSectionExercises = sectionExercises.map((item, index) => ({
        ...item,
        sectionOrder: index,
      }));
      
      // Update the full exercises list
      const otherExercises = exercisesInSet.filter(ex => ex.section !== section);
      setExercisesInSet([...otherExercises, ...updatedSectionExercises]);
    }
    // Moving exercise between sections
    else if ((source.droppableId === "warmup" || source.droppableId === "main" || source.droppableId === "summary") &&
             (destination.droppableId === "warmup" || destination.droppableId === "main" || destination.droppableId === "summary") &&
             source.droppableId !== destination.droppableId) {
      
      const sourceSection = source.droppableId as TrainingSection;
      const targetSection = destination.droppableId as TrainingSection;
      
      const sourceExercises = getExercisesBySection(sourceSection);
      const targetExercises = getExercisesBySection(targetSection);
      
      const [movedExercise] = sourceExercises.splice(source.index, 1);
      movedExercise.section = targetSection;
      movedExercise.sectionOrder = destination.index;
      
      targetExercises.splice(destination.index, 0, movedExercise);
      
      // Update section orders
      const updatedSourceExercises = sourceExercises.map((item, index) => ({
        ...item,
        sectionOrder: index,
      }));
      
      const updatedTargetExercises = targetExercises.map((item, index) => ({
        ...item,
        sectionOrder: index,
      }));
      
      // Update the full exercises list
      const otherExercises = exercisesInSet.filter(ex => ex.section !== sourceSection && ex.section !== targetSection);
      setExercisesInSet([...otherExercises, ...updatedSourceExercises, ...updatedTargetExercises]);
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
      section: ex.section,
      sectionOrder: ex.sectionOrder,
      exerciseTemplateId: ex.exerciseTemplateId,
    }));

    createTrainingSetMutation.mutate({
      teamId: selectedTeamId,
      name: trainingSetName.trim(),
      description: trainingSetDescription.trim() || undefined,
      totalDuration: totalDuration[0],
      warmupDuration,
      mainDuration,
      summaryDuration,
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
              ← {t("backToDashboard")}
            </Link>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-500 w-10 h-10 flex items-center justify-center shadow">
                <span className="text-xl text-white font-bold">🏀</span>
              </div>
              <h1 className="text-xl font-bold text-blue-900">
                {t("title")}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowExerciseDatabase(!showExerciseDatabase)}
            >
              {showExerciseDatabase ? t("hideDatabase") : t("showDatabase")}
            </Button>
            <Button
              onClick={handleCreateTrainingSet}
              disabled={!trainingSetName.trim() || !selectedTeamId || createTrainingSetMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {createTrainingSetMutation.isPending ? t("creating") : t("createTrainingSet")}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Training Builder - Left Column */}
            <div className="lg:col-span-3 space-y-6">
              {/* Training Set Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-orange-500" />
                    {t("details.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2">
                        {t("details.selectTeam")} *
                      </Label>
                      <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("details.selectTeamPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          {teamsData?.teams?.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2">
                        {t("details.trainingName")} *
                      </Label>
                      <Input
                        value={trainingSetName}
                        onChange={(e) => setTrainingSetName(e.target.value)}
                        placeholder={t("details.trainingNamePlaceholder")}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2">
                      {t("details.description")}
                    </Label>
                    <Textarea
                      value={trainingSetDescription}
                      onChange={(e) => setTrainingSetDescription(e.target.value)}
                      placeholder={t("details.descriptionPlaceholder")}
                      className="h-20 resize-none"
                    />
                  </div>
                  
                  {/* Duration Controls */}
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        {t("details.totalDuration")}: {totalDuration[0]} {t("details.minutes")}
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={autoAllocateTime}
                        className="text-xs"
                      >
                        {t("details.autoAllocate")}
                      </Button>
                    </div>
                    <Slider
                      value={totalDuration}
                      onValueChange={setTotalDuration}
                      max={180}
                      min={30}
                      step={5}
                      className="w-full"
                    />
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="space-y-2">
                        <Label className="text-xs text-orange-600 font-medium flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {t("sections.warmup")}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={warmupDuration}
                            onChange={(e) => setWarmupDuration(parseInt(e.target.value) || 0)}
                            min={0}
                            max={60}
                            className="text-xs h-8"
                          />
                          <span className="text-xs text-gray-500">{t("details.min")}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-blue-600 font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {t("sections.main")}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={mainDuration}
                            onChange={(e) => setMainDuration(parseInt(e.target.value) || 0)}
                            min={0}
                            max={120}
                            className="text-xs h-8"
                          />
                          <span className="text-xs text-gray-500">{t("details.min")}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {t("sections.summary")}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={summaryDuration}
                            onChange={(e) => setSummaryDuration(parseInt(e.target.value) || 0)}
                            min={0}
                            max={30}
                            className="text-xs h-8"
                          />
                          <span className="text-xs text-gray-500">{t("details.min")}</span>
                        </div>
                      </div>
                    </div>
                    
                    {getTotalAllocatedTime() !== totalDuration[0] && (
                      <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border">
                        {t("details.remainingTime")}: {totalDuration[0] - getTotalAllocatedTime()} {t("details.min")}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Training Sections */}
              {(Object.keys(sectionConfig) as TrainingSection[]).map((section) => {
                const config = sectionConfig[section];
                const Icon = config.icon;
                const sectionExercises = getExercisesBySection(section);
                const sectionDuration = getSectionDuration(section);
                const allocatedDuration = section === "warmup" ? warmupDuration : section === "main" ? mainDuration : summaryDuration;
                const isExpanded = expandedSections[section];
                
                return (
                  <Card key={section} className={cn("border-l-4", config.borderColor)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", config.bgColor)}>
                            <Icon className={cn("w-5 h-5", config.iconColor)} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{config.title}</CardTitle>
                            <p className="text-sm text-gray-600">{config.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {sectionExercises.length} {t("exercises.exerciseCount")}
                            </div>
                            <div className="text-xs text-gray-500">
                              {sectionDuration}/{allocatedDuration} {t("details.min")}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSection(section)}
                            className="h-8 w-8 p-0"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {isExpanded && (
                      <CardContent>
                        <Droppable droppableId={section}>
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={cn(
                                "min-h-24 space-y-2 p-4 rounded-lg border-2 border-dashed transition-colors",
                                snapshot.isDraggingOver
                                  ? cn("border-orange-400", config.bgColor)
                                  : "border-gray-300 bg-gray-50"
                              )}
                            >
                              {sectionExercises.length === 0 ? (
                                <div className="text-center text-gray-500 py-6">
                                  <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                  <p className="text-sm">{t("exercises.dragHint")}</p>
                                </div>
                              ) : (
                                sectionExercises.map((exercise, index) => (
                                  <Draggable key={exercise.id} draggableId={exercise.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={cn(
                                          "bg-white p-4 rounded-lg border shadow-sm transition-all cursor-move",
                                          snapshot.isDragging ? "shadow-lg" : "hover:shadow-md"
                                        )}
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
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                                                  <Clock className="w-3 h-3" />
                                                  {exercise.duration}{t("details.min")}
                                                </span>
                                              )}
                                            </div>
                                            {exercise.description && (
                                              <p className="text-sm text-gray-600 mb-1">{exercise.description}</p>
                                            )}
                                            {exercise.equipment && (
                                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <span>🏀</span> {exercise.equipment}
                                              </p>
                                            )}
                                          </div>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeExercise(exercise.id)}
                                            className="text-red-500 border-red-300 hover:bg-red-50 h-8 px-3 text-xs"
                                          >
                                            {t("exercises.removeExercise")}
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
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Exercise Database - Right Sidebar */}
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