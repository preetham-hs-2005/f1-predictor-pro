import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface EditProfileModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileModal({ isOpen, onOpenChange }: EditProfileModalProps) {
  const { user, updateProfile } = useAuth();
  
  // Name is the only editable field
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nameInput.length < 2 || nameInput.length > 50) {
      toast.error("Name must be 2-50 characters");
      return;
    }

    setLoading(true);
    const result = await updateProfile(nameInput);
    
    if (result.success) {
      toast.success("Profile updated successfully!");
      onOpenChange(false);
    } else {
      toast.error(result.error || "Failed to update profile");
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-primary/20 bg-card">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.id}`} alt={user.name} />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="f1-heading text-xl">Edit Profile</DialogTitle>
              <DialogDescription>
                Customize how others see you on the leaderboard.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          
          <div className="space-y-2">
            <Label htmlFor="profile-username" className="text-muted-foreground">Username (Locked)</Label>
            <Input
              id="profile-username"
              value={user.username || "Not set"}
              disabled
              className="bg-background/30 text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-email" className="text-muted-foreground">Email (Locked)</Label>
            <Input
              id="profile-email"
              value={user.email}
              disabled
              className="bg-background/30 text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-name">Display Name</Label>
            <Input
              id="profile-name"
              placeholder="e.g. Lewis Hamilton"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              required
              disabled={loading}
              className="bg-background/50 focus-visible:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              2-50 characters
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
