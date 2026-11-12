import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { proprietorApi } from "@/lib/api/proprietor";

export default function StaffOverview() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      const res = await proprietorApi.getStaffOverview();
      if (res.success && res.data) {
        setOverview(res.data);
      }
    } catch (error) {
      console.error("Failed to load staff overview:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (!overview) {
    return <div className="text-muted-foreground">Failed to load staff</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Overview</h1>
        <p className="text-muted-foreground">
          List of all staff members
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.statistics?.totalStaff || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teaching Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.statistics?.teachingStaff || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Non-Teaching Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.statistics?.nonTeachingStaff || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.staff?.length > 0 ? (
                overview.staff.map((staff: any) => (
                  <TableRow key={staff.id}>
                    <TableCell>{staff.staffId}</TableCell>
                    <TableCell>{`${staff.firstName} ${staff.lastName}`}</TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell>{staff.type}</TableCell>
                    <TableCell>{staff.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No staff found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
