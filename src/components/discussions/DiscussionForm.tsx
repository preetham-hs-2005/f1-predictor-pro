import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DiscussionFormProps {
  onSubmit: (data: {
    title: string;
    content: string;
    category: string;
    raceWeekendId?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "technical", label: "Technical" },
  { value: "race-specific", label: "Race Specific" },
  { value: "predictions", label: "Predictions" },
  { value: "off-topic", label: "Off Topic" },
];

function DiscussionForm({ onSubmit, isLoading = false }: DiscussionFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        category,
      });
      setTitle("");
      setContent("");
      setCategory("general");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">
          Category
        </label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Title
        </label>
        <Input
          id="title"
          placeholder="Enter discussion title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-2">
          Content
        </label>
        <Textarea
          id="content"
          placeholder="Enter your discussion content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Creating..." : "Create Discussion"}
      </Button>
    </form>
  );
}

export default DiscussionForm;
