"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, ListSkeleton } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";

interface NotesSectionProps {
  teamId: string;
  onUpdate: () => void;
}


export function NotesSection({ teamId, onUpdate }: NotesSectionProps) {
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [selectedPractice, setSelectedPractice] = useState("");

  const { data: notesData, isLoading: loadingNotes, refetch: refetchNotes } = trpc.getCoachNotes.useQuery({ teamId });
  const { data: practicesData } = trpc.getPractices.useQuery({ teamId });

  const createNoteMutation = trpc.createCoachNote.useMutation({
    onSuccess: () => {
      refetchNotes();
      onUpdate();
      setShowAddNote(false);
      setNoteTitle("");
      setNoteContent("");
      setSelectedPractice("");
    },
  });

  const deleteNoteMutation = trpc.deleteCoachNote.useMutation({
    onSuccess: () => {
      refetchNotes();
      onUpdate();
    },
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    createNoteMutation.mutate({
      teamId,
      title: noteTitle.trim() || undefined,
      content: noteContent.trim(),
      practiceId: selectedPractice || undefined,
    });
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate({ noteId });
    }
  };

  if (loadingNotes) {
    return <ListSkeleton items={3} />;
  }

  const notes = notesData?.notes || [];
  const practices = practicesData?.practices || [];
  const sortedNotes = notes.sort((a, b) => 
    new Date(b.noteDate).getTime() - new Date(a.noteDate).getTime()
  );

  const getPracticeForNote = (practiceId?: string) => {
    return practices.find(p => p.id === practiceId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Coach Notes</h2>
          <p className="text-muted-foreground">
            Keep track of observations, plans, and team progress
          </p>
        </div>
        <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
          <DialogTrigger asChild>
            <Button variant="success" size="sm">
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Coach Note</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <Label htmlFor="noteTitle">Title (Optional)</Label>
                <Input
                  id="noteTitle"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note title..."
                />
              </div>
              
              <div>
                <Label htmlFor="noteContent">Note Content *</Label>
                <Textarea
                  id="noteContent"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your observations, plans, or notes here..."
                  rows={5}
                  required
                />
              </div>

              <div>
                <Label htmlFor="practice">Link to Practice (Optional)</Label>
                <select
                  id="practice"
                  value={selectedPractice}
                  onChange={(e) => setSelectedPractice(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="">No specific practice</option>
                  {practices.map((practice) => (
                    <option key={practice.id} value={practice.id}>
                      {new Date(practice.date).toLocaleDateString()}
                      {practice.time && ` at ${practice.time}`}
                      {practice.location && ` - ${practice.location}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddNote(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createNoteMutation.isPending}>
                  {createNoteMutation.isPending ? "Adding..." : "Add Note"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notes List */}
      {sortedNotes.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No notes yet"
          description="Start keeping track of your team's progress and observations"
          action={
            <Button
              variant="success"
              onClick={() => setShowAddNote(true)}
            >
              Write First Note
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {sortedNotes.map((note, index) => {
            const linkedPractice = getPracticeForNote(note.practiceId || undefined);
            
            return (
              <Card
                key={note.id}
                variant="outlined"
                className="animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {note.title ? (
                          <CardTitle className="text-lg">{note.title}</CardTitle>
                        ) : (
                          <CardTitle className="text-lg text-muted-foreground">
                            Untitled Note
                          </CardTitle>
                        )}
                        <Badge variant="outline" size="sm">
                          {new Date(note.noteDate).toLocaleDateString()}
                        </Badge>
                      </div>
                      
                      {linkedPractice && (
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="court" size="sm">
                            📅 Practice: {new Date(linkedPractice.date).toLocaleDateString()}
                            {linkedPractice.time && ` at ${linkedPractice.time}`}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                      disabled={deleteNoteMutation.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm text-muted-foreground">
                    <span>
                      Created {new Date(note.createdAt).toLocaleDateString()} 
                      at {new Date(note.createdAt).toLocaleTimeString()}
                    </span>
                    <span className="flex items-center gap-1">
                      📝 Coach Note
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      {sortedNotes.length > 0 && (
        <Card variant="filled" className="mt-6">
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {sortedNotes.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Notes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {sortedNotes.filter(n => n.practiceId).length}
                </div>
                <div className="text-sm text-muted-foreground">Practice Notes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {sortedNotes.filter(n => !n.practiceId).length}
                </div>
                <div className="text-sm text-muted-foreground">General Notes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {sortedNotes.filter(n => 
                    new Date(n.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                  ).length}
                </div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}