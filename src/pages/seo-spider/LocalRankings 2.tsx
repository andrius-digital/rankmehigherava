import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, TrendingUp, TrendingDown, Minus, RefreshCw, Target } from 'lucide-react';

const LocalRankings: React.FC = () => {
  const [keyword, setKeyword] = useState('plumber near me');
  const [isScanning, setIsScanning] = useState(false);

  const gridData = [
    { position: 1, trend: 'up' }, { position: 2, trend: 'up' }, { position: 3, trend: 'same' }, { position: 5, trend: 'down' }, { position: 1, trend: 'same' },
    { position: 2, trend: 'up' }, { position: 4, trend: 'down' }, { position: 3, trend: 'same' }, { position: 1, trend: 'up' }, { position: 2, trend: 'same' },
    { position: 3, trend: 'up' }, { position: 6, trend: 'down' }, { position: 2, trend: 'up' }, { position: 1, trend: 'up' }, { position: 3, trend: 'same' },
    { position: 4, trend: 'same' }, { position: 3, trend: 'down' }, { position: 2, trend: 'up' }, { position: 1, trend: 'up' }, { position: 2, trend: 'same' },
    { position: 5, trend: 'down' }, { position: 4, trend: 'same' }, { position: 3, trend: 'up' }, { position: 2, trend: 'up' }, { position: 1, trend: 'up' },
  ];

  const getPositionColor = (position: number) => {
    if (position <= 3) return 'bg-gradient-to-br from-green-500 to-green-600';
    if (position <= 5) return 'bg-gradient-to-br from-yellow-500 to-yellow-600';
    if (position <= 10) return 'bg-gradient-to-br from-orange-500 to-orange-600';
    return 'bg-gradient-to-br from-red-500 to-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-400" />;
      default: return <Minus className="w-3 h-3 text-white/50" />;
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  const avgPosition = (gridData.reduce((sum, d) => sum + d.position, 0) / gridData.length).toFixed(1);
  const top3Count = gridData.filter((d) => d.position <= 3).length;

  return (
    <>
      <Helmet>
        <title>Local Rankings | AVA SEO</title>
        <meta name="description" content="Track your local search rankings across your service area." />
      </Helmet>
      <DashboardLayout>
        <PageHeader title="Local Rankings" description="Track your position in local search results" icon={MapPin}>
          <Button onClick={handleScan} disabled={isScanning} className="bg-card/30 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/50 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Scan Now'}
          </Button>
        </PageHeader>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Avg. Position', value: avgPosition, Icon: Target, color: 'text-primary' },
              { label: 'Top 3 Positions', value: top3Count.toString(), badge: '#3', badgeColor: 'text-green-500 bg-green-500/10' },
              { label: 'Grid Points', value: '25', badge: '25', badgeColor: 'text-cyan-400 bg-cyan-500/10' },
            ].map((stat, index) => (
              <Card key={stat.label} className="bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-red-600/20 flex items-center justify-center">
                      {stat.Icon ? <stat.Icon className={`w-5 h-5 ${stat.color}`} /> : <span className={`text-sm font-bold ${stat.badgeColor}`}>{stat.badge}</span>}
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
              <CardTitle className="flex items-center gap-2"><Search className="w-5 h-5 text-primary" />Keyword Tracking</CardTitle>
              <CardDescription>Enter a keyword to track your local rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Enter keyword..." className="pl-9 bg-secondary/30 border-border/50" />
                </div>
                <Button variant="outline" className="bg-card/20 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/40 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">Add Keyword</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Ranking Grid for "{keyword}"</CardTitle>
              <CardDescription>Your position in local search results across a 5x5 grid</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
                {gridData.map((cell, index) => (
                  <div key={index} className={`aspect-square rounded-xl ${getPositionColor(cell.position)} flex flex-col items-center justify-center text-white font-bold relative shadow-lg transition-transform hover:scale-105`}>
                    <span className="text-lg">#{cell.position}</span>
                    <div className="absolute bottom-1 right-1">{getTrendIcon(cell.trend)}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                {[{ color: 'bg-green-500', label: 'Position 1-3' }, { color: 'bg-yellow-500', label: 'Position 4-5' }, { color: 'bg-orange-500', label: 'Position 6-10' }, { color: 'bg-red-500', label: 'Position 10+' }].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${item.color}`} />
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader><CardTitle>Tracked Keywords</CardTitle><CardDescription>All keywords you're monitoring</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['plumber near me', 'emergency plumbing', 'water heater repair', 'drain cleaning'].map((kw, index) => (
                  <div key={kw} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/20 transition-all animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <span className="font-medium">{kw}</span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/10 text-primary">Avg #2.4</Badge>
                      <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">View</Button>
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

export default LocalRankings;
