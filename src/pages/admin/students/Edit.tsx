import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, Loader2, ArrowRight, ChevronDown, ChevronUp, Plus, Trash2, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Gender, StudentStatus } from "@/lib/types/common";
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

const secondaryGuardianSchema = z.object({
  relationship: z.string().min(1, "Relationship is required"),
  title: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  occupation: z.string().min(1, "Occupation is required"),
  address: z.string().min(1, "Address is required"),
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
  status: z.nativeEnum(StudentStatus),
  accountEmail: z.string().email("Invalid email address"),
  accountPhone: z.string().min(1, "Phone number is required"),
  primaryGuardian: guardianSchema,
  secondaryGuardian: secondaryGuardianSchema.optional(),
  maritalStatus: z
    .enum(["MARRIED", "SINGLE", "DIVORCED", "WIDOWED", "SEPARATED"])
    .optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface CollapsibleSection {
  personal: boolean;
  additional: boolean;
  account: boolean;
  guardian: boolean;
  secondaryGuardian: boolean;
  transfer: boolean;
  files: boolean;
}

export default function EditStudent() {
  const navigate = useNavigate();
  const { admissionNumber } = useParams<{ admissionNumber: string }>();
  const [showTransfer, setShowTransfer] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [transferMode, setTransferMode] = useState<"section" | "class">("section");
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [selectedState, setSelectedState] = useState("");
  const [showSecondaryGuardian, setShowSecondaryGuardian] = useState(false);
  
  // Collapsible sections state
  const [sections, setSections] = useState<CollapsibleSection>({
    personal: true,
    additional: false,
    account: false,
    guardian: false,
    secondaryGuardian: false,
    transfer: false,
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
      secondaryGuardian: showSecondaryGuardian,
      transfer: true,
      files: true,
    });
  };

  const collapseAll = () => {
    setSections({
      personal: true,
      additional: false,
      account: false,
      guardian: false,
      secondaryGuardian: false,
      transfer: false,
      files: false,
    });
  };

  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ["student", admissionNumber],
    queryFn: () => adminApi.getStudentByAdmissionNumber(admissionNumber!),
    enabled: !!admissionNumber,
  });

  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: () => adminApi.getAllClassesWithSections(),
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
      setValue("status", student.data.status);
      
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
        
        if (student.data.parent.secondaryGuardian) {
          try {
            const secondaryGuardian = typeof student.data.parent.secondaryGuardian === 'string'
              ? JSON.parse(student.data.parent.secondaryGuardian)
              : student.data.parent.secondaryGuardian;
            setValue("secondaryGuardian", secondaryGuardian);
            setShowSecondaryGuardian(true);
          } catch (e) {
            console.error("Failed to parse secondary guardian data:", e);
          }
        }
        
        setValue("maritalStatus", student.data.parent.maritalStatus || undefined);
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
      formData.append("status", data.status);

      // Account credentials
      formData.append("accountEmail", data.accountEmail);
      formData.append("accountPhone", data.accountPhone);

      if (passportPhoto) {
        formData.append("passportPhoto", passportPhoto);
      }

      // Parent data
      const parentData: any = {
        primaryGuardian: data.primaryGuardian,
        secondaryGuardian: data.secondaryGuardian || null,
        address: data.address || null,
        maritalStatus: data.maritalStatus || null,
      };

      formData.append("parentData", JSON.stringify(parentData));

      return adminApi.updateStudent(admissionNumber!, formData);
    },
    onSuccess: () => {
      toast.success("Student updated successfully");
      navigate("/admin/students");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update student");
    },
  });

  const onSubmit = (data: StudentFormData) => {
    updateStudentMutation.mutate(data);
  };

  const transferMutation = useMutation({
    mutationFn: ({ sectionId, classId }: { sectionId: string; classId?: string }) => {
      const enrollmentId = student.data.enrollments?.[0]?.id;
      if (!enrollmentId) {
        throw new Error("No active enrollment found for this student");
      }
      
      if (transferMode === "class" && classId) {
        return adminApi.transferStudentWithClass(enrollmentId, classId, sectionId);
      } else {
        return adminApi.transferStudent(enrollmentId, sectionId);
      }
    },
    onSuccess: () => {
      toast.success("Student transferred successfully");
      setShowTransfer(false);
      setSelectedSection("");
      setSelectedClass("");
      setTransferMode("section");
      window.location.reload();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to transfer student");
    },
  });

  const addSecondaryGuardian = () => {
    setShowSecondaryGuardian(true);
    setValue("secondaryGuardian", {
      relationship: "Mother",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      occupation: "",
    });
  };

  const removeSecondaryGuardian = () => {
    setShowSecondaryGuardian(false);
    setValue("secondaryGuardian", undefined);
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
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={StudentStatus.ACTIVE}>Active</SelectItem>
                              <SelectItem value={StudentStatus.GRADUATED}>Graduated</SelectItem>
                              <SelectItem value={StudentStatus.WITHDRAWN}>Withdrawn</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
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

              {/* Secondary Guardian */}
              <div className="space-y-4 border-t pt-4">
                <SectionHeader title="Secondary Guardian" sectionKey="secondaryGuardian" />
                {sections.secondaryGuardian && (
                  <div className="space-y-4">
                    {!showSecondaryGuardian ? (
                      <Button type="button" variant="outline" onClick={addSecondaryGuardian} className="gap-2">
                        <Plus className="size-4" />
                        Add Secondary Guardian
                      </Button>
                    ) : (
                      <>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="secondaryGuardian.relationship">Relationship *</Label>
                            <Controller
                              name="secondaryGuardian.relationship"
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
                            {errors.secondaryGuardian?.relationship && (
                              <p className="text-sm text-destructive">{errors.secondaryGuardian.relationship.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="secondaryGuardian.title">Title</Label>
                            <Controller
                              name="secondaryGuardian.title"
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
                            <Label htmlFor="secondaryGuardian.firstName">First Name *</Label>
                            <Input id="secondaryGuardian.firstName" {...register("secondaryGuardian.firstName")} />
                            {errors.secondaryGuardian?.firstName && (
                              <p className="text-sm text-destructive">{errors.secondaryGuardian.firstName.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="secondaryGuardian.lastName">Last Name *</Label>
                            <Input id="secondaryGuardian.lastName" {...register("secondaryGuardian.lastName")} />
                            {errors.secondaryGuardian?.lastName && (
                              <p className="text-sm text-destructive">{errors.secondaryGuardian.lastName.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="secondaryGuardian.phone">Phone *</Label>
                            <Input id="secondaryGuardian.phone" {...register("secondaryGuardian.phone")} />
                            {errors.secondaryGuardian?.phone && (
                              <p className="text-sm text-destructive">{errors.secondaryGuardian.phone.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="secondaryGuardian.email">Email *</Label>
                            <Input id="secondaryGuardian.email" type="email" {...register("secondaryGuardian.email")} />
                            {errors.secondaryGuardian?.email && (
                              <p className="text-sm text-destructive">{errors.secondaryGuardian.email.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="secondaryGuardian.occupation">Occupation *</Label>
                            <Input id="secondaryGuardian.occupation" {...register("secondaryGuardian.occupation")} />
                            {errors.secondaryGuardian?.occupation && (
                              <p className="text-sm text-destructive">{errors.secondaryGuardian.occupation.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="secondaryGuardian.address">Address *</Label>
                            <Input id="secondaryGuardian.address" {...register("secondaryGuardian.address")} />
                            {errors.secondaryGuardian?.address && (
                              <p className="text-sm text-destructive">{errors.secondaryGuardian.address.message}</p>
                            )}
                          </div>
                        </div>
                        <Button type="button" variant="outline" onClick={removeSecondaryGuardian} className="gap-2">
                          <Trash2 className="size-4" />
                          Remove Secondary Guardian
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Marital Status */}
              <div className="space-y-4 border-t pt-4">
                <SectionHeader title="Marital Status" sectionKey="guardian" />
                {sections.guardian && (
                  <div className="space-y-2">
                    <Controller
                      name="maritalStatus"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select marital status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MARRIED">Married</SelectItem>
                            <SelectItem value="SINGLE">Single</SelectItem>
                            <SelectItem value="DIVORCED">Divorced</SelectItem>
                            <SelectItem value="WIDOWED">Widowed</SelectItem>
                            <SelectItem value="SEPARATED">Separated</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Transfer Section */}
              <div className="space-y-4 border-t pt-4">
                <SectionHeader title="Transfer Student" sectionKey="transfer" />
                {sections.transfer && (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Current Class</Label>
                        <div className="text-sm bg-muted p-2 rounded">
                          {student.data.enrollments?.[0]?.class?.name || "Not enrolled"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Current Section</Label>
                        <div className="text-sm bg-muted p-2 rounded">
                          {student.data.enrollments?.[0]?.section?.name || "Not assigned"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                      <AlertTriangle className="size-4" />
                      <span>Transfers are only allowed within the same academic year and term.</span>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowTransfer(!showTransfer)}
                      className="gap-2"
                    >
                      <ArrowRight className="size-4" />
                      {showTransfer ? "Cancel Transfer" : "Transfer Student"}
                    </Button>

                    {showTransfer && (
                      <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                        <div className="space-y-2">
                          <Label>Transfer Mode</Label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant={transferMode === "section" ? "default" : "outline"}
                              onClick={() => setTransferMode("section")}
                              size="sm"
                            >
                              Section Only
                            </Button>
                            <Button
                              type="button"
                              variant={transferMode === "class" ? "default" : "outline"}
                              onClick={() => setTransferMode("class")}
                              size="sm"
                            >
                              Class + Section
                            </Button>
                          </div>
                        </div>

                        {transferMode === "class" && (
                          <div className="space-y-2">
                            <Label htmlFor="newClass">Select New Class</Label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select class to transfer to" />
                              </SelectTrigger>
                              <SelectContent>
                                {classes?.data?.map((cls: any) => (
                                  <SelectItem 
                                    key={cls.id} 
                                    value={cls.id}
                                    disabled={cls.id === student.data.enrollments?.[0]?.class?.id}
                                  >
                                    {cls.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="newSection">Select New Section</Label>
                          <Select 
                            value={selectedSection} 
                            onValueChange={setSelectedSection}
                            disabled={transferMode === "class" && !selectedClass}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select section to transfer to" />
                            </SelectTrigger>
                            <SelectContent>
                              {transferMode === "class" 
                                ? classes?.data?.find((cls: any) => cls.id === selectedClass)?.sections?.map((section: any) => (
                                    <SelectItem 
                                      key={section.id} 
                                      value={section.id}
                                      disabled={section.id === student.data.enrollments?.[0]?.section?.id}
                                    >
                                      {section.name}
                                    </SelectItem>
                                  ))
                                : classes?.data?.map((cls: any) => 
                                    cls.sections?.map((section: any) => (
                                      <SelectItem 
                                        key={section.id} 
                                        value={section.id}
                                        disabled={section.id === student.data.enrollments?.[0]?.section?.id}
                                      >
                                        {cls.name} - {section.name}
                                      </SelectItem>
                                    ))
                                  )
                              }
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            onClick={() => {
                              setShowTransfer(false);
                              setSelectedSection("");
                              setSelectedClass("");
                              setTransferMode("section");
                            }}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="button" 
                            disabled={transferMutation.isPending || !selectedSection || (transferMode === "class" && !selectedClass)}
                            onClick={() => selectedSection && transferMutation.mutate({ 
                              sectionId: selectedSection, 
                              classId: transferMode === "class" ? selectedClass : undefined 
                            })}
                          >
                            {transferMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Transferring...
                              </>
                            ) : (
                              "Confirm Transfer"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Student"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
