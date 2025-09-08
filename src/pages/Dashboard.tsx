import { useEffect, useState } from "react";
import { companies as companiesData } from '@/lib/companies'
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";
import { CompanyList } from "@/components/CompanyList";
import { DashboardMap } from "@/components/DashboardMap";
import { CesiumGlobe } from "@/components/CesiumGlobe";
import { RegionAnalyzer } from "@/components/RegionAnalyzer";
import { CompanyReport } from "@/components/CompanyReport";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricGrid } from "@/components/dashboard";
import { 
  EnhancedCompanyLocation, 
  MockCompanyData,
  convertMockDataToEnhanced,
  convertEnhancedToLegacy 
} from "@/types/company";
import { CompanyData, GlobeEntity } from "@/types/globe";
import mockDataJson from "@/data/mockdata.json";

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
  const [selectedEnhancedCompany, setSelectedEnhancedCompany] = useState<EnhancedCompanyLocation | null>(null);
  const [selectedGlobeEntity, setSelectedGlobeEntity] = useState<GlobeEntity | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    impactRange: [0, 100] as [number, number],
    timeRange: '2024'
  });

  // Load data from mockdata.JSON file
  const mockCompanies: MockCompanyData[] = mockDataJson as MockCompanyData[];
  
  // Convert mock data to enhanced format (flattens all mines into individual entries)
  const enhancedCompanies: EnhancedCompanyLocation[] = convertMockDataToEnhanced(mockCompanies);
  
  // Convert to CompanyData format for globe visualization
  const globeCompanies: CompanyData[] = mockCompanies as CompanyData[];

  // Use shared company list for list and metrics
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
                  <Badge variant="secondary">{enhancedCompanies.length} facilities</Badge>
                </div>
                <div className="h-96">
                  <CesiumGlobe 
                    companies={globeCompanies}
                    onEntitySelect={setSelectedGlobeEntity}
                    showControls={true}
                    className="w-full h-full"
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

        {/* Enhanced Company Report Modal */}
        {selectedEnhancedCompany && (
          <CompanyReport
            company={convertEnhancedToLegacy(selectedEnhancedCompany)}
            onClose={() => setSelectedEnhancedCompany(null)}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
