import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BursaryLayout } from '@/components/layout/BursaryLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { bursaryApi } from '@/lib/api/bursary';
import { ArrowLeft, Loader2, Save, Search, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAlert } from '@/contexts/alert-context';

export default function EditBill() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [term, setTerm] = useState('');
  const [scope, setScope] = useState<
    'ALL_STUDENTS' | 'BY_CLASS' | 'BY_STUDENT'
  >('ALL_STUDENTS');
  const [intakeType, setIntakeType] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [description, setDescription] = useState('');

  const { data: billData, isLoading: isLoadingBill } = useQuery({
    queryKey: ['bursary-bill', id],
    queryFn: () => bursaryApi.getBillById(id!),
    enabled: !!id,
  });

  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['bursary-classes'],
    queryFn: () => bursaryApi.getAllClasses(),
  });

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['bursary-students', studentSearch],
    queryFn: () =>
      bursaryApi.getAllStudents({ search: studentSearch, limit: 20 }),
    enabled: scope === 'BY_STUDENT' && studentSearch.length > 2,
  });

  // Load selected students for display
  const { data: selectedStudentsData } = useQuery({
    queryKey: ['bursary-selected-students', selectedStudents],
    queryFn: () => bursaryApi.getAllStudents({ page: 1, limit: 100 }),
    enabled: scope === 'BY_STUDENT' && selectedStudents.length > 0,
  });

  useEffect(() => {
    if (billData?.data) {
      const bill = billData.data;
      setName(bill.name);
      setAmount(bill.amount.toString());
      setAcademicYear(bill.academicYear);
      setTerm(bill.term); // Keep the backend format (FIRST_TERM)
      setScope(bill.scope);
      setIntakeType(bill.intakeType || '');
      setDescription(bill.description || '');

      if (bill.classes) {
        setSelectedClasses(bill.classes.map((c: any) => c.class.id));
      }

      if (bill.students) {
        setSelectedStudents(bill.students.map((s: any) => s.studentId));
      }
    }
  }, [billData]);

  const mutation = useMutation({
    mutationFn: (data: any) => bursaryApi.updateBill(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bursary-bills'] });
      queryClient.invalidateQueries({ queryKey: ['bursary-bill', id] });
      navigate('/bursary/bills');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate based on scope
    if (scope === 'BY_CLASS' && selectedClasses.length === 0) {
      showAlert('Please select at least one class', 'error');
      return;
    }

    if (scope === 'BY_STUDENT' && selectedStudents.length === 0) {
      showAlert('Please select at least one student', 'error');
      return;
    }

    const billData = {
      name,
      amount: parseFloat(amount),
      academicYear,
      term: term.toUpperCase().replace(/ /g, '_'), // Convert "First Term" to "FIRST_TERM"
      scope,
      intakeType: scope === 'ALL_STUDENTS' ? intakeType : undefined,
      classIds: scope === 'BY_CLASS' ? selectedClasses : undefined,
      studentIds: scope === 'BY_STUDENT' ? selectedStudents : undefined,
      description,
    };

    mutation.mutate(billData);
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId],
    );
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleAddStudent = (studentId: string) => {
    if (!selectedStudents.includes(studentId)) {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleRemoveStudent = (studentId: string) => {
    setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
  };

  if (isLoadingBill) {
    return (
      <BursaryLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </BursaryLayout>
    );
  }

  return (
    <BursaryLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/bursary/bills')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Bill</h1>
            <p className="text-muted-foreground mt-1">Update bill details</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bill Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Bill Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Tuition Fee 2024/2025"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₦) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="e.g., 50000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year *</Label>
                  <Input
                    id="academicYear"
                    placeholder="e.g., 2024/2025"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="term">Term *</Label>
                  <Select value={term} onValueChange={setTerm} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIRST_TERM">First Term</SelectItem>
                      <SelectItem value="SECOND_TERM">Second Term</SelectItem>
                      <SelectItem value="THIRD_TERM">Third Term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope">Scope *</Label>
                <Select
                  value={scope}
                  onValueChange={(value) =>
                    setScope(
                      value as 'ALL_STUDENTS' | 'BY_CLASS' | 'BY_STUDENT',
                    )
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_STUDENTS">All Students</SelectItem>
                    <SelectItem value="BY_CLASS">By Class</SelectItem>
                    <SelectItem value="BY_STUDENT">By Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {scope === 'ALL_STUDENTS' && (
                <div className="space-y-2">
                  <Label htmlFor="intakeType">Intake Type (Optional)</Label>
                  <Select value={intakeType} onValueChange={setIntakeType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select intake type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New Students</SelectItem>
                      <SelectItem value="CONTINUING">
                        Continuing Students
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {scope === 'BY_CLASS' && (
                <div className="space-y-2">
                  <Label>Select Classes *</Label>
                  {classesLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                      {classesData?.data?.map((cls: any) => (
                        <div key={cls.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`class-${cls.id}`}
                            checked={selectedClasses.includes(cls.id)}
                            onCheckedChange={() => handleClassToggle(cls.id)}
                          />
                          <label
                            htmlFor={`class-${cls.id}`}
                            className="cursor-pointer text-sm"
                          >
                            {cls.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {scope === 'BY_STUDENT' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentSearch">Search Students *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="studentSearch"
                        placeholder="Search by name or admission number..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStudentSearch('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Type at least 3 characters to search
                    </p>
                  </div>

                  {studentSearch.length > 2 && (
                    <div className="space-y-2">
                      <Label>Search Results</Label>
                      {studentsLoading ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                          ))}
                        </div>
                      ) : (
                        <div className="grid gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                          {studentsData?.data
                            ?.filter(
                              (student: any) =>
                                !selectedStudents.includes(
                                  student.admissionNumber,
                                ),
                            )
                            .map((student: any) => (
                              <div
                                key={student.admissionNumber}
                                className="flex items-center justify-between p-2 border rounded hover:bg-accent cursor-pointer"
                                onClick={() =>
                                  handleAddStudent(student.admissionNumber)
                                }
                              >
                                <div>
                                  <p className="font-medium text-sm">
                                    {student.firstName} {student.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {student.admissionNumber}
                                  </p>
                                </div>
                                <Button type="button" size="sm" variant="ghost">
                                  <Search className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          {studentsData?.data?.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No students found
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedStudents.length > 0 && (
                    <div className="space-y-2">
                      <Label>
                        Selected Students ({selectedStudents.length})
                      </Label>
                      <div className="grid gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                        {selectedStudents.map((studentId) => {
                          const student = selectedStudentsData?.data?.find(
                            (s: any) => s.admissionNumber === studentId,
                          );
                          return (
                            <div
                              key={studentId}
                              className="flex items-center justify-between p-2 border rounded bg-accent/50"
                            >
                              <div>
                                <p className="font-medium text-sm">
                                  {student?.firstName} {student?.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {studentId}
                                </p>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveStudent(studentId)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional description of the bill"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => navigate('/bursary/bills')}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Bill
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {mutation.error && (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to update bill. Please check your inputs and try again.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </BursaryLayout>
  );
}
