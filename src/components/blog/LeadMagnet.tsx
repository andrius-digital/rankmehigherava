import { ArrowRight, Calendar } from "lucide-react";

const LeadMagnet = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-500/10 border border-red-500/20 p-6 md:p-8 my-8">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="flex-1">
          <h3 className="font-orbitron font-bold text-lg text-foreground mb-1.5">
            Want results like these?
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We build custom-coded web apps that rank, convert, and grow your business. See if we're a fit.
          </p>
        </div>
        <button 
          onClick={() => window.open('https://calendly.com/andrius-cdlagency/andrius-digital-asap-meeting', '_blank')}
          className="group shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-red-500/15 backdrop-blur-md border border-red-500/30 text-white font-bold text-sm hover:bg-red-500/25 hover:border-red-500/50 transition-all duration-300 font-orbitron"
        >
          <Calendar className="w-4 h-4 text-red-400" />
          Book a Call
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default LeadMagnet;
