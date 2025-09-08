import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";
import { CompanyList } from "@/components/CompanyList";
import { DashboardMap } from "@/components/DashboardMap";
import { RegionAnalyzer } from "@/components/RegionAnalyzer";
import { CompanyReport } from "@/components/CompanyReport";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Globe, Leaf } from "lucide-react";

interface CompanyLocation {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'manufacturing' | 'mining' | 'agriculture' | 'energy';
  impactScore: number;
  country: string;
}

export type DashboardView = 'overview' | 'companies' | 'regions' | 'reports' | 'settings';

const Dashboard = () => {
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [selectedCompany, setSelectedCompany] = useState<CompanyLocation | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    impactRange: [0, 100] as [number, number],
    timeRange: '2024'
  });

  const companyLocations: CompanyLocation[] = [
    {
      id: '1',
      name: 'TechCorp Manufacturing',
      position: [1.2, 0.8, 0.9],
      type: 'manufacturing',
      impactScore: 72,
      country: 'USA'
    },
    {
      id: '2', 
      name: 'GreenEnergy Solutions',
      position: [-0.5, 0.3, 1.1],
      type: 'energy',
      impactScore: 45,
      country: 'Germany'
    },
    {
      id: '3',
      name: 'AgroGiant Facilities',
      position: [0.8, -0.6, 0.7],
      type: 'agriculture',
      impactScore: 88,
      country: 'Brazil'
    }
  ];

  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{companyLocations.length}</div>
                    <div className="text-sm text-muted-foreground">Active Companies</div>
                  </div>
                  <Globe className="h-8 w-8 text-primary" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">67%</div>
                    <div className="text-sm text-muted-foreground">Avg Impact Score</div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-secondary" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">-12%</div>
                    <div className="text-sm text-muted-foreground">Impact Reduction</div>
                  </div>
                  <TrendingDown className="h-8 w-8 text-green-500" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">23</div>
                    <div className="text-sm text-muted-foreground">Countries</div>
                  </div>
                  <Leaf className="h-8 w-8 text-accent" />
                </div>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Panel */}
              <Card className="lg:col-span-2 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Global Impact Map</h3>
                  <Badge variant="secondary">{companyLocations.length} facilities</Badge>
                </div>
                <div className="h-96">
                  <DashboardMap 
                    companies={companyLocations}
                    onCompanySelect={setSelectedCompany}
                    filters={filters}
                  />
                </div>
              </Card>

              {/* Company List Panel */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Analysis</h3>
                <CompanyList 
                  companies={companyLocations}
                  onCompanySelect={setSelectedCompany}
                />
              </Card>
            </div>
          </div>
        );

      case 'companies':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Company Management</h2>
              <Badge variant="secondary">{companyLocations.length} companies</Badge>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Company Directory</h3>
                <CompanyList 
                  companies={companyLocations}
                  onCompanySelect={setSelectedCompany}
                  showAll={true}
                />
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Impact Visualization</h3>
                <div className="h-96">
                  <DashboardMap 
                    companies={companyLocations}
                    onCompanySelect={setSelectedCompany}
                    filters={filters}
                  />
                </div>
              </Card>
            </div>
          </div>
        );

      case 'regions':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Region Analysis</h2>
            </div>
            <RegionAnalyzer />
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">This feature is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderMainContent()}
          </div>
        </main>

        {/* Company Report Modal - keeping same functionality */}
        {selectedCompany && (
          <CompanyReport
            company={selectedCompany}
            onClose={() => setSelectedCompany(null)}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
