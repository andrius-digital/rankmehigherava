import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Users, Building2, Search, Eye, Ban, MoreVertical, Activity, TrendingUp, DollarSign } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { isAdmin, startImpersonation } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.company_name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const stats = [
    { label: 'Total Users', value: users.length.toString(), Icon: Users, color: 'text-cyan-400' },
    { label: 'Active Today', value: '24', Icon: Activity, color: 'text-green-500' },
    { label: 'MRR', value: '$12,450', Icon: DollarSign, color: 'text-yellow-500' },
    { label: 'Growth', value: '+12%', Icon: TrendingUp, color: 'text-primary' },
  ];

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Card className="max-w-md bg-card/50 backdrop-blur-sm border-destructive/30">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-heading font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | AVA SEO</title>
        <meta name="description" content="Administrator dashboard for managing users and system settings." />
      </Helmet>
      <DashboardLayout>
        <PageHeader title="Admin Dashboard" description="Manage users and system settings" icon={Shield} />

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={stat.label} className="bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-red-600/20 flex items-center justify-center">
                      <stat.Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="bg-secondary/50 border border-border/50">
              <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Users</TabsTrigger>
              <TabsTrigger value="companies" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Companies</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-secondary/30 border-border/50" />
                </div>
              </div>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading users...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No users found</div>
                  ) : (
                    <div className="divide-y divide-border/30">
                      {filteredUsers.map((user, index) => (
                        <div key={user.id} className="p-4 hover:bg-primary/5 transition-colors animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                          <div className="flex items-center gap-4">
                            <Avatar className="border-2 border-primary/20">
                              <AvatarFallback className="bg-gradient-to-br from-primary to-red-600 text-primary-foreground font-semibold">
                                {user.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{user.full_name || 'No name'}</span>
                                {user.company_name && <Badge variant="outline" className="border-border/50">{user.company_name}</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                              <p className="text-sm text-muted-foreground">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="hover:bg-primary/10"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border-border">
                                <DropdownMenuItem onClick={() => startImpersonation({ id: user.id, email: user.email, full_name: user.full_name || undefined })}>
                                  <Eye className="w-4 h-4 mr-2" />View as User
                                </DropdownMenuItem>
                                <DropdownMenuItem>Edit User</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive"><Ban className="w-4 h-4 mr-2" />Suspend User</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="companies">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-red-600/20 flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground font-medium">Company management coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-red-600/20 flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground font-medium">Activity logs coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default AdminDashboard;
