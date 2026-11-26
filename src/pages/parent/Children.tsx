import { useQuery } from "@tanstack/react-query";
import { ParentLayout } from "@/components/layout/ParentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parentApi } from "@/lib/api/parent";
import { Child } from "@/lib/types/parent";
import { GraduationCap, Eye, WalletCards, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ParentChildren() {
  const navigate = useNavigate();

  const { data: childrenData, isLoading } = useQuery({
    queryKey: ["parent-children"],
    queryFn: () => parentApi.getMyChildren(),
  });

  const children = childrenData?.data || [];

  const getChildInitials = (child: Child) => {
    const firstName = child.firstName || "";
    const lastName = child.lastName || "";
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return firstName?.[0]?.toUpperCase() || lastName?.[0]?.toUpperCase() || "U";
  };

  return (
    <ParentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Children</h1>
          <p className="text-muted-foreground mt-1">View and manage your children's information</p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : children.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No children linked</h3>
              <p className="text-muted-foreground mb-4">
                There are no children currently linked to your parent account.
              </p>
              <p className="text-sm text-muted-foreground">
                Please contact the school administration to link your children.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {children.map((child: Child) => (
              <Card key={child.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      {child.passportPhoto ? (
                        <img src={child.passportPhoto} alt={child.firstName} className="h-full w-full object-cover" />
                      ) : (
                        <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">
                          {getChildInitials(child)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {child.firstName} {child.lastName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{child.admissionNumber}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Class:</span>
                      <span className="ml-2 font-medium">{child.class?.name || "N/A"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="ml-2 font-medium">{child.gender}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/parent/children/${child.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/parent/results?studentId=${child.id}`)}
                    >
                      <WalletCards className="h-4 w-4 mr-1" />
                      Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ParentLayout>
  );
}