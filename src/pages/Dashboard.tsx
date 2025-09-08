import { useEffect, useState } from "react";
import { companies as companiesData } from '@/lib/companies'
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";
import { CompanyList } from "@/components/CompanyList";
import { DashboardMap } from "@/components/DashboardMap";
import { RegionAnalyzer } from "@/components/RegionAnalyzer";
import { CompanyReport } from "@/components/CompanyReport";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricGrid } from "@/components/dashboard";

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

  const companyLocations: CompanyLocation[] = companiesData

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const view = params.get('view') as DashboardView | null
    if (view && ['overview','companies','regions','reports','settings'].includes(view)) {
      setActiveView(view)
    }
  }, [])

  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Overview Stats */}
            <MetricGrid 
              companies={companyLocations}
              loading={false}
            />

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
              <h2 className="text-2xl font-bold">Company Directory</h2>
              <Badge variant="secondary">{companyLocations.length} companies</Badge>
            </div>
            <CompanyList 
              companies={companyLocations}
              onCompanySelect={setSelectedCompany}
              showAll={true}
            />
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
        
        <main className="flex-1 overflow-hidden">
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
