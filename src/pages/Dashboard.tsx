import { useEffect, useState } from "react";
import { companies as companiesData } from '@/lib/companies'
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";
import { CompanyList } from "@/components/CompanyList";
import { DashboardMap } from "@/components/DashboardMap";
import { MapLibre3DGlobe } from "@/components/MapLibre3DGlobe";
import { SimpleMapLibreGlobe } from "@/components/SimpleMapLibreGlobe";
import { RegionAnalyzer } from "@/components/RegionAnalyzer";
import { CompanyReport } from "@/components/CompanyReport";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricGrid } from "@/components/dashboard";
import { CompanyData, GlobeEntity } from "@/types/globe";
import mockDataJson from "@/data/mockdata.json";
import { useNavigate } from "react-router-dom";

// Removed old GEE Analysis imports - using simplified approach now

interface CompanyLocation {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'manufacturing' | 'mining' | 'agriculture' | 'energy' | 'nuclear' | 'thermal';
  impactScore: number;
  country: string;
}

export type DashboardView = 'overview' | 'companies' | 'regions' | 'reports' | 'settings';

const Dashboard = () => {
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [selectedCompany, setSelectedCompany] = useState<CompanyLocation | null>(null);
  const [selectedGlobeEntity, setSelectedGlobeEntity] = useState<GlobeEntity | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    impactRange: [0, 100] as [number, number],
    timeRange: '2024'
  });
  const navigate = useNavigate();

  // Removed GEE Analysis state - using simplified approach

  // Convert our unified companies to format MapLibre3DGlobe expects
  const globeCompanies: CompanyData[] = companiesData.map(company => ({
    company: company.name,
    Industry: company.industry,
    "Market cap": company.marketCap || "N/A",
    Revenue: company.revenue || undefined,
    places: company.places.map(place => {
      // Calculate center point from rectangular coordinates [tlx, tly, brx, bry]
      const [tlx, tly, brx, bry] = place.coordinates;
      const centerLng = (tlx + brx) / 2;
      const centerLat = (tly + bry) / 2;
      
      return {
        name: place.name,
        location: place.location,
        coordinates: [centerLng, centerLat] as [number, number], // Convert to center point
        "Number of plants": company.numberOfPlants || 1
      };
    })
  }));

  // Convert new company format to legacy format for compatibility
  const companyLocations: CompanyLocation[] = companiesData.map(company => ({
    id: company.id,
    name: company.name,
    position: company.position,
    type: company.type === 'nuclear' || company.type === 'thermal' ? 'energy' : company.type,
    impactScore: company.impactScore,
    country: company.country
  }))

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
                  <Badge variant="secondary">
                    {globeCompanies.reduce((total, company) => total + (company.places?.length || 0), 0)} locations
                  </Badge>
                </div>
                <div className="h-96">
                  <SimpleMapLibreGlobe 
                    companies={globeCompanies}
                    onEntitySelect={setSelectedGlobeEntity}
                    showControls={true}
                    className="w-full h-full"
                  />
                </div>
              </Card>

              {/* Company List Panel */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Companies</h3>
                <CompanyList 
                  companies={companyLocations}
                  onCompanySelect={setSelectedCompany}
                  onStartAnalysis={(companyId) => navigate(`/company/${companyId}`)}
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
              onStartAnalysis={(companyId) => navigate(`/company/${companyId}`)}
            />
          </div>
        );

      case 'regions':
        return <RegionAnalyzer />;

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
