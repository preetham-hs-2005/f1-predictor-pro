import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { History, LayoutDashboard, LogOut, Menu, MessageCircle, FlagTriangleRight, Shield, Trophy, UserCircle } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
import { BrandMark } from "@/components/layout/BrandMark";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/results", label: "Results", icon: FlagTriangleRight },
  { to: "/predictions", label: "History", icon: History },
  { to: "/discussions", label: "Discussions", icon: MessageCircle },
];

const adminNavItem = { to: "/admin", label: "Admin", icon: Shield };

const navButtonClass = (active: boolean) =>
  cn(
    "rounded-full border px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-all",
    active
      ? "border-primary/40 bg-primary/18 text-white shadow-[0_10px_30px_rgba(255,105,61,0.2)]"
      : "border-transparent bg-transparent text-white/62 hover:border-white/10 hover:bg-white/[0.05] hover:text-white",
  );

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 md:px-6">
        <div className="glass-strong mx-auto flex max-w-7xl items-center gap-4 rounded-[1.75rem] px-4 py-3 md:px-5">
          <div className="shrink-0">
            <BrandMark to="/dashboard" />
          </div>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className={navButtonClass(location.pathname === item.to)}>
                <span className="flex items-center gap-2">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </span>
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link to={adminNavItem.to} className={navButtonClass(location.pathname === adminNavItem.to)}>
                <span className="flex items-center gap-2">
                  <adminNavItem.icon className="h-3.5 w-3.5" />
                  {adminNavItem.label}
                </span>
              </Link>
            )}
          </nav>

          <div className="ml-auto hidden shrink-0 items-center xl:flex">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full focus:outline-none ring-offset-background transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Avatar className="h-11 w-11 border border-white/10 bg-white/[0.04]">
                    <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.id}`} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 rounded-[1.25rem] border-white/10 bg-[rgba(10,16,29,0.95)] backdrop-blur-2xl" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none text-white">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setProfileOpen(true)} className="cursor-pointer rounded-xl">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer rounded-xl text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="xl:hidden">
              <Button variant="glass" size="icon" className="ml-auto">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-sm">
              <div className="mt-8 flex flex-col gap-6">
                <BrandMark to="/dashboard" />
                {user && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.24em] text-white/40">Signed in as</p>
                    <p className="mt-2 text-base font-semibold text-white">{user.name}</p>
                    <p className="text-sm text-white/55">{user.email}</p>
                  </div>
                )}
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="block">
                      <div className={navButtonClass(location.pathname === item.to) + " w-full rounded-2xl px-4 py-3"}>
                        <span className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {user?.role === "admin" && (
                    <Link to={adminNavItem.to} onClick={() => setOpen(false)} className="block">
                      <div className={navButtonClass(location.pathname === adminNavItem.to) + " w-full rounded-2xl px-4 py-3"}>
                        <span className="flex items-center gap-3">
                          <adminNavItem.icon className="h-4 w-4" />
                          {adminNavItem.label}
                        </span>
                      </div>
                    </Link>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="glass" className="flex-1" onClick={() => setProfileOpen(true)}>
                    <UserCircle className="h-4 w-4" />
                    Profile
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <EditProfileModal isOpen={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
};

export default Navbar;
