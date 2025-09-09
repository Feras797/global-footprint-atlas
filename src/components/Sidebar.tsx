import { 
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Globe2, 
  BarChart3, 
  Building2, 
  MapPin, 
  FileText, 
  Settings,
  Home,
  LogOut,
  Satellite
} from "lucide-react";
import { Link } from "react-router-dom";
import type { DashboardView } from "@/pages/Dashboard";

interface SidebarProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

const menuItems = [
  {
    title: "Overview",
    icon: BarChart3,
    view: 'overview' as DashboardView,
    description: "Dashboard overview"
  },
  {
    title: "Companies",
    icon: Building2,
    view: 'companies' as DashboardView,
    description: "Manage companies"
  },
  {
    title: "Regions", 
    icon: MapPin,
    view: 'regions' as DashboardView,
    description: "Analyze regions"
  },
  {
    title: "Satellite Analysis",
    icon: Satellite,
    view: 'analysis' as DashboardView,
    description: "Earth Engine similarity analysis"
  },
  {
    title: "Settings",
    icon: Settings,
    view: 'settings' as DashboardView,
    description: "Configuration"
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  return (
    <SidebarComponent className="border-r border-sidebar-border bg-sidebar-background">
      <SidebarHeader className="p-6 border-b border-sidebar-border bg-sidebar-background">
        <div className="flex items-center space-x-2">
          <div>
            <div className="text-lg font-bold text-white">
              <span className="text-white">Protect</span>
              <span className="text-primary">Earth</span>
            </div>
            <div className="text-xs text-sidebar-foreground">Environmental Monitoring</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 bg-sidebar-background">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.view}>
                  <SidebarMenuButton 
                    onClick={() => onViewChange(item.view)}
                    isActive={activeView === item.view}
                    className={`w-full justify-start transition-smooth ${
                      activeView === item.view 
                        ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-sidebar-foreground">Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-smooth">
                <MapPin className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-smooth">
                <FileText className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar-background">
        <div className="space-y-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-smooth">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-smooth">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </SidebarComponent>
  );
};