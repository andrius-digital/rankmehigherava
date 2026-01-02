import React from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, ExternalLink, Bot, Sparkles } from 'lucide-react';

const Reviews: React.FC = () => {
  const reviews = [
    { id: '1', author: 'John D.', rating: 5, text: 'Excellent service! They fixed our water heater the same day.', date: '2024-03-15', source: 'Google', responded: true },
    { id: '2', author: 'Sarah M.', rating: 4, text: 'Good work on the drain cleaning. Would have appreciated a heads up.', date: '2024-03-14', source: 'Google', responded: false },
    { id: '3', author: 'Mike R.', rating: 5, text: 'Best plumbers in town! They went above and beyond.', date: '2024-03-12', source: 'Yelp', responded: true },
    { id: '4', author: 'Emily W.', rating: 2, text: "Technician was late and the fix didn't last.", date: '2024-03-10', source: 'Google', responded: false },
  ];

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const renderStars = (rating: number) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
  ));

  const stats = [
    { label: 'Avg. Rating', value: avgRating, Icon: Star, color: 'text-yellow-500', isRating: true },
    { label: 'Total Reviews', value: '127', Icon: MessageSquare, color: 'text-cyan-400' },
    { label: 'Positive (4-5★)', value: '112', Icon: ThumbsUp, color: 'text-green-500' },
    { label: 'Negative (1-2★)', value: '8', Icon: ThumbsDown, color: 'text-red-500' },
  ];

  return (
    <>
      <Helmet>
        <title>Reviews | AVA SEO</title>
        <meta name="description" content="Manage and respond to your customer reviews." />
      </Helmet>
      <DashboardLayout>
        <PageHeader title="Review Management" description="Monitor and respond to customer reviews" icon={Star}>
          <Button className="bg-card/30 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/50 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
            <ExternalLink className="w-4 h-4 mr-2" />
            Request Reviews
          </Button>
        </PageHeader>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={stat.label} className="bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-red-600/20 flex items-center justify-center">
                      {stat.isRating ? (
                        <div className="flex">{renderStars(5).slice(0, 3)}</div>
                      ) : (
                        <stat.Icon className={`w-5 h-5 ${stat.color}`} />
                      )}
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

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-secondary/50 border border-border/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Reviews</TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Needs Response</TabsTrigger>
              <TabsTrigger value="responded" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Responded</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {reviews.map((review, index) => (
                <Card key={review.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{review.author}</span>
                          <div className="flex">{renderStars(review.rating)}</div>
                          <Badge variant="outline" className="border-border/50">{review.source}</Badge>
                          {review.responded && <Badge className="bg-green-500/10 text-green-500">Responded</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{review.text}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                      <div className="flex sm:flex-col gap-2">
                        <Button variant="outline" size="sm" className="bg-card/20 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/40 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                          <MessageSquare className="w-4 h-4 mr-2" />Reply
                        </Button>
                        <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                          <Sparkles className="w-4 h-4 mr-2" />AI Reply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="pending"><p className="text-muted-foreground text-center py-8">Reviews needing response will appear here.</p></TabsContent>
            <TabsContent value="responded"><p className="text-muted-foreground text-center py-8">Responded reviews will appear here.</p></TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Reviews;
