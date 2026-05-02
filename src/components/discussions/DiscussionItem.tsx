import { formatDistanceToNow } from "date-fns";
import { Eye, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Discussion } from "@/hooks/useDiscussions";

interface DiscussionItemProps {
  discussion: Discussion;
  onClick: (id: string) => void;
}

function DiscussionItem({ discussion, onClick }: DiscussionItemProps) {
  const categoryColors: Record<string, string> = {
    general: "border-border bg-muted text-white/72",
    technical: "border-primary/20 bg-primary/10 text-primary",
    "race-specific": "border-primary/20 bg-primary/10 text-primary",
    predictions: "border-primary/20 bg-primary/10 text-primary",
    "off-topic": "border-border bg-muted text-white/72",
  };

  const categoryLabels: Record<string, string> = {
    general: "General",
    technical: "Technical",
    "race-specific": "Race specific",
    predictions: "Predictions",
    "off-topic": "Off topic",
  };

  return (
    <Card className="cursor-pointer border-border transition-colors hover:border-primary/40" onClick={() => onClick(discussion._id)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {discussion.isPinned && (
              <Badge className="mb-3 rounded-md border border-f1-warning/20 bg-f1-warning/10 text-f1-warning" variant="outline">
                Pinned
              </Badge>
            )}
            <h3 className="mb-2 line-clamp-2 text-xl font-semibold text-white">{discussion.title}</h3>
            <p className="mb-3 line-clamp-2 text-sm leading-6 text-white/60">{discussion.content}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>by {discussion.userName}</span>
              <span>·</span>
              <span>{formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
          <Badge className={`rounded-md border ${categoryColors[discussion.category]}`}>{categoryLabels[discussion.category]}</Badge>
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
