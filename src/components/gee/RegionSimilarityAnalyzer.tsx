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
  const [batchAnalysisData, setBatchAnalysisData] = useState<any>(null)
  const [isIndustrialAnalysisInProgress, setIsIndustrialAnalysisInProgress] = useState(false)
  const [isSimilaritySearchEnabled, setIsSimilaritySearchEnabled] = useState(true)

  // Check if we have region coordinates for similarity search
  const isSimilaritySearchReady = region.rectangleCoordinates && region.rectangleCoordinates.length === 4
  
  // Check if we can perform industrial analysis (need 1 red + 3 greens)
  const isIndustrialAnalysisReady = greenAreas.length === 3 && redAreas.length === 1

  // Initialize Google Maps (aligned with CompanyAnalysisMap approach)
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      if (!mapRef.current) return

      try {
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['geometry']  // Match CompanyAnalysisMap libraries
        })

        await loader.load()
        
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: region.coordinates.lat, lng: region.coordinates.lng },
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false
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
            fillColor: '#ef4444',
            fillOpacity: 0.35,
            strokeColor: '#dc2626',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            clickable: true,
            map: map
          })

          // Fit map to show the region
          map.fitBounds(rectangle.getBounds()!)
        }

        console.log('🗺️ Google Maps initialized successfully for custom region')

      } catch (error) {
        console.error('❌ Failed to initialize Google Maps:', error)
        setError('Failed to load Google Maps. Please try again.')
      }
    }

    initializeGoogleMaps()
  }, [region])

  const findSimilarRegions = async () => {
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

      // Draw green areas on map (aligned with CompanyAnalysisMap style)
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
            fillColor: '#22c55e',
            fillOpacity: 0.3,
            strokeColor: '#16a34a',
            strokeOpacity: 0.8,
            strokeWeight: 3,
            clickable: true,
            map: mapInstance.current
          })

          // Add click handler (no info windows to match company style)
          rectangle.addListener('click', () => {
            console.log(`🟢 Clicked similar area: Position ${area.position} (Rank ${area.rank}), similarity: ${(area.similarity * 100).toFixed(1)}%`)
            console.log('📊 Environmental features:', area.features)
          })

          // Add hover effects to match CompanyAnalysisMap
          rectangle.addListener('mouseover', () => {
            rectangle.setOptions({ fillOpacity: 0.5, strokeWeight: 4 })
          })

          rectangle.addListener('mouseout', () => {
            rectangle.setOptions({ fillOpacity: 0.3, strokeWeight: 3 })
          })
        })
      }

      setAnalysisProgress(100)
      setStatusMessage('Similar regions found! Ready for environmental analysis.')
      // Don't set analysisCompleted yet - that's only after industrial analysis
      
      console.log(`✅ Similar regions found: ${similarAreas.length} areas ready for analysis`)
      
      // DON'T trigger final callbacks yet - only after industrial analysis

    } catch (error) {
      console.error('Analysis failed:', error)
      setError(error instanceof Error ? error.message : 'Analysis failed')
      setStatusMessage('Analysis failed')
    } finally {
      setIsAnalysisInProgress(false)
    }
  }

  // NEW: Industrial analysis function matching CompanyAnalysisMap exactly
  const performIndustrialAnalysis = async () => {
    if (greenAreas.length !== 3 || redAreas.length !== 1) {
      setError('Need exactly 1 red area and 3 green areas for analysis')
      return
    }

    console.log('🔬 Performing industrial analysis for custom region...')
    console.log('📊 Analysis data:', {
      redAreas: 1,
      greenAreas: greenAreas.length,
      totalAreas: 4
    })

    try {
      setIsIndustrialAnalysisInProgress(true)
      console.log('📡 Calling real industrial analysis API...')

      const redArea = redAreas[0]
      
      // Transform coordinates to match API format: [minLon, minLat, maxLon, maxLat]
      const rectangles = []
      const rectangle_names = []
      
      // Add red area (custom region)
      const [tlx, tly, brx, bry] = redArea.coordinates
      const minLon = Math.min(tlx, brx)
      const maxLon = Math.max(tlx, brx)
      const minLat = Math.min(tly, bry)
      const maxLat = Math.max(tly, bry)
      
      rectangles.push([minLon, minLat, maxLon, maxLat])
      rectangle_names.push(redArea.name)
      
      // Add the 3 green areas (similar areas)
      greenAreas.forEach((green, index) => {
        const [minLng, minLat, maxLng, maxLat] = green.bbox
        rectangles.push([minLng, minLat, maxLng, maxLat])
        rectangle_names.push(`Similar_Area_${index + 1}`)
      })
      
      console.log('📊 Industrial analysis request:', {
        rectangles,
        rectangle_names
      })
      
      const requestPayload = {
        rectangles,
        rectangle_names,
        start_date: "2022-01-01",
        end_date: "2023-12-31",
        temporal_resolution: "quarterly",
        thresholds: {
          vegetation_loss: -0.2,
          dust_level: 0.15,
          thermal_anomaly: 50,
          soil_exposure: 0.3,
          night_light_increase: 0.5
        }
      }
      
      const response = await fetch('https://weather-370308594166.europe-west1.run.app/analysis/industrial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      })
      
      if (!response.ok) {
        throw new Error(`Industrial analysis API failed: ${response.status} ${response.statusText}`)
      }
      
      const batchResult = await response.json()
      console.log('✅ Industrial analysis completed:', batchResult)
      
      // Create the analysis data structure matching company format
      const combinedAnalysisData = {
        status: "success",
        timestamp: new Date().toISOString(),
        total_requests: 1,
        batch_results: [batchResult],
        combined_summary: {
          total_areas_analyzed: batchResult.summary?.areas_analyzed || 4,
          total_periods: batchResult.summary?.total_periods_analyzed || 8,
          total_anomalies: batchResult.anomaly_summary?.total_anomalies || 0,
          total_requests: 1
        }
      }
      
      // Store the analysis data
      setBatchAnalysisData(combinedAnalysisData)
      setAnalysisCompleted(true)
      
      // NOW trigger the final callbacks with proper format
      const redAreasData = [{
        name: redArea.name,
        coordinates: redArea.coordinates,
        location: redArea.location,
        environmentalData: batchResult // Include the analysis results
      }]
      
      const greenAreasData = greenAreas.map((area, index) => ({
        name: `Area ${area.position}`,
        coordinates: area.bbox,
        location: 'Environmentally Similar Region',
        similarity: area.similarity,
        rank: area.rank,
        environmentalData: area.features
      }))

      onAnalysisComplete?.(redAreasData, greenAreasData)
      onAnalysisPerformed?.(combinedAnalysisData)
      
      console.log('🎉 Custom region analysis completed successfully!')
      
    } catch (error) {
      console.error('❌ Industrial analysis failed:', error)
      setError(error instanceof Error ? error.message : 'Industrial analysis failed')
    } finally {
      setIsIndustrialAnalysisInProgress(false)
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

        {/* Step 1: Find Similar Regions */}
        <div className="flex justify-center">
          <Button
            onClick={findSimilarRegions}
            disabled={!isSimilaritySearchReady || isAnalysisInProgress || greenAreas.length === 3}
            size="lg"
            className="min-w-[200px]"
          >
            {isAnalysisInProgress ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Finding Similar Regions...
              </>
            ) : greenAreas.length === 3 ? (
              <>✓ Similar Regions Found</>
            ) : isSimilaritySearchReady ? (
              <>Find Similar Regions</>
            ) : (
              <>Region coordinates required</>
            )}
          </Button>
        </div>

        {/* Step 2: Perform Industrial Analysis (only show after green areas found) */}
        {greenAreas.length === 3 && (
          <div className="flex justify-center">
            <Button
              onClick={performIndustrialAnalysis}
              disabled={!isIndustrialAnalysisReady || isIndustrialAnalysisInProgress}
              size="lg"
              className="min-w-[200px]"
              variant={analysisCompleted ? "outline" : "default"}
            >
              {isIndustrialAnalysisInProgress ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Performing Environmental Analysis...
                </>
              ) : analysisCompleted ? (
                <>✓ Analysis Complete</>
              ) : (
                <>Perform Environmental Analysis</>
              )}
            </Button>
          </div>
        )}

        {/* Progress Summary */}
        {greenAreas.length > 0 && (
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Analysis Progress</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">✓ Custom region defined</span>
                <Badge variant="outline" className="text-xs">Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">✓ Similar regions found</span>
                <Badge variant="outline" className="text-xs">{greenAreas.length} areas</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {analysisCompleted ? '✓' : '⏳'} Environmental analysis
                </span>
                <Badge variant={analysisCompleted ? "outline" : "secondary"} className="text-xs">
                  {analysisCompleted ? 'Complete' : 'Pending'}
                </Badge>
              </div>
            </div>
            
            {analysisCompleted && batchAnalysisData && (
              <div className="mt-4 pt-3 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Areas Analyzed:</span>
                    <div className="font-medium">{batchAnalysisData.combined_summary?.total_areas_analyzed || 4}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Anomalies Found:</span>
                    <div className="font-medium">{batchAnalysisData.combined_summary?.total_anomalies || 0}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-muted-foreground text-sm">
                    Best Match: {greenAreas[0] ? `${(greenAreas[0].similarity * 100).toFixed(1)}% similarity` : 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}