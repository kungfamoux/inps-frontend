import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardList, Plus, Search } from "lucide-react";
import { healthApi, SickbayVisit } from "@/lib/api/health";

export default function SickbayVisits() {
  const [visits, setVisits] = useState<SickbayVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      const res = await healthApi.getSickbayVisits();
      if (res.success && res.data) {
        setVisits(res.data);
      }
    } catch (error) {
      console.error("Failed to load sickbay visits:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVisits = visits.filter((visit) =>
    `${visit.student.firstName} ${visit.student.lastName} ${visit.student.admissionNumber}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sickbay Visits</h1>
          <p className="text-muted-foreground">
            View and manage sickbay visit records
          </p>
        </div>
        <Link to="/health/sickbay-visits/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Record Visit
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by student name or admission number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredVisits.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? "No visits found" : "No sickbay visits recorded"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredVisits.map((visit) => (
              <Card key={visit.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {visit.student.firstName} {visit.student.lastName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {visit.student.admissionNumber} •{" "}
                    {new Date(visit.visitDate).toLocaleString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Symptoms:</span>{" "}
                      {visit.symptoms}
                    </p>
                    <p>
                      <span className="font-medium">Treatment:</span>{" "}
                      {visit.treatment}
                    </p>
                    {visit.medication && (
                      <p>
                        <span className="font-medium">Medication:</span>{" "}
                        {visit.medication}
                      </p>
                    )}
                    <Link to={`/health/sickbay-visits/${visit.id}`}>
                      <Button variant="outline" size="sm" className="mt-2">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
