import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Building2, MapPin, Palette, ArrowLeft, Mail, Phone, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [showDetails, setShowDetails] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

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

      <main className="flex-1 pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Compact Success Card */}
          <div className="bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 rounded-2xl p-6 md:p-8 text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
              Submission Confirmed!
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mb-6">
              Thank you for completing the website onboarding form. Our team will review your submission and get back to you soon.
            </p>

            {/* Quick Info Summary - Always visible */}
            <div className="bg-card/50 rounded-xl p-4 mb-4 text-left">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="w-5 h-5 text-primary shrink-0" />
                <span className="font-semibold text-lg">{submissionData.companyName}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate">{submissionData.businessEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{submissionData.businessPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{submissionData.mainCity}</span>
                </div>
                {submissionData.domainName && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="w-4 h-4 shrink-0" />
                    <span className="truncate">{submissionData.domainName}</span>
                  </div>
                )}
              </div>
              {submissionData.serviceCategory && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">Service: </span>
                  <span className="text-sm font-medium">{submissionData.serviceCategory}</span>
                </div>
              )}
            </div>

            {/* Show More Details Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors mb-4"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  View Full Details
                </>
              )}
            </button>

            {/* Action Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Home
              </Button>
            </div>
          </div>

          {/* Expandable Details Section */}
          {showDetails && (
            <div className="space-y-4 animate-fade-in">
              {/* Service Areas */}
              {submissionData.serviceAreas && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Service Areas</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{submissionData.serviceAreas}</p>
                </div>
              )}

              {/* Branding */}
              {submissionData.websiteColors && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Branding Preferences</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{submissionData.websiteColors}</p>
                </div>
              )}

              {/* Additional Notes */}
              {submissionData.additionalNotes && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Additional Notes</h3>
                  <p className="text-sm text-muted-foreground">{submissionData.additionalNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WebsiteSubmissionConfirmation;
