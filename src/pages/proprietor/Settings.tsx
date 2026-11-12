import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { proprietorApi } from "@/lib/api/proprietor";

export default function ProprietorSettings() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await proprietorApi.getSchoolConfiguration();
      if (res.success && res.data) {
        setConfig(res.data);
      }
    } catch (error) {
      console.error("Failed to load school configuration:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (!config) {
    return <div className="text-muted-foreground">Failed to load configuration</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          School configuration and information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">School Name</p>
            <p className="text-sm text-muted-foreground">{config.schoolName || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Academic Year</p>
            <p className="text-sm text-muted-foreground">{config.academicYear || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Current Term</p>
            <p className="text-sm text-muted-foreground">{config.currentTerm || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">School Address</p>
            <p className="text-sm text-muted-foreground">{config.address || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Phone Number</p>
            <p className="text-sm text-muted-foreground">{config.phone || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{config.email || "Not set"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fee Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Fee structure information is view-only. Contact administration for any changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
