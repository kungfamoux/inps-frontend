import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash2, Send, FileText, Megaphone, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function CommunicationDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: communication, isLoading, error, refetch } = useQuery({
    queryKey: ["communication", id],
    queryFn: () => adminApi.getCommunicationById(id!),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return adminApi.deleteCommunication(id!);
    },
    onSuccess: () => {
      toast.success("Communication deleted successfully");
      navigate("/admin/communications");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete communication");
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      return adminApi.publishCommunication(id!);
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
    mutationFn: async () => {
      return adminApi.sendCommunication(id!);
    },
    onSuccess: () => {
      toast.success("Communication sent successfully");
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send communication");
    },
  });

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this communication?")) return;
    deleteMutation.mutate();
  };

  const handlePublish = async () => {
    if (!window.confirm("Are you sure you want to publish this communication?")) return;
    publishMutation.mutate();
  };

  const handleSend = async () => {
    if (!window.confirm("Are you sure you want to send this communication via email?")) return;
    sendMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !communication?.data) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Communication not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const comm = communication.data;

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/admin/communications")}>
                  <ArrowLeft className="size-4" />
                </Button>
                <div>
                  <CardTitle>{comm.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">Communication Details</p>
                </div>
              </div>
              <div className="flex gap-2">
                {getTypeBadge(comm.type)}
                {getStatusBadge(comm.status)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(`/admin/communications/${id}/edit`)}>
                <Edit className="size-4 mr-2" /> Edit
              </Button>
              {comm.status === "DRAFT" && (
                <Button variant="outline" onClick={handlePublish}>
                  <FileText className="size-4 mr-2" /> Publish
                </Button>
              )}
              {!comm.sentAt && (
                <Button onClick={handleSend}>
                  <Send className="size-4 mr-2" /> Send
                </Button>
              )}
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="size-4 mr-2" /> Delete
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Target Audience</p>
                <p className="font-medium">{comm.target}</p>
              </div>
              {comm.announcementCategory && (
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{comm.announcementCategory}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Published Date</p>
                <p className="font-medium">
                  {comm.publishedAt ? new Date(comm.publishedAt).toLocaleString() : "Not published"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sent Date</p>
                <p className="font-medium">
                  {comm.sentAt ? new Date(comm.sentAt).toLocaleString() : "Not sent"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Content</p>
              <div className="rounded-lg border p-4 bg-muted/50 whitespace-pre-wrap">
                {comm.content}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Created: {new Date(comm.createdAt).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
