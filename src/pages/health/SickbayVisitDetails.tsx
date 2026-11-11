import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { healthApi, SickbayVisit } from "@/lib/api/health";
import { toast } from "sonner";

export default function SickbayVisitDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<SickbayVisit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadVisitDetails(id);
    }
  }, [id]);

  const loadVisitDetails = async (visitId: string) => {
    try {
      const res = await healthApi.getSickbayVisit(visitId);
      if (res.success && res.data) {
        setVisit(res.data);
      }
    } catch (error) {
      console.error("Failed to load visit details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (!visit) {
    return <div className="text-muted-foreground">Visit not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/health/sickbay-visits")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Visit Details
          </h1>
          <p className="text-muted-foreground">
            {new Date(visit.visitDate).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="font-medium">Name:</span>{" "}
              {visit.student.firstName} {visit.student.middleName}{" "}
              {visit.student.lastName}
            </p>
            <p>
              <span className="font-medium">Admission Number:</span>{" "}
              {visit.student.admissionNumber}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="font-medium">Nurse:</span>{" "}
              {visit.nurse.firstName} {visit.nurse.lastName}
            </p>
            <p>
              <span className="font-medium">Date:</span>{" "}
              {new Date(visit.visitDate).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Symptoms:</p>
              <p className="text-sm">{visit.symptoms}</p>
            </div>
            <div>
              <p className="font-medium">Treatment:</p>
              <p className="text-sm">{visit.treatment}</p>
            </div>
            {visit.medication && (
              <div>
                <p className="font-medium">Medication:</p>
                <p className="text-sm">{visit.medication}</p>
              </div>
            )}
            {visit.notes && (
              <div>
                <p className="font-medium">Notes:</p>
                <p className="text-sm">{visit.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
