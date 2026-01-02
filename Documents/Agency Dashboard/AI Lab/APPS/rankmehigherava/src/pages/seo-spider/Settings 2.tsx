import React from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Settings as SettingsIcon, Bell, Lock, User, Palette, Globe, Shield, Trash2 } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, profile } = useAuth();

  return (
    <>
      <Helmet>
        <title>Settings | AVA SEO</title>
        <meta name="description" content="Manage your account and application settings." />
      </Helmet>
      <DashboardLayout>
        <PageHeader title="Settings" description="Manage your account and preferences" icon={SettingsIcon} />

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" />Profile</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-red-600 text-primary-foreground text-lg font-bold">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="bg-card/20 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/40 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">Change Avatar</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" defaultValue={profile?.full_name || ''} className="bg-secondary/30 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user?.email || ''} disabled className="bg-secondary/30 border-border/50 opacity-60" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue={profile?.phone || ''} className="bg-secondary/30 border-border/50" />
                  </div>
                  <Button className="bg-card/30 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/50 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">Save Changes</Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-primary" />Notifications</CardTitle>
                  <CardDescription>Configure how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: 'Email Notifications', desc: 'Receive updates via email' },
                    { title: 'Weekly Reports', desc: 'Get a weekly summary of your SEO performance' },
                    { title: 'Ranking Alerts', desc: 'Get notified when rankings change significantly' },
                    { title: 'New Reviews', desc: 'Get notified when you receive new reviews' },
                  ].map((item, index) => (
                    <React.Fragment key={item.title}>
                      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/5 transition-colors">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                      </div>
                      {index < 3 && <Separator className="bg-border/30" />}
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" />Security</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/5 transition-colors">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                    <Button variant="outline" className="bg-card/20 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/40 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">Change Password</Button>
                  </div>
                  <Separator className="bg-border/30" />
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/5 transition-colors">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline" className="bg-card/20 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/40 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">Enable</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-primary" />Appearance</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Dark Mode</span>
                    <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" />Language</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">English (US)</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-card/20 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/40 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">Change</Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-destructive/30">
                <CardHeader><CardTitle className="text-destructive flex items-center gap-2"><Trash2 className="w-5 h-5" />Danger Zone</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground">Delete Account</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Settings;
