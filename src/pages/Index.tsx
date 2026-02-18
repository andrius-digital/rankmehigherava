import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Globe, Search, MapPin, Phone, Megaphone, Play, Instagram, Mail, Calendar, Star, CheckCircle2, Sparkles, Brain, ChevronDown, MessageCircle, Shield, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FuturisticWrapper from "@/components/ui/FuturisticWrapper";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const services = [
  {
    id: "websites",
    title: "High-Conversion Sales Machines",
    description: "Go live in 7 days. We install proprietary AI systems that capture and close every lead 24/7.",
    icon: Globe,
    link: "/services/websites",
  },
  {
    id: "localmapbooster",
    title: "Google Map Dominance",
    description: "We force your business into the Top 3. Results in 7 days or you don't pay. Zero risk.",
    icon: MapPin,
    link: "/localmapbooster",
    featured: true,
  },
  {
    id: "ads",
    title: "Qualified Lead Systems",
    description: "Zero-touch content and high-ROI ads. We fill your calendar with appointments while you work.",
    icon: Megaphone,
    link: "/services/ads-content",
  },
  {
    id: "seo",
    title: "Search Monopoly",
    description: "Stop paying for traffic. We dominate the exact terms your customers are typing. Pure organic growth.",
    icon: Search,
    link: "/services/seo",
  },
  {
    id: "outbound",
    title: "Database Reactivation",
    description: "We call your old leads and turn them into new cash. Guaranteed ROI. Zero effort required.",
    icon: Phone,
    link: "/services/outbound",
  },
];

// Declare Calendly global type
declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

const CALENDLY_URL = "https://calendly.com/andrius-cdlagency/andrius-digital-asap-meeting";

const Index = () => {
  const [isAvaDialogOpen, setIsAvaDialogOpen] = useState(false);
  const [isQualifyDialogOpen, setIsQualifyDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitlistForm, setWaitlistForm] = useState({
    businessName: '',
    email: '',
    phone: '',
    website: '',
    message: ''
  });
  const [qualifyForm, setQualifyForm] = useState({
    name: '',
    email: '',
    phone: '',
    businessWebsite: '',
    googleBusinessProfile: ''
  });
  const { toast } = useToast();

  const openCalendly = () => {
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url: CALENDLY_URL });
    } else {
      window.open(CALENDLY_URL, '_blank');
    }
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Store in database or send notification
      const { error } = await supabase
        .from('website_submissions')
        .insert({
          company_name: waitlistForm.businessName || 'Ava Waitlist',
          business_email: waitlistForm.email,
          form_data: {
            type: 'ava_waitlist',
            phone: waitlistForm.phone,
            website: waitlistForm.website,
            message: waitlistForm.message,
            submittedAt: new Date().toISOString()
          }
        });

      if (error) throw error;

      toast({
        title: "You're on the list!",
        description: "We'll notify you when Ava becomes available for new clients.",
      });

      setIsAvaDialogOpen(false);
      setWaitlistForm({
        businessName: '',
        email: '',
        phone: '',
        website: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Error submitting waitlist:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQualifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('website_submissions')
        .insert({
          company_name: qualifyForm.name || 'Free Website Qualification',
          business_email: qualifyForm.email,
          form_data: {
            type: 'free_website_qualification',
            name: qualifyForm.name,
            phone: qualifyForm.phone,
            businessWebsite: qualifyForm.businessWebsite,
            googleBusinessProfile: qualifyForm.googleBusinessProfile,
            submittedAt: new Date().toISOString()
          }
        });

      if (error) throw error;

      toast({
        title: "Application Received!",
        description: "We'll review your business and get back to you within 24 hours.",
      });

      setIsQualifyDialogOpen(false);
      setQualifyForm({
        name: '',
        email: '',
        phone: '',
        businessWebsite: '',
        googleBusinessProfile: ''
      });
    } catch (error: any) {
      console.error('Error submitting qualification:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Chicago AI Website Agency | Rank Page 1 On Google Guaranteed</title>
        <meta
          name="description"
          content="Stop wasting money on digital paperweights. We build SEO-machines that dominate Google rankings and automate your business. Complete business revamp in 7 days."
        />
      </Helmet>

      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Enhanced Ambient Light Overlays */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <Navbar />

          {/* HERO SECTION */}
          {/* Desktop Layout */}
          <section className="hidden lg:flex min-h-[calc(100vh-80px)] items-center pt-28 pb-8">
            <div className="container mx-auto px-8 max-w-7xl">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* CONTENT SECTION - Desktop */}
                <div className="space-y-5 text-left">
                  <div className="flex items-center gap-2 animate-fade-in">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground font-orbitron">
                      <span className="text-foreground font-bold">Actively manage 100+ Websites</span> on <span className="text-cyan-400 font-bold">AVA</span>
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h1 className="text-5xl xl:text-6xl 2xl:text-7xl font-black leading-[1.1] font-orbitron tracking-tight">
                      <span className="text-foreground">We Custom Code</span>
                      <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-primary animate-gradient-x">
                        SEO-Ready Websites
                      </span>
                      <br />
                      <span className="text-foreground text-4xl xl:text-5xl 2xl:text-6xl">That Actually Make Money.</span>
                    </h1>
                    <p className="text-lg xl:text-xl text-muted-foreground max-w-xl leading-relaxed">
                      Stop paying $5K+ for websites that sit there doing nothing. We <strong>custom code</strong> SEO-ready websites with <strong>lead capture, SMS & email automations</strong>—then manage everything with <span className="text-cyan-400 font-bold">AVA</span>. Dashboard, leads pipeline & <strong>24/7 support</strong> included.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-white font-bold text-sm font-orbitron">
                        Built fully active in 7 days. Dashboard, leads pipeline & 24/7 support included.
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground pl-2">
                      <div className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold shrink-0">•</span>
                        <span><strong className="text-foreground">All-Inclusive:</strong> 24/7 AI support • Lead pipeline • SMS & email automations • Task request platform • Custom integrations available • We handle everything</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row gap-4">
                    <button
                      onClick={() => setIsQualifyDialogOpen(true)}
                      className="group relative px-7 py-4 rounded-xl bg-red-500/10 backdrop-blur-md border border-red-500/30 text-white font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 group-hover:from-red-500/10 group-hover:via-red-500/20 group-hover:to-red-500/10 transition-all duration-500" />
                      <div className="relative flex items-center justify-center gap-2">
                        <Globe className="w-5 h-5 text-red-400" />
                        <span>Free Website Qualification</span>
                      </div>
                    </button>
                    <button
                      onClick={openCalendly}
                      className="group relative px-7 py-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold text-base hover:bg-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500" />
                      <span className="relative flex items-center justify-center gap-2">
                        Book a Call
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/40">
                    {['Custom Coded', '24/7 AI Support', 'Task Platform', 'Fast Response'].map((item) => (
                      <div key={item} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/20">
                        <CheckCircle2 className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-muted-foreground font-orbitron">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VIDEO SECTION - Desktop */}
                <div className="relative space-y-4">
                  <button
                    onClick={() => setIsAvaDialogOpen(true)}
                    className="w-full px-5 py-4 rounded-xl bg-cyan-500/10 backdrop-blur-md border border-cyan-500/30 text-white font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 hover:bg-cyan-500/20 hover:scale-[1.02] transition-all duration-300 font-orbitron flex items-center justify-center gap-3 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 group-hover:from-cyan-500/10 group-hover:via-cyan-500/20 group-hover:to-cyan-500/10 transition-all duration-500" />
                    <Brain className="w-6 h-6 text-cyan-400 relative z-10" />
                    <span className="relative z-10">Join AVA SEO Waitlist</span>
                    <ArrowRight className="w-5 h-5 text-cyan-400 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20 group">
                    <div className="absolute -inset-2 bg-gradient-to-br from-primary/40 to-red-600/40 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                    <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 to-red-600/30 rounded-2xl blur-lg opacity-60" />
                    <div className="relative aspect-video z-10">
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: `<style>wistia-player[media-id='k4xdzi49er']:not(:defined) { background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/k4xdzi49er/swatch'); display: block; filter: blur(5px); padding-top:56.25%; }</style><wistia-player media-id="k4xdzi49er" aspect="1.7777777777777777"></wistia-player>` 
                        }} 
                        className="w-full h-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center">
                      <div className="text-2xl font-bold text-green-400 font-orbitron">7</div>
                      <div className="text-xs text-muted-foreground">Days to Launch</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center">
                      <div className="text-2xl font-bold text-cyan-400 font-orbitron">100+</div>
                      <div className="text-xs text-muted-foreground">Active Websites</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center">
                      <div className="text-2xl font-bold text-green-400 font-orbitron">24/7</div>
                      <div className="text-xs text-muted-foreground">AVA Support included</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MOBILE HERO - OFF TINT Style */}
          <section className="lg:hidden pt-20 pb-5 px-4">
            {/* Rating & Trust Badge - Same Line */}
            <div className="flex items-center justify-center gap-2 mb-[18px]">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-orbitron">
                <span className="text-foreground font-bold">Actively manage 100+ Websites</span> on <span className="text-cyan-400 font-bold">AVA</span>
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-3xl font-black leading-tight font-orbitron mb-[14px] text-center">
              <span className="text-foreground">We Custom Code </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">SEO-Ready Websites</span>
              <br />
              <span className="text-foreground text-xl sm:text-2xl">That Actually Make Money.</span>
            </h1>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 text-center">
              Custom websites with lead capture & automations. Dashboard & <span className="text-cyan-400 font-bold">24/7 AVA</span> support included. Based in Chicago, IL — proudly serving businesses nationwide.
            </p>

            {/* Video Player */}
            <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 shadow-xl shadow-primary/20 mb-5">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 to-red-600/30 rounded-xl blur-md opacity-50" />
              <div className="relative aspect-video z-10">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: `<style>wistia-player[media-id='k4xdzi49er']:not(:defined) { background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/k4xdzi49er/swatch'); display: block; filter: blur(5px); padding-top:56.25%; }</style><wistia-player media-id="k4xdzi49er" aspect="1.7777777777777777"></wistia-player>` 
                  }} 
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-[10px] mb-3">
              <button
                onClick={() => setIsQualifyDialogOpen(true)}
                className="group w-full px-5 py-[14px] rounded-xl bg-red-500/10 backdrop-blur-md border-2 border-red-500/40 text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.98] transition-all duration-300 font-orbitron flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0" />
                <Globe className="w-4 h-4 text-red-400 relative z-10" />
                <span className="relative z-10">See If You Qualify</span>
              </button>
              
              <button
                onClick={openCalendly}
                className="group w-full px-5 py-[14px] rounded-xl bg-white/5 backdrop-blur-md border-2 border-white/20 text-white font-bold text-sm hover:bg-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 active:scale-[0.98] transition-all duration-300 font-orbitron flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500" />
                <span className="relative z-10 flex items-center gap-2">
                  Book a Call
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>

            {/* Trust Badge - Simple */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span className="font-orbitron">Trusted by businesses across America</span>
            </div>
          </section>

          {/* PORTFOLIO SHOWCASE SECTION */}
          <section className="pt-4 pb-2 lg:pt-6 lg:pb-4 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="font-orbitron font-black text-3xl lg:text-4xl mb-3">
                  <span className="text-foreground">Our</span>{' '}
                  <span className="text-primary">Work</span>
                </h2>
                <p className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto">
                  Real results from real clients. Every website receives our signature attention to detail and custom coding expertise.
                </p>
              </div>

              {/* Mobile: Horizontal Scrollable Cards with swipe indicator */}
              <div className="lg:hidden mb-6">
                {/* Swipe hint */}
                <div className="flex items-center justify-center gap-2 mb-4 text-muted-foreground">
                  <div className="flex items-center gap-1 text-xs font-orbitron animate-pulse">
                    <span>←</span>
                    <span>Swipe to explore</span>
                    <span>→</span>
                  </div>
                </div>
                
                {/* Scrollable container with peek effect */}
                <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
                  <div className="flex gap-4" style={{ width: 'max-content', paddingRight: '40px' }}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="group flex-shrink-0 snap-center" style={{ width: 'calc(100vw - 80px)', maxWidth: '320px' }}>
                      <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/20">
                        {num === 1 ? (
                          <>
                            <div className="relative overflow-hidden bg-black">
                              <img 
                                src="/kleanaf.png" 
                                alt="Klean AF Website Screenshot" 
                                className="w-full h-auto block"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-red-600/20" style={{ display: 'none' }}>
                                <div className="text-center p-4">
                                  <Globe className="w-16 h-16 text-primary/50 mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground font-orbitron">Screenshot Coming Soon</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-background/80 backdrop-blur-sm">
                              <h4 className="font-orbitron font-bold text-base text-foreground mb-1">Klean AF</h4>
                              <p className="text-xs text-muted-foreground">House Cleaning Company in San Diego</p>
                            </div>
                          </>
                        ) : num === 2 ? (
                          <>
                            <div className="relative overflow-hidden bg-black">
                              <img 
                                src="/truckclinic.png" 
                                alt="Truck Clinic Website Screenshot" 
                                className="w-full h-auto block"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-600/20" style={{ display: 'none' }}>
                                <div className="text-center p-4">
                                  <Globe className="w-16 h-16 text-cyan-400/50 mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground font-orbitron">Screenshot Coming Soon</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-background/80 backdrop-blur-sm">
                              <h4 className="font-orbitron font-bold text-base text-foreground mb-1">Truck Clinic</h4>
                              <p className="text-xs text-muted-foreground">Truck Repair Shop in Romeoville, IL</p>
                            </div>
                          </>
                        ) : num === 3 ? (
                          <>
                            <div className="relative overflow-hidden bg-black">
                              <img 
                                src="/off-tint-screenshot.png" 
                                alt="Off-Tint Website Screenshot" 
                                className="w-full h-auto block"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-500/20 to-emerald-600/20" style={{ display: 'none' }}>
                                <div className="text-center p-4">
                                  <Globe className="w-16 h-16 text-green-400/50 mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground font-orbitron">Screenshot Coming Soon</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-background/80 backdrop-blur-sm">
                              <h4 className="font-orbitron font-bold text-base text-foreground mb-1">Off-Tint</h4>
                              <p className="text-xs text-muted-foreground">PPF, Ceramic Coating, Window Tinting Studio in Lisle, IL</p>
                            </div>
                          </>
                        ) : num === 4 ? (
                          <>
                            <div className="relative overflow-hidden bg-black">
                              <img 
                                src="/goxxii.png" 
                                alt="XXII Century Website Screenshot" 
                                className="w-full h-auto block"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-violet-600/20" style={{ display: 'none' }}>
                                <div className="text-center p-4">
                                  <Globe className="w-16 h-16 text-purple-400/50 mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground font-orbitron">Screenshot Coming Soon</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-background/80 backdrop-blur-sm">
                              <h4 className="font-orbitron font-bold text-base text-foreground mb-1">XXII Century</h4>
                              <p className="text-xs text-muted-foreground">Trucking Company from Chicago, IL</p>
                            </div>
                          </>
                        ) : num === 5 ? (
                          <>
                            <div className="relative overflow-hidden bg-black">
                              <img 
                                src="/prorepair.png" 
                                alt="Pro Repair Service Website Screenshot" 
                                className="w-full h-auto block"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-amber-600/20" style={{ display: 'none' }}>
                                <div className="text-center p-4">
                                  <Globe className="w-16 h-16 text-orange-400/50 mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground font-orbitron">Screenshot Coming Soon</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-background/80 backdrop-blur-sm">
                              <h4 className="font-orbitron font-bold text-base text-foreground mb-1">Pro Repair Service</h4>
                              <p className="text-xs text-muted-foreground">Truck Repair Shop in Lockport, IL</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="aspect-[2/1] bg-gradient-to-br from-primary/20 to-red-600/20 flex items-center justify-center">
                              <div className="text-center p-4">
                                <Globe className="w-16 h-16 text-primary/50 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground font-orbitron">Screenshot Coming Soon</p>
                              </div>
                            </div>
                            <div className="p-4 bg-background/80 backdrop-blur-sm">
                              <h4 className="font-orbitron font-bold text-base text-foreground mb-1">Client Website #{num}</h4>
                              <p className="text-xs text-muted-foreground">Custom SEO Website</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
                
                {/* Scroll indicator dots */}
                <div className="flex justify-center gap-2 mt-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div 
                      key={num} 
                      className="w-2 h-2 rounded-full bg-primary/30 transition-colors"
                    />
                  ))}
                </div>
              </div>

              {/* Desktop: Overlapping Portfolio Grid */}
              <div className="hidden lg:block relative min-h-[500px]">
                {/* Portfolio Item 1 - Left */}
                <div className="group absolute top-0 left-[3%] w-[40%] z-10 hover:z-50 transition-all duration-500 hover:scale-105">
                  <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/20">
                    <div className="relative overflow-hidden bg-black">
                      <img 
                        src="/kleanaf.png" 
                        alt="Klean AF Website Screenshot" 
                        className="w-full h-auto block"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-red-600/20" style={{ display: 'none' }}>
                        <div className="text-center p-4">
                          <Globe className="w-16 h-16 text-primary/50 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground font-orbitron">Screenshot Coming Soon</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-background/80 backdrop-blur-sm">
                      <h4 className="font-orbitron font-bold text-base text-foreground mb-1">Klean AF</h4>
                      <p className="text-xs text-muted-foreground">House Cleaning Company in San Diego</p>
                    </div>
                  </div>
                </div>

                {/* Portfolio Item 2 - Center Left */}
                <div className="group absolute top-[8%] left-[20%] w-[40%] z-20 hover:z-50 transition-all duration-500 hover:scale-105">
                  <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/20">
                    <div className="relative overflow-hidden bg-black">
                      <img 
                        src="/truckclinic.png" 
                        alt="Truck Clinic Website Screenshot" 
                        className="w-full h-auto block"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-600/20" style={{ display: 'none' }}>
                        <div className="text-center p-4">
                          <Globe className="w-16 h-16 text-cyan-400/50 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground font-orbitron">Screenshot Coming Soon</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-background/80 backdrop-blur-sm">
                      <h4 className="font-orbitron font-bold text-base text-foreground mb-1">Truck Clinic</h4>
                      <p className="text-xs text-muted-foreground">Truck Repair Shop in Romeoville, IL</p>
                    </div>
                  </div>
                </div>

                {/* Portfolio Item 3 - Center */}
                <div className="group absolute top-[16%] left-[30%] w-[40%] z-30 hover:z-50 transition-all duration-500 hover:scale-105">
                  <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/20">
                    <div className="relative overflow-hidden bg-black">
                      <img 
                        src="/off-tint-screenshot.png" 
                        alt="Off-Tint Website Screenshot" 
                        className="w-full h-auto block"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-500/20 to-emerald-600/20" style={{ display: 'none' }}>
                        <div className="text-center p-4">
                          <Globe className="w-16 h-16 text-green-400/50 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground font-orbitron">Screenshot Coming Soon</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-background/80 backdrop-blur-sm">
                      <h4 className="font-orbitron font-bold text-base text-foreground mb-1">Off-Tint</h4>
                      <p className="text-xs text-muted-foreground">PPF, Ceramic Coating, Window Tinting Studio in Lisle, IL</p>
                    </div>
                  </div>
                </div>

                {/* Portfolio Item 4 - Center Right */}
                <div className="group absolute top-[8%] right-[20%] w-[40%] z-20 hover:z-50 transition-all duration-500 hover:scale-105">
                  <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/20">
                    <div className="relative overflow-hidden bg-black">
                      <img 
                        src="/goxxii.png" 
                        alt="XXII Century Website Screenshot" 
                        className="w-full h-auto block"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-violet-600/20" style={{ display: 'none' }}>
                        <div className="text-center p-4">
                          <Globe className="w-16 h-16 text-purple-400/50 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground font-orbitron">Screenshot Coming Soon</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-background/80 backdrop-blur-sm">
                      <h4 className="font-orbitron font-bold text-base text-foreground mb-1">XXII Century</h4>
                      <p className="text-xs text-muted-foreground">Trucking Company from Chicago, IL</p>
                    </div>
                  </div>
                </div>

                {/* Portfolio Item 5 - Right */}
                <div className="group absolute top-0 right-[3%] w-[40%] z-10 hover:z-50 transition-all duration-500 hover:scale-105">
                  <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/20">
                    <div className="relative overflow-hidden bg-black">
                      <img 
                        src="/prorepair.png" 
                        alt="Pro Repair Service Website Screenshot" 
                        className="w-full h-auto block"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-amber-600/20" style={{ display: 'none' }}>
                        <div className="text-center p-4">
                          <Globe className="w-16 h-16 text-orange-400/50 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground font-orbitron">Screenshot Coming Soon</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-background/80 backdrop-blur-sm">
                      <h4 className="font-orbitron font-bold text-base text-foreground mb-1">Pro Repair Service</h4>
                      <p className="text-xs text-muted-foreground">Truck Repair Shop in Lockport, IL</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* SERVICES SECTION - HIDDEN FOR NOW */}
          {/* 
          <section className="py-12 lg:py-20">
            ...services section hidden...
          </section>
          */}

          {/* WHAT YOU GET SECTION */}
          <section className="py-16 lg:py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
                  <Zap className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs font-orbitron text-red-400 font-bold">Everything Included</span>
                </div>
                <h2 className="text-3xl lg:text-5xl font-black leading-tight font-orbitron mb-4">
                  <span className="text-foreground">Not Just a Website.</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-primary">A Complete Growth System.</span>
                </h2>
                <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Every client gets a custom-coded website, automation systems, a client dashboard, and 24/7 AI support. All managed by us.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                {[
                  {
                    icon: Globe,
                    title: 'Custom Coded Website',
                    description: 'Hand-coded React/TypeScript. No WordPress, no templates. Faster load times, better SEO, total control over every pixel.',
                    color: 'red',
                  },
                  {
                    icon: Phone,
                    title: 'SMS & Email Automations',
                    description: 'New lead? Instant text. Appointment booked? Auto reminder. Follow-ups run on autopilot while you focus on your business.',
                    color: 'red',
                  },
                  {
                    icon: Brain,
                    title: 'AVA AI Assistant',
                    description: 'Voice chat, voice calls, and automatic appointment booking built into your site. AVA qualifies leads and books appointments 24/7.',
                    color: 'cyan',
                  },
                  {
                    icon: Sparkles,
                    title: '24/7 AI Support',
                    description: 'You get a platform to request tasks and track their progress. All extra adjustments are charged a fixed fee — no surprises.',
                    color: 'cyan',
                  },
                  {
                    icon: Zap,
                    title: 'Custom Automations & Integrations',
                    description: 'AI voice agents, reminders, booking systems — whatever you need. All custom coded and billed per hour. No limits on what we can build.',
                    color: 'red',
                  },
                  {
                    icon: MessageCircle,
                    title: 'Telegram Support',
                    description: 'Every client gets a private Telegram group for quick responses on urgent issues. Real people, fast turnaround.',
                    color: 'red',
                  },
                ].map((feature, i) => {
                  const colorClasses = feature.color === 'cyan' 
                    ? { bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', hover: 'hover:border-cyan-400/50', icon: 'text-cyan-400', iconBg: 'bg-cyan-500/20' }
                    : { bg: 'bg-white/5', border: 'border-white/10', hover: 'hover:border-red-500/30', icon: 'text-red-400', iconBg: 'bg-red-500/15' };
                  return (
                    <div key={i} className={`p-5 rounded-2xl backdrop-blur-md border transition-all duration-300 group ${colorClasses.bg} ${colorClasses.border} ${colorClasses.hover}`}>
                      <div className={`w-12 h-12 rounded-xl ${colorClasses.iconBg} flex items-center justify-center mb-4`}>
                        <feature.icon className={`w-6 h-6 ${colorClasses.icon}`} />
                      </div>
                      <h3 className="font-orbitron font-bold text-base text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { value: '100+', label: 'Websites Built', color: 'text-red-400' },
                  { value: '7', label: 'Days to Launch', color: 'text-green-400' },
                  { value: '24/7', label: 'AVA Support', color: 'text-cyan-400' },
                  { value: '4.9', label: 'Client Rating', color: 'text-yellow-400' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className={`text-3xl lg:text-4xl font-black font-orbitron ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* HOW IT WORKS SECTION */}
          <section className="py-16 lg:py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/[0.03] to-transparent" />
            <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-5xl font-black leading-tight font-orbitron mb-4">
                  <span className="text-foreground">How It </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">Works</span>
                </h2>
                <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
                  From first call to live website in 7 days. Here's exactly what happens.
                </p>
              </div>

              <div className="space-y-0">
                {[
                  {
                    step: '01',
                    title: 'Discovery Call',
                    description: 'We learn about your business, your goals, and what you need. We review your current website (if any) and your Google presence. 15 minutes.',
                    icon: Phone,
                    color: 'red',
                  },
                  {
                    step: '02',
                    title: 'We Build Everything',
                    description: 'Our team custom codes your website, sets up automations, and installs AVA. You get updates in your Telegram group along the way.',
                    icon: Globe,
                    color: 'red',
                  },
                  {
                    step: '03',
                    title: 'Review & Launch',
                    description: 'You review the finished product in your client dashboard. We make any final tweaks, then push it live. Domain, SSL, and everything configured.',
                    icon: CheckCircle2,
                    color: 'green',
                  },
                  {
                    step: '04',
                    title: 'We Manage It All',
                    description: 'Ongoing support, performance monitoring, and updates. Need changes? Submit a request through your dashboard or message us on Telegram.',
                    icon: Shield,
                    color: 'cyan',
                  },
                ].map((item, i) => (
                  <div key={i} className="relative flex gap-6 lg:gap-8">
                    <div className="flex flex-col items-center">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        item.color === 'cyan' ? 'bg-cyan-500/15 border border-cyan-500/30' :
                        item.color === 'green' ? 'bg-green-500/15 border border-green-500/30' :
                        'bg-red-500/15 border border-red-500/30'
                      }`}>
                        <item.icon className={`w-6 h-6 ${
                          item.color === 'cyan' ? 'text-cyan-400' :
                          item.color === 'green' ? 'text-green-400' :
                          'text-red-400'
                        }`} />
                      </div>
                      {i < 3 && (
                        <div className="w-px h-full min-h-[40px] bg-gradient-to-b from-white/20 to-transparent my-2" />
                      )}
                    </div>
                    <div className="pb-10">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-orbitron text-muted-foreground font-bold">STEP {item.step}</span>
                      </div>
                      <h3 className="font-orbitron font-bold text-lg lg:text-xl text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PRICING SECTION */}
          <section className="py-16 lg:py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl lg:text-5xl font-black leading-tight font-orbitron mb-4">
                  <span className="text-foreground">Simple, </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">Transparent Pricing</span>
                </h2>
                <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
                  No hidden fees. No long-term contracts. Know exactly what you're paying for.
                </p>
              </div>

              <div className="relative p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl border border-white/15 mb-8">
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                  <div>
                    <h3 className="font-orbitron font-bold text-xl text-foreground mb-4">How Our Pricing Works</h3>
                    <ul className="space-y-4">
                      {[
                        { title: 'One-time build fee', desc: 'Your website, fully custom coded and ready to go' },
                        { title: 'Small monthly fee', desc: 'Covers hosting, security updates, and AVA AI support' },
                        { title: 'Adjustments at a fixed fee', desc: 'All extra changes through your task platform — clear pricing, no surprises' },
                        { title: 'Custom work billed per hour', desc: 'AI voice agents, booking systems, automations — whatever you need, custom coded' },
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-sm font-bold text-foreground">{item.title}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/30">
                    <h4 className="font-orbitron font-bold text-base text-foreground mb-3">What's Included Every Month</h4>
                    <ul className="space-y-2">
                      {[
                        'Website hosting & security (SSL)',
                        'AVA AI assistant (chat + voice)',
                        'Client dashboard & task platform',
                        'Telegram group support',
                        'Performance & uptime monitoring',
                        'Backups & updates',
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ SECTION */}
          <section className="py-16 lg:py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent" />
            <div className="container mx-auto px-4 lg:px-8 max-w-3xl relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-5xl font-black leading-tight font-orbitron mb-4">
                  <span className="text-foreground">Frequently Asked </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">Questions</span>
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    q: 'How long does it take to build my website?',
                    a: 'Most websites are fully live within 7 days. More complex projects with custom features may take 10-14 days. You\'ll get daily updates in your Telegram group.',
                  },
                  {
                    q: 'Do I own my website?',
                    a: 'Yes. You own all the code and content. If you ever decide to leave, we\'ll hand over everything — no hostage situations, no hidden clauses.',
                  },
                  {
                    q: 'What is AVA?',
                    a: 'AVA is our proprietary AI assistant that gets installed on your website. She handles voice chat, answers questions, qualifies leads, and books appointments automatically — 24/7, even while you sleep.',
                  },
                  {
                    q: 'Why custom code instead of WordPress?',
                    a: 'Custom-coded websites load faster, rank better on Google, and give us complete control over every feature. No plugins to break, no security vulnerabilities from outdated themes, no bloat.',
                  },
                  {
                    q: 'What happens if I need changes after launch?',
                    a: 'Submit a request through your client dashboard or message us on Telegram. Small tweaks are included monthly. Larger projects get a flat quote before we start — no hourly surprises.',
                  },
                  {
                    q: 'Do you offer refunds?',
                    a: 'We offer a satisfaction guarantee. If you\'re not happy with the final product before launch, we\'ll revise it until you are. We don\'t charge until you approve.',
                  },
                  {
                    q: 'Can you help with Google Maps / Local SEO?',
                    a: 'Absolutely. We offer a separate Google Map Dominance service that gets your business into the top 3 local results. Results in 7 days or you don\'t pay.',
                  },
                  {
                    q: 'What\'s included in the monthly fee?',
                    a: 'Hosting, security updates, SSL, performance monitoring, AVA AI support, Telegram group access, client dashboard with task platform, and uptime monitoring with backups.',
                  },
                ].map((faq, i) => (
                  <details key={i} className="group rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                    <summary className="flex items-center justify-between p-4 lg:p-5 cursor-pointer list-none select-none hover:bg-white/5 transition-colors">
                      <span className="font-orbitron font-bold text-sm lg:text-base text-foreground pr-4">{faq.q}</span>
                      <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-4 lg:px-5 pb-4 lg:pb-5">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* FINAL CTA SECTION */}
          <section className="py-16 lg:py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl relative z-10">
              <div className="relative p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-red-500/15 via-red-600/10 to-red-500/15 border border-red-500/30 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0" />
                <div className="relative z-10">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-orbitron mb-4 text-foreground">
                    Ready to Stop Losing Leads?
                  </h2>
                  <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                    Get a custom-coded website with built-in automations, AI support, and full management. Live in 7 days.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                    <button
                      onClick={() => setIsQualifyDialogOpen(true)}
                      className="group relative px-8 py-4 rounded-xl bg-red-500/20 backdrop-blur-md border-2 border-red-500/40 text-white font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:bg-red-500/30 hover:border-red-500/60 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 group-hover:from-red-500/10 group-hover:via-red-500/20 group-hover:to-red-500/10 transition-all duration-500" />
                      <span className="relative flex items-center justify-center gap-2">
                        <Globe className="w-5 h-5 text-red-400" />
                        See If You Qualify — Free
                      </span>
                    </button>
                    <button
                      onClick={openCalendly}
                      className="group px-8 py-4 rounded-xl bg-white/5 backdrop-blur-md border-2 border-white/20 text-white font-bold text-base hover:bg-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02] transition-all duration-300 font-orbitron flex items-center justify-center gap-2"
                    >
                      Book a Strategy Call
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    {['Free consultation', 'No obligations', 'Live in 7 days', 'Cancel anytime'].map((item) => (
                      <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </main>

      {/* Ava Waitlist Dialog */}
      <Dialog open={isAvaDialogOpen} onOpenChange={setIsAvaDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-cyan-500/10 backdrop-blur-xl border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-orbitron font-bold text-foreground flex items-center gap-2">
              <Brain className="w-6 h-6 text-cyan-400" />
              Join AVA SEO Waitlist
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              AVA SEO is currently available only for existing clients. Join our waitlist to be notified when we open it to the public.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleWaitlistSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="font-orbitron text-sm">Business Name *</Label>
              <Input
                id="businessName"
                value={waitlistForm.businessName}
                onChange={(e) => setWaitlistForm({ ...waitlistForm, businessName: e.target.value })}
                placeholder="Your business name"
                required
                className="bg-cyan-500/5 border-cyan-500/20 focus:border-cyan-500/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-orbitron text-sm">Email *</Label>
              <Input
                id="email"
                type="email"
                value={waitlistForm.email}
                onChange={(e) => setWaitlistForm({ ...waitlistForm, email: e.target.value })}
                placeholder="your@email.com"
                required
                className="bg-cyan-500/5 border-cyan-500/20 focus:border-cyan-500/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="font-orbitron text-sm">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={waitlistForm.phone}
                onChange={(e) => setWaitlistForm({ ...waitlistForm, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="bg-cyan-500/5 border-cyan-500/20 focus:border-cyan-500/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="font-orbitron text-sm">Website</Label>
              <Input
                id="website"
                type="url"
                value={waitlistForm.website}
                onChange={(e) => setWaitlistForm({ ...waitlistForm, website: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="bg-cyan-500/5 border-cyan-500/20 focus:border-cyan-500/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="font-orbitron text-sm">Message</Label>
              <Textarea
                id="message"
                value={waitlistForm.message}
                onChange={(e) => setWaitlistForm({ ...waitlistForm, message: e.target.value })}
                placeholder="Tell us about your business..."
                rows={4}
                className="bg-cyan-500/5 border-cyan-500/20 focus:border-cyan-500/40 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsAvaDialogOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl bg-transparent border-2 border-cyan-500/30 text-white font-bold text-base font-orbitron hover:bg-cyan-500/5 hover:border-cyan-500/50 transition-all duration-300 flex items-center justify-center h-[60px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 border-2 border-cyan-500/30 text-white font-bold text-base shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all duration-300 font-orbitron flex items-center justify-center gap-3 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed h-[60px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 group-hover:from-cyan-500/10 group-hover:via-cyan-500/20 group-hover:to-cyan-500/10 transition-all duration-500" />
                <Brain className="w-5 h-5 text-cyan-400 relative z-10" />
                <span className="relative z-10">{isSubmitting ? 'Submitting...' : 'Join Waitlist'}</span>
                {!isSubmitting && <ArrowRight className="w-5 h-5 text-cyan-400 relative z-10 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Free Website Qualification Dialog */}
      <Dialog open={isQualifyDialogOpen} onOpenChange={setIsQualifyDialogOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-2 border-red-500/30 rounded-3xl max-w-lg shadow-2xl shadow-red-500/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-orbitron">
              <Globe className="w-7 h-7 text-red-400" />
              <span>Free Website Qualification</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              See if your business qualifies for a free custom-coded website. We'll review your application and get back to you within 24 hours.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleQualifySubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="qualify-name" className="font-orbitron text-sm">Your Name *</Label>
              <Input
                id="qualify-name"
                type="text"
                value={qualifyForm.name}
                onChange={(e) => setQualifyForm({ ...qualifyForm, name: e.target.value })}
                placeholder="John Smith"
                required
                className="bg-red-500/5 border-red-500/20 focus:border-red-500/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualify-email" className="font-orbitron text-sm">Email *</Label>
              <Input
                id="qualify-email"
                type="email"
                value={qualifyForm.email}
                onChange={(e) => setQualifyForm({ ...qualifyForm, email: e.target.value })}
                placeholder="your@email.com"
                required
                className="bg-red-500/5 border-red-500/20 focus:border-red-500/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualify-phone" className="font-orbitron text-sm">Phone Number *</Label>
              <Input
                id="qualify-phone"
                type="tel"
                value={qualifyForm.phone}
                onChange={(e) => setQualifyForm({ ...qualifyForm, phone: e.target.value })}
                placeholder="(555) 123-4567"
                required
                className="bg-red-500/5 border-red-500/20 focus:border-red-500/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualify-website" className="font-orbitron text-sm">Current Business Website</Label>
              <Input
                id="qualify-website"
                type="url"
                value={qualifyForm.businessWebsite}
                onChange={(e) => setQualifyForm({ ...qualifyForm, businessWebsite: e.target.value })}
                placeholder="https://yourbusiness.com (or leave blank if none)"
                className="bg-red-500/5 border-red-500/20 focus:border-red-500/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualify-gbp" className="font-orbitron text-sm">Google Business Profile Link</Label>
              <Input
                id="qualify-gbp"
                type="url"
                value={qualifyForm.googleBusinessProfile}
                onChange={(e) => setQualifyForm({ ...qualifyForm, googleBusinessProfile: e.target.value })}
                placeholder="https://maps.google.com/..."
                className="bg-red-500/5 border-red-500/20 focus:border-red-500/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsQualifyDialogOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl bg-transparent border-2 border-red-500/30 text-white font-bold text-base font-orbitron hover:bg-red-500/5 hover:border-red-500/50 transition-all duration-300 flex items-center justify-center h-[60px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 rounded-2xl bg-red-500/10 backdrop-blur-md border-2 border-red-500/30 text-white font-bold text-base shadow-xl hover:shadow-2xl hover:shadow-red-500/20 hover:bg-red-500/20 hover:scale-[1.02] transition-all duration-300 font-orbitron flex items-center justify-center gap-3 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed h-[60px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 group-hover:from-red-500/10 group-hover:via-red-500/20 group-hover:to-red-500/10 transition-all duration-500" />
                <Globe className="w-5 h-5 text-red-400 relative z-10" />
                <span className="relative z-10">{isSubmitting ? 'Submitting...' : 'Check Eligibility'}</span>
                {!isSubmitting && <ArrowRight className="w-5 h-5 text-red-400 relative z-10 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Index;
