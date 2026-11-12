import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { proprietorApi } from "@/lib/api/proprietor";
import { School, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!config) {
    return <div className="text-muted-foreground">Failed to load configuration</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          School configuration and information
        </p>
      </div>

      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <School className="h-5 w-5" />
            School Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <School className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">School Name</p>
              </div>
              <p className="text-lg font-semibold">{config.schoolName || "Not set"}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Academic Year</p>
              </div>
              <p className="text-lg font-semibold">{config.academicYear || "Not set"}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Current Term</p>
              </div>
              <p className="text-lg font-semibold">{config.currentTerm || "Not set"}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">School Address</p>
              </div>
              <p className="text-lg font-semibold">{config.address || "Not set"}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
              </div>
              <p className="text-lg font-semibold">{config.phone || "Not set"}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Email</p>
              </div>
              <p className="text-lg font-semibold">{config.email || "Not set"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Read-Only Access:</strong> As a proprietor, you have read-only access to all school data. Fee structure and other configuration changes must be made by the administration team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
