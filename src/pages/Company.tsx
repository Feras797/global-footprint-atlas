import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Share2, Satellite, MapPin, Building2 } from 'lucide-react'

import { getCompanyById } from '@/lib/companies'
import { getCompanyByMockId, companyIdToIndex, MockCompany } from '@/lib/mockdata-companies'
import { CompanyAnalysisMap } from '@/components/gee/CompanyAnalysisMap'

export default function CompanyPage() {
  const params = useParams()
  const companyId = params.companyId || ''
  
  // Try to load from mockdata first, then fallback to old companies
  const mockCompany = useMemo(() => getCompanyByMockId(companyId), [companyId])
  const company = useMemo(() => getCompanyById(companyId), [companyId])
  const navigate = useNavigate()

  // Use mock company if available, otherwise fallback to old company format
  const activeCompany: MockCompany | null = mockCompany || null
  const legacyCompany = !mockCompany ? company : null

  // Convert company places to location format for the map
  const companyLocations = useMemo(() => {
    if (activeCompany) {
      // Use real mockdata places with rectangular coordinates
      return activeCompany.places.map(place => ({
        name: place.name,
        coordinates: place.coordinates, // Already in [tlx, tly, brx, bry] format
        location: place.location
      }));
    } else if (legacyCompany) {
      // Fallback to legacy company format (convert to rectangle)
      const [lng, lat] = legacyCompany.position;
      const size = 0.005;
      return [{
        name: `${legacyCompany.name} Primary Site`,
        coordinates: [lng - size, lat + size, lng + size, lat - size] as [number, number, number, number],
        location: legacyCompany.country
      }];
    }
    return [];
  }, [activeCompany, legacyCompany]);

  if (!activeCompany && !legacyCompany) {
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
              {activeCompany?.company || legacyCompany?.name}
            </span>
          </div>
          
          {/* Company Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                {activeCompany?.company || legacyCompany?.name}
              </h1>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {activeCompany ? companyLocations[0]?.location || 'Multiple Locations' : legacyCompany?.country}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Building2 className="h-4 w-4" />
                  <Badge variant="outline">
                    {activeCompany?.Industry || legacyCompany?.type}
                  </Badge>
                </div>
                {activeCompany && (
                  <div className="flex items-center space-x-1">
                    <span>Plants: </span>
                    <Badge variant="secondary">
                      {activeCompany['Number of plants'] || companyLocations.length}
                    </Badge>
                  </div>
                )}
                {legacyCompany && (
                  <div className="flex items-center space-x-1">
                    <span>Impact Score: </span>
                    <Badge variant={legacyCompany.impactScore > 70 ? 'destructive' : legacyCompany.impactScore > 40 ? 'secondary' : 'default'}>
                      {legacyCompany.impactScore}
                    </Badge>
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
                <h2 className="text-2xl font-bold">Satellite Environmental Analysis</h2>
                <p className="text-muted-foreground mt-1">
                  Real-time analysis of {activeCompany?.company || legacyCompany?.name}'s operational areas and environmentally similar regions
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Satellite className="h-3 w-3 mr-1" />
                Live Satellite Analysis
              </Badge>
            </div>
          </div>
          
          {/* Analysis Map Component */}
          <CompanyAnalysisMap
            companyName={activeCompany?.company || legacyCompany?.name || 'Unknown Company'}
            locations={companyLocations}
            className="max-w-6xl mx-auto"
          />
        </div>
      </main>
    </div>
  )
}