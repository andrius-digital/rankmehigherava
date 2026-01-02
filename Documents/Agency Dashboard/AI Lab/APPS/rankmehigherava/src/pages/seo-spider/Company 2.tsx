import React from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, MapPin, Clock, Camera, Upload, Palette } from 'lucide-react';

const Company: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Company Settings | AVA SEO</title>
        <meta name="description" content="Manage your business information and settings." />
      </Helmet>
      <DashboardLayout>
        <PageHeader title="Company Settings" description="Manage your business information" icon={Building2} />

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" />Business Information</CardTitle>
                <CardDescription>This information will be used across your SEO campaigns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" placeholder="Your Company Name" defaultValue="Acme Plumbing" className="bg-secondary/30 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="(555) 123-4567" defaultValue="(555) 123-4567" className="bg-secondary/30 border-border/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="123 Main St, City, State 12345" defaultValue="123 Main St, Springfield, IL 62701" className="bg-secondary/30 border-border/50" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" placeholder="https://yourwebsite.com" defaultValue="https://acmeplumbing.com" className="bg-secondary/30 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Business Email</Label>
                    <Input id="email" type="email" placeholder="info@company.com" defaultValue="info@acmeplumbing.com" className="bg-secondary/30 border-border/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea id="description" placeholder="Describe your business..." rows={4} defaultValue="Acme Plumbing provides professional plumbing services to residential and commercial customers in the Springfield area." className="bg-secondary/30 border-border/50" />
                </div>
                <Button className="bg-card/30 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/50 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">Save Changes</Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5 text-primary" />Branding</CardTitle>
                <CardDescription>Your company logo and brand colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square rounded-xl border-2 border-dashed border-primary/30 flex items-center justify-center bg-gradient-to-br from-secondary/30 to-secondary/10 hover:border-primary/50 transition-colors cursor-pointer group">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-red-600/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Upload Logo</p>
                    <Button variant="outline" size="sm" className="mt-3 bg-card/20 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/40 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">Choose File</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Palette className="w-4 h-4 text-primary" />Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-red-600 shadow-lg shadow-primary/30" />
                    <Input type="text" defaultValue="#E31837" className="font-mono bg-secondary/30 border-border/50" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" />Business Hours</CardTitle>
              <CardDescription>Set your operating hours for local SEO</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                  <div key={day} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/20 transition-all animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <span className="text-sm font-medium w-24">{day}</span>
                    <span className={`text-sm ${day === 'Sunday' ? 'text-red-400' : 'text-muted-foreground'}`}>{day === 'Sunday' ? 'Closed' : '8:00 AM - 6:00 PM'}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-4 bg-card/20 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/40 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">Edit Hours</Button>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" />Primary Service Area</CardTitle>
              <CardDescription>Define your main service location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-gradient-to-br from-secondary/50 to-secondary/30 rounded-xl border border-border/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-red-600/20 flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Map will display here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Company;
