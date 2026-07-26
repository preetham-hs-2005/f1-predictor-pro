import { useState, useCallback, useEffect, useRef } from "react";
import { useToast } from "./use-toast";
import {
  Discussion,
  Message,
  Poll,
  getDiscussions,
  getDiscussion,
  createMessage as apiCreateMessage,
  deleteMessage as apiDeleteMessage,
  likeMessage as apiLikeMessage,
  createPoll as apiCreatePoll,
  votePoll as apiVotePoll,
  deletePoll as apiDeletePoll,
  getMessages,
} from "@/lib/api/discussions";

interface UseDiscussionsReturn {
  discussions: Discussion[];
  loading: boolean;
  error: string | null;
  fetchDiscussions: (category?: string, page?: number) => Promise<void>;
}

export const useDiscussions = (): UseDiscussionsReturn => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDiscussions = useCallback(async (category: string = "", page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDiscussions(category, page);
      setDiscussions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch discussions";
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { discussions, loading, error, fetchDiscussions };
};

interface UseDiscussionReturn {
  discussion: Discussion | null;
  messages: Message[];
  polls: Poll[];
  loading: boolean;
  error: string | null;
  fetchDiscussion: (id: string) => Promise<void>;
  addMessage: (content: string) => Promise<Message | null>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  likeMessage: (messageId: string) => Promise<void>;
  createPoll: (question: string, description: string, type: string, options: string[]) => Promise<Poll | null>;
  votePoll: (pollId: string, selectedOptions: number[]) => Promise<void>;
  deletePoll: (pollId: string) => Promise<boolean>;
}

export const useDiscussion = (): UseDiscussionReturn => {
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const discussionIdRef = useRef<string | null>(null);

  const fetchDiscussion = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    discussionIdRef.current = id;
    try {
      const data = await getDiscussion(id, true);
      setDiscussion(data.discussion);
      setMessages(data.messages);
      setPolls(data.polls);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch discussion";
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Auto-refresh messages every 3 seconds
  useEffect(() => {
    if (!discussion) return;

    const refreshMessages = async () => {
      if (document.hidden) return;
      try {
        const freshMessages = await getMessages(discussion._id, 1, 100);
        setMessages(freshMessages);
      } catch (err) {
        console.error("Error refreshing messages:", err);
      }
    };

    // Set up polling interval
    pollingIntervalRef.current = setInterval(refreshMessages, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [discussion]);

  const addMessage = useCallback(
    async (content: string): Promise<Message | null> => {
      if (!discussion) return null;
      try {
        const message = await apiCreateMessage(discussion._id, content);
        setMessages((prev) => [...prev, message]);
        return message;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create message";
        toast({ title: "Error", description: message, variant: "destructive" });
        return null;
      }
    },
    [discussion, toast]
  );

  const deleteMessage = useCallback(
    async (messageId: string): Promise<boolean> => {
      if (!discussion) return false;
      try {
        const deleted = await apiDeleteMessage(discussion._id, messageId);
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
        toast({ title: "Success", description: "Message deleted" });
        return deleted;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete message";
        toast({ title: "Error", description: message, variant: "destructive" });
        return false;
      }
    },
    [discussion, toast]
  );

  const likeMessage = useCallback(
    async (messageId: string) => {
      if (!discussion) return;
      try {
        const updatedMessage = await apiLikeMessage(discussion._id, messageId);
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? { ...m, likes: updatedMessage.likes } : m))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to like message";
        toast({ title: "Error", description: message, variant: "destructive" });
      }
    },
    [discussion, toast]
  );

  const createPoll = useCallback(
    async (
      question: string,
      description: string,
      type: string,
      options: string[]
    ): Promise<Poll | null> => {
      if (!discussion) return null;
      try {
        const poll = await apiCreatePoll(discussion._id, {
          question,
          description,
          type: type as "single" | "multiple",
          options,
        });
        setPolls((prev) => [...prev, poll]);
        return poll;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create poll";
        toast({ title: "Error", description: message, variant: "destructive" });
        return null;
      }
    },
    [discussion, toast]
  );

  const votePoll = useCallback(
    async (pollId: string, selectedOptions: number[]) => {
      if (!discussion) return;
      try {
        const result = await apiVotePoll(discussion._id, pollId, selectedOptions);
        setPolls((prev) =>
          prev.map((p) =>
            p._id === pollId ? { ...p, voteCounts: result.voteCounts } : p
          )
        );
        toast({ title: "Success", description: "Vote recorded" });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to vote";
        toast({ title: "Error", description: message, variant: "destructive" });
      }
    },
    [discussion, toast]
  );

  const deletePoll = useCallback(
    async (pollId: string): Promise<boolean> => {
      if (!discussion) return false;
      try {
        const deleted = await apiDeletePoll(discussion._id, pollId);
        setPolls((prev) => prev.filter((p) => p._id !== pollId));
        toast({ title: "Success", description: "Poll deleted" });
        return deleted;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete poll";
        toast({ title: "Error", description: message, variant: "destructive" });
        return false;
      }
    },
    [discussion, toast]
  );

  return {
    discussion,
    messages,
    polls,
    loading,
    error,
    fetchDiscussion,
    addMessage,
    deleteMessage,
    likeMessage,
    createPoll,
    votePoll,
    deletePoll,
  };
};
