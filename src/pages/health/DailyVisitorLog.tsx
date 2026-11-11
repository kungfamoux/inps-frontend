import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { healthApi } from "@/lib/api/health";

export default function DailyVisitorLog() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("date", date);
    formData.append("dailyVisitorLog", file);

    try {
      const res = await healthApi.uploadDailyVisitorLog(formData);
      if (res.success) {
        toast.success("Daily visitor log uploaded successfully");
        loadDailyLog();
      } else {
        toast.error(res.message || "Failed to upload");
      }
    } catch (error) {
      toast.error("Failed to upload");
    } finally {
      setLoading(false);
    }
  };

  const loadDailyLog = async () => {
    try {
      const res = await healthApi.getDailyVisitorLog(date);
      if (res.success && res.data) {
        setImageUrl(res.data);
      } else {
        setImageUrl(null);
      }
    } catch (error) {
      console.error("Failed to load daily log:", error);
    }
  };

  useEffect(() => {
    loadDailyLog();
  }, [date]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Visitor Log</h1>
        <p className="text-muted-foreground">
          Upload and view daily sickbay visitor logs
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload Daily Log</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="image">Visitor Log Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View Daily Log</CardTitle>
          </CardHeader>
          <CardContent>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Daily visitor log"
                className="w-full rounded-lg border"
              />
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                No log uploaded for this date
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
