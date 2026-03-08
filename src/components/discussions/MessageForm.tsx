import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Image, X } from "lucide-react";

interface MessageFormProps {
  onSubmit: (content: string, imageUrl?: string) => Promise<void>;
  isLoading?: boolean;
}

function MessageForm({ onSubmit, isLoading = false }: MessageFormProps) {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && !selectedImage) {
      toast({
        title: "Error",
        description: "Message cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      let imageUrl: string | undefined;
      
      if (selectedImage) {
        const formData = new FormData();
        formData.append("file", selectedImage);
        
        // In a real app, upload to image service (Cloudinary, Firebase Storage, etc.)
        // For now, use data URL
        imageUrl = previewUrl || undefined;
      }

      await onSubmit(content.trim(), imageUrl);
      setContent("");
      handleRemoveImage();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-800 bg-black px-6 py-4 space-y-3 max-w-4xl mx-auto w-full flex-shrink-0">
      {previewUrl && (
        <div className="relative inline-block">
          <img src={previewUrl} alt="preview" className="h-24 w-24 rounded-lg object-cover" />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      )}
      
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || uploadingImage}
          className="text-gray-400 hover:text-red-600"
        >
          <Image className="h-5 w-5" />
        </Button>

        <Input
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading || uploadingImage}
          className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 rounded-full px-4"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as any);
            }
          }}
        />

        <Button
          type="submit"
          disabled={isLoading || uploadingImage || (!content.trim() && !selectedImage)}
          className="bg-red-600 hover:bg-red-700 rounded-full"
          size="sm"
        >
          {isLoading || uploadingImage ? (
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
