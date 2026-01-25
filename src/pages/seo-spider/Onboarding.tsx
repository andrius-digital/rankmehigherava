import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Building2, MapPin, Globe, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    companyName: '',
    phone: '',
    address: '',
    website: '',
    description: '',
    primaryKeyword: '',
    targetAreas: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      toast({
        title: 'Welcome to AVA SEO!',
        description: 'Your account has been set up successfully.',
      });
      navigate('/avaseo');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <>
      <Helmet>
        <title>Get Started | AVA SEO</title>
        <meta name="description" content="Set up your AVA SEO account in just a few steps." />
      </Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-lg bg-primary mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">S</span>
            </div>
            <CardTitle className="text-2xl">Welcome to AVA SEO</CardTitle>
            <CardDescription>Let's get your account set up in just a few steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {step} of {totalSteps}</span>
                <span>{Math.round((step / totalSteps) * 100)}% complete</span>
              </div>
              <Progress value={(step / totalSteps) * 100} />
            </div>

            {/* Step 1: Business Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Business Information</h3>
                    <p className="text-sm text-muted-foreground">Tell us about your business</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => updateField('companyName', e.target.value)}
                      placeholder="Acme Plumbing"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Service Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Service Details</h3>
                    <p className="text-sm text-muted-foreground">Define your service areas and keywords</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe what your business does..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryKeyword">Primary Keyword</Label>
                  <Input
                    id="primaryKeyword"
                    value={formData.primaryKeyword}
                    onChange={(e) => updateField('primaryKeyword', e.target.value)}
                    placeholder="e.g., plumber near me"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is the main keyword you want to rank for
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAreas">Target Service Areas</Label>
                  <Textarea
                    id="targetAreas"
                    value={formData.targetAreas}
                    onChange={(e) => updateField('targetAreas', e.target.value)}
                    placeholder="Enter cities or zip codes, one per line"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">You're All Set!</h3>
                    <p className="text-sm text-muted-foreground">Review your information and get started</p>
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-lg bg-secondary/50">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company</span>
                    <span className="font-medium">{formData.companyName || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Website</span>
                    <span className="font-medium">{formData.website || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Primary Keyword</span>
                    <span className="font-medium">{formData.primaryKeyword || 'Not set'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="font-medium mb-2">What happens next?</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      We'll analyze your current online presence
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Set up your local ranking tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Start monitoring your competitors
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack} disabled={step === 1} className="bg-card/20 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/40 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} className="bg-card/30 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/50 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                {step === totalSteps ? 'Get Started' : 'Continue'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Onboarding;
