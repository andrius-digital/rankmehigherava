import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  ArrowRight, 
  CheckCircle2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    service: 'general'
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('website_submissions')
        .insert({
          company_name: formData.company || formData.name,
          business_email: formData.email,
          form_data: {
            type: 'contact_form',
            name: formData.name,
            phone: formData.phone,
            message: formData.message,
            service: formData.service,
            submittedAt: new Date().toISOString()
          }
        });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
        service: 'general'
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again or call us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'website', label: 'Custom Website Development' },
    { value: 'seo', label: 'SEO & Local Rankings' },
    { value: 'google-maps', label: 'Google Maps Optimization' },
    { value: 'marketing', label: 'Digital Marketing' },
    { value: 'support', label: 'Existing Client Support' },
  ];

  const offices = [
    {
      name: "Chicago Downtown Office",
      address: "Chicago, IL",
      mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d762316.5313005082!2d-88.20843849055156!3d41.72485702770512!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880e2d4ccadc9941%3A0xd064f8a30b6e0311!2sRank%20Me%20Higher%20%7C%20Local%20Map%20Booster!5e0!3m2!1sen!2sus!4v1767342975149!5m2!1sen!2sus"
    },
    {
      name: "Mundelein, IL Office",
      address: "Mundelein, IL",
      mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d762316.5313005082!2d-88.20843849055156!3d41.72485702770512!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880f97124a6673d1%3A0xc46cda5f1037977e!2sRank%20Me%20Higher!5e0!3m2!1sen!2sus!4v1767342994418!5m2!1sen!2sus"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Contact Rank Me Higher | AI Website & SEO Platform from Chicago</title>
        <meta name="description" content="Contact Rank Me Higher - AI, Software & Website Development Company from Chicago by Andrius Digital. Home of AVA, our AI-powered website & SEO platform managing 54 websites. Call (773) 572-4686." />
        <meta name="keywords" content="Chicago SEO agency, contact SEO company, web development Chicago, local SEO services, Google Maps optimization, digital marketing agency Illinois" />
        <link rel="canonical" href="https://rankmehigher.com/contact" />
        
        {/* Local Business Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Rank Me Higher",
            "image": "https://rankmehigher.com/assets/logo.png",
            "telephone": "(773) 572-4686",
            "email": "business@rankmehigher.com",
            "address": [
              {
                "@type": "PostalAddress",
                "addressLocality": "Chicago",
                "addressRegion": "IL",
                "addressCountry": "US"
              },
              {
                "@type": "PostalAddress",
                "addressLocality": "Mundelein",
                "addressRegion": "IL",
                "addressCountry": "US"
              }
            ],
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 41.8781,
              "longitude": -87.6298
            },
            "url": "https://rankmehigher.com",
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "09:00",
              "closes": "18:00"
            },
            "priceRange": "$$",
            "sameAs": [
              "https://www.facebook.com/rankmehigher",
              "https://www.linkedin.com/company/rankmehigher"
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <Navbar />

        <section className="relative pt-28 pb-12 overflow-hidden">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
            <div className="text-center mb-10">
              <h1 className="font-orbitron font-black text-4xl md:text-5xl text-foreground mb-3 leading-tight">
                Let's Create Something{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-primary">
                  Epic
                </span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Ready to dominate? We're accepting new projects.
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <div className="p-6 md:p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                  <h2 className="font-orbitron font-bold text-lg text-foreground mb-1">Send A Message</h2>
                  <p className="text-sm text-muted-foreground mb-6">Fill out the form below and we'll get back to you within 24 hours.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="font-orbitron text-xs">Name *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Smith"
                          required
                          className="bg-white/5 border-white/10 focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="font-orbitron text-xs">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="your@email.com"
                          required
                          className="bg-white/5 border-white/10 focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="font-orbitron text-xs">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="(555) 123-4567"
                          className="bg-white/5 border-white/10 focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="service" className="font-orbitron text-xs">Service</Label>
                        <select
                          id="service"
                          value={formData.service}
                          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                          className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-foreground text-sm focus:border-primary/40 focus:outline-none"
                        >
                          {services.map((service) => (
                            <option key={service.value} value={service.value} className="bg-background">
                              {service.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="message" className="font-orbitron text-xs">Project Details *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your project and goals..."
                        rows={4}
                        required
                        className="bg-white/5 border-white/10 focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-red-600 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.01] transition-all duration-300 font-orbitron disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" />
                        <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                        {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                      </div>
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <a href="tel:773-572-4686" className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/40 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-orbitron font-bold text-foreground text-sm">(773) 572-4686</p>
                    <p className="text-xs text-muted-foreground">Mon-Fri, 9am - 6pm CST</p>
                  </div>
                </a>

                <a href="mailto:business@rankmehigher.com" className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/40 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-orbitron font-bold text-foreground text-sm">business@rankmehigher.com</p>
                    <p className="text-xs text-muted-foreground">For general inquiries</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-orbitron font-bold text-foreground text-sm">Chicago & Mundelein, IL</p>
                    <p className="text-xs text-muted-foreground">Two locations to serve you</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                  <h3 className="font-orbitron font-bold text-sm text-foreground mb-3">Why Rank Me Higher?</h3>
                  <div className="space-y-2.5">
                    {[
                      "54 hand-coded websites launched",
                      "No templates — no WordPress",
                      "Chicago-based, meet us in person",
                      "Direct line to Andrius, always",
                      "Live in 10 days, not months",
                      "$1,500 setup + $99/mo, no hidden fees"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <p className="text-xs text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 relative z-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-6">
              {offices.map((office, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden hover:border-primary/40 transition-all"
                >
                  <div className="aspect-[16/9] w-full">
                    <iframe
                      src={office.mapSrc}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <h3 className="font-orbitron font-bold text-sm text-foreground">{office.name}</h3>
                        <p className="text-xs text-muted-foreground">{office.address}</p>
                      </div>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/Rank+Me+Higher+${office.address.replace(/\s/g, '+')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold text-xs font-orbitron flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Directions <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 relative z-10 border-t border-white/10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="prose prose-lg prose-invert max-w-none text-center">
              <h2 className="font-orbitron font-bold text-2xl text-foreground mb-6">
                AI, Software & <span className="text-primary">Website Development</span> from Chicago
              </h2>
              
              <div className="text-muted-foreground space-y-4 text-left">
                <p>
                  <strong className="text-foreground">Rank Me Higher</strong> is a Software & Website Development Marketing Company from Chicago. We take a technology-driven approach to building faster, better-ranking websites that actually generate leads and revenue for local businesses.
                </p>
                
                <p>
                  <strong className="text-cyan-400">AVA</strong> is our proprietary website and SEO platform, built to make enterprise-level marketing technology accessible to small and medium businesses.
                </p>

                <p>
                  <strong className="text-cyan-400">AVA</strong> is currently managing <strong className="text-foreground">54 websites</strong> and growing. The platform handles everything from custom website development and hosting to SEO optimization, lead capture, SMS & email automation, and 24/7 support. Every website we build is custom-coded (no templates), SEO-optimized from day one, and includes a full dashboard for leads and analytics.
                </p>

                <p>
                  With offices in <strong className="text-foreground">Chicago Downtown</strong> and <strong className="text-foreground">Mundelein, IL</strong>, we serve businesses throughout the Chicagoland area and beyond. Whether you're a local service business looking to dominate Google Maps or an established company needing a technology upgrade—we have the expertise and proven tools to deliver results. <strong className="text-foreground">Contact us today</strong> for a free consultation.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[
                  { label: "Websites on AVA", value: "54" },
                  { label: "Custom Coded", value: "100%" },
                  { label: "Avg Launch Time", value: "10 Days" },
                  { label: "Client Support", value: "24/7" }
                ].map((stat, index) => (
                  <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-2xl font-orbitron font-bold text-primary">{stat.value}</div>
                    <div className="text-xs text-muted-foreground font-orbitron">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Contact;

