import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDiscussion } from "@/hooks/useDiscussions";
import { deleteDiscussion } from "@/lib/api/discussions";
import MessageForm from "./MessageForm";
import MessageItem from "./MessageItem";
import PollComponent from "./PollComponent";
import { useToast } from "@/hooks/use-toast";

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

  // Auto-scroll to bottom when new messages arrive
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
          description: "Poll created successfully!",
        });
      }
    } finally {
      setCreatingPoll(false);
    }
  };

  const handleDeleteDiscussion = async () => {
    if (!discussion) return;
    if (
      !window.confirm(
        "Are you sure you want to delete this discussion? All messages and polls will be deleted."
      )
    ) {
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
    return <Skeleton className="w-full h-96" />;
  }

  if (error || !discussion) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error || "Discussion not found"}</p>
        <Button onClick={onBack}>Back to Discussions</Button>
      </div>
    );
  }

  const isAuthor = user?.id === discussion.userId;
  const isAdmin = user?.role === "admin";
  const canDelete = isAuthor || isAdmin;

  return (
    <div className="flex flex-col h-full bg-black items-center">
      <div className="w-full max-w-2xl flex flex-col h-full border-x border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-800 bg-black px-4 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Button
                variant="ghost"
                onClick={onBack}
                className="gap-2 text-gray-400 hover:text-white mb-2 -ml-3"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h2 className="text-xl font-bold text-white">{discussion.title}</h2>
              <p className="text-xs text-gray-500 mt-1">
                {discussion.userName} • {new Date(discussion.createdAt).toLocaleDateString()} •{" "}
                {discussion.views} views
              </p>
            </div>
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteDiscussion}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Discussion content preview */}
        <div className="border-b border-gray-800 bg-black px-4 py-3">
          <p className="text-sm text-gray-300 whitespace-pre-wrap break-words max-h-20 overflow-y-auto">
            {discussion.content}
          </p>
        </div>

        {/* Polls section */}
        {polls.length > 0 && (
          <div className="border-b border-gray-800 bg-black px-4 py-4 flex flex-col shrink-0 max-h-[104px]">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 shrink-0">Polls</h3>
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

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 w-full">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageItem
                key={message._id}
                message={message}
                currentUserId={user?.id || ""}
                isAdmin={user?.role === "admin" || false}
                onDelete={async (id) => { await deleteMessage(id); }}
                onLike={likeMessage}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
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
