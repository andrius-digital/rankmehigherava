import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Building2, MapPin, Palette, ArrowLeft, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { GeneratedPrompt } from "@/components/GeneratedPrompt";

interface SubmissionData {
  companyName: string;
  businessEmail: string;
  businessPhone: string;
  mainCity: string;
  serviceAreas: string;
  serviceCategory: string;
  domainName: string;
  websiteColors: string;
  additionalNotes: string;
  [key: string]: any;
}

const WebsiteSubmissionConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const submissionData = location.state as SubmissionData | null;

  useEffect(() => {
    if (!submissionData) {
      navigate("/website-submissions");
    }
  }, [submissionData, navigate]);

  if (!submissionData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Submission Confirmed | Rank Me Higher</title>
        <meta name="description" content="Your website onboarding form has been submitted successfully." />
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in-up">
              Submission Confirmed!
            </h1>
            <p className="text-muted-foreground text-lg animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Thank you for completing the website onboarding form. Our team will review your submission and get back to you soon.
            </p>
          </div>

          {/* Generated Website Prompt */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <GeneratedPrompt formData={submissionData} />
          </div>

          {/* Summary Cards */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {/* Business Info */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-primary" />
                <h2 className="font-heading text-xl font-bold text-foreground">Business Information</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Company Name</p>
                  <p className="text-foreground font-medium">{submissionData.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Business Email</p>
                  <p className="text-foreground font-medium">{submissionData.businessEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-foreground font-medium">{submissionData.businessPhone}</p>
                </div>
                {submissionData.domainName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Domain</p>
                    <p className="text-foreground font-medium">{submissionData.domainName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Services */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-primary" />
                <h2 className="font-heading text-xl font-bold text-foreground">Location & Services</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Main City</p>
                  <p className="text-foreground font-medium">{submissionData.mainCity}</p>
                </div>
                {submissionData.serviceCategory && (
                  <div>
                    <p className="text-sm text-muted-foreground">Service Category</p>
                    <p className="text-foreground font-medium">{submissionData.serviceCategory}</p>
                  </div>
                )}
                {submissionData.serviceAreas && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Service Areas</p>
                    <p className="text-foreground font-medium">{submissionData.serviceAreas}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Branding */}
            {submissionData.websiteColors && (
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Palette className="w-6 h-6 text-primary" />
                  <h2 className="font-heading text-xl font-bold text-foreground">Branding Preferences</h2>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Website Colors</p>
                  <p className="text-foreground font-medium">{submissionData.websiteColors}</p>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {submissionData.additionalNotes && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-heading text-xl font-bold text-foreground mb-4">Additional Notes</h2>
                <p className="text-foreground">{submissionData.additionalNotes}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Home
            </Button>
            <Button
              size="lg"
              onClick={() => navigate("/website-submissions")}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Submit Another
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WebsiteSubmissionConfirmation;
