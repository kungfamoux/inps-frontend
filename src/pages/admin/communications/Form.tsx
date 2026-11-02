import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/shared/LoadingButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const communicationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["NEWSLETTER", "ANNOUNCEMENT"]),
  target: z.enum(["ALL", "PARENTS", "STAFF"]),
  announcementCategory: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

type CommunicationFormData = z.infer<typeof communicationSchema>;

export default function CommunicationForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: communication, isLoading } = useQuery({
    queryKey: ["communication", id],
    queryFn: () => adminApi.getCommunicationById(id!),
    enabled: isEdit,
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CommunicationFormData>({
    resolver: zodResolver(communicationSchema),
    defaultValues: {
      type: "NEWSLETTER",
      target: "ALL",
      status: "DRAFT",
    },
  });

  useEffect(() => {
    if (communication?.data && isEdit) {
      setValue("title", communication.data.title);
      setValue("content", communication.data.content);
      setValue("type", communication.data.type);
      setValue("target", communication.data.target);
      setValue("announcementCategory", communication.data.announcementCategory || "");
      setValue("status", communication.data.status);
    }
  }, [communication, isEdit, setValue]);

  const createMutation = useMutation({
    mutationFn: async (data: CommunicationFormData) => {
      return adminApi.createCommunication(data);
    },
    onSuccess: () => {
      toast.success("Communication created successfully");
      navigate("/admin/communications");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create communication");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CommunicationFormData) => {
      return adminApi.updateCommunication(id!, data);
    },
    onSuccess: () => {
      toast.success("Communication updated successfully");
      navigate("/admin/communications");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update communication");
    },
  });

  const onSubmit = (data: CommunicationFormData) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEdit && isLoading) {
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/admin/communications")}>
                <ArrowLeft className="size-4" />
              </Button>
              <div>
                <CardTitle>
                  {isEdit ? "Edit Communication" : "Create Communication"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isEdit ? "Update communication details" : "Create a new newsletter or announcement"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" {...register("title")} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEWSLETTER">Newsletter</SelectItem>
                          <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Target Audience *</Label>
                  <Controller
                    name="target"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All (Parents + Staff)</SelectItem>
                          <SelectItem value="PARENTS">Parents Only</SelectItem>
                          <SelectItem value="STAFF">Staff Only</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.target && <p className="text-sm text-destructive">{errors.target.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="PUBLISHED">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="announcementCategory">Category (Announcements Only)</Label>
                <Controller
                  name="announcementCategory"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">General</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                        <SelectItem value="CLASS_UPDATE">Class Update</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  {...register("content")}
                  rows={10}
                  placeholder="Enter the communication content..."
                />
                {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/communications")}
                >
                  Cancel
                </Button>
                <LoadingButton type="submit" loading={isSubmitting}>
                  {isEdit ? "Update" : "Create"} Communication
                </LoadingButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
