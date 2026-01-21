import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  Mail,
  Phone,
  Globe,
  Palette,
  Check,
  X,
  ExternalLink,
  Copy,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import HUDOverlay from '@/components/ui/HUDOverlay';
import { useReseller } from '@/contexts/ResellerContext';
import { Reseller, CreateResellerInput } from '@/types/reseller';

const ResellerManagement: React.FC = () => {
  const { toast } = useToast();
  const {
    resellers,
    createReseller,
    updateReseller,
    deleteReseller,
    getClientsByReseller,
  } = useReseller();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);
  const [formData, setFormData] = useState<CreateResellerInput>({
    name: '',
    slug: '',
    email: '',
    phone: '',
    logo_url: '',
    brand_color: '#00D4FF',
  });

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      email: '',
      phone: '',
      logo_url: '',
      brand_color: '#00D4FF',
    });
    setEditingReseller(null);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: 'Validation Error',
        description: 'Name and email are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createReseller(formData);
      toast({
        title: 'Reseller Created',
        description: `${formData.name} has been added as a reseller`,
      });
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create reseller',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingReseller) return;

    try {
      await updateReseller(editingReseller.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        logo_url: formData.logo_url,
        brand_color: formData.brand_color,
      });
      toast({
        title: 'Reseller Updated',
        description: `${formData.name} has been updated`,
      });
      setEditingReseller(null);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update reseller',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (reseller: Reseller) => {
    try {
      await deleteReseller(reseller.id);
      toast({
        title: 'Reseller Deleted',
        description: `${reseller.name} has been removed`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete reseller',
        variant: 'destructive',
      });
    }
  };

  const startEdit = (reseller: Reseller) => {
    setEditingReseller(reseller);
    setFormData({
      name: reseller.name,
      slug: reseller.slug,
      email: reseller.email,
      phone: reseller.phone || '',
      logo_url: reseller.logo_url || '',
      brand_color: reseller.brand_color || '#00D4FF',
    });
  };

  const copyPortalLink = (reseller: Reseller) => {
    const link = `${window.location.origin}/reseller/${reseller.slug}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link Copied',
      description: 'Reseller portal link copied to clipboard',
    });
  };

  const filteredResellers = resellers.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeResellers = filteredResellers.filter(r => r.status === 'active');
  const inactiveResellers = filteredResellers.filter(r => r.status !== 'active');

  return (
    <>
      <Helmet>
        <title>Reseller Management | AVA Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
        <HUDOverlay />

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-sm mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                RESELLER MANAGEMENT
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="text-white">RESELLER</span>{' '}
                <span className="text-cyan-400">PORTAL</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search resellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black/50 border-cyan-500/30 text-white w-64"
                />
              </div>

              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
                    onClick={resetForm}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reseller
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-cyan-500/30 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-cyan-400">Create New Reseller</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Company Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g., Local SEO Agency"
                        className="bg-black/50 border-gray-700"
                      />
                    </div>
                    <div>
                      <Label>URL Slug</Label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="local-seo-agency"
                        className="bg-black/50 border-gray-700"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Portal URL: /reseller/{formData.slug || 'your-slug'}
                      </p>
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="admin@agency.com"
                        className="bg-black/50 border-gray-700"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(555) 123-4567"
                        className="bg-black/50 border-gray-700"
                      />
                    </div>
                    <div>
                      <Label>Brand Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.brand_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, brand_color: e.target.value }))}
                          className="w-12 h-10 p-1 bg-black/50 border-gray-700"
                        />
                        <Input
                          value={formData.brand_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, brand_color: e.target.value }))}
                          placeholder="#00D4FF"
                          className="bg-black/50 border-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreate}
                      className="bg-cyan-500 hover:bg-cyan-600 text-black"
                    >
                      Create Reseller
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Building2 className="w-4 h-4" />
                <span className="text-sm">Total Resellers</span>
              </div>
              <p className="text-2xl font-bold">{resellers.length}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Check className="w-4 h-4" />
                <span className="text-sm">Active</span>
              </div>
              <p className="text-2xl font-bold">{activeResellers.length}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Total Clients</span>
              </div>
              <p className="text-2xl font-bold">
                {resellers.reduce((acc, r) => acc + getClientsByReseller(r.id).length, 0)}
              </p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm border border-gray-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <X className="w-4 h-4" />
                <span className="text-sm">Inactive</span>
              </div>
              <p className="text-2xl font-bold">{inactiveResellers.length}</p>
            </div>
          </div>

          {/* Reseller Cards */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              Active Resellers
              <Badge variant="outline" className="ml-2 text-cyan-400 border-cyan-500/30">
                {activeResellers.length}
              </Badge>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeResellers.map((reseller) => (
                <div
                  key={reseller.id}
                  className="bg-black/40 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-5 hover:border-cyan-500/40 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold"
                        style={{ backgroundColor: reseller.brand_color + '20', color: reseller.brand_color }}
                      >
                        {reseller.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{reseller.name}</h3>
                        <p className="text-sm text-gray-400">/{reseller.slug}</p>
                      </div>
                    </div>
                    <Badge
                      className="bg-green-500/20 text-green-400 border-green-500/30"
                    >
                      Active
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{reseller.email}</span>
                    </div>
                    {reseller.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{reseller.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{getClientsByReseller(reseller.id).length} clients</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: reseller.brand_color }}
                      />
                      <span>{reseller.brand_color}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                      onClick={() => copyPortalLink(reseller)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Link
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 hover:bg-gray-800"
                      onClick={() => window.open(`/reseller/${reseller.slug}`, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 hover:bg-gray-800"
                          onClick={() => startEdit(reseller)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-cyan-500/30 text-white">
                        <DialogHeader>
                          <DialogTitle className="text-cyan-400">Edit Reseller</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label>Company Name</Label>
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              className="bg-black/50 border-gray-700"
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              className="bg-black/50 border-gray-700"
                            />
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input
                              value={formData.phone}
                              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                              className="bg-black/50 border-gray-700"
                            />
                          </div>
                          <div>
                            <Label>Brand Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={formData.brand_color}
                                onChange={(e) => setFormData(prev => ({ ...prev, brand_color: e.target.value }))}
                                className="w-12 h-10 p-1 bg-black/50 border-gray-700"
                              />
                              <Input
                                value={formData.brand_color}
                                onChange={(e) => setFormData(prev => ({ ...prev, brand_color: e.target.value }))}
                                className="bg-black/50 border-gray-700"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Status</Label>
                            <Select
                              value={editingReseller?.status || 'active'}
                              onValueChange={(value) => {
                                if (editingReseller) {
                                  updateReseller(editingReseller.id, { status: value as 'active' | 'inactive' | 'pending' });
                                }
                              }}
                            >
                              <SelectTrigger className="bg-black/50 border-gray-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditingReseller(null)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdate}
                            className="bg-cyan-500 hover:bg-cyan-600 text-black"
                          >
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-900 border-red-500/30">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-red-400">Delete Reseller?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete {reseller.name} and remove all their client associations.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(reseller)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}

              {activeResellers.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No active resellers found
                </div>
              )}
            </div>

            {/* Inactive Resellers */}
            {inactiveResellers.length > 0 && (
              <>
                <h2 className="text-xl font-semibold flex items-center gap-2 mt-8">
                  <X className="w-5 h-5 text-gray-400" />
                  Inactive Resellers
                  <Badge variant="outline" className="ml-2 text-gray-400 border-gray-500/30">
                    {inactiveResellers.length}
                  </Badge>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                  {inactiveResellers.map((reseller) => (
                    <div
                      key={reseller.id}
                      className="bg-black/40 backdrop-blur-sm border border-gray-500/20 rounded-lg p-5"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold bg-gray-800 text-gray-500"
                          >
                            {reseller.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-400">{reseller.name}</h3>
                            <p className="text-sm text-gray-500">/{reseller.slug}</p>
                          </div>
                        </div>
                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                          {reseller.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => updateReseller(reseller.id, { status: 'active' })}
                        >
                          Reactivate
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/30 text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-900 border-red-500/30">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-red-400">Delete Reseller?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete {reseller.name}. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(reseller)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ResellerManagement;
