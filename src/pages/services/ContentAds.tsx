import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Clock, Video, Megaphone, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ContentAds = () => {
  return (
    <>
      <Helmet>
        <title>Content & Ads | Short-Form Video & Meta Ad Campaigns | Rank Me Higher</title>
        <meta
          name="description"
          content="Professional short-form video content creation and high-ROI Meta ad campaigns. Zero-touch content that fills your calendar with appointments."
        />
        <meta property="og:title" content="Content & Ads | Short-Form Video & Meta Ad Campaigns | Rank Me Higher" />
        <meta property="og:description" content="Professional short-form video content creation and high-ROI Meta ad campaigns that fill your calendar." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rankmehigher.com/services/content-ads" />
        <meta property="og:site_name" content="Rank Me Higher" />
        <meta property="og:image" content="https://rankmehigher.com/assets/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Content & Ads | Rank Me Higher" />
        <meta name="twitter:description" content="Short-form video content and Meta ad campaigns that convert." />
        <link rel="canonical" href="https://rankmehigher.com/services/content-ads" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Content & Ads",
          "description": "Professional short-form video content creation, Google Ads, and Meta Ads campaigns that fill your calendar with qualified appointments.",
          "provider": { "@type": "Organization", "name": "Rank Me Higher", "url": "https://rankmehigher.com" },
          "url": "https://rankmehigher.com/services/content-ads",
          "serviceType": "Content Marketing and Advertising",
          "areaServed": { "@type": "Country", "name": "United States" }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://rankmehigher.com" },
            { "@type": "ListItem", "position": 2, "name": "Content & Ads", "item": "https://rankmehigher.com/services/content-ads" }
          ]
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="relative z-10">
          <Navbar />

          <main className="pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 mb-8">
                  <Megaphone className="w-12 h-12 text-red-400" />
                </div>

                <h1 className="text-4xl lg:text-6xl font-black font-orbitron mb-6">
                  <span className="text-foreground">Content & Ads</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-primary">
                    Coming Soon
                  </span>
                </h1>

                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  We're building something powerful — scroll-stopping short-form video ads and high-ROI Meta campaigns. Every single campaign we run is profitable. This page is launching soon.
                </p>

                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-10">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <Video className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground font-orbitron">Short-Form Ads</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <Target className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground font-orbitron">Meta Campaigns</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground font-orbitron">Launching Soon</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mb-12">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <span className="text-primary font-orbitron text-sm tracking-widest">STAY TUNED</span>
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                </div>

                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 text-white font-orbitron transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default ContentAds;
