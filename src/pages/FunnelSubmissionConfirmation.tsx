import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Building2, Target, ArrowLeft, Mail, Phone } from "lucide-react";
import { useEffect } from "react";

interface SubmissionData {
  companyName: string;
  businessEmail: string;
  businessPhone: string;
  funnelGoal: string;
  mainOffer: string;
  [key: string]: any;
}

const FunnelSubmissionConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const submissionData = location.state as SubmissionData | null;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    if (!submissionData) {
      navigate("/funnel-submissions");
    }
  }, [submissionData, navigate]);

  if (!submissionData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Funnel Submission Confirmed | Rank Me Higher</title>
        <meta name="description" content="Your funnel onboarding form has been submitted successfully." />
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Compact Success Card */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-background to-background border border-emerald-500/20 rounded-2xl p-6 md:p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
              Funnel Submission Confirmed!
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mb-6">
              Thank you for submitting your funnel project. Our team will review and get back to you soon.
            </p>

            {/* Quick Info Summary */}
            <div className="bg-card/50 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="font-semibold text-lg">{submissionData.companyName}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate">{submissionData.businessEmail}</span>
                </div>
                {submissionData.businessPhone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>{submissionData.businessPhone}</span>
                  </div>
                )}
              </div>
              {submissionData.funnelGoal && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-muted-foreground">Goal: </span>
                      <span className="text-sm">{submissionData.funnelGoal}</span>
                    </div>
                  </div>
                </div>
              )}
              {submissionData.mainOffer && (
                <div className="mt-2">
                  <span className="text-xs text-muted-foreground">Offer: </span>
                  <span className="text-sm font-medium">{submissionData.mainOffer}</span>
                </div>
              )}
            </div>

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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FunnelSubmissionConfirmation;
