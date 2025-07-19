"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { trpc } from "@/lib/trpc";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { ExerciseMotionDesigner } from "@/components/ExerciseMotionDesigner";

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

    const data = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      category: formData.category || undefined,
      difficulty: formData.difficulty || undefined,
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
    if (confirm("Are you sure you want to delete this exercise?")) {
      deleteExerciseMutation.mutate({ id });
    }
  };

  const categories = ["Warm-up", "Skills", "Conditioning", "Scrimmage", "Cool-down"];
  const difficulties = ["beginner", "intermediate", "advanced"];

  const filteredExercises = exerciseTemplates.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || exercise.category === categoryFilter;
    const matchesDifficulty = !difficultyFilter || exercise.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

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
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Exercise Database</span>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            variant={showAddForm ? "outline" : "default"}
          >
            {showAddForm ? "Cancel" : "+ Add Exercise"}
          </Button>
        </CardTitle>
        
        {/* Search and Filters */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">All Difficulties</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add/Edit Exercise Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Exercise name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 h-20 resize-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Select difficulty</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                min="1"
              />
              <input
                type="text"
                placeholder="Equipment needed"
                value={formData.equipment}
                onChange={(e) => setFormData({...formData, equipment: e.target.value})}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <textarea
              placeholder="Instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({...formData, instructions: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 h-20 resize-none"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700">
                Make public (future feature)
              </label>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                className="flex-1"
                disabled={createExerciseMutation.isPending || updateExerciseMutation.isPending}
              >
                {editingExercise ? "Update" : "Add"} Exercise
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Exercise List */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} found
          </p>
          
          <Droppable droppableId="exercise-database">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2 max-h-96 overflow-y-auto"
              >
                {filteredExercises.map((exercise, index) => (
                  <Draggable key={exercise.id} draggableId={exercise.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-3 border rounded-lg cursor-move transition-all ${
                          snapshot.isDragging 
                            ? "bg-blue-50 border-blue-300 shadow-lg" 
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-sm text-gray-900">{exercise.name}</span>
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
                            </div>
                            {exercise.description && (
                              <p className="text-xs text-gray-600 mb-1">{exercise.description}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {exercise.duration && <span>{exercise.duration}min</span>}
                              {exercise.equipment && <span>• {exercise.equipment}</span>}
                              {exercise.usageCount > 0 && <span>• Used {exercise.usageCount} times</span>}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDesigningMotion(exercise);
                                setSheetOpen(true);
                              }}
                              className="text-xs px-2 py-1 h-auto text-orange-600 border-orange-300 hover:bg-orange-50"
                            >
                              Design Motion
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(exercise)}
                              className="text-xs px-2 py-1 h-auto"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(exercise.id)}
                              className="text-xs px-2 py-1 h-auto text-red-500 border-red-500 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
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
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <span>🏀</span>
                  Design Motion for: {designingMotion.name}
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