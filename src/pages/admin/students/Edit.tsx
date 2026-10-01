import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/shared/LoadingButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Gender } from "@/lib/types/common";
import { NIGERIAN_STATES, getLGAsByState } from "@/lib/data/nigeria-states";

const guardianSchema = z.object({
  relationship: z.string().min(1, "Relationship is required"),
  title: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().or(z.literal("")).optional(),
  email: z.string().email("Invalid email address").or(z.literal("")).optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
});

const studentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().min(1, "Middle name is required"),
  gender: z.nativeEnum(Gender),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  admissionDate: z.string().min(1, "Admission date is required"),
  nationality: z.string().min(1, "Nationality is required"),
  state: z.string().min(1, "State is required"),
  lga: z.string().min(1, "LGA is required"),
  religion: z.string().min(1, "Religion is required"),
  healthInfo: z.string().min(1, "Health info is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  sportHouse: z.string().min(1, "Sport house is required"),
  studentType: z.string().min(1, "Student type is required"),
  address: z.string().min(1, "Address is required"),
  accountEmail: z.string().email("Invalid email address"),
  accountPhone: z.string().min(1, "Phone number is required"),
  primaryGuardian: guardianSchema,
});

type StudentFormData = z.infer<typeof studentSchema>;

interface CollapsibleSection {
  personal: boolean;
  additional: boolean;
  account: boolean;
  guardian: boolean;
  files: boolean;
}

export default function EditStudent() {
  const navigate = useNavigate();
  const { admissionNumber } = useParams<{ admissionNumber: string }>();
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [selectedState, setSelectedState] = useState("");
  
  // Collapsible sections state
  const [sections, setSections] = useState<CollapsibleSection>({
    personal: true,
    additional: false,
    account: false,
    guardian: false,
    files: false,
  });

  const toggleSection = (section: keyof CollapsibleSection) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const expandAll = () => {
    setSections({
      personal: true,
      additional: true,
      account: true,
      guardian: true,
      files: true,
    });
  };

  const collapseAll = () => {
    setSections({
      personal: true,
      additional: false,
      account: false,
      guardian: false,
      files: false,
    });
  };

  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ["student", admissionNumber],
    queryFn: () => adminApi.getStudentByAdmissionNumber(admissionNumber!),
    enabled: !!admissionNumber,
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      gender: Gender.MALE,
      primaryGuardian: {
        relationship: "Father",
        title: "Mr.",
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        occupation: "",
      },
    },
  });

  useEffect(() => {
    if (student?.data) {
      setValue("firstName", student.data.firstName);
      setValue("lastName", student.data.lastName);
      setValue("middleName", student.data.middleName || "");
      setValue("gender", student.data.gender);
      setValue("dateOfBirth", student.data.dateOfBirth?.split("T")[0] || "");
      setValue("admissionDate", student.data.admissionDate?.split("T")[0] || "");
      setValue("nationality", student.data.nationality || "");
      setValue("state", student.data.state || "");
      setValue("lga", student.data.lga || "");
      setValue("religion", student.data.religion || "");
      setValue("healthInfo", student.data.healthInfo || "");
      setValue("bloodGroup", student.data.bloodGroup || "");
      setValue("sportHouse", student.data.sportHouse || "");
      setValue("studentType", student.data.studentType || "");
      setValue("address", student.data.address || "");
      
      // Account credentials
      if (student.data.parent) {
        setValue("accountEmail", student.data.parent.accountEmail);
        setValue("accountPhone", student.data.parent.accountPhone);
        
        // Parse guardian data
        if (student.data.parent.primaryGuardian) {
          try {
            const primaryGuardian = typeof student.data.parent.primaryGuardian === 'string'
              ? JSON.parse(student.data.parent.primaryGuardian)
              : student.data.parent.primaryGuardian;
            setValue("primaryGuardian", primaryGuardian);
          } catch (e) {
            console.error("Failed to parse primary guardian data:", e);
          }
        }
      }
      
      if (student.data.state) {
        setSelectedState(student.data.state);
      }
    }
  }, [student, setValue]);

  const updateStudentMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const formData = new FormData();

      // Student data
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("middleName", data.middleName || "");
      formData.append("gender", data.gender);
      formData.append("dateOfBirth", data.dateOfBirth);
      formData.append("admissionDate", data.admissionDate);
      formData.append("nationality", data.nationality);
      formData.append("state", data.state);
      formData.append("lga", data.lga);
      formData.append("religion", data.religion);
      formData.append("healthInfo", data.healthInfo);
      formData.append("bloodGroup", data.bloodGroup);
      formData.append("sportHouse", data.sportHouse);
      formData.append("studentType", data.studentType);
      formData.append("address", data.address);
      formData.append("status", "ACTIVE");

      // Account credentials
      formData.append("accountEmail", data.accountEmail);
      formData.append("accountPhone", data.accountPhone);

      if (passportPhoto) {
        formData.append("passportPhoto", passportPhoto);
      }

      // Parent data
      const parentData: any = {
        primaryGuardian: data.primaryGuardian,
        address: data.address || null,
      };

      formData.append("parentData", JSON.stringify(parentData));

      return adminApi.updateStudent(admissionNumber!, formData);
    },
    onSuccess: () => {
      toast.success("Student updated successfully");
      // Refetch student data to show updated parent information
      window.location.reload();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update student");
    },
  });

  const onSubmit = (data: StudentFormData) => {
    if (updateStudentMutation.isPending) return;
    updateStudentMutation.mutate(data);
  };

  const SectionHeader = ({ title, sectionKey }: { title: string; sectionKey: keyof CollapsibleSection }) => (
    <div 
      className="flex items-center justify-between cursor-pointer py-2"
      onClick={() => toggleSection(sectionKey)}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      {sections[sectionKey] ? (
        <ChevronUp className="size-4" />
      ) : (
        <ChevronDown className="size-4" />
      )}
    </div>
  );

  if (studentLoading) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/students")}>
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Student</h1>
              <p className="text-sm text-muted-foreground">Loading student information...</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (!student?.data) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/students")}>
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Student</h1>
              <p className="text-sm text-muted-foreground">Student not found</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Student not found</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/students")}>
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Student</h1>
              <p className="text-sm text-muted-foreground">
                {student.data.firstName} {student.data.lastName} ({student.data.admissionNumber})
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4 border-t pt-4">
                <SectionHeader title="Personal Information" sectionKey="personal" />
                {sections.personal && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" {...register("firstName")} />
                      {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" {...register("lastName")} />
                      {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="middleName">Middle Name *</Label>
                      <Input id="middleName" {...register("middleName")} />
                      {errors.middleName && <p className="text-sm text-destructive">{errors.middleName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={Gender.MALE}>Male</SelectItem>
                              <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                      {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admissionDate">Admission Date *</Label>
                      <Input id="admissionDate" type="date" {...register("admissionDate")} />
                      {errors.admissionDate && <p className="text-sm text-destructive">{errors.admissionDate.message}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="space-y-4 border-t pt-4">
                <SectionHeader title="Additional Information" sectionKey="additional" />
                {sections.additional && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality *</Label>
                      <Input id="nationality" {...register("nationality")} />
                      {errors.nationality && <p className="text-sm text-destructive">{errors.nationality.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Controller
                        name="state"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedState(value);
                            }}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {NIGERIAN_STATES.map((state) => (
                                <SelectItem key={state.name} value={state.name}>
                                  {state.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lga">LGA *</Label>
                      <Controller
                        name="lga"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!selectedState}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  selectedState
                                    ? "Select LGA"
                                    : "Select state first"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedState &&
                                getLGAsByState(selectedState).map((lga) => (
                                  <SelectItem key={lga} value={lga}>
                                    {lga}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.lga && <p className="text-sm text-destructive">{errors.lga.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="religion">Religion *</Label>
                      <Controller
                        name="religion"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select religion" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Christianity">Christianity</SelectItem>
                              <SelectItem value="Islam">Islam</SelectItem>
                              <SelectItem value="Traditional">Traditional</SelectItem>
                              <SelectItem value="Others">Others</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.religion && <p className="text-sm text-destructive">{errors.religion.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="healthInfo">Health Info *</Label>
                      <Input id="healthInfo" {...register("healthInfo")} />
                      {errors.healthInfo && <p className="text-sm text-destructive">{errors.healthInfo.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup">Blood Group *</Label>
                      <Controller
                        name="bloodGroup"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood group" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="AB+">AB+</SelectItem>
                              <SelectItem value="AB-">AB-</SelectItem>
                              <SelectItem value="O+">O+</SelectItem>
                              <SelectItem value="O-">O-</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.bloodGroup && <p className="text-sm text-destructive">{errors.bloodGroup.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentType">Student Type *</Label>
                      <Controller
                        name="studentType"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select student type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Day">Day</SelectItem>
                              <SelectItem value="Boarding">Boarding</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.studentType && <p className="text-sm text-destructive">{errors.studentType.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sportHouse">Sport House *</Label>
                      <Controller
                        name="sportHouse"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select sport house" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Red">Red</SelectItem>
                              <SelectItem value="Blue">Blue</SelectItem>
                              <SelectItem value="Green">Green</SelectItem>
                              <SelectItem value="Yellow">Yellow</SelectItem>
                              <SelectItem value="Purple">Purple</SelectItem>
                              <SelectItem value="Orange">Orange</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.sportHouse && <p className="text-sm text-destructive">{errors.sportHouse.message}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input id="address" {...register("address")} />
                      {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Account Information */}
              <div className="space-y-4 border-t pt-4">
                <SectionHeader title="Account Information" sectionKey="account" />
                {sections.account && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      These credentials are used for the parent portal login. Changes affect Firebase authentication for all children of this parent.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="accountEmail">Account Email *</Label>
                        <Input id="accountEmail" type="email" {...register("accountEmail")} />
                        {errors.accountEmail && <p className="text-sm text-destructive">{errors.accountEmail.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountPhone">Account Phone *</Label>
                        <Input id="accountPhone" {...register("accountPhone")} />
                        {errors.accountPhone && <p className="text-sm text-destructive">{errors.accountPhone.message}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Guardian */}
              <div className="space-y-4 border-t pt-4">
                <SectionHeader title="Primary Guardian (Account Holder)" sectionKey="guardian" />
                {sections.guardian && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      This guardian receives portal login credentials, invoices, and SMS alerts.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="primaryGuardian.relationship">Relationship *</Label>
                        <Controller
                          name="primaryGuardian.relationship"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select relationship" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Father">Father</SelectItem>
                                <SelectItem value="Mother">Mother</SelectItem>
                                <SelectItem value="Guardian">Guardian</SelectItem>
                                <SelectItem value="Uncle">Uncle</SelectItem>
                                <SelectItem value="Aunt">Aunt</SelectItem>
                                <SelectItem value="Grandparent">Grandparent</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.primaryGuardian?.relationship && (
                          <p className="text-sm text-destructive">{errors.primaryGuardian.relationship.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="primaryGuardian.title">Title</Label>
                        <Controller
                          name="primaryGuardian.title"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select title" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Mr.">Mr.</SelectItem>
                                <SelectItem value="Mrs.">Mrs.</SelectItem>
                                <SelectItem value="Ms.">Ms.</SelectItem>
                                <SelectItem value="Dr.">Dr.</SelectItem>
                                <SelectItem value="Chief">Chief</SelectItem>
                                <SelectItem value="Engr.">Engr.</SelectItem>
                                <SelectItem value="Pastor">Pastor</SelectItem>
                                <SelectItem value="Imam">Imam</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="primaryGuardian.firstName">First Name *</Label>
                        <Input id="primaryGuardian.firstName" {...register("primaryGuardian.firstName")} />
                        {errors.primaryGuardian?.firstName && (
                          <p className="text-sm text-destructive">{errors.primaryGuardian.firstName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="primaryGuardian.lastName">Last Name *</Label>
                        <Input id="primaryGuardian.lastName" {...register("primaryGuardian.lastName")} />
                        {errors.primaryGuardian?.lastName && (
                          <p className="text-sm text-destructive">{errors.primaryGuardian.lastName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="primaryGuardian.phone">Phone</Label>
                        <Input id="primaryGuardian.phone" {...register("primaryGuardian.phone")} />
                        {errors.primaryGuardian?.phone && (
                          <p className="text-sm text-destructive">{errors.primaryGuardian.phone.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="primaryGuardian.email">Email</Label>
                        <Input id="primaryGuardian.email" type="email" {...register("primaryGuardian.email")} />
                        {errors.primaryGuardian?.email && (
                          <p className="text-sm text-destructive">{errors.primaryGuardian.email.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="primaryGuardian.occupation">Occupation</Label>
                        <Input id="primaryGuardian.occupation" {...register("primaryGuardian.occupation")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="primaryGuardian.address">Address</Label>
                        <Input id="primaryGuardian.address" {...register("primaryGuardian.address")} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* File Upload Section */}
              <div className="space-y-4 border-t pt-4">
                <SectionHeader title="File Upload" sectionKey="files" />
                {sections.files && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="passportPhoto">Passport Photo</Label>
                      <Input
                        id="passportPhoto"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPassportPhoto(e.target.files?.[0] || null)}
                      />
                      {student.data.passportPhoto && (
                        <p className="text-sm text-muted-foreground">
                          Current: {student.data.passportPhoto}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate("/admin/students")}>
                  Cancel
                </Button>
                <LoadingButton
                  type="submit"
                  loading={isSubmitting || updateStudentMutation.isPending}
                  loadingText="Updating..."
                >
                  Update Student
                </LoadingButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}