import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  BarChart3,
  FileText,
  Star,
  MapPin,
  Map,
  Users,
  Building2,
  CreditCard,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  Brain,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { title: 'Dashboard', url: '/avaseo', icon: LayoutDashboard },
  { title: 'AI Assistant', url: '/avaseo/ai-assistant', icon: Bot },
  { title: 'Analytics', url: '/avaseo/analytics', icon: BarChart3 },
  { title: 'Blogs', url: '/avaseo/blogs', icon: FileText },
  { title: 'Reviews', url: '/avaseo/reviews', icon: Star },
  { title: 'Local Rankings', url: '/avaseo/local-rankings', icon: MapPin },
  { title: 'Service Areas', url: '/avaseo/service-areas', icon: Map },
  { title: 'Contacts', url: '/avaseo/contacts', icon: Users },
];

const settingsNavItems = [
  { title: 'Company', url: '/avaseo/company', icon: Building2 },
  { title: 'Billing', url: '/avaseo/billing', icon: CreditCard },
  { title: 'Settings', url: '/avaseo/settings', icon: Settings },
];

const DashboardSidebar: React.FC = () => {
  const location = useLocation();
  const { isAdmin, signOut } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/avaseo') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-card/50 backdrop-blur-sm">
      <SidebarHeader className="p-4 border-b border-border/50">
        <Link to="/avaseo" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-cyan-500/10 backdrop-blur-md border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-all overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity" />
            <Brain className="w-5 h-5 text-cyan-400 relative z-10" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg text-sidebar-foreground">
                AVA SEO
              </span>
              <span className="text-xs text-muted-foreground">by Rank Me Higher</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(isCollapsed && 'sr-only')}>
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={cn(isCollapsed && 'sr-only')}>
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className={cn(isCollapsed && 'sr-only')}>
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/avaseo/admin')}
                    tooltip="Admin Dashboard"
                  >
                    <Link to="/avaseo/admin">
                      <Shield className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="AVA Admin Panel">
              <Link to="/avaadminpanel">
                <ChevronLeft className="h-4 w-4" />
                <span>AVA Admin Panel</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              tooltip="Sign Out"
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
