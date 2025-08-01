"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { ExerciseMotionDesigner } from "@/components/ExerciseMotionDesigner";
import { useTranslations } from "next-intl";
import { Search, Filter, Plus, Clock, Dumbbell, Edit, Trash2, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseTemplate {
  id: string;
  name: string;
  description?: string | null;
  duration?: number | null;
  category?: string | null;
  difficulty?: string | null;
  equipment?: string | null;
  instructions?: string | null;
  isPublic: boolean;
  usageCount: number;
  coach: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ExerciseDatabaseProps {
  onRefetch: () => void;
  exerciseTemplates: ExerciseTemplate[];
}

export function ExerciseDatabase({ onRefetch, exerciseTemplates }: ExerciseDatabaseProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [designingMotion, setDesigningMotion] = useState<ExerciseTemplate | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const t = useTranslations("ExercisesPage");
  const tBuilder = useTranslations("TrainingBuilder");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    category: "",
    difficulty: "",
    equipment: "",
    instructions: "",
    isPublic: false,
  });

  const createExerciseMutation = trpc.createExerciseTemplate.useMutation({
    onSuccess: () => {
      resetForm();
      onRefetch();
    },
  });

  const updateExerciseMutation = trpc.updateExerciseTemplate.useMutation({
    onSuccess: () => {
      resetForm();
      onRefetch();
    },
  });

  const deleteExerciseMutation = trpc.deleteExerciseTemplate.useMutation({
    onSuccess: () => {
      onRefetch();
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration: "",
      category: "",
      difficulty: "",
      equipment: "",
      instructions: "",
      isPublic: false,
    });
    setShowAddForm(false);
    setEditingExercise(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const validCategories = ["warmup", "ball_handling", "shooting", "defense", "conditioning", "scrimmage", "skills", "numerical_advantage"];
    const validDifficulties = ["beginner", "intermediate", "advanced"];
    
    const data = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      category: (formData.category && validCategories.includes(formData.category)) 
        ? formData.category as "warmup" | "ball_handling" | "shooting" | "defense" | "conditioning" | "scrimmage" | "skills" | "numerical_advantage"
        : undefined,
      difficulty: (formData.difficulty && validDifficulties.includes(formData.difficulty))
        ? formData.difficulty as "beginner" | "intermediate" | "advanced"
        : undefined,
      equipment: formData.equipment.trim() || undefined,
      instructions: formData.instructions.trim() || undefined,
      isPublic: formData.isPublic,
    };

    if (editingExercise) {
      updateExerciseMutation.mutate({ id: editingExercise.id, ...data });
    } else {
      createExerciseMutation.mutate(data);
    }
  };

  const handleEdit = (exercise: ExerciseTemplate) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      description: exercise.description || "",
      duration: exercise.duration?.toString() || "",
      category: exercise.category || "",
      difficulty: exercise.difficulty || "",
      equipment: exercise.equipment || "",
      instructions: exercise.instructions || "",
      isPublic: exercise.isPublic,
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t("confirmDelete"))) {
      deleteExerciseMutation.mutate({ id });
    }
  };

  const categories = [
    { value: "warmup", label: t("categories.warmup") },
    { value: "ball_handling", label: t("categories.ball_handling") },
    { value: "shooting", label: t("categories.shooting") },
    { value: "defense", label: t("categories.defense") },
    { value: "conditioning", label: t("categories.conditioning") },
    { value: "scrimmage", label: t("categories.scrimmage") },
    { value: "skills", label: t("categories.skills") },
    { value: "numerical_advantage", label: t("categories.numerical_advantage") },
  ];
  const difficulties = [
    { value: "beginner", label: t("difficulties.beginner") },
    { value: "intermediate", label: t("difficulties.intermediate") },
    { value: "advanced", label: t("difficulties.advanced") },
  ];

  const filteredExercises = exerciseTemplates.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || exercise.category === categoryFilter;
    const matchesDifficulty = !difficultyFilter || exercise.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyVariant = (difficulty?: string) => {
    switch (difficulty) {
      case "beginner": return "success" as const;
      case "intermediate": return "warning" as const;
      case "advanced": return "basketball" as const;
      default: return "secondary" as const;
    }
  };

  const getCategoryVariant = (category?: string) => {
    switch (category) {
      case "warmup": return "basketball" as const;
      case "ball_handling": return "court" as const;
      case "shooting": return "destructive" as const;
      case "defense": return "outline" as const;
      case "conditioning": return "success" as const;
      case "scrimmage": return "warning" as const;
      case "skills": return "secondary" as const;
      case "numerical_advantage": return "gradient" as const;
      default: return "secondary" as const;
    }
  };

  const getCategoryLabel = (category?: string) => {
    const categoryItem = categories.find(cat => cat.value === category);
    return categoryItem ? categoryItem.label : category;
  };
  
  const getDifficultyLabel = (difficulty?: string) => {
    const difficultyItem = difficulties.find(diff => diff.value === difficulty);
    return difficultyItem ? difficultyItem.label : difficulty;
  };

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-orange-500" />
            <span className="text-lg font-bold">{tBuilder("showDatabase")}</span>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            variant={showAddForm ? "outline" : "default"}
            className={cn(
              "transition-all duration-200",
              showAddForm ? "" : "bg-orange-500 hover:bg-orange-600"
            )}
          >
            {showAddForm ? (
              <>
                {t("cancel")}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {t("addNewExercise")}
              </>
            )}
          </Button>
        </CardTitle>
        
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                {t("category")}
              </Label>
              <Select value={categoryFilter || undefined} onValueChange={(value) => setCategoryFilter(value || "")}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder={t("allCategories")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-600 flex items-center gap-1">
                <Target className="w-3 h-3" />
                {t("difficulty")}
              </Label>
              <Select value={difficultyFilter || undefined} onValueChange={(value) => setDifficultyFilter(value || "")}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder={t("allDifficulties")} />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add/Edit Exercise Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gradient-to-br from-orange-50 to-blue-50 rounded-lg border border-orange-200">
            <div className="space-y-2">
              <Label htmlFor="exercise-name" className="text-sm font-medium">
                {t("exerciseNameEnglish")} *
              </Label>
              <Input
                id="exercise-name"
                type="text"
                placeholder={t("exerciseNameEnglish")}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="h-9"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exercise-description" className="text-sm font-medium">
                {t("descriptionEnglish")}
              </Label>
              <Textarea
                id="exercise-description"
                placeholder={t("descriptionEnglish")}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="h-20 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("selectCategory")}</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={t("selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("selectDifficulty")}</Label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData({...formData, difficulty: value})}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={t("selectDifficulty")} />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium">
                  {t("duration")}
                </Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder={t("duration")}
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  min="1"
                  className="h-9"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="equipment" className="text-sm font-medium">
                  {t("requiredEquipment")}
                </Label>
                <Input
                  id="equipment"
                  type="text"
                  placeholder={t("requiredEquipment")}
                  value={formData.equipment}
                  onChange={(e) => setFormData({...formData, equipment: e.target.value})}
                  className="h-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instructions" className="text-sm font-medium">
                {t("detailedInstructionsEnglish")}
              </Label>
              <Textarea
                id="instructions"
                placeholder={t("detailedInstructionsEnglish")}
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                className="h-20 resize-none"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({...formData, isPublic: checked as boolean})}
              />
              <Label htmlFor="isPublic" className="text-sm text-gray-700">
                {t("public")} (future feature)
              </Label>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                size="sm"
                className="flex-1 bg-orange-500 hover:bg-orange-600 transition-colors"
                disabled={createExerciseMutation.isPending || updateExerciseMutation.isPending}
              >
                {(createExerciseMutation.isPending || updateExerciseMutation.isPending) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t("creating")}
                  </>
                ) : (
                  editingExercise ? "Update Exercise" : t("createExercise")
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetForm}
                className="px-6 transition-colors"
                disabled={createExerciseMutation.isPending || updateExerciseMutation.isPending}
              >
                {t("cancel")}
              </Button>
            </div>
          </form>
        )}

        {/* Exercise List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 font-medium">
              {filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'} found
            </p>
            {filteredExercises.length === 0 && (
              <Badge variant="secondary" size="sm">
                {t("noExercisesFound")}
              </Badge>
            )}
          </div>
          
          <Droppable droppableId="exercise-database">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3 overflow-y-auto pr-2"
                style={{
                  maxHeight: 'calc(100vh - 350px)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}
              >
                {filteredExercises.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Dumbbell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium">{t("noExercisesFound")}</p>
                    <p className="text-xs mt-1">{t("noExercisesSubtitle")}</p>
                  </div>
                ) : (
                  filteredExercises.map((exercise, index) => (
                    <Draggable key={exercise.id} draggableId={exercise.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            "group p-4 border rounded-lg cursor-move transition-all duration-200",
                            snapshot.isDragging 
                              ? "bg-orange-50 border-orange-300 shadow-lg scale-105 rotate-1" 
                              : "bg-white border-gray-200 hover:border-orange-200 hover:shadow-md"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              {/* Exercise Name and Badges */}
                              <div className="flex items-start gap-2 mb-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm text-gray-900 truncate mb-1">
                                    {exercise.name}
                                  </h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {exercise.category && (
                                      <Badge variant={getCategoryVariant(exercise.category)} size="sm">
                                        {getCategoryLabel(exercise.category)}
                                      </Badge>
                                    )}
                                    {exercise.difficulty && (
                                      <Badge variant={getDifficultyVariant(exercise.difficulty)} size="sm">
                                        {getDifficultyLabel(exercise.difficulty)}
                                      </Badge>
                                    )}
                                    {exercise.duration && (
                                      <Badge variant="outline" size="sm" className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {exercise.duration}m
                                      </Badge>
                                    )}
                                    {/* Section compatibility badges */}
                                    {(() => {
                                      const categoryToSectionMap: Record<string, string[]> = {
                                        "warmup": ["W"],
                                        "ball_handling": ["W", "M"],
                                        "shooting": ["M"],
                                        "defense": ["M"],
                                        "conditioning": ["M", "S"],
                                        "scrimmage": ["M"],
                                        "skills": ["M"],
                                        "numerical_advantage": ["M"],
                                      };
                                      const allowedSections = categoryToSectionMap[exercise.category || ""] || ["M"];
                                      return allowedSections.map(section => (
                                        <Badge key={section} variant="secondary" size="sm" className="text-xs h-5 px-1">
                                          {section}
                                        </Badge>
                                      ));
                                    })()
                                  }
                                  </div>
                                </div>
                              </div>
                              
                              {/* Description */}
                              {exercise.description && (
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                  {exercise.description}
                                </p>
                              )}
                              
                              {/* Additional Info */}
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                {exercise.equipment && (
                                  <span className="flex items-center gap-1">
                                    <span>🏀</span> {exercise.equipment}
                                  </span>
                                )}
                                {exercise.usageCount > 0 && (
                                  <span className={cn(
                                    "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                                    exercise.usageCount >= 10 ? "bg-green-100 text-green-700" :
                                    exercise.usageCount >= 5 ? "bg-blue-100 text-blue-700" :
                                    "bg-gray-100 text-gray-600"
                                  )}>
                                    📊 Used {exercise.usageCount} times
                                    {exercise.usageCount >= 10 && " 🔥"}
                                    {exercise.usageCount >= 20 && " ⭐"}
                                  </span>
                                )}
                                <span className="text-xs text-gray-400">
                                  {t("createdBy")} {exercise.coach.name}
                                </span>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDesigningMotion(exercise);
                                  setSheetOpen(true);
                                }}
                                className="h-7 px-2 text-xs text-orange-600 border-orange-300 hover:bg-orange-50 transition-colors"
                                title="Design Motion"
                              >
                                🏀
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(exercise);
                                }}
                                className="h-7 px-2 text-xs hover:bg-blue-50 transition-colors"
                                title="Edit Exercise"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(exercise.id);
                                }}
                                className="h-7 px-2 text-xs text-red-500 border-red-300 hover:bg-red-50 transition-colors"
                                title="Delete Exercise"
                                disabled={deleteExerciseMutation.isPending}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
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
        </div>
      </CardContent>
      
      {/* Basketball Court Design Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent 
          side="right" 
          className="w-[75vw] max-w-none p-0"
          onClose={() => {
            setSheetOpen(false);
            setDesigningMotion(null);
          }}
        >
          {designingMotion && (
            <div className="h-full">
              <SheetHeader className="p-6 border-b bg-gradient-to-r from-orange-50 to-blue-50">
                <SheetTitle className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <span className="text-white text-lg">🏀</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Design Motion
                    </h2>
                    <p className="text-sm text-gray-600 font-normal">
                      {designingMotion.name}
                    </p>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="h-[calc(100vh-120px)] overflow-auto">
                <ExerciseMotionDesigner 
                  exercise={designingMotion}
                  onSave={(motionData) => {
                    console.log("Motion data saved:", motionData);
                    // Here you could save to database or update exercise
                  }}
                />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}