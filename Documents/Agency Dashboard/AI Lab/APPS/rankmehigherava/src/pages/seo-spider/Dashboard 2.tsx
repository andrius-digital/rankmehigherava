import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  Star,
  MapPin,
  FileText,
  ArrowRight,
  Zap,
  CheckCircle,
  AlertCircle,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { profile, user } = useAuth();
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  const stats = [
    { label: 'Google Rankings', value: '24', change: '+5', icon: TrendingUp, trend: 'up' },
    { label: 'Reviews', value: '127', change: '+12', icon: Star, trend: 'up' },
    { label: 'Local Citations', value: '89', change: '+3', icon: MapPin, trend: 'up' },
    { label: 'Blog Posts', value: '18', change: '+2', icon: FileText, trend: 'up' },
  ];

  const quickActions = [
    { label: 'Generate Blog Post', href: '/avaseo/blogs', icon: FileText },
    { label: 'Check Rankings', href: '/avaseo/local-rankings', icon: MapPin },
    { label: 'View Analytics', href: '/avaseo/analytics', icon: BarChart3 },
    { label: 'Manage Reviews', href: '/avaseo/reviews', icon: Star },
  ];

  const integrations = [
    { name: 'Google Business Profile', status: 'connected', icon: '🔗' },
    { name: 'Google Analytics', status: 'pending', icon: '📊' },
    { name: 'Google Search Console', status: 'disconnected', icon: '🔍' },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard | AVA SEO by Rank Me Higher</title>
        <meta name="description" content="Monitor your SEO performance and manage your local marketing campaigns." />
      </Helmet>
      <DashboardLayout>
        <PageHeader
          title={`Welcome back, ${displayName}!`}
          description="Here's what's happening with your SEO campaigns today."
          icon={LayoutDashboard}
        >
          <Button asChild className="bg-card/30 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/50 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
            <Link to="/avaseo/ai-assistant">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Assistant
            </Link>
          </Button>
        </PageHeader>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card 
                key={stat.label} 
                className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="relative w-10 h-10 rounded-xl bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-pulse" />
                      <stat.icon className="w-5 h-5 text-cyan-400 relative z-10" />
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Get things done faster with one-click actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => (
                    <Link key={action.label} to={action.href}>
                      <div className="group relative p-4 rounded-xl bg-cyan-500/5 backdrop-blur-md border border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all duration-300 cursor-pointer overflow-hidden">
                        {/* Animated light effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse" />
                        </div>
                        <div className="relative flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300">
                            <action.icon className="w-5 h-5 text-cyan-400" />
                          </div>
                          <span className="font-medium text-sm flex-1 text-white">{action.label}</span>
                          <ArrowRight className="w-4 h-4 text-cyan-400/60 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Integrations Status */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Connected services status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {integrations.map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{integration.icon}</span>
                      <span className="text-sm font-medium">{integration.name}</span>
                    </div>
                    {integration.status === 'connected' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {integration.status === 'pending' && (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                    {integration.status === 'disconnected' && (
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* SEO Score */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                SEO Health Score
              </CardTitle>
              <CardDescription>Your overall SEO performance across all channels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">Overall Score</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-red-500 bg-clip-text text-transparent">78%</span>
                  </div>
                  <div className="relative">
                    <Progress value={78} className="h-3" />
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 rounded-full blur-sm" />
                  </div>
                </div>
                <Button variant="outline" asChild className="bg-card/20 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/40 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                  <Link to="/avaseo/analytics">View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
