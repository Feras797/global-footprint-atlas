import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Share2, Satellite, MapPin, Building2 } from 'lucide-react'

import { getCompanyById, Company } from '@/lib/companies'
import { CompanyAnalysisMap } from '@/components/gee/CompanyAnalysisMap'

export default function CompanyPage() {
  const params = useParams()
  const companyId = params.companyId || ''
  
  // Load company using unified system
  const company = useMemo(() => getCompanyById(companyId), [companyId])
  const navigate = useNavigate()

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
                <h2 className="text-2xl font-bold">Satellite Environmental Analysis</h2>
                <p className="text-muted-foreground mt-1">
                  Real-time analysis of {company.name}'s operational areas and environmentally similar regions
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
            companyName={company.name}
            locations={companyLocations}
            className="max-w-6xl mx-auto"
          />
        </div>
      </main>
    </div>
  )
}