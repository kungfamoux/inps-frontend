import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { SchoolLevel, ClassStatus, UpdateClassRequest } from "@/lib/types/common";

const classSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  level: z.nativeEnum(SchoolLevel),
  status: z.nativeEnum(ClassStatus),
});

// Explicit type definition to match UpdateClassRequest
type ClassFormData = UpdateClassRequest;

export default function EditClass() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();

  const { data: classData, isLoading } = useQuery({
    queryKey: ["class", classId],
    queryFn: () => adminApi.getClassById(classId!),
    enabled: !!classId,
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
  });

  // Reset form when class data is loaded
  if (classData?.data && !isLoading) {
    const cls = classData.data;
    reset({
      name: cls.className || cls.name,
      level: cls.level,
      status: cls.status || ClassStatus.ACTIVE,
    });
  }

  const updateClassMutation = useMutation({
    mutationFn: (data: ClassFormData) => adminApi.updateClass(classId!, data),
    onSuccess: () => {
      toast.success("Class updated successfully");
      navigate("/admin/classes");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update class");
    },
  });

  const onSubmit = (data: ClassFormData) => {
    updateClassMutation.mutate(data);
  };

  if (isLoading) {
    return (
      

        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/classes")}>
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Class</h1>
              <p className="text-sm text-muted-foreground">Loading class information...</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <Loader2 className="animate-spin" />
            </CardContent>
          </Card>
        </div>
      
    );
  }

  if (!classData?.data) {
    return (
      

        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/classes")}>
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Class</h1>
              <p className="text-sm text-muted-foreground">Class not found</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Class not found</p>
            </CardContent>
          </Card>
        </div>
      
    );
  }

  return (
    

      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/classes")}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Class</h1>
            <p className="text-sm text-muted-foreground">Update class information</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Class Name *</Label>
                  <Input id="name" {...register("name")} placeholder="e.g., Primary 1" />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Controller
                    name="level"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SchoolLevel.DAYCARE}>Daycare</SelectItem>
                          <SelectItem value={SchoolLevel.PRENURSERY}>Pre-Nursery</SelectItem>
                          <SelectItem value={SchoolLevel.NURSERY_1}>Nursery 1</SelectItem>
                          <SelectItem value={SchoolLevel.NURSERY_2}>Nursery 2</SelectItem>
                          <SelectItem value={SchoolLevel.NURSERY_3}>Nursery 3</SelectItem>
                          <SelectItem value={SchoolLevel.PRIMARY_1}>Primary 1</SelectItem>
                          <SelectItem value={SchoolLevel.PRIMARY_2}>Primary 2</SelectItem>
                          <SelectItem value={SchoolLevel.PRIMARY_3}>Primary 3</SelectItem>
                          <SelectItem value={SchoolLevel.PRIMARY_4}>Primary 4</SelectItem>
                          <SelectItem value={SchoolLevel.PRIMARY_5}>Primary 5</SelectItem>
                          <SelectItem value={SchoolLevel.PRIMARY_6}>Primary 6</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.level && <p className="text-sm text-destructive">{errors.level.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ClassStatus.ACTIVE}>Active</SelectItem>
                          <SelectItem value={ClassStatus.INACTIVE}>Inactive</SelectItem>
                          <SelectItem value={ClassStatus.MERGED}>Merged</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate("/admin/classes")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Class"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    
  );
}