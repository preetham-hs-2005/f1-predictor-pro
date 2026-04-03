import { useEffect, useState } from "react";
import { MessageSquarePlus, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import DiscussionForm from "@/components/discussions/DiscussionForm";
import DiscussionsList from "@/components/discussions/DiscussionsList";
import DiscussionThread from "@/components/discussions/DiscussionThread";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createDiscussion } from "@/lib/api/discussions";

const Discussions = () => {
  const { isAuthenticated, isLoading } = useAuth();
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
      <PageShell>
        <Navbar />
        <div className="container mt-24 h-[calc(100svh-7rem)] pb-4 md:mt-28 md:h-[calc(100svh-7.5rem)] md:pb-6">
          <DiscussionThread discussionId={selectedDiscussionId} onBack={() => setSelectedDiscussionId(null)} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Navbar />
      <main className="container pb-12 pt-24 md:pt-32">
        <PageHeader
          eyebrow="Community"
          title="Discussions and polls"
          description="A more social race room for league banter, technical takes, and all the prediction-side conversation that keeps the season lively."
          actions={
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="max-sm:w-full">
                  <MessageSquarePlus className="h-4 w-4" />
                  New Discussion
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl">Create a new discussion</DialogTitle>
                </DialogHeader>
                <DiscussionForm onSubmit={handleCreateDiscussion} isLoading={isCreating} />
              </DialogContent>
            </Dialog>
          }
          stats={[
            { label: "Mode", value: "Threads" },
            { label: "Extras", value: "Polls" },
            { label: "Search", value: "Enabled" },
            { label: "Energy", value: "High" },
          ]}
        />

        <section className="section-card mt-8">
          <div className="mb-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
            <p className="flex items-start gap-2 text-sm text-white/72">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              This page keeps all existing features, but now reads like a premium social hub instead of a plain forum list.
            </p>
          </div>
          <DiscussionsList onSelectDiscussion={setSelectedDiscussionId} />
        </section>
      </main>
    </PageShell>
  );
};

export default Discussions;
