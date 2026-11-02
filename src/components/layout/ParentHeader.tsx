import { Bell, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/contexts/session-context";
import { useAuth } from "@/contexts/auth-context";
import { SchoolLogo } from "@/components/shared/SchoolLogo";
import { useQuery } from "@tanstack/react-query";
import { parentApi } from "@/lib/api/parent";
import { useNavigate } from "react-router-dom";

interface ParentHeaderProps {
  onOpenMenu: () => void;
}

export function ParentHeader({ onOpenMenu }: ParentHeaderProps) {
  const { currentSession, currentTerm, error } = useSession();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: unreadData } = useQuery({
    queryKey: ["unreadAnnouncementCount"],
    queryFn: () => parentApi.getUnreadAnnouncementCount(),
  });

  const unreadCount = unreadData?.data?.unread || 0;

  const handleSignOut = () => {
    logout();
  };

  const getUserInitials = () => {
    if (!user) return "U";
    
    // Check if user is Parent
    if ("primaryGuardian" in user) {
      const firstName = user.primaryGuardian?.firstName || "";
      const lastName = user.primaryGuardian?.lastName || "";
      if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
      }
      return firstName?.[0]?.toUpperCase() || lastName?.[0]?.toUpperCase() || "U";
    }
    
    return "U";
  };

  const getDisplayName = () => {
    if (!user) return "Parent";
    
    // Check if user is Parent
    if ("primaryGuardian" in user) {
      const firstName = user.primaryGuardian?.firstName || "";
      const lastName = user.primaryGuardian?.lastName || "";
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      }
      return firstName || lastName || "Parent";
    }
    
    return "Parent";
  };

  const userInitials = getUserInitials();
  const displayName = getDisplayName();

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur md:px-7">
      <Button variant="ghost" size="icon" onClick={onOpenMenu} className="rounded-xl lg:hidden" aria-label="Open navigation">
        <Menu className="size-5" />
      </Button>
      
      <div className="flex items-center gap-3">
        <SchoolLogo size="small" variant="full" className="hidden sm:block" forceWhiteBackground />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" className="relative rounded-xl" aria-label="Notifications" onClick={() => navigate("/parent/announcements")}>
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground ring-2 ring-card">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
        <div className="hidden text-right xl:block">
          {error ? (
            <p className="text-xs text-destructive">
              {error}
            </p>
          ) : (
            <>
              <p className="text-xs font-semibold text-foreground">
                {currentSession?.session || "No Session"}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentTerm?.term || "No Term"}
              </p>
            </>
          )}
        </div>
        <div className="hidden h-8 w-px bg-border xl:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-12 gap-2 rounded-xl px-2 hover:bg-muted">
              <Avatar className="size-9 border border-border">
                <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-left md:block">
                <span className="block text-sm font-semibold leading-4">{displayName}</span>
                <span className="text-xs font-normal text-muted-foreground">Parent</span>
              </span>
              <ChevronDown className="hidden size-4 text-muted-foreground md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg" onClick={() => window.location.href = "/parent/settings"}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg text-destructive" onClick={handleSignOut}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}