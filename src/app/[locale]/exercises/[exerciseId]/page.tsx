"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";
import { BasketballCourt } from "@/components/BasketballCourt";
import { ArrowLeft, Edit, Save, Trash2, X, Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ExerciseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const exerciseId = params.exerciseId as string;
  const t = useTranslations("ExercisesPage");

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({
    name: "",
    description: "",
    duration: "",
    category: "",
    difficulty: "",
    equipment: "",
    instructions: "",
    isPublic: false,
  });
  const [diagramData, setDiagramData] = useState<{
    players: unknown[];
    actions: unknown[];
    recordings: unknown[];
  } | null>(null);

  // Queries and mutations
  const { data: exerciseData, isLoading, refetch } = trpc.getExerciseTemplate.useQuery(
    { id: exerciseId }
  );

  // Update form when data is loaded
  useEffect(() => {
    if (exerciseData?.exerciseTemplate) {
      const exercise = exerciseData.exerciseTemplate;
      setExerciseForm({
        name: exercise.name || "",
        description: exercise.description || "",
        duration: exercise.duration?.toString() || "",
        category: exercise.category || "",
        difficulty: exercise.difficulty || "",
        equipment: exercise.equipment || "",
        instructions: exercise.instructions || "",
        isPublic: exercise.isPublic || false,
      });
      setDiagramData(null);
    }
  }, [exerciseData]);

  const updateExerciseMutation = trpc.updateExerciseTemplate.useMutation();

  const deleteExerciseMutation = trpc.deleteExerciseTemplate.useMutation();

  const exercise = exerciseData?.exerciseTemplate;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Exercise Not Found</h1>
          <p className="text-gray-600 mb-6">The exercise you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          <Link href={`/${locale}/exercises`}>
            <Button>Back to Exercises</Button>
          </Link>
        </div>
      </div>
    );
  }

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

  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find(c => c.value === categoryValue);
    return category?.label || categoryValue;
  };

  const getDifficultyLabel = (difficultyValue: string) => {
    const difficulty = difficulties.find(d => d.value === difficultyValue);
    return difficulty?.label || difficultyValue;
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
      case "warmup": return "bg-orange-100 text-orange-800";
      case "ball_handling": return "bg-blue-100 text-blue-800";
      case "shooting": return "bg-purple-100 text-purple-800";
      case "defense": return "bg-red-100 text-red-800";
      case "conditioning": return "bg-green-100 text-green-800";
      case "scrimmage": return "bg-indigo-100 text-indigo-800";
      case "skills": return "bg-pink-100 text-pink-800";
      case "numerical_advantage": return "bg-cyan-100 text-cyan-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleSaveChanges = async () => {
    if (!exerciseForm.name.trim()) {
      alert("Please enter an exercise name");
      return;
    }

    try {
      await updateExerciseMutation.mutateAsync({
        id: exerciseId,
        name: exerciseForm.name,
        description: exerciseForm.description || undefined,
        duration: exerciseForm.duration ? parseInt(exerciseForm.duration) : undefined,
        category: exerciseForm.category as
          | "warmup"
          | "ball_handling"
          | "shooting"
          | "defense"
          | "conditioning"
          | "scrimmage"
          | "skills"
          | "numerical_advantage"
          | undefined,
        difficulty: exerciseForm.difficulty as
          | "beginner"
          | "intermediate"
          | "advanced"
          | undefined,
        equipment: exerciseForm.equipment || undefined,
        instructions: exerciseForm.instructions || undefined,
        diagramData: diagramData,
        isPublic: exerciseForm.isPublic,
      });
      alert("Exercise updated successfully!");
      setIsEditing(false);
      refetch();
    } catch (error: unknown) {
      console.error("Failed to update exercise:", error);
      alert(`Failed to update exercise: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteExerciseMutation.mutateAsync({ id: exerciseId });
      alert("Exercise deleted successfully!");
      router.push(`/${locale}/exercises`);
    } catch (error: unknown) {
      console.error("Failed to delete exercise:", error);
      alert(`Failed to delete exercise: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    setExerciseForm({
      name: exercise.name || "",
      description: exercise.description || "",
      duration: exercise.duration?.toString() || "",
      category: exercise.category || "",
      difficulty: exercise.difficulty || "",
      equipment: exercise.equipment || "",
      instructions: exercise.instructions || "",
      isPublic: exercise.isPublic || false,
    });
    setDiagramData(null);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/${locale}/exercises`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {locale === "he" ? "חזרה" : "Back"}
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? (locale === "he" ? "עריכת תרגיל" : "Edit Exercise") : exercise.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {exercise.category && (
                    <Badge className={getCategoryColor(exercise.category)}>
                      {getCategoryLabel(exercise.category)}
                    </Badge>
                  )}
                  {exercise.difficulty && (
                    <Badge className={getDifficultyColor(exercise.difficulty)}>
                      {getDifficultyLabel(exercise.difficulty)}
                    </Badge>
                  )}
                  {exercise.isPublic && (
                    <Badge variant="outline">
                      {locale === "he" ? "ציבורי" : "Public"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    disabled={updateExerciseMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-2" />
                    {locale === "he" ? "ביטול" : "Cancel"}
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    disabled={updateExerciseMutation.isPending || !exerciseForm.name.trim()}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateExerciseMutation.isPending
                      ? locale === "he" ? "שומר..." : "Saving..."
                      : locale === "he" ? "שמור שינויים" : "Save Changes"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {locale === "he" ? "ערוך" : "Edit"}
                  </Button>
                  
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        {locale === "he" ? "מחק" : "Delete"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {locale === "he" ? "מחיקת תרגיל" : "Delete Exercise"}
                        </DialogTitle>
                        <DialogDescription>
                          {locale === "he" 
                            ? "האם אתה בטוח שברצונך למחוק את התרגיל? פעולה זו לא ניתנת לביטול."
                            : "Are you sure you want to delete this exercise? This action cannot be undone."}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsDeleteDialogOpen(false)}
                        >
                          {locale === "he" ? "ביטול" : "Cancel"}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={deleteExerciseMutation.isPending}
                        >
                          {deleteExerciseMutation.isPending 
                            ? locale === "he" ? "מוחק..." : "Deleting..."
                            : locale === "he" ? "מחק" : "Delete"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exercise Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  {locale === "he" ? "פרטי התרגיל" : "Exercise Details"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    {/* Edit Form */}
                    <div>
                      <Label htmlFor="name">
                        {locale === "he" ? "שם התרגיל" : "Exercise Name"} *
                      </Label>
                      <Input
                        id="name"
                        value={exerciseForm.name}
                        onChange={(e) =>
                          setExerciseForm({ ...exerciseForm, name: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">
                        {locale === "he" ? "תיאור" : "Description"}
                      </Label>
                      <Textarea
                        id="description"
                        value={exerciseForm.description}
                        onChange={(e) =>
                          setExerciseForm({ ...exerciseForm, description: e.target.value })
                        }
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="duration">
                          {locale === "he" ? "זמן (דק׳)" : "Duration (min)"}
                        </Label>
                        <Input
                          id="duration"
                          type="number"
                          value={exerciseForm.duration}
                          onChange={(e) =>
                            setExerciseForm({ ...exerciseForm, duration: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">
                          {locale === "he" ? "קטגוריה" : "Category"}
                        </Label>
                        <Select
                          value={exerciseForm.category}
                          onValueChange={(value) =>
                            setExerciseForm({ ...exerciseForm, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="difficulty">
                          {locale === "he" ? "קושי" : "Difficulty"}
                        </Label>
                        <Select
                          value={exerciseForm.difficulty}
                          onValueChange={(value) =>
                            setExerciseForm({ ...exerciseForm, difficulty: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {difficulties.map((diff) => (
                              <SelectItem key={diff.value} value={diff.value}>
                                {diff.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="equipment">
                        {locale === "he" ? "ציוד נדרש" : "Required Equipment"}
                      </Label>
                      <Input
                        id="equipment"
                        value={exerciseForm.equipment}
                        onChange={(e) =>
                          setExerciseForm({ ...exerciseForm, equipment: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="instructions">
                        {locale === "he" ? "הוראות מפורטות" : "Detailed Instructions"}
                      </Label>
                      <Textarea
                        id="instructions"
                        value={exerciseForm.instructions}
                        onChange={(e) =>
                          setExerciseForm({ ...exerciseForm, instructions: e.target.value })
                        }
                        rows={4}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPublic"
                        checked={exerciseForm.isPublic}
                        onCheckedChange={(checked) =>
                          setExerciseForm({ ...exerciseForm, isPublic: !!checked })
                        }
                      />
                      <Label htmlFor="isPublic">
                        {locale === "he" ? "תרגיל ציבורי" : "Public Exercise"}
                      </Label>
                    </div>
                  </>
                ) : (
                  <>
                    {/* View Mode */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {locale === "he" ? "תיאור" : "Description"}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {exercise.description || (locale === "he" ? "אין תיאור" : "No description")}
                        </p>
                      </div>

                      {exercise.duration && (
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {locale === "he" ? "משך זמן" : "Duration"}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {exercise.duration} {locale === "he" ? "דקות" : "minutes"}
                          </p>
                        </div>
                      )}

                      {exercise.equipment && (
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {locale === "he" ? "ציוד נדרש" : "Required Equipment"}
                          </h3>
                          <p className="text-gray-600 mt-1">{exercise.equipment}</p>
                        </div>
                      )}

                      {exercise.instructions && (
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {locale === "he" ? "הוראות מפורטות" : "Detailed Instructions"}
                          </h3>
                          <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                            {exercise.instructions}
                          </p>
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {locale === "he" ? "פרטים נוספים" : "Additional Details"}
                        </h3>
                        <div className="space-y-1 mt-1 text-sm text-gray-600">
                          <p>
                            {locale === "he" ? "נוצר על ידי:" : "Created by:"} {exercise.coach.name}
                          </p>
                          <p>
                            {locale === "he" ? "שימושים:" : "Usage count:"} {exercise.usageCount}
                          </p>
                          <p>
                            {locale === "he" ? "נוצר בתאריך:" : "Created on:"}{" "}
                            {new Date(exercise.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Basketball Court Visualization */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {locale === "he" ? "דיאגרמת התרגיל" : "Exercise Diagram"}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {isEditing
                    ? locale === "he"
                      ? "ערוך את הדיאגרמה של התרגיל"
                      : "Edit the exercise diagram"
                    : locale === "he"
                    ? "הצגה חזותית של התרגיל"
                    : "Visual representation of the exercise"}
                </p>
              </CardHeader>
              <CardContent>
                {false ? (
                  <BasketballCourt
                    onDataChange={isEditing ? setDiagramData : undefined}
                    showSaveButton={false}
                  />
                ) : (
                  <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                    <div className="text-center text-gray-500">
                      <p className="text-lg font-medium">
                        {locale === "he" ? "אין דיאגרמה" : "No Diagram Available"}
                      </p>
                      <p className="text-sm mt-1">
                        {isEditing
                          ? locale === "he"
                            ? "השתמש בעורך המגרש כדי ליצור דיאגרמה"
                            : "Use the court editor to create a diagram"
                          : locale === "he"
                          ? "לא נוצרה דיאגרמה עבור תרגיל זה"
                          : "No diagram was created for this exercise"}
                      </p>
                      {isEditing && (
                        <Button
                          className="mt-4"
                          onClick={() => {
                            // Initialize with default court setup
                            setDiagramData({
                              players: [],
                              actions: [],
                              recordings: []
                            });
                          }}
                        >
                          {locale === "he" ? "צור דיאגרמה" : "Create Diagram"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}