import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Map, Plus, Trash2, MapPin, Users, Globe } from 'lucide-react';

const ServiceAreas: React.FC = () => {
  const [newArea, setNewArea] = useState('');

  const serviceAreas = [
    { id: '1', name: 'Springfield, IL', zipCodes: ['62701', '62702', '62703'], population: 114394, primary: true },
    { id: '2', name: 'Decatur, IL', zipCodes: ['62521', '62522'], population: 70522, primary: false },
    { id: '3', name: 'Champaign, IL', zipCodes: ['61820', '61821'], population: 88302, primary: false },
    { id: '4', name: 'Bloomington, IL', zipCodes: ['61701', '61704'], population: 78680, primary: false },
  ];

  const handleAddArea = () => {
    if (newArea.trim()) setNewArea('');
  };

  return (
    <>
      <Helmet>
        <title>Service Areas | AVA SEO</title>
        <meta name="description" content="Define and manage your business service areas." />
      </Helmet>
      <DashboardLayout>
        <PageHeader title="Service Areas" description="Define where your business operates" icon={Map} />

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Service Areas', value: serviceAreas.length.toString(), Icon: Map, color: 'text-primary' },
              { label: 'Zip Codes', value: serviceAreas.reduce((sum, a) => sum + a.zipCodes.length, 0).toString(), Icon: MapPin, color: 'text-cyan-400' },
              { label: 'Population Reach', value: `${(serviceAreas.reduce((sum, a) => sum + a.population, 0) / 1000).toFixed(0)}K`, Icon: Users, color: 'text-green-500' },
            ].map((stat, index) => (
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

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />Add Service Area</CardTitle>
              <CardDescription>Enter a city name or zip code to add a new service area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="Enter city name or zip code..." className="flex-1 bg-secondary/30 border-border/50" />
                <Button onClick={handleAddArea} className="bg-card/30 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/50 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                  <Plus className="w-4 h-4 mr-2" />Add Area
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" />Coverage Map</CardTitle>
              <CardDescription>Visual representation of your service areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] bg-gradient-to-br from-secondary/50 to-secondary/30 rounded-xl border border-border/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-red-600/20 flex items-center justify-center mx-auto mb-4">
                    <Map className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground font-medium">Interactive map will display here</p>
                  <p className="text-xs text-muted-foreground mt-1">Requires Mapbox token configuration</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader><CardTitle>Your Service Areas</CardTitle><CardDescription>Manage your existing service areas</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {serviceAreas.map((area, index) => (
                  <div key={area.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/20 transition-all animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-red-600 flex items-center justify-center shadow-lg shadow-primary/20">
                        <MapPin className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{area.name}</span>
                          {area.primary && <Badge className="bg-primary/10 text-primary">Primary</Badge>}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span>{area.zipCodes.length} zip codes</span>
                          <span>•</span>
                          <span>{area.population.toLocaleString()} population</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">Edit</Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default ServiceAreas;
