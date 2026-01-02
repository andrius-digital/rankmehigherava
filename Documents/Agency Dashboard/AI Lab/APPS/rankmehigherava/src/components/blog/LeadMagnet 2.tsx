import { ArrowRight, Phone, Sparkles, Calendar } from "lucide-react";

const LeadMagnet = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500/10 via-primary/10 to-red-500/10 backdrop-blur-xl border border-red-500/20 p-10 md:p-12 my-12 shadow-2xl">
      {/* Glow effects */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-red-500/20 to-primary/20 rounded-3xl blur-xl opacity-50" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(239,68,68,0.3) 1px, transparent 1px)`,
        backgroundSize: '24px 24px'
      }} />
      
      <div className="relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 mb-6">
          <Sparkles className="w-4 h-4 text-red-400" />
          <span className="text-red-300 text-sm font-bold font-orbitron">Limited Spots Available</span>
        </div>
        
        <h3 className="font-orbitron font-black text-3xl md:text-4xl text-foreground mb-4 leading-tight">
          Ready to <span className="text-primary">Rank #1</span>?
        </h3>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg">
          Stop reading about SEO and start seeing results. Get a free audit and discover what's holding your business back.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => window.open('https://calendly.com/andrius-cdlagency/andrius-digital-asap-meeting', '_blank')}
            className="group relative px-8 py-4 rounded-2xl bg-red-500/10 backdrop-blur-md border border-red-500/30 text-white font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 group-hover:from-red-500/10 group-hover:via-red-500/20 group-hover:to-red-500/10 transition-all duration-500" />
            <div className="relative flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-400" />
              <span>Book a Call Today</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
          
          <a 
            href="tel:773-572-4686" 
            className="group relative px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold text-base hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500" />
            <div className="relative flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span>(773) 572-4686</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default LeadMagnet;
