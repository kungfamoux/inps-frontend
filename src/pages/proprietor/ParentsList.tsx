import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/lib/api/admin";
import { Users, Search, Phone, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Parent } from "@/lib/types/student";

export default function ProprietorParentsList() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      const res = await adminApi.getAllParents({ _t: Date.now() });
      console.log("Parents response:", res);
      console.log("Parents response type:", typeof res);
      console.log("Has success:", 'success' in res);
      console.log("Has data:", 'data' in res);
      
      if (res && typeof res === 'object') {
        if ('success' in res && res.success && 'data' in res) {
          const data = res.data as any;
          setParents(data.data || data || []);
        } else if (Array.isArray(res)) {
          setParents(res);
        } else if ('data' in res) {
          const data = res.data as any;
          setParents(data.data || data || []);
        }
      }
    } catch (error) {
      console.error("Failed to load parents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredParents = parents.filter((parent) =>
    `${parent.firstName} ${parent.lastName} ${parent.email} ${parent.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Parents List
        </h1>
        <p className="text-muted-foreground mt-2">
          Complete list of all registered parents
        </p>
      </div>

      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Parents ({filteredParents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parent</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Children</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParents.length > 0 ? (
                filteredParents.map((parent) => (
                  <TableRow key={parent.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {parent.firstName?.[0]}{parent.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{`${parent.firstName} ${parent.lastName}`}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {parent.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {parent.phone}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{parent.address || "Not provided"}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {parent.children?.length || 0} children
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No parents found
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
