import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { healthApi } from "@/lib/api/health";

export default function SickbayVisitForm() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [treatment, setTreatment] = useState("");
  const [medication, setMedication] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !symptoms || !treatment) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await healthApi.recordSickbayVisit({
        studentId,
        symptoms,
        treatment,
        medication,
        notes,
      });
      if (res.success) {
        toast.success("Sickbay visit recorded successfully");
        navigate("/health/sickbay-visits");
      } else {
        toast.error(res.message || "Failed to record visit");
      }
    } catch (error) {
      toast.error("Failed to record visit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Record Sickbay Visit</h1>
        <p className="text-muted-foreground">
          Document a new sickbay visit
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visit Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="studentId">Student ID *</Label>
              <Input
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter student ID"
                required
              />
            </div>
            <div>
              <Label htmlFor="symptoms">Symptoms *</Label>
              <Textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe the symptoms..."
                required
              />
            </div>
            <div>
              <Label htmlFor="treatment">Treatment *</Label>
              <Textarea
                id="treatment"
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                placeholder="Describe the treatment given..."
                required
              />
            </div>
            <div>
              <Label htmlFor="medication">Medication</Label>
              <Textarea
                id="medication"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                placeholder="Any medication administered..."
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Recording..." : "Record Visit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/health/sickbay-visits")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
