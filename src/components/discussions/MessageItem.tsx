import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, MoreVertical, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Message } from "@/hooks/useDiscussions";

interface MessageItemProps {
  message: Message;
  currentUserId: string;
  isAdmin: boolean;
  onDelete: (messageId: string) => Promise<void>;
  onLike: (messageId: string) => Promise<void>;
}

function MessageItem({
  message,
  currentUserId,
  isAdmin,
  onDelete,
  onLike,
}: MessageItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const isAuthor = currentUserId === message.userId;
  const canDelete = isAuthor || isAdmin;
  const isCurrentUser = currentUserId === message.userId;

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      setIsDeleting(true);
      try {
        await onDelete(message._id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleLike = async () => {
    setIsLiking(true);
    try {
      await onLike(message._id);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className={`flex gap-2 py-2 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="bg-red-600 text-white">
          {message.userName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className={`flex flex-col gap-1 ${isCurrentUser ? "items-end" : ""}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-300">{message.userName}</span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isCurrentUser ? "start" : "end"}>
                <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div
          className={`max-w-xs rounded-lg px-4 py-2 break-words ${
            isCurrentUser
              ? "bg-red-600 text-white rounded-br-none"
              : "bg-gray-800 text-gray-100 rounded-bl-none"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1 text-xs transition-colors ${
              message.likes > 0
                ? "text-red-500 hover:text-red-600"
                : "text-gray-500 hover:text-red-500"
            }`}
          >
            <Heart className="h-4 w-4" fill={message.likes > 0 ? "currentColor" : "none"} />
            {message.likes > 0 && <span>{message.likes}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageItem;
