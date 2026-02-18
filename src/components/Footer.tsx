import { MapPin, Phone, Mail, Facebook, Instagram, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

// TikTok icon (not available in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const services = [
  { label: "Custom Websites", href: "/services/websites" },
  { label: "Local Map Booster", href: "/localmapbooster" },
  { label: "Ads & Content", href: "/services/ads-content" },
  { label: "SEO Services", href: "/services/seo" },
  { label: "Live Outbound Sales Agents", href: "/services/outbound" },
];

const Footer = () => {
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  return (
    <footer id="contact" className="relative bg-background pt-12 pb-6">
      {/* Navigation */}
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <nav className="flex flex-wrap justify-center gap-6 md:gap-10 mb-8 pb-8 border-b border-border/30">
          <Link
            to="/"
            className="text-sm font-medium tracking-wider transition-colors text-muted-foreground hover:text-primary"
          >
            HOME
          </Link>

          {/* Services Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsServicesOpen(true)}
            onMouseLeave={() => setIsServicesOpen(false)}
          >
            <button className="flex items-center gap-1 text-sm font-medium tracking-wider transition-colors text-muted-foreground hover:text-primary">
              SERVICES
              <ChevronUp className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown - Opens upward */}
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-xl bg-background border border-border shadow-xl z-50 transition-all duration-200 ${isServicesOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
              <div className="py-2">
                {services.map((service, i) => (
                  <Link
                    key={i}
                    to={service.href}
                    className="block px-4 py-2.5 text-sm text-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                  >
                    {service.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            to="/blog"
            className="text-sm font-medium tracking-wider transition-colors text-muted-foreground hover:text-primary"
          >
            BLOG
          </Link>

          <Link
            to="/contact"
            className="text-sm font-medium tracking-wider transition-colors text-muted-foreground hover:text-primary"
          >
            CONTACT
          </Link>
        </nav>

        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Left Column - About */}
          <div className="space-y-6">
            <img src={logo} alt="Rank Me Higher" className="h-10 w-auto" />

            <p className="text-muted-foreground leading-relaxed max-w-md">
              <strong className="text-foreground">Rank Me Higher</strong> is a Software & Website Development Marketing Company from Chicago. We take a technology-driven approach to building faster, better-ranking websites that actually generate leads and revenue for local businesses.
            </p>
            <p className="text-muted-foreground leading-relaxed max-w-md text-sm mt-3">
              <strong className="text-cyan-400">AVA</strong> is our proprietary website and SEO platform, currently managing <strong className="text-foreground">54 websites</strong> and growing.
            </p>

            <div className="space-y-2">
              <Link to="/terms" className="block text-primary hover:underline text-sm">
                Terms & Conditions
              </Link>
              <Link to="/privacy" className="block text-primary hover:underline text-sm">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Right Column - Contact */}
          <div className="space-y-6">
            <h3 className="font-heading font-bold text-lg text-foreground tracking-wider">
              CONTACT
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span className="text-muted-foreground">
                  1 N State St Ste 1515, Chicago, IL 60602, United States
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:773-572-4686" className="text-muted-foreground hover:text-primary transition-colors">
                  (773) 572-4686
                </a>
              </div>

              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:business@rankmehigher.com" className="text-muted-foreground hover:text-primary transition-colors">
                  business@rankmehigher.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-border/30">
          <p className="text-muted-foreground text-sm">
            Copyright © 2026 Rank Me Higher | All Rights Reserved
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/rankmehigherseo"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://instagram.com/rankmehigherseo"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.tiktok.com/@rankmehigher"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              aria-label="TikTok"
            >
              <TikTokIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
