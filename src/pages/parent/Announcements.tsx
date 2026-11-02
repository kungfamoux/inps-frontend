import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { parentApi } from "@/lib/api/parent";
import { ParentLayout } from "@/components/layout/ParentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ParentAnnouncements() {
  const [category, setCategory] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: announcements, isLoading, refetch } = useQuery({
    queryKey: ["announcements", page, category],
    queryFn: () => {
      const params: any = { page, limit };
      if (category) params.category = category;
      return parentApi.getAnnouncements(params);
    },
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["unreadAnnouncementCount"],
    queryFn: () => parentApi.getUnreadAnnouncementCount(),
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      return parentApi.markAnnouncementAsRead(announcementId);
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark as read");
    },
  });

  const handleMarkAsRead = (announcementId: string) => {
    markAsReadMutation.mutate(announcementId);
  };

  const getCategoryBadge = (cat: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      GENERAL: "default",
      URGENT: "destructive",
      CLASS_UPDATE: "secondary",
    };
    return <Badge variant={variants[cat] || "secondary"}>{cat}</Badge>;
  };

  return (
    <ParentLayout>
      <div className="mx-auto max-w-[1200px] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
            <p className="text-sm text-muted-foreground">
              Stay updated with school news and important information
            </p>
          </div>
          {unreadCount && (
            <div className="flex items-center gap-2 text-sm">
              <Bell className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {unreadCount.unread} unread of {unreadCount.total}
              </span>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Announcements</CardTitle>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                <option value="GENERAL">General</option>
                <option value="URGENT">Urgent</option>
                <option value="CLASS_UPDATE">Class Updates</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : announcements?.data?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No announcements at this time.
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {announcements.data.map((announcement: any) => (
                    <div
                      key={announcement.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        announcement.isRead ? "bg-muted/30" : "bg-white hover:bg-primary/5"
                      }`}
                      onClick={() => !announcement.isRead && handleMarkAsRead(announcement.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {!announcement.isRead && (
                              <div className="size-2 rounded-full bg-blue-500" />
                            )}
                            {announcement.announcementCategory && getCategoryBadge(announcement.announcementCategory)}
                            <span className="text-xs text-muted-foreground">
                              {new Date(announcement.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
                        </div>
                        {announcement.isRead && (
                          <Check className="size-5 text-green-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {announcements.meta && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted-foreground">
                      Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, announcements.meta.total)} of {announcements.meta.total} announcements
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= announcements.meta.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ParentLayout>
  );
}
