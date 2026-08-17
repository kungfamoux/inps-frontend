import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BursaryLayout } from '@/components/layout/BursaryLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { bursaryApi } from '@/lib/api/bursary';
import { Plus, FileText, Edit, Trash2, Loader2, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { SessionTermSelector } from '@/components/admin/SessionTermSelector';

export default function BillsList() {
  const navigate = useNavigate();
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedSessionName, setSelectedSessionName] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [scope, setScope] = useState('');
  const [search, setSearch] = useState('');

  const {
    data: billsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['bursary-bills', selectedSessionName, selectedTerm, scope],
    queryFn: () =>
      bursaryApi.getAllBills({
        academicYear: selectedSessionName || undefined,
        term: selectedTerm || undefined,
        scope: scope || undefined,
      }),
  });

  const bills = billsData?.data || [];

  const handleSearch = () => {
    refetch();
  };

  return (
    <BursaryLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Bills Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage fee bills
            </p>
          </div>
          <Button onClick={() => navigate('/bursary/bills/add')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Bill
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <SessionTermSelector
                sessionId={selectedSessionId}
                termId={selectedTermId}
                onSessionChange={(id, name) => {
                  setSelectedSessionId(id);
                  setSelectedSessionName(name);
                }}
                onTermChange={(id, term) => {
                  setSelectedTermId(id);
                  setSelectedTerm(term);
                }}
                showBoth
              />
              <div className="space-y-2">
                <Label>Scope</Label>
                <Select value={scope} onValueChange={setScope}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_STUDENTS">All Students</SelectItem>
                    <SelectItem value="BY_CLASS">By Class</SelectItem>
                    <SelectItem value="BY_STUDENT">By Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search bills..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button onClick={handleSearch} variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Bills</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : bills.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No bills found. Create your first bill to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {bills.map((bill: any) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="grid size-10 place-items-center rounded-full bg-primary/10">
                        <FileText className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{bill.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {bill.academicYear} - {bill.term} • ₦
                          {bill.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          bill.status === 'ACTIVE' ? 'default' : 'secondary'
                        }
                      >
                        {bill.status}
                      </Badge>
                      <Badge variant="outline">{bill.scope}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          navigate(`/bursary/bills/edit/${bill.id}`)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BursaryLayout>
  );
}
