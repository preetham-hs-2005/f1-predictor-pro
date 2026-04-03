import { formatDistanceToNow } from "date-fns";
import { Eye, MessageSquare } from "lucide-react";

import { Discussion } from "@/hooks/useDiscussions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface DiscussionItemProps {
  discussion: Discussion;
  onClick: (id: string) => void;
}

function DiscussionItem({ discussion, onClick }: DiscussionItemProps) {
  const categoryColors: Record<string, string> = {
    general: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
    technical: "border-violet-400/20 bg-violet-400/10 text-violet-200",
    "race-specific": "border-primary/20 bg-primary/10 text-primary",
    predictions: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    "off-topic": "border-white/10 bg-white/[0.05] text-white/72",
  };

  const categoryLabels: Record<string, string> = {
    general: "General",
    technical: "Technical",
    "race-specific": "Race Specific",
    predictions: "Predictions",
    "off-topic": "Off Topic",
  };

  return (
    <Card className="cursor-pointer border-white/10 transition-all hover:-translate-y-1 hover:border-white/15" onClick={() => onClick(discussion._id)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {discussion.isPinned && (
              <Badge className="mb-3 rounded-full border border-f1-warning/20 bg-f1-warning/10 text-f1-warning" variant="outline">
                Pinned
              </Badge>
            )}
            <h3 className="mb-2 line-clamp-2 font-heading text-xl text-white">{discussion.title}</h3>
            <p className="mb-3 line-clamp-2 text-sm leading-7 text-white/60">{discussion.content}</p>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/38">
              <span>by {discussion.userName}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
          <Badge className={`rounded-full border ${categoryColors[discussion.category]}`}>{categoryLabels[discussion.category]}</Badge>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-white/48">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{discussion.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{discussion.messageCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DiscussionItem;
