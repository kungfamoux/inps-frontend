import { useQuery } from "@tanstack/react-query";
import { ParentLayout } from "@/components/layout/ParentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parentApi } from "@/lib/api/parent";
import { Child, Announcement } from "@/lib/types/parent";
import { useAuth } from "@/contexts/auth-context";
import { GraduationCap, Bell, UsersRound, WalletCards, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ["parent-children"],
    queryFn: () => parentApi.getMyChildren(),
  });

  const { data: announcementsData, isLoading: announcementsLoading } = useQuery({
    queryKey: ["parent-announcements"],
    queryFn: () => parentApi.getAnnouncements({ limit: 3 }),
  });

  const { data: unreadData } = useQuery({
    queryKey: ["parent-unread-announcements"],
    queryFn: () => parentApi.getUnreadAnnouncementCount(),
  });

  const { data: currentSessionData } = useQuery({
    queryKey: ["parent-current-session"],
    queryFn: () => parentApi.getCurrentSession(),
  });

  const children = childrenData?.data || [];
  const announcements = announcementsData?.data || [];
  const unreadCount = unreadData?.data?.unread || 0;
  const currentSession = currentSessionData?.data?.session || "2024/2025";

  const getDisplayName = () => {
    if (!user) return "Parent";
    if ("primaryGuardian" in user) {
      const firstName = user.primaryGuardian?.firstName || "";
      const lastName = user.primaryGuardian?.lastName || "";
      return `${firstName} ${lastName}`;
    }
    return "Parent";
  };

  return (
    <ParentLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {getDisplayName()}</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your children's education</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Children</CardTitle>
              <UsersRound className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{childrenLoading ? <Skeleton className="h-8 w-16" /> : children.length}</div>
              <p className="text-xs text-muted-foreground">Linked to your account</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadCount}</div>
              <p className="text-xs text-muted-foreground">School announcements</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Academic Session</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentSession}</div>
              <p className="text-xs text-muted-foreground">Current session</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <WalletCards className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/parent/results")}>
                View Results <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Children Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Children</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate("/parent/children")}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {childrenLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : children.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No children linked to your account
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {children.slice(0, 3).map((child: Child) => (
                  <Card key={child.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/parent/children/${child.id}`)}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{child.firstName} {child.lastName}</p>
                          <p className="text-sm text-muted-foreground truncate">{child.class?.name || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">{child.admissionNumber}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Announcements</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate("/parent/announcements")}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {announcementsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent announcements
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement: Announcement) => (
                  <div key={announcement.id} className={`p-4 rounded-lg border ${announcement.isRead ? 'bg-muted/30' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{announcement.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 whitespace-pre-wrap">{announcement.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(announcement.publishedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!announcement.isRead && (
                        <div className="ml-2 h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto flex-col py-4" onClick={() => navigate("/parent/children")}>
                <UsersRound className="h-6 w-6 mb-2" />
                <span>View Children</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4" onClick={() => navigate("/parent/results")}>
                <WalletCards className="h-6 w-6 mb-2" />
                <span>View Results</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4" onClick={() => navigate("/parent/settings")}>
                <GraduationCap className="h-6 w-6 mb-2" />
                <span>Settings</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4" onClick={() => navigate("/parent/announcements")}>
                <Bell className="h-6 w-6 mb-2" />
                <span>Announcements</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ParentLayout>
  );
}