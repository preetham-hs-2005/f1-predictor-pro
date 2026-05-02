import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import CreatePollDialog from "./CreatePollDialog";

interface MessageFormProps {
  onSubmit: (content: string, imageUrl?: string) => Promise<void>;
  onCreatePoll?: (data: {
    question: string;
    description?: string;
    type: "single" | "multiple";
    options: string[];
  }) => Promise<void>;
  isLoading?: boolean;
  isCreatingPoll?: boolean;
}

function MessageForm({
  onSubmit,
  onCreatePoll,
  isLoading = false,
  isCreatingPoll = false,
}: MessageFormProps) {
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Message cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSubmit(content.trim());
      setContent("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl flex-shrink-0 border-t border-border bg-card px-4 py-4">
      <div className="flex gap-2">
        {onCreatePoll && (
          <CreatePollDialog onCreate={onCreatePoll} isLoading={isCreatingPoll} />
        )}

        <Input
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading || isCreatingPoll}
          className="bg-input"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as any);
            }
          }}
        />

        <Button
          type="submit"
          disabled={isLoading || isCreatingPoll || !content.trim()}
          className="bg-primary hover:bg-primary/90"
          size="sm"
        >
          {isLoading ? (
            <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
}

export default MessageForm;
