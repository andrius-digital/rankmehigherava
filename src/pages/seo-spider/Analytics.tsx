import React from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, Eye, Clock, MousePointer } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const Analytics: React.FC = () => {
  const trafficData = [
    { name: 'Jan', organic: 4000, direct: 2400, referral: 1200 },
    { name: 'Feb', organic: 4500, direct: 2600, referral: 1400 },
    { name: 'Mar', organic: 5200, direct: 2800, referral: 1600 },
    { name: 'Apr', organic: 5800, direct: 3000, referral: 1800 },
    { name: 'May', organic: 6400, direct: 3200, referral: 2000 },
    { name: 'Jun', organic: 7200, direct: 3400, referral: 2200 },
  ];

  const keywordData = [
    { keyword: 'plumber near me', position: 3, change: '+2' },
    { keyword: 'emergency plumbing', position: 5, change: '+1' },
    { keyword: 'water heater repair', position: 8, change: '-1' },
    { keyword: 'drain cleaning', position: 4, change: '+3' },
    { keyword: 'pipe repair service', position: 12, change: '0' },
  ];

  const stats = [
    { label: 'Total Visits', value: '24,521', change: '+12.5%', icon: Eye },
    { label: 'Unique Visitors', value: '18,234', change: '+8.3%', icon: Users },
    { label: 'Avg. Session', value: '3m 42s', change: '+5.2%', icon: Clock },
    { label: 'Click Rate', value: '4.8%', change: '+0.8%', icon: MousePointer },
  ];

  return (
    <>
      <Helmet>
        <title>Analytics | AVA SEO</title>
        <meta name="description" content="View detailed analytics and performance metrics for your SEO campaigns." />
      </Helmet>
      <DashboardLayout>
        <PageHeader
          title="Analytics"
          description="Track your SEO performance and website metrics"
          icon={BarChart3}
        />

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card 
                key={stat.label} 
                className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-red-600/20 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs text-green-500 font-semibold bg-green-500/10 px-2 py-1 rounded-full">{stat.change}</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="traffic" className="space-y-4">
            <TabsList className="bg-secondary/50 border border-border/50">
              <TabsTrigger value="traffic" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Traffic</TabsTrigger>
              <TabsTrigger value="keywords" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Keywords</TabsTrigger>
              <TabsTrigger value="sources" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sources</TabsTrigger>
            </TabsList>

            <TabsContent value="traffic">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Traffic Overview
                  </CardTitle>
                  <CardDescription>Website traffic by source over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trafficData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.2)',
                          }}
                        />
                        <Line type="monotone" dataKey="organic" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))' }} />
                        <Line type="monotone" dataKey="direct" stroke="hsl(217 91% 60%)" strokeWidth={2} />
                        <Line type="monotone" dataKey="referral" stroke="hsl(142 76% 36%)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="keywords">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Keyword Rankings</CardTitle>
                  <CardDescription>Your top performing keywords in search results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {keywordData.map((kw, index) => (
                      <div 
                        key={kw.keyword} 
                        className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/20 transition-all animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div>
                          <p className="font-medium">{kw.keyword}</p>
                          <p className="text-sm text-muted-foreground">Position: <span className="text-primary font-semibold">#{kw.position}</span></p>
                        </div>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          kw.change.startsWith('+') 
                            ? 'text-green-500 bg-green-500/10' 
                            : kw.change.startsWith('-') 
                              ? 'text-red-500 bg-red-500/10' 
                              : 'text-muted-foreground bg-muted/50'
                        }`}>
                          {kw.change}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sources">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Where your visitors are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trafficData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                          }}
                        />
                        <Bar dataKey="organic" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="direct" fill="hsl(217 91% 60%)" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="referral" fill="hsl(142 76% 36%)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Analytics;
