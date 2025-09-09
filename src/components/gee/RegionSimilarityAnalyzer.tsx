import React, { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, Loader2, MapPin } from 'lucide-react'

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyDxCaV_ArUKahmWNSsO2OVni3dUoPSqfPI'

// Real similarity analysis API
const SIMILARITY_API_BASE = 'https://similar1-370308594166.europe-west1.run.app/similarity/top3'

interface RegionData {
  id: string
  name: string
  coordinates: {
    lat: number
    lng: number
  }
  rectangleCoordinates?: [number, number, number, number] // [lng_top_left, lat_top_left, lng_bottom_right, lat_bottom_right]
  area: number
  type: 'urban' | 'forest' | 'agricultural' | 'industrial' | 'coastal'
  description: string
}

interface RegionAnalysisProps {
  region: RegionData
  className?: string
  onAnalysisComplete?: (redAreas: any[], greenAreas: any[]) => void
  onAnalysisPerformed?: (batchAnalysisData?: any) => void
}

interface SimilarArea {
  bbox: [number, number, number, number] // [minLng, minLat, maxLng, maxLat] 
  similarity: number
  rank: number
  index: number
  position: string
  belongsToRedBox: number
  features: {
    ndvi_mean: number
    ndvi_std: number
    elevation_mean: number
    elevation_std: number
    slope_mean: number
    slope_std: number
    ndwi_mean: number
    ndbi_mean: number
    landcover_diversity: number
  }
}

// Real API response structure
interface RealApiResponse {
  status: string
  timestamp: string
  config: {
    reference_bbox: [number, number, number, number]
    start_date: string
    end_date: string
    search_radius_km: number
    sampling_resolution_m: number
    max_candidates: number
    similarity_threshold: number
    weights: {
      ndvi: number
      elevation: number
      slope: number
      landcover: number
    }
  }
  reference: {
    bbox: [number, number, number, number]
  }
  candidates_generated: number
  top_matches: {
    rank: number
    index: number
    position: string
    similarity: number
    bbox: [number, number, number, number]
    features: {
      ndvi_mean: number
      ndvi_std: number
      elevation_mean: number
      elevation_std: number
      slope_mean: number
      slope_std: number
      ndwi_mean: number
      ndbi_mean: number
      landcover_diversity: number
    }
  }[]
}

/**
 * Transform coordinates from [tlx, tly, brx, bry] to API format and build URL
 */
const buildSimilarityApiUrl = (coordinates: [number, number, number, number]): string => {
  const [tlx, tly, brx, bry] = coordinates
  
  // Convert to minLng, minLat, maxLng, maxLat format
  const minLng = Math.min(tlx, brx)
  const maxLng = Math.max(tlx, brx)
  const minLat = Math.min(tly, bry)
  const maxLat = Math.max(tly, bry)
  
  const params = new URLSearchParams({
    reference_bbox: `${minLng},${minLat},${maxLng},${maxLat}`,
    start_date: '2022-01-01',
    end_date: '2023-12-31',
    search_radius_km: '400',
    sampling_resolution_m: '25000',
    max_candidates: '20',
    similarity_threshold: '0.5',
    'weights.ndvi': '0.4',
    'weights.elevation': '0.2',
    'weights.slope': '0.2',
    'weights.landcover': '0.2'
  })
  
  return `${SIMILARITY_API_BASE}?${params.toString()}`
}

/**
 * Parse real API response and convert to internal SimilarArea format
 */
const parseRealApiResponse = (apiResponse: RealApiResponse, redBoxIndex: number): SimilarArea[] => {
  return apiResponse.top_matches.map(match => {
    console.log(`🔄 Converting Rank ${match.rank} for Region:`, {
      position: match.position,
      bbox: match.bbox,
      similarity: match.similarity,
      features: match.features
    })
    
    return {
      bbox: match.bbox,
      similarity: match.similarity,
      rank: match.rank,
      index: match.index,
      position: match.position,
      belongsToRedBox: redBoxIndex,
      features: match.features
    }
  })
}

export const RegionSimilarityAnalyzer: React.FC<RegionAnalysisProps> = ({
  region,
  className = '',
  onAnalysisComplete,
  onAnalysisPerformed
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAnalysisInProgress, setIsAnalysisInProgress] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const [greenAreas, setGreenAreas] = useState<SimilarArea[]>([])
  const [redAreas, setRedAreas] = useState<any[]>([])
  const [analysisCompleted, setAnalysisCompleted] = useState(false)

  // Check if we have region coordinates for analysis
  const isAnalysisEnabled = region.rectangleCoordinates && region.rectangleCoordinates.length === 4

  // Initialize Google Maps
  useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'drawing']
    })

    loader
      .load()
      .then(() => {
        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: region.coordinates.lat, lng: region.coordinates.lng },
            zoom: 8,
            mapTypeId: 'satellite'
          })

          mapInstance.current = map
          setIsMapLoaded(true)

          // Draw the region if coordinates are available
          if (region.rectangleCoordinates) {
            const [tlx, tly, brx, bry] = region.rectangleCoordinates
            
            const rectangle = new google.maps.Rectangle({
              bounds: {
                north: Math.max(tly, bry),
                south: Math.min(tly, bry),
                east: Math.max(tlx, brx),
                west: Math.min(tlx, brx)
              },
              fillColor: '#FF0000',
              fillOpacity: 0.35,
              strokeColor: '#FF0000',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              map: map
            })

            // Fit map to show the region
            map.fitBounds(rectangle.getBounds()!)
          }
        }
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error)
        setError('Failed to load map. Please try again.')
      })
  }, [region])

  const performSimilarityAnalysis = async () => {
    if (!region.rectangleCoordinates || !isMapLoaded) {
      setError('Region coordinates not available or map not loaded')
      return
    }

    setIsAnalysisInProgress(true)
    setAnalysisProgress(0)
    setStatusMessage('Initializing analysis...')
    setError(null)

    try {
      // Prepare red area data
      const redArea = {
        name: region.name,
        coordinates: region.rectangleCoordinates,
        location: region.description || region.name
      }
      setRedAreas([redArea])
      setAnalysisProgress(20)
      setStatusMessage('Finding similar regions...')

      // Call similarity API
      const apiUrl = buildSimilarityApiUrl(region.rectangleCoordinates)
      console.log('🚀 Calling Similarity API:', apiUrl)
      
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const apiData: RealApiResponse = await response.json()
      console.log('✅ API Response received:', apiData)

      setAnalysisProgress(60)
      setStatusMessage('Processing similar regions...')

      // Parse and store green areas
      const similarAreas = parseRealApiResponse(apiData, 0)
      setGreenAreas(similarAreas)

      setAnalysisProgress(80)
      setStatusMessage('Updating map visualization...')

      // Draw green areas on map
      if (mapInstance.current) {
        similarAreas.forEach((area, index) => {
          const [minLng, minLat, maxLng, maxLat] = area.bbox
          
          const rectangle = new google.maps.Rectangle({
            bounds: {
              north: maxLat,
              south: minLat,
              east: maxLng,
              west: minLng
            },
            fillColor: '#00FF00',
            fillOpacity: 0.25,
            strokeColor: '#00FF00',
            strokeOpacity: 0.8,
            strokeWeight: 1,
            map: mapInstance.current
          })

          // Add info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h4 class="font-semibold">Similar Region ${area.rank}</h4>
                <p class="text-sm">Similarity: ${(area.similarity * 100).toFixed(1)}%</p>
                <p class="text-sm">NDVI: ${area.features.ndvi_mean.toFixed(2)}</p>
                <p class="text-sm">Elevation: ${area.features.elevation_mean.toFixed(0)}m</p>
              </div>
            `
          })

          rectangle.addListener('click', () => {
            infoWindow.setPosition({
              lat: (minLat + maxLat) / 2,
              lng: (minLng + maxLng) / 2
            })
            infoWindow.open(mapInstance.current)
          })
        })
      }

      setAnalysisProgress(100)
      setStatusMessage('Analysis completed successfully!')
      setAnalysisCompleted(true)

      // Trigger callbacks
      onAnalysisComplete?.([redArea], similarAreas)
      onAnalysisPerformed?.({
        redAreas: [redArea],
        greenAreas: similarAreas,
        apiResponse: apiData
      })

    } catch (error) {
      console.error('Analysis failed:', error)
      setError(error instanceof Error ? error.message : 'Analysis failed')
      setStatusMessage('Analysis failed')
    } finally {
      setIsAnalysisInProgress(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Analysis Status */}
      {error && (
        <Alert className="border-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Region Info Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{region.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{region.coordinates.lat.toFixed(4)}, {region.coordinates.lng.toFixed(4)}</span>
              {region.area > 0 && (
                <>
                  <span>•</span>
                  <span>{region.area.toLocaleString()} km²</span>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{region.description}</p>
          </div>
          
          <div className="text-right">
            <Badge variant="outline" className="mb-2">
              {region.type.charAt(0).toUpperCase() + region.type.slice(1)}
            </Badge>
            {analysisCompleted && (
              <div className="text-sm text-green-600 font-medium">
                ✓ Analysis Complete
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Map Container */}
      <Card className="overflow-hidden">
        <div className="relative">
          <div ref={mapRef} className="w-full h-96" />
          
          {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading map...</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Analysis Controls */}
      <div className="flex flex-col space-y-4">
        {/* Analysis Progress */}
        {isAnalysisInProgress && (
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Analysis Progress</span>
                <span className="text-sm text-muted-foreground">{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="w-full" />
              {statusMessage && (
                <p className="text-sm text-muted-foreground">{statusMessage}</p>
              )}
            </div>
          </Card>
        )}

        {/* Analysis Button */}
        <div className="flex justify-center">
          <Button
            onClick={performSimilarityAnalysis}
            disabled={!isAnalysisEnabled || isAnalysisInProgress}
            size="lg"
            className="min-w-[200px]"
          >
            {isAnalysisInProgress ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Region...
              </>
            ) : isAnalysisEnabled ? (
              <>Perform Analysis</>
            ) : (
              <>Region coordinates required</>
            )}
          </Button>
        </div>

        {/* Results Summary */}
        {analysisCompleted && (
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Analysis Results</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Region Analyzed:</span>
                <div className="font-medium">1 area ({region.area.toLocaleString()} km²)</div>
              </div>
              <div>
                <span className="text-muted-foreground">Similar Regions Found:</span>
                <div className="font-medium">{greenAreas.length} areas</div>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-muted-foreground text-sm">
                Best Match: {greenAreas[0] ? `${(greenAreas[0].similarity * 100).toFixed(1)}% similarity` : 'N/A'}
              </span>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}