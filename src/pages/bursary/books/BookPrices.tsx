import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { bursaryApi } from '@/lib/api/bursary';
import { Plus, Trash2, Edit, Loader2, BookOpen, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAlert } from '@/contexts/alert-context';

export default function BookPrices() {
  const queryClient = useQueryClient();
  const { showConfirm } = useAlert();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    classLevel: '',
    price: '',
    isbn: '',
    author: '',
    publisher: '',
  });

  const {
    data: booksData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['bursary-book-prices'],
    queryFn: () => bursaryApi.getAllBookPrices(),
  });

  const books = booksData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => bursaryApi.createBookPrice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bursary-book-prices'] });
      setIsDialogOpen(false);
      setFormData({
        title: '',
        subject: '',
        classLevel: '',
        price: '',
        isbn: '',
        author: '',
        publisher: '',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      bursaryApi.updateBookPrice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bursary-book-prices'] });
      setIsEditDialogOpen(false);
      setSelectedBook(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bursaryApi.deleteBookPrice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bursary-book-prices'] });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      price: parseFloat(formData.price),
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBook) {
      updateMutation.mutate({
        id: selectedBook.id,
        data: {
          ...formData,
          price: parseFloat(formData.price),
        },
      });
    }
  };

  const handleEdit = (book: any) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      subject: book.subject,
      classLevel: book.classLevel,
      price: book.price.toString(),
      isbn: book.isbn || '',
      author: book.author || '',
      publisher: book.publisher || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm(
      'Are you sure you want to delete this book price?',
      'danger',
      'Confirm Deletion',
      'Delete',
      'Cancel',
    );
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <BursaryLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Book Prices</h1>
            <p className="text-muted-foreground mt-1">
              Manage textbook prices for students
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Book Price
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Book Price</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Book Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Mathematics for JSS 1"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Mathematics"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classLevel">Class Level *</Label>
                    <Select
                      value={formData.classLevel}
                      onValueChange={(value) =>
                        setFormData({ ...formData, classLevel: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JSS1">JSS 1</SelectItem>
                        <SelectItem value="JSS2">JSS 2</SelectItem>
                        <SelectItem value="JSS3">JSS 3</SelectItem>
                        <SelectItem value="SS1">SS 1</SelectItem>
                        <SelectItem value="SS2">SS 2</SelectItem>
                        <SelectItem value="SS3">SS 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₦) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="e.g., 2500"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      placeholder="e.g., 978-0-123456-78-9"
                      value={formData.isbn}
                      onChange={(e) =>
                        setFormData({ ...formData, isbn: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      placeholder="e.g., John Doe"
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="publisher">Publisher</Label>
                    <Input
                      id="publisher"
                      placeholder="e.g., Educational Publishers Ltd"
                      value={formData.publisher}
                      onChange={(e) =>
                        setFormData({ ...formData, publisher: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Book Price'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Book Prices ({books.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No book prices found. Add your first book price to get started.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class Level</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Publisher</TableHead>
                      <TableHead>ISBN</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book: any) => (
                      <TableRow key={book.id}>
                        <TableCell className="font-medium">
                          {book.title}
                        </TableCell>
                        <TableCell>{book.subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{book.classLevel}</Badge>
                        </TableCell>
                        <TableCell>₦{book.price.toLocaleString()}</TableCell>
                        <TableCell>{book.author || '-'}</TableCell>
                        <TableCell>{book.publisher || '-'}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {book.isbn || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(book)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDelete(book.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Book Price</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Book Title *</Label>
                  <Input
                    id="edit-title"
                    placeholder="e.g., Mathematics for JSS 1"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-subject">Subject *</Label>
                  <Input
                    id="edit-subject"
                    placeholder="e.g., Mathematics"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-classLevel">Class Level *</Label>
                  <Select
                    value={formData.classLevel}
                    onValueChange={(value) =>
                      setFormData({ ...formData, classLevel: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JSS1">JSS 1</SelectItem>
                      <SelectItem value="JSS2">JSS 2</SelectItem>
                      <SelectItem value="JSS3">JSS 3</SelectItem>
                      <SelectItem value="SS1">SS 1</SelectItem>
                      <SelectItem value="SS2">SS 2</SelectItem>
                      <SelectItem value="SS3">SS 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (₦) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    placeholder="e.g., 2500"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-isbn">ISBN</Label>
                  <Input
                    id="edit-isbn"
                    placeholder="e.g., 978-0-123456-78-9"
                    value={formData.isbn}
                    onChange={(e) =>
                      setFormData({ ...formData, isbn: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-author">Author</Label>
                  <Input
                    id="edit-author"
                    placeholder="e.g., John Doe"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-publisher">Publisher</Label>
                  <Input
                    id="edit-publisher"
                    placeholder="e.g., Educational Publishers Ltd"
                    value={formData.publisher}
                    onChange={(e) =>
                      setFormData({ ...formData, publisher: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Book Price'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </BursaryLayout>
  );
}
