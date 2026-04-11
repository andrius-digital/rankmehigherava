import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Home, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Page Not Found | Rank Me Higher</title>
        <meta name="description" content="The page you are looking for does not exist. Return to the Rank Me Higher homepage." />
        <meta name="prerender-status-code" content="404" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
        <Navbar />

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="font-orbitron font-black text-7xl md:text-8xl text-primary mb-4">
              404
            </h1>
            <h2 className="font-orbitron font-bold text-xl md:text-2xl text-foreground mb-3">
              Page Not Found
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              The page you are looking for does not exist or has been moved.
              Let us help you find what you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary/10 border border-primary/30 text-white font-bold text-sm hover:bg-primary/20 hover:border-primary/50 transition-all font-orbitron"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 hover:border-white/20 transition-all font-orbitron"
              >
                <ArrowLeft className="w-4 h-4" />
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default NotFound;
