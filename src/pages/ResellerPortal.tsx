import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  UserPlus,
  Layout,
  ArrowRight,
  Sparkles,
  Layers,
  MonitorSmartphone,
  X,
  Target,
  Palette,
  Send,
  Loader2,
  Check,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Tag,
  Plus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import HUDOverlay from '@/components/ui/HUDOverlay';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useReseller } from '@/contexts/ResellerContext';

// Helper function to get logo from client data
const getClientLogo = (client: any): string | null => {
  if (client.website_url) {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(client.website_url)}&sz=128`;
  }

  if (client.notes) {
    try {
      const parsed = JSON.parse(client.notes);
      const domain = parsed?.live_domain || parsed?.dummy_domain;
      if (domain) {
        return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
      }
    } catch {}
  }
  return null;
};

// Helper to determine if client is a funnel or website
const getClientType = (client: any): 'website' | 'funnel' => {
  if (client.notes) {
    try {
      const parsed = JSON.parse(client.notes);
      if (parsed?.dummy_domain || parsed?.live_domain || parsed?.funnel_goal) {
        return 'funnel';
      }
    } catch {}
  }
  return 'website';
};

// Helper function to get funnel domains from client data
const getFunnelDomains = (client: any): { dummyDomain: string | null; liveDomain: string | null } => {
  if (client.notes) {
    try {
      const parsed = JSON.parse(client.notes);
      return {
        dummyDomain: parsed?.dummy_domain || null,
        liveDomain: parsed?.live_domain || null,
      };
    } catch {}
  }
  return { dummyDomain: null, liveDomain: null };
};

const ResellerPortal: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    getResellerBySlug,
    getClientsByReseller,
    tagClient,
    untagClient,
    getResellerTag,
    resellerClients,
  } = useReseller();

  const reseller = slug ? getResellerBySlug(slug) : null;

  // Redirect if reseller not found or inactive
  useEffect(() => {
    if (slug && !reseller) {
      toast({
        title: 'Reseller Not Found',
        description: 'This reseller portal does not exist',
        variant: 'destructive',
      });
      navigate('/');
    } else if (reseller && reseller.status !== 'active') {
      toast({
        title: 'Portal Inactive',
        description: 'This reseller portal is currently inactive',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [slug, reseller, navigate, toast]);

  const [globalSearch, setGlobalSearch] = useState('');
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [tagInput, setTagInput] = useState('');

  const websiteScrollRef = useRef<HTMLDivElement>(null);
  const funnelScrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Fetch all clients from Supabase
  const { data: allClients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Get reseller's tagged clients
  const resellerClientIds = reseller
    ? getClientsByReseller(reseller.id).map(rc => rc.client_id)
    : [];

  // Filter clients that belong to this reseller
  const myClients = allClients.filter(client =>
    resellerClientIds.includes(client.id)
  );

  // Apply search filter
  const filteredClients = myClients.filter(client => {
    if (!globalSearch) return true;
    const search = globalSearch.toLowerCase();
    return (
      (client.name?.toLowerCase().includes(search)) ||
      (client.company_name?.toLowerCase().includes(search)) ||
      (client.email?.toLowerCase().includes(search)) ||
      (client.website_url?.toLowerCase().includes(search))
    );
  });

  // Separate websites and funnels
  const websiteClients = filteredClients.filter(c => getClientType(c) === 'website');
  const funnelClients = filteredClients.filter(c => getClientType(c) === 'funnel');

  // Untagged clients (available to add)
  const untaggedClients = allClients.filter(client =>
    !resellerClientIds.includes(client.id)
  );

  const handleTagClient = async (clientId: string) => {
    if (!reseller || !tagInput.trim()) return;

    try {
      await tagClient(reseller.id, clientId, tagInput.trim());
      toast({
        title: 'Client Added',
        description: 'Client has been added to your portal',
      });
      setShowTagModal(false);
      setShowAddClientModal(false);
      setTagInput('');
      setSelectedClient(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add client',
        variant: 'destructive',
      });
    }
  };

  const handleUntagClient = async (clientId: string) => {
    if (!reseller) return;

    try {
      await untagClient(reseller.id, clientId);
      toast({
        title: 'Client Removed',
        description: 'Client has been removed from your portal',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove client',
        variant: 'destructive',
      });
    }
  };

  if (!reseller) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const brandColor = reseller.brand_color || '#00D4FF';

  return (
    <>
      <Helmet>
        <title>{reseller.name} | Client Portal</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
        <HUDOverlay />

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-sm mb-2" style={{ color: brandColor }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#22C55E' }} />
                SYSTEM ACTIVE
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">
                <span style={{ color: brandColor }}>{reseller.name.toUpperCase()}</span>{' '}
                <span className="text-white">PORTAL</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-cyan-500/30"
                style={{ borderColor: brandColor + '50', color: brandColor }}
                onClick={() => setShowAddClientModal(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search clients by name, email, or domain..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="pl-12 py-6 bg-black/50 border-gray-700 text-white text-lg"
                style={{ borderColor: brandColor + '30' }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/40 backdrop-blur-sm border rounded-lg p-4" style={{ borderColor: brandColor + '30' }}>
              <div className="flex items-center gap-2 mb-2" style={{ color: brandColor }}>
                <Globe className="w-4 h-4" />
                <span className="text-sm">Websites</span>
              </div>
              <p className="text-2xl font-bold">{websiteClients.length}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Layers className="w-4 h-4" />
                <span className="text-sm">Funnels</span>
              </div>
              <p className="text-2xl font-bold">{funnelClients.length}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Check className="w-4 h-4" />
                <span className="text-sm">Total Clients</span>
              </div>
              <p className="text-2xl font-bold">{myClients.length}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Target className="w-4 h-4" />
                <span className="text-sm">Active</span>
              </div>
              <p className="text-2xl font-bold">
                {myClients.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>

          {/* Websites Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6" style={{ color: brandColor }} />
                <h2 className="text-xl font-semibold">Websites</h2>
                <Badge
                  variant="outline"
                  className="ml-2"
                  style={{ color: brandColor, borderColor: brandColor + '50' }}
                >
                  {websiteClients.length}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => scrollLeft(websiteScrollRef)}
                  className="border-gray-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => scrollRight(websiteScrollRef)}
                  className="border-gray-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div
              ref={websiteScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {websiteClients.map((client) => {
                const tag = reseller ? getResellerTag(reseller.id, client.id) : null;
                return (
                  <div
                    key={client.id}
                    className="flex-shrink-0 w-[300px] bg-black/40 backdrop-blur-sm border rounded-lg p-5 hover:border-opacity-60 transition-all group"
                    style={{ borderColor: brandColor + '30' }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: brandColor + '20' }}
                      >
                        {getClientLogo(client) ? (
                          <img
                            src={getClientLogo(client)!}
                            alt=""
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Globe className="w-6 h-6" style={{ color: brandColor }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            className="text-xs"
                            style={{ backgroundColor: brandColor + '20', color: brandColor }}
                          >
                            WEBSITE
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg truncate mt-1">
                          {client.company_name || client.name}
                        </h3>
                      </div>
                    </div>

                    {tag && (
                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <Tag className="w-3 h-3" style={{ color: brandColor }} />
                        <span style={{ color: brandColor }}>{tag}</span>
                      </div>
                    )}

                    {client.primary_services && client.primary_services.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {client.primary_services.slice(0, 3).map((service: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs border-gray-700 text-gray-400">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {client.website_url && (
                      <a
                        href={client.website_url.startsWith('http') ? client.website_url : `https://${client.website_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        <span className="truncate">{client.website_url.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )}

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-800">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-gray-700 hover:bg-gray-800"
                        onClick={() => {
                          setSelectedClient(client);
                          setTagInput(tag || '');
                          setShowTagModal(true);
                        }}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag ? 'Edit Tag' : 'Add Tag'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleUntagClient(client.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {websiteClients.length === 0 && (
                <div className="w-full text-center py-12 text-gray-500">
                  No websites yet. Click "Add Client" to get started.
                </div>
              )}
            </div>
          </div>

          {/* Funnels Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Layers className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-semibold">Funnels</h2>
                <Badge variant="outline" className="ml-2 text-purple-400 border-purple-500/30">
                  {funnelClients.length}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => scrollLeft(funnelScrollRef)}
                  className="border-gray-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => scrollRight(funnelScrollRef)}
                  className="border-gray-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div
              ref={funnelScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {funnelClients.map((client) => {
                const { dummyDomain, liveDomain } = getFunnelDomains(client);
                const tag = reseller ? getResellerTag(reseller.id, client.id) : null;

                return (
                  <div
                    key={client.id}
                    className="flex-shrink-0 w-[300px] bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-lg p-5 hover:border-purple-500/40 transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center overflow-hidden">
                        {getClientLogo(client) ? (
                          <img
                            src={getClientLogo(client)!}
                            alt=""
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Layers className="w-6 h-6 text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                          FUNNEL
                        </Badge>
                        <h3 className="font-semibold text-lg truncate mt-1">
                          {client.company_name || client.name}
                        </h3>
                      </div>
                    </div>

                    {tag && (
                      <div className="flex items-center gap-2 mb-3 text-sm text-purple-400">
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      {liveDomain && (
                        <a
                          href={liveDomain.startsWith('http') ? liveDomain : `https://${liveDomain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-green-400 hover:text-green-300"
                        >
                          <Globe className="w-4 h-4" />
                          <span className="truncate">{liveDomain}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {dummyDomain && (
                        <a
                          href={dummyDomain.startsWith('http') ? dummyDomain : `https://${dummyDomain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gray-400 hover:text-gray-300"
                        >
                          <Globe className="w-4 h-4" />
                          <span className="truncate">{dummyDomain}</span>
                          <Badge variant="outline" className="text-xs border-gray-600">staging</Badge>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-800">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-gray-700 hover:bg-gray-800"
                        onClick={() => {
                          setSelectedClient(client);
                          setTagInput(tag || '');
                          setShowTagModal(true);
                        }}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag ? 'Edit Tag' : 'Add Tag'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleUntagClient(client.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {funnelClients.length === 0 && (
                <div className="w-full text-center py-12 text-gray-500">
                  No funnels yet. Click "Add Client" to get started.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Client Modal */}
        <Dialog open={showAddClientModal} onOpenChange={setShowAddClientModal}>
          <DialogContent className="bg-gray-900 border-cyan-500/30 text-white max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle style={{ color: brandColor }}>Add Client to Your Portal</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-2 pr-4">
                {untaggedClients.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    All available clients have been added to your portal.
                  </p>
                ) : (
                  untaggedClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                          {getClientLogo(client) ? (
                            <img
                              src={getClientLogo(client)!}
                              alt=""
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Building2 className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{client.company_name || client.name}</p>
                          <p className="text-sm text-gray-500">
                            {client.website_url || client.email || 'No domain'}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        style={{ backgroundColor: brandColor, color: 'black' }}
                        className="hover:opacity-90"
                        onClick={() => {
                          setSelectedClient(client);
                          setTagInput('');
                          setShowTagModal(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Tag Modal */}
        <Dialog open={showTagModal} onOpenChange={setShowTagModal}>
          <DialogContent className="bg-gray-900 border-cyan-500/30 text-white">
            <DialogHeader>
              <DialogTitle style={{ color: brandColor }}>
                {selectedClient?.company_name || selectedClient?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Your Tag for this Client</Label>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g., Premium Client, Q1 2026, VIP"
                  className="bg-black/50 border-gray-700 mt-2"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This tag is only visible to you and helps organize your clients.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowTagModal(false);
                  setSelectedClient(null);
                  setTagInput('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedClient && handleTagClient(selectedClient.id)}
                style={{ backgroundColor: brandColor, color: 'black' }}
                className="hover:opacity-90"
                disabled={!tagInput.trim()}
              >
                {getResellerTag(reseller?.id || '', selectedClient?.id || '') ? 'Update Tag' : 'Add Client'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default ResellerPortal;
