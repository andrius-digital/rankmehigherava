import React, { useState } from 'react';
import {
  Users, Plus, Trash2, Loader2, X, Mail, User, Building2,
  Briefcase, Phone, FileText, Send, UserPlus, KeyRound
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type TabType = 'resellers' | 'users';

interface ResellerUserManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resellers: any[];
  initialTab?: TabType;
}

const ResellerUserManagement: React.FC<ResellerUserManagementProps> = ({
  open, onOpenChange, resellers, initialTab = 'resellers'
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // ---- RESELLER TAB STATE ----
  const [showResellerForm, setShowResellerForm] = useState(false);
  const [isSubmittingReseller, setIsSubmittingReseller] = useState(false);
  const [resellerFormData, setResellerFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    notes: '',
  });

  const resetResellerForm = () => {
    setResellerFormData({ companyName: '', contactName: '', contactEmail: '', contactPhone: '', notes: '' });
    setShowResellerForm(false);
  };

  const handleCreateReseller = async () => {
    if (!resellerFormData.companyName) {
      toast({ title: 'Missing required field', description: 'Please enter the company name.', variant: 'destructive' });
      return;
    }

    setIsSubmittingReseller(true);
    try {
      const notesData = {
        submission_type: 'reseller-account',
        is_reseller: true,
        contact_name: resellerFormData.contactName,
        additional_notes: resellerFormData.notes,
        submitted_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('clients').insert({
        name: resellerFormData.companyName,
        company_name: resellerFormData.companyName,
        email: resellerFormData.contactEmail || null,
        phone: resellerFormData.contactPhone || null,
        brand_voice: 'Reseller Account',
        status: 'PENDING',
        primary_services: ['Reseller'],
        notes: JSON.stringify(notesData),
      });

      if (error) throw new Error(error.message);

      queryClient.invalidateQueries({ queryKey: ['all-clients'] });
      toast({ title: 'Reseller created!', description: `${resellerFormData.companyName} has been added.` });
      resetResellerForm();
    } catch (error: any) {
      console.error('Create reseller error:', error);
      toast({ title: 'Failed to create reseller', description: error.message || 'Something went wrong.', variant: 'destructive' });
    } finally {
      setIsSubmittingReseller(false);
    }
  };

  // ---- USER TAB STATE ----
  const [showUserForm, setShowUserForm] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Password change state
  const [changingPasswordUserId, setChangingPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    resellerId: '',
  });

  const resetUserForm = () => {
    setUserFormData({ email: '', password: '', fullName: '', resellerId: '' });
    setShowUserForm(false);
  };

  // Fetch reseller users
  const { data: resellerUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['reseller-users'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('admin-operations', {
        body: { action: 'list_reseller_users', data: {} },
      });

      if (response.error) throw response.error;
      return response.data?.data || [];
    },
    enabled: open && activeTab === 'users',
  });

  const handleCreateUser = async () => {
    if (!userFormData.email || !userFormData.password || !userFormData.resellerId) {
      toast({ title: 'Missing fields', description: 'Email, password, and reseller are required.', variant: 'destructive' });
      return;
    }
    if (userFormData.password.length < 6) {
      toast({ title: 'Weak password', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }

    setIsSubmittingUser(true);
    try {
      const response = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'create_reseller_user',
          data: {
            email: userFormData.email,
            password: userFormData.password,
            full_name: userFormData.fullName,
            reseller_id: userFormData.resellerId,
          },
        },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);

      const resellerName = resellers.find(r => r.id === userFormData.resellerId)?.company_name || 'reseller';
      toast({ title: 'User created!', description: `${userFormData.email} can now log in to the ${resellerName} portal.` });
      resetUserForm();
      queryClient.invalidateQueries({ queryKey: ['reseller-users'] });
    } catch (error: any) {
      console.error('Create reseller user error:', error);
      toast({ title: 'Failed to create user', description: error.message || 'Something went wrong.', variant: 'destructive' });
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    setDeletingUserId(userId);
    try {
      const response = await supabase.functions.invoke('admin-operations', {
        body: { action: 'delete_reseller_user', data: { user_id: userId } },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);

      toast({ title: 'User removed', description: `${email} has been deleted.` });
      queryClient.invalidateQueries({ queryKey: ['reseller-users'] });
    } catch (error: any) {
      console.error('Delete reseller user error:', error);
      toast({ title: 'Failed to delete user', description: error.message || 'Something went wrong.', variant: 'destructive' });
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleChangePassword = async (userId: string, email: string) => {
    if (!newPassword) {
      toast({ title: 'Enter a password', description: 'Please type the new password.', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Weak password', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await supabase.functions.invoke('admin-operations', {
        body: { action: 'change_user_password', data: { user_id: userId, password: newPassword } },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);

      toast({ title: 'Password updated', description: `Password changed for ${email}.` });
      setChangingPasswordUserId(null);
      setNewPassword('');
    } catch (error: any) {
      console.error('Change password error:', error);
      toast({ title: 'Failed to change password', description: error.message || 'Something went wrong.', variant: 'destructive' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getResellerName = (resellerId: string | null) => {
    if (!resellerId) return 'Unassigned';
    const reseller = resellers.find(r => r.id === resellerId);
    return reseller?.company_name || reseller?.name || 'Unknown';
  };

  // Reset forms when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetResellerForm();
      resetUserForm();
      setChangingPasswordUserId(null);
      setNewPassword('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] bg-background/95 backdrop-blur-xl border-purple-500/30 p-0 gap-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-purple-400 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Reseller Management
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 p-1 rounded-xl bg-card/40 border border-white/10">
            <button
              onClick={() => setActiveTab('resellers')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-orbitron text-[10px] uppercase tracking-widest font-bold transition-all ${
                activeTab === 'resellers'
                  ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
                  : 'text-muted-foreground hover:text-purple-400 hover:bg-purple-500/10 border border-transparent'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Resellers
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-orbitron text-[7px] px-1.5 py-0">
                {resellers.length}
              </Badge>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-orbitron text-[10px] uppercase tracking-widest font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
                  : 'text-muted-foreground hover:text-purple-400 hover:bg-purple-500/10 border border-transparent'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Users
              {resellerUsers.length > 0 && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-orbitron text-[7px] px-1.5 py-0">
                  {resellerUsers.length}
                </Badge>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-6 pb-6">
          {/* ============ RESELLERS TAB ============ */}
          {activeTab === 'resellers' && (
            <div className="space-y-4">
              {/* Add Reseller Button */}
              {!showResellerForm && (
                <Button
                  onClick={() => setShowResellerForm(true)}
                  className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-400/60 text-purple-400 hover:text-purple-300 font-orbitron text-xs"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Reseller
                </Button>
              )}

              {/* Create Reseller Form */}
              {showResellerForm && (
                <div className="bg-card/40 border border-purple-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-orbitron text-xs text-purple-400 uppercase tracking-wider">New Reseller Account</h3>
                    <button onClick={resetResellerForm} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 col-span-2">
                      <Label className="font-orbitron text-[10px] text-muted-foreground uppercase tracking-wider">Company Name *</Label>
                      <Input
                        value={resellerFormData.companyName}
                        onChange={(e) => setResellerFormData({ ...resellerFormData, companyName: e.target.value })}
                        placeholder="Agency / Company name"
                        className="bg-background/50 border-purple-500/20 focus:border-purple-400/50 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-orbitron text-[10px] text-muted-foreground uppercase tracking-wider">Contact Name</Label>
                      <Input
                        value={resellerFormData.contactName}
                        onChange={(e) => setResellerFormData({ ...resellerFormData, contactName: e.target.value })}
                        placeholder="Primary contact"
                        className="bg-background/50 border-purple-500/20 focus:border-purple-400/50 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-orbitron text-[10px] text-muted-foreground uppercase tracking-wider">Email</Label>
                      <Input
                        type="email"
                        value={resellerFormData.contactEmail}
                        onChange={(e) => setResellerFormData({ ...resellerFormData, contactEmail: e.target.value })}
                        placeholder="contact@agency.com"
                        className="bg-background/50 border-purple-500/20 focus:border-purple-400/50 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-orbitron text-[10px] text-muted-foreground uppercase tracking-wider">Phone</Label>
                      <Input
                        type="tel"
                        value={resellerFormData.contactPhone}
                        onChange={(e) => setResellerFormData({ ...resellerFormData, contactPhone: e.target.value })}
                        placeholder="(555) 123-4567"
                        className="bg-background/50 border-purple-500/20 focus:border-purple-400/50 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-orbitron text-[10px] text-muted-foreground uppercase tracking-wider">Notes</Label>
                      <Input
                        value={resellerFormData.notes}
                        onChange={(e) => setResellerFormData({ ...resellerFormData, notes: e.target.value })}
                        placeholder="Additional details..."
                        className="bg-background/50 border-purple-500/20 focus:border-purple-400/50 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleCreateReseller}
                      disabled={isSubmittingReseller}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-orbitron text-xs"
                    >
                      {isSubmittingReseller ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                      Create Reseller
                    </Button>
                    <Button onClick={resetResellerForm} variant="outline" className="border-white/10 font-orbitron text-xs">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Resellers List */}
              <ScrollArea className="max-h-[45vh]">
                {resellers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground font-orbitron text-xs">
                    No reseller accounts yet. Create your first one above.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {resellers.map((reseller) => {
                      const userCount = resellerUsers.filter((u: any) => u.reseller_id === reseller.id).length;
                      return (
                        <div
                          key={reseller.id}
                          className="flex items-center gap-3 p-3 bg-card/30 border border-white/10 rounded-xl hover:border-purple-500/30 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-foreground truncate font-orbitron">
                                {reseller.company_name || reseller.name}
                              </p>
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-orbitron text-[7px] px-1.5 py-0">
                                RESELLER
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              {reseller.email && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Mail className="w-2.5 h-2.5" />
                                  {reseller.email}
                                </span>
                              )}
                              <span className="text-[10px] text-purple-400/70 flex items-center gap-1">
                                <Users className="w-2.5 h-2.5" />
                                {userCount} user{userCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* ============ USERS TAB ============ */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Add User Button */}
              {!showUserForm && (
                <Button
                  onClick={() => setShowUserForm(true)}
                  className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-400/60 text-purple-400 hover:text-purple-300 font-orbitron text-xs"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add User to Reseller
                </Button>
              )}

              {/* Create User Form */}
              {showUserForm && (
                <div className="bg-card/40 border border-purple-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-orbitron text-xs text-purple-400 uppercase tracking-wider">New Reseller Login</h3>
                    <button onClick={resetUserForm} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="font-orbitron text-[10px] text-muted-foreground uppercase tracking-wider">Email *</Label>
                      <Input
                        type="email"
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                        placeholder="user@example.com"
                        className="bg-background/50 border-purple-500/20 focus:border-purple-400/50 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-orbitron text-[10px] text-muted-foreground uppercase tracking-wider">Password *</Label>
                      <Input
                        type="text"
                        value={userFormData.password}
                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                        placeholder="Min 6 characters"
                        className="bg-background/50 border-purple-500/20 focus:border-purple-400/50 text-sm font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-orbitron text-[10px] text-muted-foreground uppercase tracking-wider">Full Name</Label>
                      <Input
                        value={userFormData.fullName}
                        onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                        placeholder="John Doe"
                        className="bg-background/50 border-purple-500/20 focus:border-purple-400/50 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-orbitron text-[10px] text-muted-foreground uppercase tracking-wider">Assign to Reseller *</Label>
                      <select
                        value={userFormData.resellerId}
                        onChange={(e) => setUserFormData({ ...userFormData, resellerId: e.target.value })}
                        className="w-full h-9 rounded-md border border-purple-500/20 bg-background/50 px-3 text-sm focus:border-purple-400/50 focus:outline-none focus:ring-1 focus:ring-purple-400/50"
                      >
                        <option value="">Select reseller...</option>
                        {resellers.map(r => (
                          <option key={r.id} value={r.id}>{r.company_name || r.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleCreateUser}
                      disabled={isSubmittingUser}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-orbitron text-xs"
                    >
                      {isSubmittingUser ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                      Create User
                    </Button>
                    <Button onClick={resetUserForm} variant="outline" className="border-white/10 font-orbitron text-xs">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Users List */}
              <ScrollArea className="max-h-[45vh]">
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  </div>
                ) : resellerUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground font-orbitron text-xs">
                    No reseller users yet. Add a user above to give them portal access.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {resellerUsers.map((user: any) => (
                      <div
                        key={user.user_id}
                        className="bg-card/30 border border-white/10 rounded-xl hover:border-purple-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 p-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                            <User className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate">
                                {user.full_name || user.email || 'Unknown'}
                              </p>
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-orbitron text-[7px] px-1.5 py-0">
                                RESELLER
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Mail className="w-2.5 h-2.5" />
                                {user.email}
                              </span>
                              <span className="text-[10px] text-purple-400/70 flex items-center gap-1">
                                <Building2 className="w-2.5 h-2.5" />
                                {getResellerName(user.reseller_id)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                if (changingPasswordUserId === user.user_id) {
                                  setChangingPasswordUserId(null);
                                  setNewPassword('');
                                } else {
                                  setChangingPasswordUserId(user.user_id);
                                  setNewPassword('');
                                }
                              }}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                changingPasswordUserId === user.user_id
                                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                                  : 'bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 text-purple-400'
                              }`}
                              title="Change password"
                            >
                              <KeyRound className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.user_id, user.email)}
                              disabled={deletingUserId === user.user_id}
                              className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                              title="Delete user"
                            >
                              {deletingUserId === user.user_id ? (
                                <Loader2 className="w-3 h-3 animate-spin text-red-400" />
                              ) : (
                                <Trash2 className="w-3 h-3 text-red-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Inline password change form */}
                        {changingPasswordUserId === user.user_id && (
                          <div className="px-3 pb-3 pt-0">
                            <div className="flex items-center gap-2 p-2 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                              <Input
                                type="text"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New password (min 6 chars)"
                                className="h-7 bg-background/50 border-purple-500/20 focus:border-purple-400/50 text-xs font-mono flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleChangePassword(user.user_id, user.email);
                                  if (e.key === 'Escape') { setChangingPasswordUserId(null); setNewPassword(''); }
                                }}
                                autoFocus
                              />
                              <Button
                                onClick={() => handleChangePassword(user.user_id, user.email)}
                                disabled={isChangingPassword || !newPassword}
                                size="sm"
                                className="h-7 px-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-orbitron text-[9px]"
                              >
                                {isChangingPassword ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                              </Button>
                              <button
                                onClick={() => { setChangingPasswordUserId(null); setNewPassword(''); }}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                              >
                                <X className="w-3 h-3 text-muted-foreground" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResellerUserManagement;
