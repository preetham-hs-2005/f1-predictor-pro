import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useDiscussion } from "@/hooks/useDiscussions";
import { useToast } from "@/hooks/use-toast";
import { deleteDiscussion } from "@/lib/api/discussions";
import MessageForm from "./MessageForm";
import MessageItem from "./MessageItem";
import PollComponent from "./PollComponent";

interface DiscussionThreadProps {
  discussionId: string;
  onBack: () => void;
}

function DiscussionThread({ discussionId, onBack }: DiscussionThreadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sendingMessage, setSendingMessage] = useState(false);
  const [creatingPoll, setCreatingPoll] = useState(false);
  const [votingPoll, setVotingPoll] = useState<string | null>(null);
  const [userVotedPolls, setUserVotedPolls] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    discussion,
    messages,
    polls,
    loading,
    error,
    fetchDiscussion,
    addMessage,
    deleteMessage,
    likeMessage,
    votePoll,
    createPoll,
    deletePoll,
  } = useDiscussion();

  useEffect(() => {
    fetchDiscussion(discussionId);
  }, [discussionId, fetchDiscussion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    setSendingMessage(true);
    try {
      const messageContent = imageUrl ? `${content}\n[Image: ${imageUrl}]` : content;
      await addMessage(messageContent);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleVote = async (pollId: string, selectedOptions: number[]) => {
    setVotingPoll(pollId);
    try {
      await votePoll(pollId, selectedOptions);
      setUserVotedPolls(new Set([...userVotedPolls, pollId]));
    } finally {
      setVotingPoll(null);
    }
  };

  const handleCreatePoll = async (data: {
    question: string;
    description?: string;
    type: "single" | "multiple";
    options: string[];
  }) => {
    setCreatingPoll(true);
    try {
      const newPoll = await createPoll(data.question, data.description || "", data.type, data.options);
      if (newPoll) {
        toast({
          title: "Success",
          description: "Poll created",
        });
      }
    } finally {
      setCreatingPoll(false);
    }
  };

  const handleDeleteDiscussion = async () => {
    if (!discussion) return;
    if (!window.confirm("Delete this discussion and all messages?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDiscussion(discussion._id);
      onBack();
    } catch (error) {
      console.error("Error deleting discussion:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-96 w-full rounded-lg bg-muted" />;
  }

  if (error || !discussion) {
    return (
      <div className="section-card py-8 text-center">
        <p className="mb-4 text-destructive">{error || "Discussion not found"}</p>
        <Button onClick={onBack}>Back to discussions</Button>
      </div>
    );
  }

  const isAuthor = user?.id === discussion.userId;
  const isAdmin = user?.role === "admin";
  const canDelete = isAuthor || isAdmin;

  return (
    <div className="flex h-full flex-col items-center">
      <div className="glass-strong flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-border">
        <div className="flex-shrink-0 border-b border-border bg-muted px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Button variant="ghost" onClick={onBack} className="mb-2 -ml-3 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h2 className="text-2xl font-semibold text-white">{discussion.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {discussion.userName} · {new Date(discussion.createdAt).toLocaleDateString()} · {discussion.views} views
              </p>
            </div>
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteDiscussion}
                disabled={isDeleting}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="border-b border-border bg-card px-5 py-4">
          <p className="max-h-20 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 text-white/72">
            {discussion.content}
          </p>
        </div>

        {polls.length > 0 && (
          <div className="flex max-h-[140px] shrink-0 flex-col border-b border-border bg-card px-5 py-4">
            <h3 className="mb-3 shrink-0 text-xs font-semibold text-muted-foreground">Polls</h3>
            <div className="space-y-3 overflow-y-auto pr-2">
              {polls.map((poll) => (
                <PollComponent
                  key={poll._id}
                  poll={poll}
                  onVote={(selectedOptions) => handleVote(poll._id, selectedOptions)}
                  onDelete={canDelete ? () => deletePoll(poll._id) : undefined}
                  hasVoted={userVotedPolls.has(poll._id)}
                  isLoading={votingPoll === poll._id}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 w-full space-y-4 overflow-y-auto px-5 py-5">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-white/45">No messages yet.</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageItem
                  key={message._id}
                  message={message}
                  currentUserId={user?.id || ""}
                  isAdmin={user?.role === "admin" || false}
                  onDelete={async (id) => {
                    await deleteMessage(id);
                  }}
                  onLike={likeMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <MessageForm
          onSubmit={handleSendMessage}
          isLoading={sendingMessage}
          onCreatePoll={handleCreatePoll}
          isCreatingPoll={creatingPoll}
        />
      </div>
    </div>
  );
}

export default DiscussionThread;
