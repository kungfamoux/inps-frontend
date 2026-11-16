import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { SchoolLevel, CreateClassRequest } from "@/lib/types/common";

const classSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  level: z.nativeEnum(SchoolLevel),
});

// Explicit type definition to match CreateClassRequest
type ClassFormData = CreateClassRequest;

export default function AddClass() {
  const navigate = useNavigate();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      level: SchoolLevel.PRIMARY_1,
    },
  });

  const createClassMutation = useMutation({
    mutationFn: (data: ClassFormData) => adminApi.createClass(data),
    onSuccess: () => {
      toast.success("Class created successfully");
      navigate("/admin/classes");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create class");
    },
  });

  const onSubmit = (data: ClassFormData) => {
    createClassMutation.mutate(data);
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/classes")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Class</h1>
          <p className="text-sm text-muted-foreground">Create a new class</p>
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
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate("/admin/classes")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Class"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}