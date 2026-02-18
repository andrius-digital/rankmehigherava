import { Phone, Menu, X, ChevronDown, Calendar } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Declare Calendly global type
declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

const CALENDLY_URL = "https://calendly.com/andrius-cdlagency/andrius-digital-asap-meeting";

const services = [
  { label: "Custom Websites", href: "/services/websites" },
  { label: "Local Map Booster", href: "/localmapbooster" },
  { label: "Ads & Content", href: "/services/ads-content" },
  { label: "SEO Services", href: "/services/seo" },
  { label: "Live Outbound Sales Agents", href: "/services/outbound" },
];

const Navbar = ({ onOpenLeadMagnet }: { onOpenLeadMagnet?: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const openCalendly = () => {
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url: CALENDLY_URL });
    } else {
      window.open(CALENDLY_URL, '_blank');
    }
  };

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById("contact");
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById("contact");
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-red-600/40 rounded-full blur-md" />
                <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-background border-2 border-primary/30 overflow-hidden flex items-center justify-center">
                  <img src="/assets/logo.png" alt="Rank Me Higher" className="w-10 h-10 lg:w-12 lg:h-12 object-contain" />
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground font-medium hover:text-primary transition-colors">
              Home
            </Link>

            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button className="flex items-center gap-1 text-foreground font-medium hover:text-primary transition-colors">
                Services
                <ChevronDown className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              <div className={`absolute top-full left-0 mt-2 w-56 rounded-xl bg-background border border-border shadow-xl z-50 transition-all duration-200 ${isServicesOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                }`}>
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

            <Link to="/blog" className="text-foreground font-medium hover:text-primary transition-colors">
              Blog
            </Link>


            <Link to="/contact" className="text-foreground font-medium hover:text-primary transition-colors">
              Contact
            </Link>
          </div>

          {/* Desktop: Get Your Website CTA */}
          <button
            onClick={onOpenLeadMagnet || openCalendly}
            className="group hidden lg:flex items-center gap-3 px-5 py-2.5 rounded-full bg-red-500/10 backdrop-blur-md border border-red-500/30 text-white font-medium hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 group-hover:from-red-500/10 group-hover:via-red-500/20 group-hover:to-red-500/10 transition-all duration-500" />
            <Phone className="w-4 h-4 text-red-400 relative z-10" />
            <span className="text-sm font-bold relative z-10">Get Your Website</span>
          </button>

          {/* Mobile: Get Your Website CTA */}
          <button
            onClick={onOpenLeadMagnet || openCalendly}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 backdrop-blur-md border border-red-500/30 text-white text-xs font-bold hover:bg-red-500/20 transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-red-400" />
            <span>Get Your Website</span>
          </button>

          {/* Mobile: Menu Button */}
          <button className="md:hidden text-foreground p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-foreground font-medium hover:text-primary transition-colors py-2"
              >
                Home
              </Link>

              {/* Services with dropdown */}
              <div>
                <button
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className="flex items-center justify-between w-full text-foreground font-medium hover:text-primary transition-colors py-2"
                >
                  <span>Services</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                </button>
                {isServicesOpen && (
                  <div className="pl-4 space-y-1 mt-1 bg-background">
                    {services.map((service, i) => (
                      <Link
                        key={i}
                        to={service.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-muted-foreground hover:text-primary transition-colors py-2 text-sm"
                      >
                        {service.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/blog"
                onClick={() => setIsMenuOpen(false)}
                className="text-foreground font-medium hover:text-primary transition-colors py-2"
              >
                Blog
              </Link>


              <Link
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="text-foreground font-medium hover:text-primary transition-colors py-2"
              >
                Contact
              </Link>

              <button onClick={() => { setIsMenuOpen(false); if (onOpenLeadMagnet) onOpenLeadMagnet(); else openCalendly(); }} className="flex items-center justify-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-primary to-red-600 text-white font-bold mt-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">Get Your Website</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
