import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import AvaAvatar from "@/components/agency/AvaAvatar";
import StatusIndicator from "@/components/agency/StatusIndicator";
import MissionClock from "@/components/agency/MissionClock";
import { useIsMobile } from "@/hooks/use-mobile";

interface AvaAdminHeaderProps {
  onSignOut?: () => void;
  showSignOut?: boolean;
}

export const AvaAdminHeader = ({ onSignOut, showSignOut = false }: AvaAdminHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <header className={`border-b border-primary/20 bg-card/80 backdrop-blur-xl sticky top-0 z-50 ${isMobile ? 'py-2' : 'py-3'}`}>
      <div className={`container mx-auto ${isMobile ? 'px-3' : 'px-4'}`}>
        <div className="flex items-center justify-between">
          {/* Left side - Logo and title */}
          <div className="flex items-center gap-2">
            <AvaAvatar size={isMobile ? 'sm' : 'md'} />
            <h1 className={`font-orbitron font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent ${isMobile ? 'text-sm' : 'text-xl'}`}>
              {isMobile ? 'AVA' : 'AVA ADMIN PANEL'}
            </h1>
            {!isMobile && (
              <p className="text-xs text-muted-foreground font-orbitron tracking-widest uppercase ml-2">
                AI Marketing System
              </p>
            )}
          </div>

          {/* Right side - Status and clock */}
          <div className="flex items-center gap-2">
            {!isMobile ? (
              <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-card/50 border border-primary/20">
                <StatusIndicator status="online" label="Agency Node" />
                <div className="w-px h-4 bg-border" />
                <MissionClock />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card/30 border border-primary/10">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[9px] text-muted-foreground font-orbitron">ONLINE</span>
              </div>
            )}
            
            {showSignOut && onSignOut && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onSignOut}
                className={isMobile ? 'h-7 w-7 p-0' : 'h-9 w-9 p-0'}
              >
                <LogOut className={`text-muted-foreground hover:text-destructive ${isMobile ? 'w-3.5 h-3.5' : 'w-5 h-5'}`} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AvaAdminHeader;
