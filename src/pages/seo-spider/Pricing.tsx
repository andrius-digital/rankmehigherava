import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, Building2, ArrowLeft } from 'lucide-react';

const Pricing: React.FC = () => {
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small businesses just getting started with local SEO',
      price: 49,
      icon: Zap,
      features: [
        '5 Keywords tracked',
        '100 AI credits/month',
        'Basic analytics',
        'Email support',
        '1 Location',
        'Weekly ranking updates',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For growing businesses serious about dominating local search',
      price: 99,
      icon: Crown,
      popular: true,
      features: [
        '25 Keywords tracked',
        '500 AI credits/month',
        'Advanced analytics',
        'Priority support',
        '3 Locations',
        'Daily ranking updates',
        'Review management',
        'Blog automation',
        'Competitor tracking',
      ],
    },
    {
      id: 'agency',
      name: 'Agency',
      description: 'For agencies and enterprises managing multiple locations',
      price: 249,
      icon: Building2,
      features: [
        'Unlimited keywords',
        'Unlimited AI credits',
        'White-label reports',
        'Dedicated support',
        'Unlimited locations',
        'Real-time ranking updates',
        'Full API access',
        'Team collaboration',
        'Custom integrations',
        'SLA guarantee',
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>Pricing | AVA SEO</title>
        <meta name="description" content="Choose the perfect plan for your local SEO needs." />
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Link to="/avaseo" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to AVA Admin Panel
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-heading font-bold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business. All plans include a 14-day free trial.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                variant={plan.popular ? 'featured' : 'default'}
                className={`relative ${plan.popular ? 'scale-105 shadow-xl' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                    <plan.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="min-h-[48px]">{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    Start Free Trial
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-heading font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Can I change plans later?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">What happens after my free trial?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    After your 14-day trial, you'll be automatically charged for your selected plan unless you cancel.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Do you offer refunds?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pricing;
