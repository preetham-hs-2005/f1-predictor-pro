import { useEffect, useState } from "react";
import { MessageSquarePlus } from "lucide-react";
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
      <main className="container pb-12 pt-32">
        <PageHeader
          eyebrow="Discussions"
          title="Threads and polls"
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
                  <DialogTitle className="text-2xl font-semibold">Create discussion</DialogTitle>
                </DialogHeader>
                <DiscussionForm onSubmit={handleCreateDiscussion} isLoading={isCreating} />
              </DialogContent>
            </Dialog>
          }
          stats={[
            { label: "Type", value: "Threads" },
            { label: "Polls", value: "Enabled" },
            { label: "Search", value: "Enabled" },
          ]}
        />

        <section className="section-card mt-8">
          <DiscussionsList onSelectDiscussion={setSelectedDiscussionId} />
        </section>
      </main>
    </PageShell>
  );
};

export default Discussions;
