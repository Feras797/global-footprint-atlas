import { useState } from "react";
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
    },
    { id: '4', name: 'BlueSteel Mining', position: [-0.9, 0.4, -0.6], type: 'mining', impactScore: 65, country: 'Canada' },
    { id: '5', name: 'Solaris Power', position: [0.2, 1.0, -0.3], type: 'energy', impactScore: 38, country: 'Australia' },
    { id: '6', name: 'AgriFoods Ltd', position: [-1.0, -0.2, 0.5], type: 'agriculture', impactScore: 54, country: 'India' },
    { id: '7', name: 'EuroManufacture', position: [0.6, 0.1, -0.9], type: 'manufacturing', impactScore: 47, country: 'France' },
    { id: '8', name: 'ShinTech Fabrication', position: [-0.3, -0.9, 0.8], type: 'manufacturing', impactScore: 59, country: 'Japan' },
    { id: '9', name: 'Nordic Minerals', position: [0.7, -0.2, 0.9], type: 'mining', impactScore: 33, country: 'Norway' },
    { id: '10', name: 'Desert Oil Fields', position: [0.9, 0.5, -0.4], type: 'energy', impactScore: 81, country: 'Saudi Arabia' },
    { id: '11', name: 'RiverValley Farms', position: [-0.4, 0.7, 0.6], type: 'agriculture', impactScore: 42, country: 'Argentina' },
    { id: '12', name: 'MetroWorks Assembly', position: [0.5, 0.9, -0.2], type: 'manufacturing', impactScore: 36, country: 'UK' },
    { id: '13', name: 'Siberia Metals', position: [-0.8, -0.5, 0.4], type: 'mining', impactScore: 76, country: 'Russia' },
    { id: '14', name: 'Coastal Wind Co', position: [0.1, -1.1, 0.6], type: 'energy', impactScore: 29, country: 'Spain' },
    { id: '15', name: 'Mediterranean Agro', position: [-0.6, 0.2, -1.0], type: 'agriculture', impactScore: 51, country: 'Italy' },
    { id: '16', name: 'TransPacific Fabricators', position: [1.0, -0.1, 0.2], type: 'manufacturing', impactScore: 63, country: 'China' },
    { id: '17', name: 'Andes Mining Group', position: [-0.7, 0.8, -0.1], type: 'mining', impactScore: 57, country: 'Peru' },
    { id: '18', name: 'Equatorial BioFarms', position: [0.2, -0.8, 1.0], type: 'agriculture', impactScore: 46, country: 'Indonesia' },
    { id: '19', name: 'Gulf Petro Energy', position: [0.4, 0.6, 0.9], type: 'energy', impactScore: 84, country: 'UAE' },
    { id: '20', name: 'Savanna Growers', position: [-0.2, 0.9, -0.7], type: 'agriculture', impactScore: 40, country: 'South Africa' }
  ];

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
