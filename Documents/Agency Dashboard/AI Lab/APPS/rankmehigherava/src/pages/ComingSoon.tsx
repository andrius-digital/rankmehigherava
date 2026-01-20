import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border border-primary/30 mb-8">
              <Clock className="w-12 h-12 text-primary" />
            </div>

            {/* Heading */}
            <h1 className="text-4xl lg:text-6xl font-black font-orbitron mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-600">
                Coming Soon
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're working hard to bring you something amazing. This page is under construction and will be available soon.
            </p>

            {/* Decorative elements */}
            <div className="flex items-center justify-center gap-2 mb-12">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-primary font-orbitron text-sm tracking-widest">STAY TUNED</span>
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>

            {/* Back button */}
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
  );
};

export default ComingSoon;



