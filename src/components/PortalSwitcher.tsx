import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Users, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type PortalType = 'agency' | 'client' | 'reseller';

interface PortalSwitcherProps {
  className?: string;
}

const allPortals: { type: PortalType; label: string; path: string; icon: React.ElementType; color: string }[] = [
  {
    type: 'agency',
    label: 'Agency',
    path: '/client-portal',
    icon: Building2,
    color: 'cyan'
  },
  {
    type: 'client',
    label: 'Client',
    path: '/client-dashboard',
    icon: Users,
    color: 'emerald'
  },
  {
    type: 'reseller',
    label: 'Reseller',
    path: '/reseller-portal',
    icon: Briefcase,
    color: 'purple'
  },
];

const PortalSwitcher: React.FC<PortalSwitcherProps> = ({ className }) => {
  const location = useLocation();
  const { isAdmin, isReseller } = useAuth();

  const getCurrentPortal = (): PortalType => {
    if (location.pathname.includes('client-dashboard')) return 'client';
    if (location.pathname.includes('reseller-portal')) return 'reseller';
    return 'agency';
  };

  const currentPortal = getCurrentPortal();

  // Reseller users see Agency + Client portals (not Reseller management)
  const portals = isReseller && !isAdmin
    ? allPortals.filter(p => p.type === 'agency' || p.type === 'client')
    : allPortals;

  // Don't render switcher if only one portal
  if (portals.length <= 1) return null;

  return (
    <div className={cn("flex items-center gap-1 p-1 rounded-xl bg-card/30 border border-white/10", className)}>
      {portals.map((portal) => {
        const Icon = portal.icon;
        const isActive = currentPortal === portal.type;

        const colorClasses = {
          cyan: isActive ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'hover:bg-cyan-500/10 text-muted-foreground hover:text-cyan-400',
          emerald: isActive ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400',
          purple: isActive ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'hover:bg-purple-500/10 text-muted-foreground hover:text-purple-400',
        };

        return (
          <Link
            key={portal.type}
            to={portal.path}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all font-orbitron text-[8px] uppercase tracking-widest font-bold",
              isActive ? 'border' : 'border-transparent',
              colorClasses[portal.color as keyof typeof colorClasses]
            )}
          >
            <Icon className="w-3 h-3" />
            {portal.label}
          </Link>
        );
      })}
    </div>
  );
};

export default PortalSwitcher;
