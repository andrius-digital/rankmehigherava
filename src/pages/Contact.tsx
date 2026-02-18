import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare,
  Calendar,
  Globe,
  Shield
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

  const contactInfo = [
    {
      icon: Phone,
      title: "Call or Text Us",
      value: "(773) 572-4686",
      href: "tel:773-572-4686",
      description: "Fastest response via text"
    },
    {
      icon: Mail,
      title: "Email Us",
      value: "business@rankmehigher.com",
      href: "mailto:business@rankmehigher.com",
      description: "We respond within 24 hours"
    },
    {
      icon: Clock,
      title: "Business Hours",
      value: "Mon-Fri: 9AM-6PM CST",
      href: null,
      description: "Emergency support 24/7 for clients"
    },
  ];

  const offices = [
    {
      name: "Chicago Downtown Office",
      address: "Chicago, IL",
      description: "Our main headquarters in the heart of Chicago, serving businesses across the Chicagoland area and beyond.",
      mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d762316.5313005082!2d-88.20843849055156!3d41.72485702770512!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880e2d4ccadc9941%3A0xd064f8a30b6e0311!2sRank%20Me%20Higher%20%7C%20Local%20Map%20Booster!5e0!3m2!1sen!2sus!4v1767342975149!5m2!1sen!2sus"
    },
    {
      name: "Mundelein, IL Office",
      address: "Mundelein, IL",
      description: "Our suburban office serving the North Shore and Lake County businesses with local SEO expertise.",
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
        {/* Ambient background effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-28 pb-16 overflow-hidden">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
            <div className="text-center mb-12">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20 mb-6">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary font-orbitron">Get In Touch</span>
              </div>
              
              <h1 className="font-orbitron font-black text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
                Let's Build Your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-primary">
                  Digital Empire
                </span>
              </h1>
              
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
                Whether you need a custom website, want to dominate Google Maps, or are ready to scale your business with SEO—we're here to help. Chicago's trusted digital marketing agency.
              </p>

              {/* Quick Contact Cards */}
              <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {contactInfo.map((item, index) => (
                  <a
                    key={index}
                    href={item.href || undefined}
                    className={`group relative p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 ${item.href ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center mb-4 mx-auto">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-orbitron font-bold text-foreground mb-1">{item.title}</h3>
                      <p className="text-primary font-bold mb-1">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form & Info Section */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="relative">
                <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                      <Send className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h2 className="font-orbitron font-bold text-xl text-foreground">Send Us a Message</h2>
                      <p className="text-sm text-muted-foreground">We'll respond within 24 hours</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-orbitron text-sm">Your Name *</Label>
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
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-orbitron text-sm">Email *</Label>
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
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="font-orbitron text-sm">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="(555) 123-4567"
                          className="bg-white/5 border-white/10 focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company" className="font-orbitron text-sm">Company Name</Label>
                        <Input
                          id="company"
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="Your Business LLC"
                          className="bg-white/5 border-white/10 focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service" className="font-orbitron text-sm">What Can We Help You With?</Label>
                      <select
                        id="service"
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground focus:border-primary/40 focus:outline-none font-orbitron text-sm"
                      >
                        {services.map((service) => (
                          <option key={service.value} value={service.value} className="bg-background">
                            {service.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="font-orbitron text-sm">Your Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your project, goals, and how we can help..."
                        rows={5}
                        required
                        className="bg-white/5 border-white/10 focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group w-full relative px-8 py-4 rounded-xl bg-red-500/10 backdrop-blur-md border border-red-500/30 text-white font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 hover:scale-[1.01] transition-all duration-300 font-orbitron overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 group-hover:from-red-500/10 group-hover:via-red-500/20 group-hover:to-red-500/10 transition-all duration-500" />
                      <div className="relative flex items-center justify-center gap-2">
                        <Send className="w-5 h-5 text-red-400" />
                        <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                        {!isSubmitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                      </div>
                    </button>
                  </form>
                </div>
              </div>

              {/* Why Choose Us */}
              <div className="space-y-6">
                <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-orbitron font-bold text-xl text-foreground">Why Choose Rank Me Higher?</h2>
                  </div>

                  <div className="space-y-4">
                    {[
                      { title: "54 Websites Built", desc: "Real businesses we've launched. Check our portfolio." },
                      { title: "No Templates", desc: "Hand-coded sites. No WordPress, no page builders." },
                      { title: "Chicago Based", desc: "Local team you can actually meet in person." },
                      { title: "Direct Communication", desc: "You talk to Andrius, not a random support agent." },
                      { title: "Fast Turnaround", desc: "Most sites go live within 1-2 weeks." },
                      { title: "Honest Pricing", desc: "One monthly fee. No hidden costs or upsells." }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-orbitron font-bold text-sm text-foreground">{item.title}</h4>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href="tel:773-572-4686"
                    className="group p-6 rounded-2xl bg-red-500/10 backdrop-blur-md border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all text-center"
                  >
                    <Phone className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="font-orbitron font-bold text-foreground text-sm">Call Now</p>
                    <p className="text-xs text-muted-foreground">Instant response</p>
                  </a>
                  <button
                    onClick={() => window.open('https://calendly.com/andrius-cdlagency/andrius-digital-asap-meeting', '_blank')}
                    className="group p-6 rounded-2xl bg-cyan-500/10 backdrop-blur-md border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all text-center"
                  >
                    <Calendar className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <p className="font-orbitron font-bold text-foreground text-sm">Book a Call</p>
                    <p className="text-xs text-muted-foreground">Schedule meeting</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Office Locations Section */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 backdrop-blur-md border border-cyan-500/20 mb-6">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400 font-orbitron">Our Offices</span>
              </div>
              
              <h2 className="font-orbitron font-black text-3xl md:text-4xl text-foreground mb-4">
                Two Locations to <span className="text-primary">Serve You</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Strategically located in Chicago and Mundelein to serve businesses across Illinois and beyond. Visit us or schedule a virtual consultation.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {offices.map((office, index) => (
                <div
                  key={index}
                  className="group relative rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden hover:border-primary/40 transition-all duration-300"
                >
                  {/* Map Embed */}
                  <div className="aspect-video w-full">
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

                  {/* Office Info */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-orbitron font-bold text-lg text-foreground">{office.name}</h3>
                        <p className="text-sm text-muted-foreground">{office.address}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">{office.description}</p>
                    
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <a
                        href={`https://www.google.com/maps/search/Rank+Me+Higher+${office.address.replace(/\s/g, '+')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-bold text-sm font-orbitron flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        Get Directions
                        <ArrowRight className="w-4 h-4" />
                      </a>
                      <a
                        href="tel:773-572-4686"
                        className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs font-orbitron hover:bg-red-500/20 transition-all"
                      >
                        <Phone className="w-3 h-3 inline mr-1" />
                        Call Office
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-20 relative z-10 border-t border-white/10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="prose prose-lg prose-invert max-w-none text-center">
              <h2 className="font-orbitron font-bold text-2xl text-foreground mb-6">
                AI, Software & <span className="text-primary">Website Development</span> from Chicago
              </h2>
              
              <div className="text-muted-foreground space-y-4 text-left">
                <p>
                  <strong className="text-foreground">Rank Me Higher</strong> is a Software & Website Development Marketing Company from Chicago, founded and operated by <strong className="text-foreground">Andrius Digital</strong>. We take a technology-driven approach to building faster, better-ranking websites that actually generate leads and revenue for local businesses.
                </p>
                
                <p>
                  In 2026, Rank Me Higher introduced <strong className="text-cyan-400">AVA</strong>—our proprietary website and SEO platform. AVA was bootstrapped from the ground up without any VC funding, built entirely on our vision of making enterprise-level marketing technology accessible to small and medium businesses.
                </p>

                <p>
                  <strong className="text-cyan-400">AVA</strong> is currently managing <strong className="text-foreground">over 100 websites</strong> and growing. The platform handles everything from custom website development and hosting to SEO optimization, lead capture, SMS & email automation, and 24/7 support. Every website we build is custom-coded (no templates), SEO-optimized from day one, and includes a full dashboard for leads and analytics.
                </p>

                <p>
                  With offices in <strong className="text-foreground">Chicago Downtown</strong> and <strong className="text-foreground">Mundelein, IL</strong>, we serve businesses throughout the Chicagoland area and beyond. Whether you're a local service business looking to dominate Google Maps, an e-commerce brand ready to scale, or an established company needing a technology upgrade—we have the expertise and proven tools to deliver results. <strong className="text-foreground">Contact us today</strong> for a free consultation.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[
                  { label: "Websites on AVA", value: "100+" },
                  { label: "Founded", value: "2026" },
                  { label: "VC Funding", value: "$0" },
                  { label: "Bootstrapped", value: "100%" }
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

