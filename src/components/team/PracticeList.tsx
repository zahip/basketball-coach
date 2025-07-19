"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, ListSkeleton } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";

interface PracticeListProps {
  teamId: string;
  onUpdate: () => void;
}


export function PracticeList({ teamId, onUpdate }: PracticeListProps) {
  const [showAddPractice, setShowAddPractice] = useState(false);
  const [showAttachPlan, setShowAttachPlan] = useState<string | null>(null);
  
  // Form states
  const [practiceDate, setPracticeDate] = useState("");
  const [practiceTime, setPracticeTime] = useState("");
  const [practiceLocation, setPracticeLocation] = useState("");
  
  const { data: practicesData, isLoading: loadingPractices, refetch: refetchPractices } = trpc.getPractices.useQuery({ teamId });
  const { data: trainingSetsData, isLoading: loadingTrainingSets } = trpc.getTrainingSets.useQuery({ teamId });
  
  const createPracticeMutation = trpc.createPractice.useMutation({
    onSuccess: () => {
      refetchPractices();
      onUpdate();
      setShowAddPractice(false);
      setPracticeDate("");
      setPracticeTime("");
      setPracticeLocation("");
    },
    onError: (error) => {
      console.error("Failed to create practice:", error);
      alert(`Failed to create practice: ${error.message}`);
    },
  });

  const attachTrainingSetMutation = trpc.attachTrainingSetToPractice.useMutation({
    onSuccess: () => {
      refetchPractices();
      onUpdate();
      setShowAttachPlan(null);
    },
    onError: (error) => {
      console.error("Failed to attach training set:", error);
      alert(`Failed to attach training set: ${error.message}`);
    },
  });

  const handleAddPractice = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleAddPractice called with:", { practiceDate, practiceTime, practiceLocation });
    
    if (!practiceDate) {
      console.log("No practice date provided");
      return;
    }

    // Create date in local timezone and convert to ISO string
    const [year, month, day] = practiceDate.split('-').map(Number);
    const practiceDateTime = new Date(year, month - 1, day); // month is 0-indexed
    const dateISOString = practiceDateTime.toISOString();
    
    console.log("Creating practice with data:", {
      teamId,
      date: dateISOString,
      time: practiceTime || undefined,
      location: practiceLocation || undefined,
    });
    
    createPracticeMutation.mutate({
      teamId,
      date: dateISOString,
      time: practiceTime || undefined,
      location: practiceLocation || undefined,
    });
  };

  const handleAttachPlan = (practiceId: string, trainingSetId: string) => {
    attachTrainingSetMutation.mutate({
      practiceId,
      trainingSetId,
    });
  };

  if (loadingPractices) {
    return <ListSkeleton items={3} />;
  }

  const practices = practicesData?.practices || [];
  const upcomingPractices = practices.filter(p => new Date(p.date) >= new Date());
  const pastPractices = practices.filter(p => new Date(p.date) < new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Practices</h2>
          <p className="text-muted-foreground">
            Schedule and manage practice sessions
          </p>
        </div>
        <Dialog open={showAddPractice} onOpenChange={setShowAddPractice}>
          <DialogTrigger asChild>
            <Button variant="court" size="sm">
              Schedule Practice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Practice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPractice} className="space-y-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={practiceDate}
                  onChange={(e) => setPracticeDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={practiceTime}
                  onChange={(e) => setPracticeTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={practiceLocation}
                  onChange={(e) => setPracticeLocation(e.target.value)}
                  placeholder="Gym, court name, etc."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddPractice(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPracticeMutation.isPending}>
                  {createPracticeMutation.isPending ? "Scheduling..." : "Schedule Practice"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Practices */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📅 Upcoming Practices
          <Badge variant="outline">{upcomingPractices.length}</Badge>
        </h3>
        
        {upcomingPractices.length === 0 ? (
          <EmptyState
            icon="🗓️"
            title="No upcoming practices"
            description="Schedule your next practice session to get started"
            action={
              <Button
                variant="court"
                onClick={() => setShowAddPractice(true)}
              >
                Schedule First Practice
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingPractices.map((practice, index) => (
              <Card
                key={practice.id}
                variant="court"
                className="animate-slide-in-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      📅 {new Date(practice.date).toLocaleDateString()}
                      {practice.time && (
                        <Badge variant="outline" size="sm">
                          {practice.time}
                        </Badge>
                      )}
                    </CardTitle>
                    {practice.trainingSet ? (
                      <Badge variant="success" size="sm">
                        Plan Attached
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm">
                        No Plan
                      </Badge>
                    )}
                  </div>
                  {practice.location && (
                    <p className="text-sm text-muted-foreground">📍 {practice.location}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {practice.trainingSet ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Training Plan:</p>
                        <p className="text-sm text-muted-foreground">{practice.trainingSet.name}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAttachPlan(practice.id)}
                      >
                        Change Plan
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">No training plan attached</p>
                      <Button
                        variant="basketball"
                        size="sm"
                        onClick={() => setShowAttachPlan(practice.id)}
                      >
                        Attach Plan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Practices */}
      {pastPractices.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📚 Past Practices
            <Badge variant="outline">{pastPractices.length}</Badge>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastPractices.slice(0, 6).map((practice, index) => (
              <Card
                key={practice.id}
                variant="filled"
                className="animate-slide-in-right"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    📅 {new Date(practice.date).toLocaleDateString()}
                    {practice.time && (
                      <Badge variant="outline" size="sm">
                        {practice.time}
                      </Badge>
                    )}
                  </CardTitle>
                  {practice.trainingSet && (
                    <p className="text-xs text-muted-foreground">{practice.trainingSet.name}</p>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Attach Plan Dialog */}
      <Dialog open={!!showAttachPlan} onOpenChange={() => setShowAttachPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attach Training Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {loadingTrainingSets ? (
              <ListSkeleton items={3} />
            ) : trainingSetsData?.trainingSets?.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No training plans available"
                description="Create a training plan first to attach it to practices"
              />
            ) : (
              <div className="space-y-2">
                <Label>Select Training Plan</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {trainingSetsData?.trainingSets?.map((trainingSet) => (
                    <Card
                      key={trainingSet.id}
                      variant="outlined"
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => showAttachPlan && handleAttachPlan(showAttachPlan, trainingSet.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{trainingSet.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {trainingSet.exercises.length} exercise{trainingSet.exercises.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-basketball-blue-500">→</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAttachPlan(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}