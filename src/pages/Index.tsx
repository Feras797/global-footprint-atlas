import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InteractiveGlobe } from "@/components/InteractiveGlobe";
import { FilterPanel } from "@/components/FilterPanel";
import { CompanyReport } from "@/components/CompanyReport";
import { Navigation } from "@/components/Navigation";
import { Globe, Search, Filter, TrendingUp, Leaf } from "lucide-react";
import earthHero from "@/assets/earth-hero-bg.jpg";

interface CompanyLocation {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'manufacturing' | 'mining' | 'agriculture' | 'energy';
  impactScore: number;
  country: string;
}

const Index = () => {
  const [selectedCompany, setSelectedCompany] = useState<CompanyLocation | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${earthHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-sky opacity-20"></div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <Globe className="w-16 h-16 mx-auto mb-6 text-accent animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Explore Corporate
            <span className="block bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              Environmental Impact
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Discover how major companies impact our planet through interactive 3D visualization and comprehensive environmental data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-4 text-lg shadow-glow transition-all duration-300 hover:scale-105"
            >
              <Search className="mr-2 h-5 w-5" />
              Start Exploring
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Main Interactive Section */}
      <section className="relative min-h-screen">
        <div className="flex h-screen">
          {/* Globe Container */}
          <div className="flex-1 relative">
            <InteractiveGlobe 
              companies={companyLocations}
              onCompanySelect={setSelectedCompany}
              filters={selectedFilters}
            />
            
            {/* Floating Controls */}
            <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="secondary"
                size="sm"
                className="shadow-earth hover:shadow-glow transition-all duration-300"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Side Panel */}
          <div className={`transition-all duration-500 ease-in-out ${showFilters ? 'w-96' : 'w-0'} overflow-hidden`}>
            <FilterPanel
              filters={selectedFilters}
              onFiltersChange={setSelectedFilters}
              onClose={() => setShowFilters(false)}
            />
          </div>
        </div>

        {/* Company Report Modal */}
        {selectedCompany && (
          <CompanyReport
            company={selectedCompany}
            onClose={() => setSelectedCompany(null)}
          />
        )}
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comprehensive Environmental Intelligence</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced tools and data to understand corporate environmental impact worldwide
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-earth transition-all duration-300 hover:-translate-y-1">
              <Globe className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-3">3D Visualization</h3>
              <p className="text-muted-foreground">
                Interactive 3D globe with real facility locations and environmental impact zones
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-earth transition-all duration-300 hover:-translate-y-1">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <h3 className="text-xl font-semibold mb-3">Time-based Analysis</h3>
              <p className="text-muted-foreground">
                Visualize environmental changes over time with intuitive temporal controls
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-earth transition-all duration-300 hover:-translate-y-1">
              <Leaf className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h3 className="text-xl font-semibold mb-3">Impact Reports</h3>
              <p className="text-muted-foreground">
                Comprehensive downloadable reports with detailed environmental metrics
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;