import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";

const promiseCards = [
  {
    title: "Long-term Timeless Strategies",
    description: "Clear, strategic plan that brings in consistent customers every single month."
  },
  {
    title: "More Revenue, Less Stress",
    description: "Increase your profits, and gives you back your weekends and peace of mind."
  },
  {
    title: "Online Market Dominance",
    description: "Customers find you first - before they find your competitors."
  },
  {
    title: "Time-Saving Automated Systems",
    description: "Automate tasks so you can focus on your craft, not chasing leads."
  }
];

const promiseDetails = [
  {
    title: "Long-Term, Timeless Local SEO Strategies",
    content: "Clear, Battle-Tested Local SEO Strategy That Works In Any Market – Not Quick Hacks That Disappear With The Next Google Update. We Focus On Durable Ranking Factors: Relevance, Proximity, Reviews And Real Engagement, So Your Business Keeps Showing Up Month After Month."
  },
  {
    title: "More Revenue, Less Stress From Every Lead",
    content: "We Help You Turn Google Maps Visibility Into Real Revenue – More Calls, More Quotes And More High-Value Jobs. Instead Of Chasing Low-Quality Leads, You Get A Predictable Pipeline Of Local Customers Who Already Searched For What You Do And Are Ready To Buy."
  },
  {
    title: "Online Market Dominance In Your Service Area",
    content: "When Someone Searches For Your Service, Your Brand Becomes The Obvious First Choice. Our System Is Built To Help You Outrank Local Competitors On Google Maps, Show Up In \"Near Me\" Searches And Occupy The Top 3 Map Pack For The Terms That Actually Drive Revenue."
  },
  {
    title: "Time-Saving Automated Systems That Run Daily",
    content: "We Plug In Automated Review, Content And Engagement Workflows So Your SEO Improves Even While You're On The Jobsite. You Focus On Delivering Amazing Service; Our Systems Handle The Daily Tasks Needed To Grow Your Rankings, Traffic And Inbound Leads."
  }
];

const OurPromiseSection = () => {
  return (
    <section className="relative py-16 lg:py-24 bg-background">
      {/* Top connecting glow */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl leading-tight text-foreground">
            Our Promise, As An SEO Agency Built By Fellow{" "}
            <span className="text-primary">Local Service Business Owners.</span>
          </h2>
        </div>

        {/* Promise Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {promiseCards.map((card, index) => (
            <div
              key={index}
              className="bg-card/50 border border-border/50 rounded-xl p-5 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <h3 className="font-heading font-bold text-sm text-foreground leading-tight">
                  {card.title}
                </h3>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed pl-8">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mb-16">
          <Button variant="hero" size="lg" className="group">
            BOOK A CALL
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Detailed Promise Section */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h3 className="font-heading font-black text-xl md:text-2xl lg:text-3xl text-foreground">
              Our Promise, As An SEO Agency Built By Fellow
            </h3>
            <p className="font-heading font-bold text-lg md:text-xl text-primary">
              Local Service Business Owners.
            </p>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            We're Not "Blog And Backlink" SEOs. We Built And Scaled Real Local Service Companies First. Now We Use{" "}
            <span className="font-semibold text-foreground">Google Maps SEO, Google Business Profile Optimization</span>{" "}
            And <span className="font-semibold text-foreground">AI-Powered Local Lead Generation</span> Systems To Help You Dominate Your Service Area And Turn Searchers Into Booked Jobs.
          </p>

          {/* Promise Details */}
          <div className="space-y-8 mt-8">
            {promiseDetails.map((detail, index) => (
              <div key={index}>
                <h4 className="font-heading font-bold text-lg md:text-xl text-primary mb-3">
                  {detail.title}
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {detail.content}
                </p>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="pt-4">
            <Button variant="hero" size="lg" className="group">
              BOOK A CALL & GET YOUR LOCAL SEO PLAN
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurPromiseSection;
