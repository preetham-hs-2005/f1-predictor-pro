import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Trophy, LayoutDashboard, LogOut, Menu, Flag, Shield, History, MessageCircle, FlagTriangleRight, UserCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditProfileModal } from "@/components/profile/EditProfileModal";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/results", label: "Results", icon: FlagTriangleRight },
  { to: "/predictions", label: "History", icon: History },
  { to: "/discussions", label: "Discussions", icon: MessageCircle },
];

const adminNavItem = { to: "/admin", label: "Admin", icon: Shield };

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="racing-stripe" />
      <div className="container flex h-16 items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-primary" />
          <span className="f1-heading text-lg">
            <span className="text-gradient-f1">F1</span>{" "}
            <span className="text-foreground">Predict</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}>
              <Button
                variant={location.pathname === item.to ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link to={adminNavItem.to}>
              <Button
                variant={location.pathname === adminNavItem.to ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <adminNavItem.icon className="h-4 w-4" />
                {adminNavItem.label}
              </Button>
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none rounded-full ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-transform hover:scale-105">
                <Avatar className="h-10 w-10 border border-border/50 bg-background/50">
                  <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.id}`} alt={user.name} />
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setProfileOpen(true)} className="cursor-pointer">
                  <UserCircle className="h-4 w-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:bg-destructive/10">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {!user && (
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          )}
        </div>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-card border-border w-64">
            <div className="flex flex-col gap-4 mt-8">
              {user && (
                <p className="text-sm text-muted-foreground px-2">{user.name}</p>
              )}
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
                  <Button
                    variant={location.pathname === item.to ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              {user?.role === "admin" && (
                <Link to={adminNavItem.to} onClick={() => setOpen(false)}>
                  <Button
                    variant={location.pathname === adminNavItem.to ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <adminNavItem.icon className="h-4 w-4" />
                    {adminNavItem.label}
                  </Button>
                </Link>
              )}
              <Button variant="ghost" onClick={logout} className="justify-start gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <EditProfileModal isOpen={profileOpen} onOpenChange={setProfileOpen} />
    </header>
  );
};

export default Navbar;
