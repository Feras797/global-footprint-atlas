import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Home, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { 
  CesiumGlobeProps, 
  GlobeEntity
} from '@/types/globe'
import { 
  convertCompaniesToGlobeEntities,
  getIndustryColor,
  getPlantSizeScale,
  getUniqueIndustries,
  getIndustryStats
} from '@/lib/globe-utils'

export function SimpleMapLibreGlobe ({
  companies,
  onEntitySelect,
  showControls = true,
  className = ''
}: CesiumGlobeProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<GlobeEntity | null>(null)
  const entities = useRef<GlobeEntity[]>([])
  const markersRef = useRef<maplibregl.Marker[]>([])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    try {
      console.log('Initializing Simple MapLibre Map...')
      
      // Create a simple map with OpenStreetMap tiles
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: [
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm-tiles-layer',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: [0, 20],
        zoom: 2,
        attributionControl: false
      })

      // Add attribution control
      map.addControl(new maplibregl.AttributionControl({
        compact: true
      }), 'bottom-right')

      // Add navigation control
      map.addControl(new maplibregl.NavigationControl(), 'top-right')

      mapRef.current = map

      // Handle load event
      map.on('load', () => {
        console.log('Map loaded successfully')
        setIsLoading(false)
        setError(null)
      })

      // Handle errors
      map.on('error', (e) => {
        console.error('Map error:', e)
        // Don't set error for tile loading issues
        if (!e.error?.status || e.error.status !== 404) {
          setError('Map loading issue detected, but continuing...')
        }
      })

      // Set loading to false after a timeout even if load event doesn't fire
      setTimeout(() => {
        setIsLoading(false)
      }, 3000)

    } catch (err) {
      console.error('Failed to initialize map:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize map')
      setIsLoading(false)
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        markersRef.current.forEach(marker => marker.remove())
        markersRef.current = []
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Add markers
  useEffect(() => {
    if (!mapRef.current || !companies.length) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Convert companies to entities
    entities.current = convertCompaniesToGlobeEntities(companies)

    // Create simple markers
    entities.current.forEach((entity) => {
      const color = getIndustryColor(entity.industry)
      const scale = getPlantSizeScale(entity.numberOfPlants)
      const size = 12 + (scale * 6)

      // Create marker element
      const el = document.createElement('div')
      el.style.width = `${size}px`
      el.style.height = `${size}px`
      el.style.backgroundColor = color
      el.style.border = '2px solid white'
      el.style.borderRadius = '50%'
      el.style.cursor = 'pointer'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'

      // Add click handler
      el.addEventListener('click', () => {
        setSelectedEntity(entity)
        onEntitySelect?.(entity)
      })

      // Create marker
      const marker = new maplibregl.Marker({
        element: el
      })
        .setLngLat([entity.longitude, entity.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 8px;">
                <strong>${entity.name}</strong><br/>
                ${entity.company}<br/>
                ${entity.location}
              </div>
            `)
        )
        .addTo(mapRef.current!)

      markersRef.current.push(marker)
    })

    // Fit bounds
    if (entities.current.length > 0) {
      const bounds = new maplibregl.LngLatBounds()
      entities.current.forEach(entity => {
        bounds.extend([entity.longitude, entity.latitude])
      })
      
      mapRef.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 10
      })
    }
  }, [companies, onEntitySelect])

  // Control functions
  const zoomIn = () => mapRef.current?.zoomIn()
  const zoomOut = () => mapRef.current?.zoomOut()
  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [0, 20],
        zoom: 2
      })
    }
  }

  if (error && isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Loading Map...</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 z-10 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading Map...</p>
          </div>
        </div>
      )}

      {showControls && !isLoading && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <Button size="sm" variant="secondary" onClick={resetView}>
            <Home className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!isLoading && entities.current.length > 0 && (
        <div className="absolute top-4 left-4 z-20">
          <Badge variant="secondary">
            {entities.current.length} facilities
          </Badge>
        </div>
      )}

      {selectedEntity && (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm">
          <Card className="p-3 bg-background/95 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm">{selectedEntity.name}</h4>
              <button 
                onClick={() => setSelectedEntity(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <div className="text-xs space-y-1">
              <p>{selectedEntity.company}</p>
              <p className="text-muted-foreground">{selectedEntity.location}</p>
              <Badge variant="secondary" className="text-xs">
                {selectedEntity.industry}
              </Badge>
            </div>
          </Card>
        </div>
      )}

      <div 
        ref={mapContainer}
        className="w-full h-full min-h-[400px] rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
    </div>
  )
}
