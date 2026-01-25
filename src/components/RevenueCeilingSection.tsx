import { ArrowRight, XCircle } from "lucide-react";
import { Button } from "./ui/button";
import ernestWindowsTeam from "@/assets/ernest-windows-team.png";
// import ernestWindowsTeam from "@/assets/ernest-windows-team.png";

const painPoints = [
  { text: "No time, no interest, confusion about online marketing" },
  { prefix: "Burned by other agencies that ", bold: "DON'T", suffix: " specialise in Local Business SEO and don't have personal experience on the team" },
  { prefix: "Ads Are ", bold: "Killing Your Profits", suffix: ", Spend more on ads than you make." },
  { bold: "Can't Get Found Online", suffix: ", Customers can't find you on Google" },
  { prefix: "Stuck Doing ", bold: "Everything Yourself,", suffix: " always working, never growing" }
];

const RevenueCeilingSection = () => {
  return (
    <section className="relative py-16 lg:py-24 bg-background">
      {/* Top connecting glow */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent" />
      {/* Bottom connecting glow */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/15 via-primary/5 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - Pain Points */}
          <div className="space-y-8">
            <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl leading-tight">
              <span className="text-primary">Stuck</span>{" "}
              <span className="text-foreground">At A Revenue Ceiling Or</span>
              <br />
              <span className="text-primary">Struggling To Get Going?</span>
            </h2>

            <ul className="space-y-4">
              {painPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    {point.prefix}
                    {point.bold && <span className="font-bold text-foreground">{point.bold}</span>}
                    {point.text}
                    {point.suffix}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Story */}
          <div className="space-y-6">
            {/* Image */}
            <div className="rounded-xl overflow-hidden border border-border/50 shadow-lg shadow-primary/10 bg-muted/20 h-64 flex items-center justify-center">
              {/* <img 
                src={ernestWindowsTeam} 
                alt="Ernest Windows team at work" 
                className="w-full h-auto object-cover"
              /> */}
              <div className="text-muted-foreground">Team Image Placeholder</div>
            </div>

            <div className="space-y-5">
              <h3 className="font-heading font-black text-xl md:text-2xl leading-tight text-foreground">
                After Years Of Growing A Home Service Business From{" "}
                <span className="text-primary">1 To 40 Locations...</span>
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                We've Been{" "}
                <span className="text-primary italic underline">Exactly Where You Are</span>{" "}
                Right Now. We Built An{" "}
                <span className="text-primary">8-Figure</span>{" "}
                Home Services Business From The Ground Up,{" "}
                <span className="text-primary">Making Every Mistake</span>{" "}
                In The Book.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                We{" "}
                <span className="text-primary">Wasted Thousands</span>{" "}
                On Marketing That Didn't Work, Spent Weeks Trying To Crack The Online Growth Code, And Felt The Frustration Of Seeing{" "}
                <span className="text-primary">Minimal Results</span>.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                <span className="text-primary italic underline">But The Game-Changer</span>:{" "}
                We{" "}
                <span className="text-primary">Cracked The Code</span>. We Discovered How To Grow Sustainably,{" "}
                <span className="text-primary">Without Relying</span>{" "}
                On Expensive, Short-Term Ad Strategies.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                Now, We're Pulling Back The Curtain And Sharing The{" "}
                <span className="text-primary">Exact Strategies</span>{" "}
                That Took Us From A{" "}
                <span className="font-semibold text-foreground">Single Location To A 40+ Location</span>{" "}
                <span className="text-primary">Empire</span>.
              </p>

              <Button variant="hero" size="lg" className="group mt-4">
                CHOOSE YOUR OPTION
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RevenueCeilingSection;
