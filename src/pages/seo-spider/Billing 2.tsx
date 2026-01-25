import React from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Check, Zap, Crown, Building2, Download, Sparkles } from 'lucide-react';

const Billing: React.FC = () => {
  const currentPlan = 'pro';
  
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 49,
      icon: Zap,
      features: [
        '5 Keywords tracked',
        '100 AI credits/month',
        'Basic analytics',
        'Email support',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      icon: Crown,
      popular: true,
      features: [
        '25 Keywords tracked',
        '500 AI credits/month',
        'Advanced analytics',
        'Priority support',
        'Review management',
        'Blog automation',
      ],
    },
    {
      id: 'agency',
      name: 'Agency',
      price: 249,
      icon: Building2,
      features: [
        'Unlimited keywords',
        'Unlimited AI credits',
        'White-label reports',
        'Dedicated support',
        'Multi-location',
        'Team collaboration',
        'API access',
      ],
    },
  ];

  const invoices = [
    { id: 'INV-001', date: '2024-01-01', amount: '$99.00', status: 'paid' },
    { id: 'INV-002', date: '2024-02-01', amount: '$99.00', status: 'paid' },
    { id: 'INV-003', date: '2024-03-01', amount: '$99.00', status: 'pending' },
  ];

  return (
    <>
      <Helmet>
        <title>Billing | AVA SEO</title>
        <meta name="description" content="Manage your subscription and billing information." />
      </Helmet>
      <DashboardLayout>
        <PageHeader
          title="Billing & Subscription"
          description="Manage your plan and payment details"
          icon={CreditCard}
        />

        <div className="p-6 space-y-6">
          {/* Current Usage */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Current Usage
              </CardTitle>
              <CardDescription>Your usage this billing period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">AI Credits</span>
                  <span className="font-semibold">324 / 500</span>
                </div>
                <div className="relative">
                  <Progress value={64.8} className="h-3" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Keywords Tracked</span>
                  <span className="font-semibold">18 / 25</span>
                </div>
                <Progress value={72} className="h-3" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Blog Posts Generated</span>
                  <span className="font-semibold text-primary">12 / unlimited</span>
                </div>
                <Progress value={100} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Plans */}
          <div>
            <h2 className="text-lg font-heading font-semibold mb-4">Available Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan, index) => (
                <Card
                  key={plan.id}
                  className={`bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 animate-fade-in relative overflow-hidden ${
                    currentPlan === plan.id ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''
                  } ${plan.popular ? 'border-primary/50' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-red-600 text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                      POPULAR
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center shadow-lg shadow-primary/30">
                        <plan.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <div className="mt-1">
                          <span className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">${plan.price}</span>
                          <span className="text-muted-foreground text-sm">/month</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm">
                          <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-green-500" />
                          </div>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className={`w-full ${
                        currentPlan === plan.id 
                          ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' 
                          : 'bg-card/30 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/50 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all'
                      }`}
                      disabled={currentPlan === plan.id}
                    >
                      {currentPlan === plan.id ? 'Current Plan' : 'Upgrade'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Invoice History */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>Download your past invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((invoice, index) => (
                  <div 
                    key={invoice.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/20 transition-all animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">{invoice.amount}</span>
                      <Badge 
                        variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                        className={invoice.status === 'paid' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}
                      >
                        {invoice.status}
                      </Badge>
                      <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                        <Download className="w-4 h-4" />
                      </Button>
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

export default Billing;
