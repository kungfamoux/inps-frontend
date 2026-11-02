import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Send, FileText, Megaphone, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function CommunicationsList() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["communications", page, filterType, filterStatus],
    queryFn: () => {
      const params: any = { page, limit };
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      return adminApi.getAllCommunications(params);
    },
  });

  const communications = data?.data || [];
  const pagination = data?.meta;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApi.deleteCommunication(id);
    },
    onSuccess: () => {
      toast.success("Communication deleted successfully");
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete communication");
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApi.publishCommunication(id);
    },
    onSuccess: () => {
      toast.success("Communication published successfully");
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to publish communication");
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApi.sendCommunication(id);
    },
    onSuccess: () => {
      toast.success("Communication sent successfully");
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send communication");
    },
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this communication?")) return;
    deleteMutation.mutate(id);
  };

  const handlePublish = async (id: string) => {
    if (!window.confirm("Are you sure you want to publish this communication?")) return;
    publishMutation.mutate(id);
  };

  const handleSend = async (id: string) => {
    if (!window.confirm("Are you sure you want to send this communication via email?")) return;
    sendMutation.mutate(id);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      DRAFT: "secondary",
      PUBLISHED: "default",
      ARCHIVED: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const color = type === "ANNOUNCEMENT" ? "text-blue-600" : "text-green-600";
    const Icon = type === "ANNOUNCEMENT" ? Megaphone : FileText;
    return (
      <div className="flex items-center gap-2">
        <Icon className={`size-4 ${color}`} />
        <span className={color}>{type}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Communications</CardTitle>
                <p className="text-sm text-muted-foreground">Manage newsletters and announcements</p>
              </div>
              <div className="flex gap-2">
                <Button className="gap-2" onClick={() => navigate("/admin/communications/add")}>
                  <Plus className="size-4" /> Create Communication
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mt-4">
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="NEWSLETTER">Newsletter</option>
                  <option value="ANNOUNCEMENT">Announcement</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                Failed to load communications. Please try again.
              </div>
            ) : communications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No communications found. Create your first communication.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="h-11 text-xs uppercase tracking-wider">Title</TableHead>
                        <TableHead className="h-11 text-xs uppercase tracking-wider">Type</TableHead>
                        <TableHead className="h-11 text-xs uppercase tracking-wider">Target</TableHead>
                        <TableHead className="h-11 text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="h-11 text-xs uppercase tracking-wider">Published</TableHead>
                        <TableHead className="h-11 text-xs uppercase tracking-wider">Sent</TableHead>
                        <TableHead className="h-11 text-right text-xs uppercase tracking-wider">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {communications.map((comm: any) => (
                        <TableRow key={comm.id} className="hover:bg-primary/5">
                          <TableCell className="font-medium">{comm.title}</TableCell>
                          <TableCell>{getTypeBadge(comm.type)}</TableCell>
                          <TableCell className="text-muted-foreground">{comm.target}</TableCell>
                          <TableCell>{getStatusBadge(comm.status)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {comm.publishedAt ? new Date(comm.publishedAt).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {comm.sentAt ? new Date(comm.sentAt).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-lg border border-transparent text-muted-foreground hover:border-border hover:bg-background hover:text-foreground"
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/admin/communications/${comm.id}`)}>
                                  <Eye className="mr-2 size-4" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/admin/communications/${comm.id}/edit`)}>
                                  <Pencil className="mr-2 size-4" /> Edit
                                </DropdownMenuItem>
                                {comm.status === "DRAFT" && (
                                  <DropdownMenuItem onClick={() => handlePublish(comm.id)}>
                                    <FileText className="mr-2 size-4" /> Publish
                                  </DropdownMenuItem>
                                )}
                                {!comm.sentAt && (
                                  <DropdownMenuItem onClick={() => handleSend(comm.id)}>
                                    <Send className="mr-2 size-4" /> Send
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDelete(comm.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 size-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {pagination && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} communications
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
                        disabled={page >= pagination.totalPages}
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
    </div>
  );
}
