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
  Shield, 
  BarChart3, 
  Building2, 
  MapPin, 
  FileText, 
  Settings,
  Home,
  LogOut
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
    title: "Reports",
    icon: FileText,
    view: 'reports' as DashboardView,
    description: "View reports"
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
    <SidebarComponent className="border-r border-border">
      <SidebarHeader className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <div className="text-lg font-bold text-foreground">ProtectEarth</div>
            <div className="text-xs text-muted-foreground">Environmental Analysis</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.view}>
                  <SidebarMenuButton 
                    onClick={() => onViewChange(item.view)}
                    isActive={activeView === item.view}
                    className={`w-full justify-start ${
                      activeView === item.view 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'hover:bg-muted'
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
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <div className="space-y-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </SidebarComponent>
  );
};