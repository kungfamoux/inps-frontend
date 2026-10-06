import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Upload, Eye } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface AssignedSubjectsResponse {
  success: boolean;
  data: Subject[];
}

export default function TeacherResults() {
  const { data: subjectsResponse, isLoading } = useQuery<AssignedSubjectsResponse>({
    queryKey: ['teacher-assigned-subjects'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<AssignedSubjectsResponse>('/api/teacher/results/assigned-subjects');
        return res;
      } catch (error) {
        // Return empty response if endpoint fails
        return {
          success: true,
          data: [],
        };
      }
    },
  });

  const subjects = subjectsResponse?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Results Management</h1>
        <p className="text-muted-foreground mt-2">Upload and manage student assessment results.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Assigned Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading subjects...</div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subjects assigned to you yet. Contact the administrator.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <Card key={subject.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {subject.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{subject.code}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" variant="default">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Results
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Results
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
