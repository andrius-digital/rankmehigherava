import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import DashboardSidebar from './DashboardSidebar';
import { Menu, Brain } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        {/* Ambient Light Overlays - Matching RMH Website */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-primary/5 via-transparent to-transparent" />
          <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col relative z-10">
          {/* Mobile Header */}
          <header className="h-14 border-b border-border/50 bg-card/30 backdrop-blur-md flex items-center px-4 lg:hidden">
            <SidebarTrigger className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
              <Menu className="w-5 h-5 text-foreground" />
            </SidebarTrigger>
            <div className="ml-3 flex items-center gap-2">
              <div className="relative w-7 h-7 rounded-lg bg-cyan-500/10 backdrop-blur-md border border-cyan-500/30 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse" />
                <Brain className="w-4 h-4 text-cyan-400 relative z-10" />
              </div>
              <span className="font-heading font-bold text-foreground">AVA SEO</span>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
