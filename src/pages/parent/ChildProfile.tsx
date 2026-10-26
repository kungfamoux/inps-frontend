import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { ParentLayout } from "@/components/layout/ParentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parentApi } from "@/lib/api/parent";
import { Child } from "@/lib/types/parent";
import { GraduationCap, ArrowLeft, Eye, WalletCards, Calendar, User, MapPin, Phone, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ChildProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const { data: childData, isLoading, error } = useQuery({
    queryKey: ["parent-child-profile", studentId],
    queryFn: () => parentApi.getChildProfile(studentId!),
    enabled: !!studentId,
  });

  const { data: feeData } = useQuery({
    queryKey: ["child-fee-overview", studentId],
    queryFn: () => parentApi.getFeeOverview(studentId),
    enabled: !!studentId,
  });

  const child = childData?.data as Child;
  const feeOverview = feeData?.data;

  const getChildInitials = () => {
    if (!child) return "U";
    const firstName = child.firstName || "";
    const lastName = child.lastName || "";
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return firstName?.[0]?.toUpperCase() || lastName?.[0]?.toUpperCase() || "U";
  };

  if (error) {
    return (
      <ParentLayout>
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => navigate("/parent/children")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Children
          </Button>
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-destructive">Failed to load child profile. Please try again.</p>
            </CardContent>
          </Card>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/parent/children")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Children
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Child Profile</h1>
            <p className="text-muted-foreground mt-1">View detailed information about your child</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : child ? (
          <div className="space-y-6">
            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-6 mb-6">
                  <Avatar className="h-20 w-20 border-2 border-primary/20">
                    {child.passportPhoto ? (
                      <img src={child.passportPhoto} alt={child.firstName} className="h-full w-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-primary text-xl font-bold text-primary-foreground">
                        {getChildInitials()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">
                      {child.firstName} {child.middleName && child.middleName + " "} {child.lastName}
                    </h3>
                    <p className="text-muted-foreground">{child.admissionNumber}</p>
                    <Badge variant={child.status === "ACTIVE" ? "default" : "secondary"} className="mt-2">
                      {child.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground w-32">Gender:</span>
                    <span className="font-medium">{child.gender}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground w-32">Date of Birth:</span>
                    <span className="font-medium">
                      {new Date(child.dateOfBirth).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground w-32">Class:</span>
                    <span className="font-medium">{child.class?.name || "N/A"}</span>
                  </div>
                  <div className="flex items-start text-sm md:col-span-2">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground w-32">Address:</span>
                    <span className="font-medium">{child.address || "N/A"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fee Status */}
            <Card>
              <CardHeader>
                <CardTitle>Fee Status</CardTitle>
              </CardHeader>
              <CardContent>
                {feeOverview ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Total Fees</span>
                        <span className="text-muted-foreground">₦</span>
                      </div>
                      <p className="text-2xl font-bold">₦{feeOverview.totalFees.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-green-700">Amount Paid</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">₦{feeOverview.totalPaid.toLocaleString()}</p>
                    </div>
                    <div className={`p-4 rounded-lg border ${feeOverview.totalOutstanding > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${feeOverview.totalOutstanding > 0 ? 'text-red-700' : 'text-green-700'}`}>Outstanding</span>
                        {feeOverview.totalOutstanding > 0 ? (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className={`text-2xl font-bold ${feeOverview.totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₦{feeOverview.totalOutstanding.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Skeleton className="h-24 w-full" />
                )}
                <Button 
                  className="w-full mt-4" 
                  onClick={() => navigate(`/parent/fees/${studentId}`)}
                >
                  <WalletCards className="mr-2 h-4 w-4" />
                  View Detailed Fees
                  <ArrowLeft className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button
                    variant="outline"
                    className="h-auto flex-col py-4"
                    onClick={() => navigate(`/parent/results?studentId=${child.id}`)}
                  >
                    <WalletCards className="h-6 w-6 mb-2" />
                    <span>View Results</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col py-4"
                    onClick={() => navigate(`/parent/children/${child.id}/attendance`)}
                  >
                    <Calendar className="h-6 w-6 mb-2" />
                    <span>View Attendance</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col py-4"
                    onClick={() => navigate(`/parent/children/${child.id}/timetable`)}
                  >
                    <GraduationCap className="h-6 w-6 mb-2" />
                    <span>View Timetable</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col py-4"
                    onClick={() => navigate(`/parent/children/${child.id}/fees`)}
                  >
                    <WalletCards className="h-6 w-6 mb-2" />
                    <span>View Fees</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Child not found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ParentLayout>
  );
}