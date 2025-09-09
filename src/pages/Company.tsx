import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ArrowLeft, Download, Share2, Satellite, MapPin, Building2, FileText, Brain, BarChart3 } from 'lucide-react'

import { getCompanyById, Company } from '@/lib/companies'
import { CompanyAnalysisMap } from '@/components/gee/CompanyAnalysisMap'
import { RealDataVisualization } from '@/components/company/RealDataVisualization'
import { ReportGenerator } from '@/components/report/ReportGenerator'


export default function CompanyPage() {
  const params = useParams()
  const companyId = params.companyId || ''
  const [activeTab, setActiveTab] = useState('analysis')
  const [analysisData, setAnalysisData] = useState<{
    redAreas: any[];
    greenAreas: any[];
  }>({ redAreas: [], greenAreas: [] })
  const [batchAnalysisData, setBatchAnalysisData] = useState<any>(null)
  const [analysisCompleted, setAnalysisCompleted] = useState(false)
  
  // Load company using unified system
  const company = useMemo(() => getCompanyById(companyId), [companyId])
  const navigate = useNavigate()

  // Reset analysis state when company changes
  useMemo(() => {
    setAnalysisCompleted(false);
    setActiveTab('analysis');
    setAnalysisData({ redAreas: [], greenAreas: [] });
    setBatchAnalysisData(null);
  }, [companyId]);

  // Convert company places to location format for the map
  const companyLocations = useMemo(() => {
    if (!company) return [];
    
    // Use company places with rectangular coordinates (from real mockdata)
    return company.places.map(place => ({
      name: place.name,
      coordinates: place.coordinates, // Already in [tlx, tly, brx, bry] format
      location: place.location
    }));
  }, [company]);

  if (!company) {
    return (
      <div className="min-h-screen w-full flex bg-background">
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Company not found</h1>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Back to Companies"
                onClick={() => navigate('/dashboard?view=companies')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="p-6">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <span>Environmental Impact</span>
            <span>/</span>
            <span>Companies</span>
            <span>/</span>
            <span className="text-foreground font-medium">
              {company.name}
            </span>
          </div>
          
          {/* Company Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                {company.name}
              </h1>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{company.country}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Building2 className="h-4 w-4" />
                  <Badge variant="outline">{company.industry}</Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Places: </span>
                  <Badge variant="secondary">{company.places.length}</Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Impact Score: </span>
                  <Badge variant={company.impactScore > 70 ? 'destructive' : company.impactScore > 40 ? 'secondary' : 'default'}>
                    {company.impactScore}
                  </Badge>
                </div>
                {company.marketCap && (
                  <div className="flex items-center space-x-1">
                    <span>Market Cap: </span>
                    <Badge variant="outline" className="text-xs">{company.marketCap}</Badge>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export Report
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Back to Companies"
                onClick={() => navigate('/dashboard?view=companies')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Environmental Impact Analysis</h2>
                <p className="text-muted-foreground mt-1">
                  Comprehensive analysis and AI-powered reporting for {company.name}'s environmental footprint
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Satellite className="h-3 w-3 mr-1" />
                Live Analysis & AI Reports
              </Badge>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <Satellite className="h-4 w-4" />
                Satellite Analysis
              </TabsTrigger>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger 
                      value="visualization" 
                      disabled={!analysisCompleted}
                      className="flex items-center gap-2"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Data Visualization
                    </TabsTrigger>
                  </TooltipTrigger>
                  {!analysisCompleted && (
                    <TooltipContent>
                      <p>Complete satellite analysis first</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger 
                      value="reports" 
                      disabled={!analysisCompleted}
                      className="flex items-center gap-2"
                    >
                      <Brain className="h-4 w-4" />
                      AI Reports
                    </TabsTrigger>
                  </TooltipTrigger>
                  {!analysisCompleted && (
                    <TooltipContent>
                      <p>Complete satellite analysis first</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </TabsList>

            <TabsContent value="analysis" className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Satellite Environmental Analysis</h3>
                <p className="text-muted-foreground text-sm">
                  Real-time analysis of operational areas (red) and environmentally similar regions (green)
                </p>
              </div>
              
              {/* Analysis Map Component */}
              <CompanyAnalysisMap
                companyName={company.name}
                locations={companyLocations}
                className="max-w-6xl mx-auto"
                onAnalysisComplete={(redAreas: any[], greenAreas: any[]) => {
                  setAnalysisData({ redAreas, greenAreas });
                  // Don't set analysisCompleted here - this just means green areas were fetched
                }}
                onAnalysisPerformed={(batchData) => {
                  setBatchAnalysisData(batchData);
                  setAnalysisCompleted(true);
                  setActiveTab('visualization'); // Auto-switch to visualization tab
                }}
              />
            </TabsContent>

            <TabsContent value="visualization" className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Environmental Data Visualization</h3>
                <p className="text-muted-foreground text-sm">
                  Interactive charts and graphs showing environmental metrics over time with comparison to similar regions
                </p>
              </div>
              
              {/* Real Data Visualization Component */}
              <RealDataVisualization
                batchAnalysisData={batchAnalysisData}
                companyName={company.name}
                className="max-w-6xl mx-auto"
              />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">AI-Powered Environmental Reports</h3>
                <p className="text-muted-foreground text-sm">
                  Generate comprehensive reports using Gemini 2.5 Pro to analyze environmental data and provide insights
                </p>
              </div>
              
              {/* Report Generator Component */}
              <ReportGenerator
                company={company}
                redAreasData={analysisData.redAreas}
                greenAreasData={analysisData.greenAreas}
                className="max-w-4xl mx-auto"
              />
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </div>
  )
}