import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Why Does It Take 6 Months To See Full Results?",
    answer: "While You'll See Technical Improvements In 7 Days, Google Typically Takes 3 Months To Fully Recognize And Reward Your SEO Efforts. By Month 6, You'll Have A Solid Foundation Generating Consistent Calls And Jobs. Unlike Other Agencies That Promise Unrealistic 3-Month Timelines, We're Honest About The Process While Working To Get You Results As Quickly As Possible."
  },
  {
    question: "How Is This Different From Other SEO Services?",
    answer: "Most Agencies Either Focus Solely On Local SEO Or Traditional Organic SEO. We Combine Both With Proprietary AI Technology, Based On Strategies That Built Our Own 8-Figure Service Business. Plus, We Complete Technical Setup In 7 Days – Not Months."
  },
  {
    question: "Will This Work For My Specific Service Business?",
    answer: "If You Provide Any Kind Of Local Or Home Service – From Window Cleaning To Roofing, Plumbing To Junk Removal – This System Works. We've Refined It Across Dozens Of Service Industries, And Our AI Technology Adapts To Your Specific Market."
  },
  {
    question: "How Does Your AI Technology Actually Work, And Is It Safe For My Business?",
    answer: "Absolutely Safe – Our AI Technology Works By Ethically Directing Real, Targeted Traffic To Your Google Business Profile And Website. Think Of It As Having A Smart Digital Assistant That Works 24/7 To Boost Your Visibility In All The Right Places. It Analyzes Search Patterns In Your Service Area, Identifies Ranking Opportunities, And Helps Your Business Appear More Prominently For Relevant Searches.\n\nEverything We Do Is Fully Compliant With Google's Guidelines – That's Why We've Been Able To Use These Same Strategies To Build Our Own 8-Figure Service Businesses. We Never Use Black-Hat Techniques Or Shortcuts That Could Put Your Business At Risk. The AI Simply Makes Your Legitimate SEO Efforts More Efficient And Effective, Helping You Achieve Better Results Faster Than Traditional Methods Alone.\n\nMost Importantly, Our System Adapts To Google's Frequent Updates, Ensuring Your Rankings Stay Strong And Continue Improving Over Time. This Is Particularly Valuable Because While Your Competitors Might Struggle With Each Algorithm Change, Your Business Maintains Its Momentum."
  }
];

const FAQSection = () => {
  return (
    <section id="faq" className="relative py-16 lg:py-24 bg-background">
      {/* Top connecting glow */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl leading-tight text-foreground">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-primary/50 rounded-lg px-6 bg-card/30 data-[state=open]:border-primary"
            >
              <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-5">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 whitespace-pre-line">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
