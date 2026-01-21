import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  FileText, 
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit3,
  Trash2,
  Calendar,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import GridOverlay from '@/components/agency/GridOverlay';
import { 
  useContentItems, 
  useCreateContentItem, 
  useUpdateContentItem, 
  useDeleteContentItem,
  ContentStatus,
  ContentType
} from '@/hooks/useContentItems';

const statusColors: Record<ContentStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  review: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const statusLabels: Record<ContentStatus, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  review: 'Under Review',
  published: 'Published',
};

const typeColors: Record<ContentType, string> = {
  blog: 'bg-purple-500/20 text-purple-400',
  social: 'bg-pink-500/20 text-pink-400',
  email: 'bg-cyan-500/20 text-cyan-400',
  video: 'bg-red-500/20 text-red-400',
  other: 'bg-gray-500/20 text-gray-400',
};

export default function ContentTracker() {
  const navigate = useNavigate();
  const { data: content = [], isLoading } = useContentItems();
  const createContent = useCreateContentItem();
  const updateContent = useUpdateContentItem();
  const deleteContent = useDeleteContentItem();
  
  const [filterStatus, setFilterStatus] = useState<ContentStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newContent, setNewContent] = useState({
    title: '',
    type: 'blog' as ContentType,
    status: 'draft' as ContentStatus,
    assignee: '',
    dueDate: '',
    description: '',
  });

  const filteredContent = useMemo(() => {
    return content.filter(item => {
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (filterType !== 'all' && item.type !== filterType) return false;
      return true;
    });
  }, [content, filterStatus, filterType]);

  const stats = useMemo(() => {
    return {
      total: content.length,
      draft: content.filter(c => c.status === 'draft').length,
      inProgress: content.filter(c => c.status === 'in_progress').length,
      review: content.filter(c => c.status === 'review').length,
      published: content.filter(c => c.status === 'published').length,
    };
  }, [content]);

  const handleAddContent = () => {
    if (!newContent.title) return;

    createContent.mutate({
      title: newContent.title,
      type: newContent.type,
      status: newContent.status,
      assignee: newContent.assignee || undefined,
      due_date: newContent.dueDate || undefined,
      description: newContent.description || undefined,
    }, {
      onSuccess: () => {
        setNewContent({
          title: '',
          type: 'blog',
          status: 'draft',
          assignee: '',
          dueDate: '',
          description: '',
        });
        setIsAddDialogOpen(false);
      }
    });
  };

  const handleDeleteContent = (id: string) => {
    deleteContent.mutate(id);
  };

  const handleStatusChange = (id: string, newStatus: ContentStatus) => {
    updateContent.mutate({ id, status: newStatus });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Helmet>
        <title>Content Tracker | Team Tracker</title>
        <meta name="description" content="Track and manage content creation" />
      </Helmet>

      <GridOverlay />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/team-tracker')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Content Tracker</h1>
                <p className="text-muted-foreground">Manage your content calendar</p>
              </div>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Content
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Content</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newContent.title}
                      onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Content title..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={newContent.type}
                        onValueChange={(v) => setNewContent(prev => ({ ...prev, type: v as ContentType }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blog">Blog</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={newContent.status}
                        onValueChange={(v) => setNewContent(prev => ({ ...prev, status: v as ContentStatus }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="review">Under Review</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Assignee</Label>
                    <Input
                      value={newContent.assignee}
                      onChange={(e) => setNewContent(prev => ({ ...prev, assignee: e.target.value }))}
                      placeholder="Assignee name..."
                    />
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={newContent.dueDate}
                      onChange={(e) => setNewContent(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newContent.description}
                      onChange={(e) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Content description..."
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={handleAddContent} 
                    className="w-full"
                    disabled={createContent.isPending || !newContent.title}
                  >
                    {createContent.isPending ? 'Adding...' : 'Add Content'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-card/50 backdrop-blur-sm border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold">{stats.total}</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Drafts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold text-muted-foreground">{stats.draft}</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold text-blue-400">{stats.inProgress}</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold text-amber-400">{stats.review}</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Published
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold text-emerald-400">{stats.published}</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6 bg-card/50 backdrop-blur-sm border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground">Status:</Label>
                  <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as ContentStatus | 'all')}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground">Type:</Label>
                  <Select value={filterType} onValueChange={(v) => setFilterType(v as ContentType | 'all')}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="blog">Blog</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Table */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/30">
            <CardHeader>
              <CardTitle>Content Items</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredContent.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No content items found</p>
                  <p className="text-sm">Add your first content item to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContent.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.title}</div>
                              {item.description && (
                                <div className="text-sm text-muted-foreground truncate max-w-xs">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={typeColors[item.type]}>
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.status}
                              onValueChange={(v) => handleStatusChange(item.id, v as ContentStatus)}
                            >
                              <SelectTrigger className={`w-32 ${statusColors[item.status]} border`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="review">Under Review</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              {item.assignee || '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {item.due_date || '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteContent(item.id)}
                              disabled={deleteContent.isPending}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
