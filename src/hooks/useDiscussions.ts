import { useState, useCallback, useEffect } from "react";
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
}

export const useDiscussion = (): UseDiscussionReturn => {
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDiscussion = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDiscussion(id);
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

  const addMessage = useCallback(
    async (content: string): Promise<Message | null> => {
      if (!discussion) return null;
      try {
        const message = await apiCreateMessage(discussion._id, content);
        setMessages([...messages, message]);
        return message;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create message";
        toast({ title: "Error", description: message, variant: "destructive" });
        return null;
      }
    },
    [discussion, messages, toast]
  );

  const deleteMessage = useCallback(
    async (messageId: string): Promise<boolean> => {
      if (!discussion) return false;
      try {
        const deleted = await apiDeleteMessage(discussion._id, messageId);
        setMessages(messages.filter((m) => m._id !== messageId));
        toast({ title: "Success", description: "Message deleted" });
        return deleted;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete message";
        toast({ title: "Error", description: message, variant: "destructive" });
        return false;
      }
    },
    [discussion, messages, toast]
  );

  const likeMessage = useCallback(
    async (messageId: string) => {
      if (!discussion) return;
      try {
        const updatedMessage = await apiLikeMessage(discussion._id, messageId);
        setMessages(
          messages.map((m) => (m._id === messageId ? { ...m, likes: updatedMessage.likes } : m))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to like message";
        toast({ title: "Error", description: message, variant: "destructive" });
      }
    },
    [discussion, messages, toast]
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
        setPolls([...polls, poll]);
        return poll;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create poll";
        toast({ title: "Error", description: message, variant: "destructive" });
        return null;
      }
    },
    [discussion, polls, toast]
  );

  const votePoll = useCallback(
    async (pollId: string, selectedOptions: number[]) => {
      if (!discussion) return;
      try {
        const result = await apiVotePoll(discussion._id, pollId, selectedOptions);
        setPolls(
          polls.map((p) =>
            p._id === pollId ? { ...p, voteCounts: result.voteCounts } : p
          )
        );
        toast({ title: "Success", description: "Vote recorded" });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to vote";
        toast({ title: "Error", description: message, variant: "destructive" });
      }
    },
    [discussion, polls, toast]
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
  };
};
