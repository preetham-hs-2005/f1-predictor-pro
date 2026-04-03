import { useEffect, useState } from "react";

import { useDiscussions } from "@/hooks/useDiscussions";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import DiscussionItem from "./DiscussionItem";

interface DiscussionsListProps {
  onSelectDiscussion: (id: string) => void;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "general", label: "General" },
  { value: "technical", label: "Technical" },
  { value: "race-specific", label: "Race Specific" },
  { value: "predictions", label: "Predictions" },
  { value: "off-topic", label: "Off Topic" },
];

function DiscussionsList({ onSelectDiscussion }: DiscussionsListProps) {
  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const { discussions, loading, fetchDiscussions } = useDiscussions();

  useEffect(() => {
    fetchDiscussions(category, page);
  }, [category, page, fetchDiscussions]);

  const filteredDiscussions = discussions.filter(
    (d) =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[220px_1fr]">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full">
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
        <Input
          placeholder="Search discussions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-[1.5rem] bg-white/[0.06]" />
          ))
        ) : filteredDiscussions.length === 0 ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] py-12 text-center">
            <p className="text-white/55">No discussions found. Be the first to create one!</p>
          </div>
        ) : (
          filteredDiscussions.map((discussion) => (
            <DiscussionItem key={discussion._id} discussion={discussion} onClick={onSelectDiscussion} />
          ))
        )}
      </div>
    </div>
  );
}

export default DiscussionsList;
