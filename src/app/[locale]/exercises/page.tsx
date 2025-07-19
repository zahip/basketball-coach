"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import { Clock, Users, Target, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface ExerciseTemplate {
  id: string;
  name: string;
  description: string | null;
  duration: number | null;
  category: string | null;
  difficulty: string | null;
  equipment: string | null;
  instructions: string | null;
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  coachId: string;
  coach: {
    name: string;
  };
}

export default function ExercisesPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('ExercisesPage');
  
  // Search
  const [search, setSearch] = useState("");
  

  // Fetch exercises with search
  const { data: exercisesData, isLoading } = trpc.getExerciseTemplatesWithFilters.useQuery({
    search: search || undefined,
    includePublic: true,
  });

  const exercises = exercisesData?.exerciseTemplates || [];

  const categories = [
    { value: "warmup", label: t('categories.warmup') },
    { value: "ball_handling", label: t('categories.ball_handling') },
    { value: "shooting", label: t('categories.shooting') },
    { value: "defense", label: t('categories.defense') },
    { value: "conditioning", label: t('categories.conditioning') },
    { value: "scrimmage", label: t('categories.scrimmage') },
    { value: "skills", label: t('categories.skills') },
  ];

  const difficulties = [
    { value: "beginner", label: t('difficulties.beginner') },
    { value: "intermediate", label: t('difficulties.intermediate') },
    { value: "advanced", label: t('difficulties.advanced') },
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
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('title')}
              </h1>
              <p className="text-gray-600 mt-2">
                {t('subtitle')}
              </p>
            </div>
            
            <Link href={`/${locale}/exercises/create`}>
              <Button className="bg-basketball-orange-500 hover:bg-basketball-orange-600">
                {t('addNewExercise')}
              </Button>
            </Link>
          </div>

          {/* Simple Search */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <Input
              placeholder={locale === 'he' ? 'חפש תרגילים...' : 'Search exercises...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* Exercises Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise: ExerciseTemplate) => (
              <Card key={exercise.id} className="hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg line-clamp-2">
                      {exercise.name}
                    </CardTitle>
                    <div className="flex items-center text-gray-500">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span className="text-sm">{exercise.usageCount}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
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
                        {locale === 'he' ? 'ציבורי' : 'Public'}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  {exercise.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {exercise.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    {exercise.duration && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{exercise.duration} {locale === 'he' ? 'דקות' : 'minutes'}</span>
                      </div>
                    )}
                    {exercise.equipment && (
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        <span className="line-clamp-1">{exercise.equipment}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="line-clamp-1">
                        {locale === 'he' ? 'נוצר על ידי:' : 'Created by:'} {exercise.coach.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <Link href={`/${locale}/exercises/${exercise.id}`}>
                      <Button className="w-full bg-basketball-blue-500 hover:bg-basketball-blue-600">
                        {locale === 'he' ? 'צפה בפרטים' : 'View Details'}
                      </Button>
                    </Link>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // TODO: Navigate to exercise details or add to training set
                        console.log('Exercise selected:', exercise.id);
                      }}
                    >
                      {locale === 'he' ? 'הוסף לאימון' : 'Add to Training'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && exercises.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Target className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {locale === 'he' ? 'לא נמצאו תרגילים' : 'No exercises found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {locale === 'he' 
                ? 'נסה לשנות את המסננים או ליצור תרגיל חדש'
                : 'Try adjusting your filters or create a new exercise'
              }
            </p>
            <Link href={`/${locale}/exercises/create`}>
              <Button className="bg-basketball-orange-500 hover:bg-basketball-orange-600">
                {locale === 'he' ? 'צור תרגיל ראשון' : 'Create First Exercise'}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}