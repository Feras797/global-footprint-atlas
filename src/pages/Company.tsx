import { useMemo, useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getCompanyById, getSimilarCompanies } from '@/lib/companies'
import { PatchCard } from '@/components/company/patch-card'
import { AnalysisChart } from '@/components/company/analysis-chart'
import { generateMockCompanyAnalysis, TIME_RANGE_PRESETS } from '@/lib/data/mock-analysis'
import { PatchData } from '@/lib/types/analysis'
import {
  ArrowLeft,
  Download,
  Share2,
  Settings,
  Eye,
  BarChart3,
  TrendingUp,
  Filter,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'

export default function CompanyPage () {
  const params = useParams()
  const companyId = params.companyId || ''
  const company = useMemo(() => getCompanyById(companyId), [companyId])
  const navigate = useNavigate()

  // Generate comprehensive analysis data
  const analysisData = useMemo(() => generateMockCompanyAnalysis(companyId), [companyId])
  
  // State management
  const [selectedPatch, setSelectedPatch] = useState<PatchData | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<[Date, Date]>(TIME_RANGE_PRESETS[2].range)
  const [showComparison, setShowComparison] = useState(true)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['deforestation', 'ndvi', 'water-bodies', 'land-cover'])
  const [viewMode, setViewMode] = useState<'grid' | 'detailed'>('grid')
  const [isPanelExpanded, setIsPanelExpanded] = useState(true)

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

  const allPatches = [analysisData.mainPatch, ...analysisData.referencePatches]
  const filteredMetrics = analysisData.metrics.filter(metric => selectedMetrics.includes(metric.id))

  // Keyboard shortcut for toggling panel
  const togglePanel = useCallback(() => {
    setIsPanelExpanded(prev => !prev)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle panel with Ctrl/Cmd + B
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault()
        togglePanel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [togglePanel])

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Side Panel */}
      <aside className={`border-r border-border bg-muted/20 overflow-auto transition-all duration-300 ease-in-out ${
        isPanelExpanded ? 'w-80' : 'w-16'
      }`}>
        <div className="px-4 py-6">
          {/* Toggle Button - Only show when collapsed */}
          {!isPanelExpanded && (
            <div className="flex justify-center mb-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={togglePanel}
                      className="h-8 w-8 hover:bg-muted"
                      aria-label="Expand panel (Ctrl+B)"
                    >
                      <PanelLeftOpen className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Expand panel (Ctrl+B)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {isPanelExpanded && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Controls Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-foreground">Analysis Controls</h3>
                  <p className="text-xs text-muted-foreground mt-1">Configure your environmental impact analysis</p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={togglePanel}
                        className="h-6 w-6 hover:bg-muted -mt-0.5"
                        aria-label="Collapse panel (Ctrl+B)"
                      >
                        <PanelLeftClose className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Collapse panel (Ctrl+B)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

            <Separator />

            {/* View Mode */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">View Mode</Label>
              <Select value={viewMode} onValueChange={(value: 'grid' | 'detailed') => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid View</SelectItem>
                  <SelectItem value="detailed">Detailed View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Comparison Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="comparison" className="text-sm font-medium">
                Show Reference Comparison
              </Label>
              <Switch
                id="comparison"
                checked={showComparison}
                onCheckedChange={setShowComparison}
              />
            </div>

            <Separator />

            {/* Metric Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Metrics to Display</Label>
              <div className="space-y-2">
                {analysisData.metrics.map(metric => (
                  <div key={metric.id} className="flex items-center justify-between">
                    <Label htmlFor={metric.id} className="text-sm text-muted-foreground cursor-pointer">
                      {metric.name}
                    </Label>
                    <Switch
                      id={metric.id}
                      checked={selectedMetrics.includes(metric.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMetrics([...selectedMetrics, metric.id])
                        } else {
                          setSelectedMetrics(selectedMetrics.filter(id => id !== metric.id))
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Quick Stats */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quick Stats</Label>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Main Patch Size:</span>
                  <span className="font-medium">{(analysisData.mainPatch.size / 1000).toFixed(1)}k ha</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reference Patches:</span>
                  <span className="font-medium">{analysisData.referencePatches.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="font-medium">
                    {new Date(analysisData.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            </div>
          )}
          
          {/* Collapsed Panel Indicators */}
          {!isPanelExpanded && (
            <div className="flex flex-col items-center space-y-4 mt-4">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <div className="p-6 space-y-8">
          {/* Header with Breadcrumbs */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Environmental Impact</span>
              <span>/</span>
              <span>Companies</span>
              <span>/</span>
              <span className="text-foreground font-medium">{company.name}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
                <div className="flex items-center space-x-4 text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{company.country}</span>
                  </div>
                  <Badge variant="outline">{company.type}</Badge>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Impact Score: {company.impactScore}</span>
                  </div>
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

          {/* Patches Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Operational Sites</h2>
                <p className="text-muted-foreground mt-1">
                  Main operational site and {analysisData.referencePatches.length} similar reference locations
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Analysis Date: {new Date(analysisData.mainPatch.analysisDate).toLocaleDateString()}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <PatchCard
                  patch={analysisData.mainPatch}
                  isSelected={selectedPatch?.id === analysisData.mainPatch.id}
                  onSelect={setSelectedPatch}
                  showSimilarityScore={false}
                />
              </div>
              {analysisData.referencePatches.map(patch => (
                <PatchCard
                  key={patch.id}
                  patch={patch}
                  isSelected={selectedPatch?.id === patch.id}
                  onSelect={setSelectedPatch}
                  showSimilarityScore={true}
                />
              ))}
            </div>
          </section>

          {/* Analysis Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Environmental Impact Analysis</h2>
                <p className="text-muted-foreground mt-1">
                  Comprehensive analysis of environmental changes over time
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {filteredMetrics.length} of {analysisData.metrics.length} metrics shown
                </Badge>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </div>
            </div>

            {filteredMetrics.length === 0 ? (
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Metrics Selected</h3>
                  <p className="text-sm mb-4">Please select at least one metric from the side panel to view analysis.</p>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedMetrics(['deforestation', 'ndvi'])}
                  >
                    Show Default Metrics
                  </Button>
                </div>
              </Card>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
                {filteredMetrics.map(metric => (
                  <AnalysisChart
                    key={metric.id}
                    metric={metric}
                    selectedTimeRange={selectedTimeRange}
                    showComparison={showComparison}
                    height={viewMode === 'detailed' ? 400 : 300}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Summary Stats */}
          <section className="space-y-6">
            <h3 className="text-xl font-semibold">Analysis Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">15%</div>
                  <div className="text-sm text-muted-foreground">Improvement over references</div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">24</div>
                  <div className="text-sm text-muted-foreground">Months of data analyzed</div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">96%</div>
                  <div className="text-sm text-muted-foreground">Average similarity to references</div>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}


