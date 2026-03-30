import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import MapPackSection from "@/components/MapPackSection";
import WhyTop3Section from "@/components/WhyTop3Section";
import OurPromiseSection from "@/components/OurPromiseSection";
import ButWaitSection from "@/components/ButWaitSection";
import RevenueCeilingSection from "@/components/RevenueCeilingSection";
import WhyOurSystemSection from "@/components/WhyOurSystemSection";
import FAQSection from "@/components/FAQSection";
import GoogleMapsSection from "@/components/GoogleMapsSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

const LocalMapBooster = () => {
  return (
    <>
      <Helmet>
        <title>Local Map Booster | Hit Top 3 On Google Maps Without Spending A Cent On Ads</title>
        <meta 
          name="description" 
          content="Local Map Booster optimizes your Google Business Profile and drives real human activity. 7 day free trial with no hidden fees. See Week 1 results before you pay." 
        />
        <meta property="og:title" content="Local Map Booster | Hit Top 3 On Google Maps" />
        <meta property="og:description" content="Optimize your Google Business Profile and drive real human activity. 7 day free trial. See results before you pay." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rankmehigher.com/localmapbooster" />
        <meta property="og:site_name" content="Rank Me Higher" />
        <meta property="og:image" content="https://rankmehigher.com/assets/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Local Map Booster | Rank Me Higher" />
        <meta name="twitter:description" content="Hit Top 3 on Google Maps without ads. 7-day free trial." />
        <link rel="canonical" href="https://rankmehigher.com/localmapbooster" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Local Map Booster",
          "provider": { "@type": "Organization", "name": "Rank Me Higher", "url": "https://rankmehigher.com" },
          "description": "Google Maps optimization service that drives real human activity to your Google Business Profile. Hit the Top 3 without paying for ads.",
          "url": "https://rankmehigher.com/localmapbooster",
          "areaServed": "United States",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "7-day free trial" },
          "serviceType": "Google Maps Optimization"
        })}</script>
      </Helmet>
      
      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Ambient Red Light Overlays */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Left edge glow */}
          <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-primary/15 via-primary/5 to-transparent" />
          {/* Right edge glow */}
          <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary/15 via-primary/5 to-transparent" />
          {/* Top corner accents */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          {/* Bottom ambient glow */}
          <div className="absolute bottom-0 left-1/4 w-1/2 h-64 bg-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <Navbar />
          <HeroSection />
          <StatsSection />
          <MapPackSection />
          <WhyTop3Section />
          <OurPromiseSection />
          <ButWaitSection />
          <RevenueCeilingSection />
          <WhyOurSystemSection />
          <FAQSection />
          <GoogleMapsSection />
          <NewsletterSection />
          <Footer />
        </div>
      </main>
    </>
  );
};

export default LocalMapBooster;
