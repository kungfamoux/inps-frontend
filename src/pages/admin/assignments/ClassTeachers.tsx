import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, User, UserMinus, UserCheck } from "lucide-react";

export default function ClassTeachers() {
  const queryClient = useQueryClient();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  const { data: classes, isLoading: classesLoading, error: classesError } = useQuery({
    queryKey: ["classes"],
    queryFn: () => adminApi.getAllClasses(),
  });

  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: () => adminApi.getAllStaff(),
  });

  const assignClassTeacherMutation = useMutation({
    mutationFn: ({ classId, teacherId }: { classId: string; teacherId: string }) =>
      adminApi.assignClassTeacher(classId, teacherId),
    onSuccess: () => {
      toast.success("Class teacher assigned successfully");
      setAssignDialogOpen(false);
      setSelectedClassId("");
      setSelectedTeacherId("");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign class teacher");
    },
  });

  const removeClassTeacherMutation = useMutation({
    mutationFn: (classId: string) => adminApi.removeClassTeacher(classId),
    onSuccess: () => {
      toast.success("Class teacher removed successfully");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove class teacher");
    },
  });

  const handleAssign = () => {
    if (!selectedClassId || !selectedTeacherId) {
      toast.error("Please select both a class and a teacher");
      return;
    }
    assignClassTeacherMutation.mutate({ classId: selectedClassId, teacherId: selectedTeacherId });
  };

  const handleRemove = (classId: string) => {
    removeClassTeacherMutation.mutate(classId);
  };

  const teachers = staff?.data?.filter((s) => s.role === "TEACHER") || [];

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Class Teacher Assignments</h1>
          <p className="text-sm text-muted-foreground">Manage class teacher assignments</p>
        </div>
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" /> Assign Class Teacher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Class Teacher</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
                <Select
                  value={selectedClassId}
                  onValueChange={setSelectedClassId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.data?.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher">Teacher *</Label>
                <Select
                  value={selectedTeacherId}
                  onValueChange={setSelectedTeacherId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAssign}
                  disabled={assignClassTeacherMutation.isPending}
                >
                  {assignClassTeacherMutation.isPending ? "Assigning..." : "Assign"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          {classesLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading classes...
            </div>
          ) : classesError ? (
            <div className="text-center py-8 text-destructive">
              Failed to load classes. Please try again.
            </div>
          ) : !classes?.data || classes.data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No classes found. Create classes first to assign class teachers.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Class Teacher</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.data.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>
                        {cls.classTeacher ? (
                          <div className="flex items-center gap-2">
                            <UserCheck className="size-4 text-green-600" />
                            {cls.classTeacher.firstName} {cls.classTeacher.lastName}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <UserMinus className="size-4" />
                            Not assigned
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {cls.classTeacher && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(cls.id)}
                            disabled={removeClassTeacherMutation.isPending}
                          >
                            <User className="size-4 mr-2" /> Remove
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
