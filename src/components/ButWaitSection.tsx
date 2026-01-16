import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

const ButWaitSection = () => {
  return (
    <section className="relative py-16 lg:py-24">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20" />
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl relative z-10">
        {/* White Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-primary mb-6">
            But Wait.
          </h2>

          {/* Content */}
          <div className="space-y-6 text-gray-800">
            <p className="font-semibold">
              Before We Can Put{" "}
              <span className="text-primary underline">Local Map Booster</span>{" "}
              Into Practice, There's Something You Should Know
            </p>

            <p className="font-semibold">
              This Approach Ensures Sustainable,{" "}
              <span className="text-primary underline">Long-Term Results</span>{" "}
              Rather Than{" "}
              <span className="text-primary underline">Temporary Ranking Spikes</span>{" "}
              That Don't Last.
            </p>

            <div className="pt-4 space-y-4">
              <p className="font-bold text-lg">
                For New Businesses Or Those Without A Google Business Profile:
              </p>
              <p className="text-gray-600">
                For Local Map Booster SEO Strategy To Work We Require An Established Google Profile To Work Effectively. But Don't Worry – We've Got You Covered!
              </p>
            </div>

            <p className="text-primary font-semibold underline text-lg">
              Here's How We'll Get You There:
            </p>

            <p className="text-gray-600">
              <span className="font-bold text-gray-800">We'll Start With The SEO Forever Setup</span>{" "}
              — A Complete 3-Month SEO Overhaul For Your Website And Google Business Profile. This Includes Full Optimization, Review Request Automations, Lead Capture Strategies, Email Follow-Ups For New Leads, And Boosting Your Local Presence. The Result: An SEO Foundation Built To Generate Organic Leads And Bookings For Years To Come.
            </p>

            <p className="text-gray-600">
              <span className="font-bold text-gray-800">Once Your SEO Has The Right Foundation,</span>{" "}
              We'll Be Able To Offer You{" "}
              <span className="text-primary underline">Local Map Booster</span>{" "}
              And{" "}
              <span className="text-primary underline">Full Scope SEO</span>{" "}
              Services And Start Driving Targeted Visitors To Your Listing And Website To Boost Your Rankings Above Competitors And Generate Consistent Calls And Leads On Autopilot
            </p>

            {/* CTA Button */}
            <div className="pt-6">
              <Button variant="hero" size="lg" className="group">
                BOOK A CALL NOW
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-gray-500 text-xs mt-3">*Limited spaces available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ButWaitSection;
