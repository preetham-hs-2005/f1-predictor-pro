import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Discussion } from "@/hooks/useDiscussions";

interface DiscussionItemProps {
  discussion: Discussion;
  onClick: (id: string) => void;
}

function DiscussionItem({ discussion, onClick }: DiscussionItemProps) {
  const categoryColors: Record<string, string> = {
    general: "bg-blue-100 text-blue-800",
    technical: "bg-purple-100 text-purple-800",
    "race-specific": "bg-red-100 text-red-800",
    predictions: "bg-green-100 text-green-800",
    "off-topic": "bg-gray-100 text-gray-800",
  };

  const categoryLabels: Record<string, string> = {
    general: "General",
    technical: "Technical",
    "race-specific": "Race Specific",
    predictions: "Predictions",
    "off-topic": "Off Topic",
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(discussion._id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {discussion.isPinned && (
              <Badge className="mb-2" variant="default">
                Pinned
              </Badge>
            )}
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600">
              {discussion.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {discussion.content}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>by {discussion.userName}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
          <Badge className={categoryColors[discussion.category]}>
            {categoryLabels[discussion.category]}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
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
