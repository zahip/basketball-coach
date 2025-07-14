"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BasketballCourt } from "@/components/BasketballCourt";

interface ExerciseTemplate {
  id: string;
  name: string;
  description?: string | null;
  duration?: number | null;
  category?: string | null;
  difficulty?: string | null;
  equipment?: string | null;
  instructions?: string | null;
}

interface ExerciseMotionDesignerProps {
  exercise: ExerciseTemplate;
  onSave?: (motionData: MotionData) => void;
}

interface DrillStep {
  id: string;
  name: string;
  description: string;
  duration: number; // in seconds
  motionData?: Record<string, unknown>;
}

interface MotionData {
  exerciseId: string;
  drillSteps: DrillStep[];
  totalDuration: number;
  createdAt: string;
}

export function ExerciseMotionDesigner({ exercise, onSave }: ExerciseMotionDesignerProps) {
  const [drillSteps, setDrillSteps] = useState<DrillStep[]>([
    {
      id: "1",
      name: "Setup",
      description: "Initial player positioning",
      duration: 10,
    }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const addDrillStep = () => {
    const newStep: DrillStep = {
      id: Date.now().toString(),
      name: `Step ${drillSteps.length + 1}`,
      description: "New drill step",
      duration: 15,
    };
    setDrillSteps([...drillSteps, newStep]);
  };

  const updateDrillStep = (stepIndex: number, updates: Partial<DrillStep>) => {
    const updatedSteps = drillSteps.map((step, index) => 
      index === stepIndex ? { ...step, ...updates } : step
    );
    setDrillSteps(updatedSteps);
  };

  const deleteDrillStep = (stepIndex: number) => {
    if (drillSteps.length > 1) {
      const updatedSteps = drillSteps.filter((_, index) => index !== stepIndex);
      setDrillSteps(updatedSteps);
      if (currentStep >= updatedSteps.length) {
        setCurrentStep(Math.max(0, updatedSteps.length - 1));
      }
    }
  };

  const saveMotionDesign = () => {
    const motionData = {
      exerciseId: exercise.id,
      drillSteps,
      totalDuration: drillSteps.reduce((total, step) => total + step.duration, 0),
      createdAt: new Date().toISOString(),
    };
    
    if (onSave) {
      onSave(motionData);
    }
    
    console.log("Motion design saved:", motionData);
  };

  const currentStepData = drillSteps[currentStep];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>🏀</span>
              {exercise.name} - Motion Designer
            </h2>
            <p className="text-orange-100 text-sm mt-1">
              {exercise.description || "Design motion and drill sequences for this exercise"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              variant="outline"
              className="bg-white text-orange-600 border-white hover:bg-orange-50"
            >
              {isPreviewMode ? "📝 Edit" : "👁 Preview"}
            </Button>
            <Button
              onClick={saveMotionDesign}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              💾 Save Motion
            </Button>
          </div>
        </div>
      </div>

      {/* Exercise Info Bar */}
      <div className="bg-gray-50 p-3 border-b flex items-center gap-4 text-sm">
        {exercise.category && (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {exercise.category}
          </span>
        )}
        {exercise.difficulty && (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            {exercise.difficulty}
          </span>
        )}
        {exercise.duration && (
          <span className="text-gray-600">Duration: {exercise.duration}min</span>
        )}
        {exercise.equipment && (
          <span className="text-gray-600">Equipment: {exercise.equipment}</span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Drill Steps */}
        <div className="w-80 bg-gray-50 border-r overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Drill Steps</h3>
              <Button onClick={addDrillStep} size="sm" className="bg-orange-500 hover:bg-orange-600">
                + Add Step
              </Button>
            </div>
            
            <div className="space-y-2">
              {drillSteps.map((step, index) => (
                <Card 
                  key={step.id} 
                  className={`cursor-pointer transition-all ${
                    currentStep === index 
                      ? "ring-2 ring-orange-400 bg-orange-50" 
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={step.name}
                            onChange={(e) => updateDrillStep(index, { name: e.target.value })}
                            className="font-medium text-sm bg-transparent border-none focus:outline-none focus:bg-white focus:border focus:border-orange-300 rounded px-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <textarea
                          value={step.description}
                          onChange={(e) => updateDrillStep(index, { description: e.target.value })}
                          className="w-full text-xs text-gray-600 bg-transparent border-none resize-none focus:outline-none focus:bg-white focus:border focus:border-orange-300 rounded px-1"
                          rows={2}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">Duration:</span>
                          <input
                            type="number"
                            value={step.duration}
                            onChange={(e) => updateDrillStep(index, { duration: parseInt(e.target.value) || 0 })}
                            className="w-12 text-xs bg-transparent border-none focus:outline-none focus:bg-white focus:border focus:border-orange-300 rounded px-1"
                            min="1"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-xs text-gray-500">sec</span>
                        </div>
                      </div>
                      {drillSteps.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDrillStep(index);
                          }}
                          className="text-red-500 border-red-300 hover:bg-red-50 p-1 h-auto"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Step Summary */}
            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Summary</h4>
              <p className="text-xs text-gray-600">
                Total Steps: {drillSteps.length}
              </p>
              <p className="text-xs text-gray-600">
                Total Duration: {drillSteps.reduce((total, step) => total + step.duration, 0)}s
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Basketball Court */}
        <div className="flex-1 flex flex-col">
          {/* Current Step Info */}
          {currentStepData && (
            <div className="bg-white border-b p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">
                    Step {currentStep + 1}: {currentStepData.name}
                  </h4>
                  <p className="text-sm text-gray-600">{currentStepData.description}</p>
                </div>
                <div className="text-sm text-gray-500">
                  Duration: {currentStepData.duration}s
                </div>
              </div>
            </div>
          )}

          {/* Basketball Court */}
          <div className="flex-1 p-4 overflow-auto">
            <BasketballCourt />
          </div>

          {/* Motion Controls */}
          <div className="bg-gray-50 border-t p-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  variant="outline"
                  size="sm"
                >
                  ← Previous Step
                </Button>
                <Button
                  onClick={() => setCurrentStep(Math.min(drillSteps.length - 1, currentStep + 1))}
                  disabled={currentStep === drillSteps.length - 1}
                  variant="outline"
                  size="sm"
                >
                  Next Step →
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                Step {currentStep + 1} of {drillSteps.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}