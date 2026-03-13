import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import DiscussionForm from "@/components/discussions/DiscussionForm";
import DiscussionsList from "@/components/discussions/DiscussionsList";
import DiscussionThread from "@/components/discussions/DiscussionThread";
import { createDiscussion } from "@/lib/api/discussions";

const Discussions = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleCreateDiscussion = async (data: {
    title: string;
    content: string;
    category: string;
    raceWeekendId?: string;
  }) => {
    setIsCreating(true);
    try {
      const discussion = await createDiscussion(data);
      toast({
        title: "Success",
        description: "Discussion created successfully!",
      });

      setIsDialogOpen(false);
      setSelectedDiscussionId(discussion._id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create discussion";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (selectedDiscussionId) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="mt-16 h-[calc(100vh-64px)] max-w-7xl mx-auto">
          <DiscussionThread
            discussionId={selectedDiscussionId}
            onBack={() => setSelectedDiscussionId(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="f1-heading text-3xl mb-2">Discussions</h1>
            <p className="text-muted-foreground text-sm">
              Join the conversation about F1 predictions and races
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Discussion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create a New Discussion</DialogTitle>
              </DialogHeader>
              <DiscussionForm
                onSubmit={handleCreateDiscussion}
                isLoading={isCreating}
              />
            </DialogContent>
          </Dialog>
        </div>

        <DiscussionsList onSelectDiscussion={setSelectedDiscussionId} />
      </main>
    </div>
  );
};

export default Discussions;
