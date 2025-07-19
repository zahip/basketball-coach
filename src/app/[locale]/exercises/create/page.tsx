"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BasketballCourt } from "@/components/BasketballCourt";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function CreateExercisePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("ExercisesPage");

  // Ensure user is synced with database
  const userUpsertMutation = trpc.userUpsert.useMutation();

  // Form state
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

  // Court diagram state
  const [diagramData, setDiagramData] = useState<{
    players: unknown[];
    actions: unknown[];
    recordings: unknown[];
  } | null>(null);

  // Create exercise mutation
  const createExerciseMutation = trpc.createExerciseTemplate.useMutation();

  const categories = [
    { value: "warmup", label: t("categories.warmup") },
    { value: "ball_handling", label: t("categories.ball_handling") },
    { value: "shooting", label: t("categories.shooting") },
    { value: "defense", label: t("categories.defense") },
    { value: "conditioning", label: t("categories.conditioning") },
    { value: "scrimmage", label: t("categories.scrimmage") },
    { value: "skills", label: t("categories.skills") },
    {
      value: "numerical_advantage",
      label: t("categories.numerical_advantage"),
    },
  ];

  const difficulties = [
    { value: "beginner", label: t("difficulties.beginner") },
    { value: "intermediate", label: t("difficulties.intermediate") },
    { value: "advanced", label: t("difficulties.advanced") },
  ];

  const handleSaveExercise = async () => {
    if (!exerciseForm.name.trim()) {
      alert("Please enter an exercise name");
      return;
    }

    try {
      // First ensure user exists in database
      await userUpsertMutation.mutateAsync();
      
      console.log("Saving exercise with data:", {
        name: exerciseForm.name,
        description: exerciseForm.description || undefined,
        duration: exerciseForm.duration ? parseInt(exerciseForm.duration) : undefined,
        category: exerciseForm.category || undefined,
        difficulty: exerciseForm.difficulty || undefined,
        equipment: exerciseForm.equipment || undefined,
        instructions: exerciseForm.instructions || undefined,
        diagramData: diagramData,
        isPublic: exerciseForm.isPublic,
      });

      await createExerciseMutation.mutateAsync({
        name: exerciseForm.name,
        description: exerciseForm.description || undefined,
        duration: exerciseForm.duration
          ? parseInt(exerciseForm.duration)
          : undefined,
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
      alert("Exercise created successfully!");
      router.push(`/${locale}/exercises`);
    } catch (error: unknown) {
      console.error("Failed to create exercise:", error);
      alert(`Failed to create exercise: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
                  {locale === "he" ? "צור תרגיל חדש" : "Create New Exercise"}
                </h1>
                <p className="text-gray-600">
                  {locale === "he"
                    ? "עצב תרגיל עם מדריך חזותי ופרטים מפורטים"
                    : "Design an exercise with visual guide and detailed information"}
                </p>
              </div>
            </div>

            <Button
              onClick={handleSaveExercise}
              disabled={
                createExerciseMutation.isPending || !exerciseForm.name.trim()
              }
              className="bg-green-500 hover:bg-green-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {createExerciseMutation.isPending
                ? locale === "he"
                  ? "שומר..."
                  : "Saving..."
                : locale === "he"
                ? "שמור תרגיל"
                : "Save Exercise"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exercise Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {locale === "he" ? "פרטי התרגיל" : "Exercise Details"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div>
                  <Label htmlFor="name">
                    {locale === "he" ? "שם התרגיל" : "Exercise Name"} *
                  </Label>
                  <Input
                    id="name"
                    value={exerciseForm.name}
                    onChange={(e) =>
                      setExerciseForm({
                        ...exerciseForm,
                        name: e.target.value,
                      })
                    }
                    placeholder={
                      locale === "he" ? "הכנס שם התרגיל" : "Enter exercise name"
                    }
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">
                    {locale === "he" ? "תיאור" : "Description"}
                  </Label>
                  <Textarea
                    id="description"
                    value={exerciseForm.description}
                    onChange={(e) =>
                      setExerciseForm({
                        ...exerciseForm,
                        description: e.target.value,
                      })
                    }
                    placeholder={
                      locale === "he"
                        ? "תיאור קצר של התרגיל"
                        : "Brief description of the exercise"
                    }
                    rows={3}
                  />
                </div>

                {/* Duration, Category, Difficulty */}
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
                        setExerciseForm({
                          ...exerciseForm,
                          duration: e.target.value,
                        })
                      }
                      placeholder="15"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">
                      {locale === "he" ? "קטגוריה" : "Category"}
                    </Label>
                    <Select
                      value={exerciseForm.category}
                      onValueChange={(value) =>
                        setExerciseForm({
                          ...exerciseForm,
                          category: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={locale === "he" ? "בחר" : "Select"}
                        />
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
                        setExerciseForm({
                          ...exerciseForm,
                          difficulty: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={locale === "he" ? "בחר" : "Select"}
                        />
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

                {/* Equipment */}
                <div>
                  <Label htmlFor="equipment">
                    {locale === "he" ? "ציוד נדרש" : "Required Equipment"}
                  </Label>
                  <Input
                    id="equipment"
                    value={exerciseForm.equipment}
                    onChange={(e) =>
                      setExerciseForm({
                        ...exerciseForm,
                        equipment: e.target.value,
                      })
                    }
                    placeholder={
                      locale === "he" ? "כדורים, חרוטים..." : "Balls, cones..."
                    }
                  />
                </div>

                {/* Instructions */}
                <div>
                  <Label htmlFor="instructions">
                    {locale === "he"
                      ? "הוראות מפורטות"
                      : "Detailed Instructions"}
                  </Label>
                  <Textarea
                    id="instructions"
                    value={exerciseForm.instructions}
                    onChange={(e) =>
                      setExerciseForm({
                        ...exerciseForm,
                        instructions: e.target.value,
                      })
                    }
                    placeholder={
                      locale === "he"
                        ? "הוראות מפורטות לביצוע התרגיל"
                        : "Step-by-step instructions for the exercise"
                    }
                    rows={4}
                  />
                </div>

                {/* Public checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    checked={exerciseForm.isPublic}
                    onCheckedChange={(checked) =>
                      setExerciseForm({
                        ...exerciseForm,
                        isPublic: !!checked,
                      })
                    }
                  />
                  <Label htmlFor="isPublic">
                    {locale === "he" ? "תרגיל ציבורי" : "Public Exercise"}
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Basketball Court Designer */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {locale === "he" ? "עיצוב התרגיל" : "Exercise Design"}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {locale === "he"
                    ? "השתמש במעצב המגרש כדי להמחיש את התרגיל. הזז שחקנים, צייר פעולות ותעד תנועות."
                    : "Use the court designer to visualize your exercise. Move players, draw actions, and record movements."}
                </p>
              </CardHeader>
              <CardContent>
                <BasketballCourt
                  onDataChange={setDiagramData}
                  showSaveButton={false}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
