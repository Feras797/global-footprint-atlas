import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Home, ZoomIn, ZoomOut, RotateCcw, Maximize2, Navigation } from 'lucide-react'
import { 
  CesiumGlobeProps, 
  GlobeEntity,
  CompanyData 
} from '@/types/globe'
import { 
  convertCompaniesToGlobeEntities,
  calculateOptimalView,
  getIndustryColor,
  getMarketCapColor,
  getPlantSizeScale,
  getUniqueIndustries,
  getIndustryStats
} from '@/lib/globe-utils'

interface MapLibre3DGlobeProps extends CesiumGlobeProps {
  enableTerrain?: boolean
  enableAtmosphere?: boolean
}

export function MapLibre3DGlobe ({
  companies,
  onEntitySelect,
  defaultView,
  showControls = true,
  className = '',
  enableTerrain = false,
  enableAtmosphere = true
}: MapLibre3DGlobeProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<GlobeEntity | null>(null)
  const [isGlobeView, setIsGlobeView] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const entities = useRef<GlobeEntity[]>([])
  const markersRef = useRef<maplibregl.Marker[]>([])
  const popupRef = useRef<maplibregl.Popup | null>(null)

  // Retry handler
  const handleRetry = useCallback(() => {
    setError(null)
    setIsLoading(true)
    setRetryCount(prev => prev + 1)
  }, [])

  // Initialize the 3D globe
  useEffect(() => {
    if (!mapContainer.current) return

    const initializeGlobe = async () => {
      try {
        console.log('Initializing MapLibre Globe...')
        
        // Create the map with a simple style first
        const map = new maplibregl.Map({
          container: mapContainer.current,
          style: 'https://demotiles.maplibre.org/style.json', // Use demo tiles for simplicity
          center: defaultView ? [defaultView.longitude, defaultView.latitude] : [0, 20],
          zoom: defaultView ? Math.log2(7500000 / defaultView.height) + 9 : 2,
          pitch: 0,
          bearing: 0,
          antialias: true
        })

        mapRef.current = map

        // Wait for the map to load
        map.on('load', () => {
          console.log('MapLibre map loaded successfully')
          
          // Enable the 3D globe projection
          try {
            map.setProjection({
              type: 'globe'
            })
            console.log('Globe projection set successfully')
          } catch (projectionError) {
            console.error('Failed to set globe projection:', projectionError)
            // Continue without globe projection
          }

          // Add atmosphere effects if supported
          if (enableAtmosphere) {
            try {
              map.setFog({
                'color': 'rgb(186, 210, 235)',
                'high-color': 'rgb(36, 92, 223)',
                'horizon-blend': 0.02,
                'space-color': 'rgb(11, 11, 25)',
                'star-intensity': 0.6
              })
              console.log('Atmosphere effects added')
            } catch (fogError) {
              console.warn('Failed to set fog/atmosphere effects:', fogError)
            }
          }

          setIsLoading(false)
          setError(null)
        })

        // Handle map errors
        map.on('error', (e) => {
          console.error('MapLibre map error:', e)
          if (e.error && e.error.message) {
            setError(`Map error: ${e.error.message}`)
          } else {
            setError('Failed to load the map. Please check your internet connection.')
          }
          setIsLoading(false)
        })

      } catch (err) {
        console.error('Failed to initialize MapLibre Globe:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize 3D globe')
        setIsLoading(false)
      }
    }

    initializeGlobe()

    // Cleanup
    return () => {
      if (mapRef.current) {
        // Clean up markers
        markersRef.current.forEach(marker => marker.remove())
        markersRef.current = []
        
        // Clean up popup
        if (popupRef.current) {
          popupRef.current.remove()
          popupRef.current = null
        }
        
        // Destroy map
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [defaultView, enableAtmosphere, retryCount])

  // Add company markers when data changes
  useEffect(() => {
    if (!mapRef.current || !companies.length || isLoading) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Convert companies to globe entities
    entities.current = convertCompaniesToGlobeEntities(companies)

    // Create markers for each entity
    entities.current.forEach((entity) => {
      const industryColor = getIndustryColor(entity.industry)
      const scale = getPlantSizeScale(entity.numberOfPlants)
      const size = 20 + (scale * 10)

      // Create custom marker element
      const el = document.createElement('div')
      el.className = 'globe-marker'
      el.style.width = `${size}px`
      el.style.height = `${size}px`
      el.style.cursor = 'pointer'
      el.style.background = industryColor
      el.style.borderRadius = '50%'
      el.style.border = '2px solid white'
      el.style.boxShadow = `0 2px 8px rgba(0,0,0,0.3)`
      el.style.transition = 'transform 0.2s ease'
      
      // Add hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)'
        el.style.zIndex = '999'
      })
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
        el.style.zIndex = '1'
      })

      // Create the marker
      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([entity.longitude, entity.latitude])
        .addTo(mapRef.current!)

      // Add click handler
      el.addEventListener('click', () => {
        setSelectedEntity(entity)
        onEntitySelect?.(entity)

        // Show popup
        if (popupRef.current) {
          popupRef.current.remove()
        }

        const popup = new maplibregl.Popup({
          closeButton: true,
          closeOnClick: false,
          offset: [0, -size/2 - 10]
        })
          .setLngLat([entity.longitude, entity.latitude])
          .setHTML(`
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 5px 0; font-weight: 600;">${entity.name}</h3>
              <p style="margin: 0; color: #666; font-size: 14px;">
                ${entity.company}<br/>
                ${entity.industry}<br/>
                ${entity.location}
              </p>
            </div>
          `)
          .addTo(mapRef.current!)

        popupRef.current = popup
      })

      markersRef.current.push(marker)
    })

    // Fit to bounds if we have entities
    if (entities.current.length > 0 && mapRef.current) {
      const bounds = new maplibregl.LngLatBounds()
      entities.current.forEach(entity => {
        bounds.extend([entity.longitude, entity.latitude])
      })
      
      mapRef.current.fitBounds(bounds, {
        padding: 100,
        duration: 1000
      })
    }
  }, [companies, isLoading, onEntitySelect])

  // Control functions
  const zoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn({ duration: 300 })
    }
  }, [])

  const zoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut({ duration: 300 })
    }
  }, [])

  const resetView = useCallback(() => {
    if (mapRef.current && entities.current.length > 0) {
      const bounds = new maplibregl.LngLatBounds()
      entities.current.forEach(entity => {
        bounds.extend([entity.longitude, entity.latitude])
      })
      
      mapRef.current.fitBounds(bounds, {
        padding: 100,
        duration: 1000
      })
    }
  }, [])

  const goHome = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [0, 20],
        zoom: 2,
        pitch: 0,
        bearing: 0,
        duration: 2000
      })
    }
  }, [])

  const toggleProjection = useCallback(() => {
    if (mapRef.current) {
      setIsGlobeView(prev => {
        const newProjection = !prev
        try {
          mapRef.current?.setProjection({
            type: newProjection ? 'globe' : 'mercator'
          })
        } catch (e) {
          console.warn('Failed to toggle projection:', e)
        }
        return newProjection
      })
    }
  }, [])

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Globe Loading Error</h3>
            <p className="text-muted-foreground mb-2">{error}</p>
            <p className="text-sm text-muted-foreground mb-4">
              Try refreshing the page or check your internet connection
            </p>
            <Button 
              onClick={handleRetry} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading 3D Globe...</p>
          </div>
        </div>
      )}

      {/* Control panel */}
      {showControls && !isLoading && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={goHome} 
            title="Go to world view"
          >
            <Home className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={zoomIn} 
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={zoomOut} 
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={resetView} 
            title="Reset to optimal view"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={toggleProjection} 
            title={isGlobeView ? "Switch to flat map" : "Switch to 3D globe"}
          >
            {isGlobeView ? <Maximize2 className="h-4 w-4" /> : <Navigation className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Info panel */}
      {selectedEntity && (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm">
          <Card className="p-4 bg-background/95 backdrop-blur-sm border-l-4" 
                style={{ borderLeftColor: getIndustryColor(selectedEntity.industry) }}>
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-base">{selectedEntity.name}</h4>
              <button 
                onClick={() => {
                  setSelectedEntity(null)
                  if (popupRef.current) {
                    popupRef.current.remove()
                    popupRef.current = null
                  }
                }}
                className="text-muted-foreground hover:text-foreground text-lg leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {selectedEntity.industry}
                </Badge>
              </div>
              
              <div className="text-sm">
                <p className="font-medium text-foreground">{selectedEntity.company}</p>
                <p className="text-muted-foreground text-xs">{selectedEntity.location}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Market Cap:</span>
                  <p className="font-medium">{selectedEntity.marketCap}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Plants:</span>
                  <p className="font-medium">{selectedEntity.numberOfPlants}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Stats panel */}
      {!isLoading && entities.current.length > 0 && (
        <div className="absolute top-4 left-4 z-20 space-y-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {entities.current.length} facilities
          </Badge>
          
          {/* Legend */}
          <Card className="p-2 bg-background/90 backdrop-blur-sm max-w-48">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-xs">Industries</h4>
              <Badge variant="outline" className="text-xs px-1 py-0">
                {getUniqueIndustries(entities.current).length}
              </Badge>
            </div>
            <div className="space-y-0.5">
              {getUniqueIndustries(entities.current).slice(0, 5).map((industry) => {
                const industryColor = getIndustryColor(industry)
                const stats = getIndustryStats(entities.current)[industry]
                return (
                  <div key={industry} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: industryColor }}
                      />
                      <span className="truncate max-w-[100px]">{industry}</span>
                    </div>
                    <span className="text-muted-foreground">{stats.count}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      {/* MapLibre container */}
      <div 
        ref={mapContainer}
        className="w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-slate-900"
        style={{ minHeight: '600px' }}
      />
    </div>
  )
}