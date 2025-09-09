import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface SelectedRegion {
  center: {
    lat: number
    lng: number
  }
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  rectangleCoordinates: [number, number, number, number] // [lng_top_left, lat_top_left, lng_bottom_right, lat_bottom_right]
  area: number // in square kilometers
}

interface MapLibreRegionSelectorProps {
  initialCenter?: [number, number]
  initialZoom?: number
  height?: string
  onRegionSelect?: (region: SelectedRegion) => void
}

type MapMode = 'navigate' | 'select'

export function MapLibreRegionSelector({
  initialCenter = [0, 20],
  initialZoom = 2,
  height = '400px',
  onRegionSelect
}: MapLibreRegionSelectorProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [mapMode, setMapMode] = useState<MapMode>('navigate')
  const [mapLoaded, setMapLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  // Drawing state refs - using refs to avoid stale closures
  const drawingStateRef = useRef({
    isDrawing: false,
    startPoint: null as [number, number] | null
  })

  // Calculate area from bounds in square kilometers
  const calculateArea = useCallback((bounds: { north: number; south: number; east: number; west: number }) => {
    const R = 6371 // Earth's radius in kilometers
    const deltaLat = (bounds.north - bounds.south) * Math.PI / 180
    const deltaLng = (bounds.east - bounds.west) * Math.PI / 180
    
    // Approximate area calculation
    const avgLat = (bounds.north + bounds.south) / 2
    const width = R * deltaLng * Math.cos(avgLat * Math.PI / 180)
    const height = R * deltaLat
    
    return Math.abs(width * height)
  }, [])

  // Handle mode toggle
  const handleModeToggle = useCallback((mode: MapMode) => {
    setMapMode(mode)
    
    if (!mapRef.current) return
    
    const canvas = mapRef.current.getCanvas()
    
    if (mode === 'select') {
      // Enable selection mode
      mapRef.current.dragPan.disable()
      mapRef.current.doubleClickZoom.disable()
      canvas.style.cursor = 'crosshair'
    } else {
      // Enable navigation mode
      mapRef.current.dragPan.enable()
      mapRef.current.doubleClickZoom.enable()
      canvas.style.cursor = ''
      
      // Clear any existing selection drawing
      if (drawingStateRef.current.isDrawing) {
        drawingStateRef.current.isDrawing = false
        drawingStateRef.current.startPoint = null
        setIsDrawing(false)
        
        const source = mapRef.current.getSource('selection-box') as maplibregl.GeoJSONSource
        if (source) {
          source.setData({
            type: 'FeatureCollection',
            features: []
          })
        }
      }
    }
  }, [])

  // Handle location search using Nominatim API
  const handleLocationSearch = useCallback(async () => {
    if (!searchQuery.trim() || !mapRef.current) return
    
    setIsSearching(true)
    
    try {
      // Query Nominatim API (OpenStreetMap's geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`
      )
      
      if (!response.ok) throw new Error('Search failed')
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)
        
        // Check if result has a bounding box
        if (result.boundingbox) {
          const [south, north, west, east] = result.boundingbox.map(parseFloat)
          
          // Fit to bounding box if available
          mapRef.current.fitBounds(
            [[west, south], [east, north]],
            { 
              padding: 50,
              duration: 1500
            }
          )
        } else {
          // Otherwise, fly to the coordinates
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 14,
            duration: 1500
          })
        }
        
        // Clear search after successful navigation
        setSearchQuery('')
      } else {
        // No results found
        alert('Location not found. Please try a different search term.')
      }
    } catch (err) {
      console.error('Search error:', err)
      alert('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize map only once
  useEffect(() => {
    if (!isClient || !mapContainer.current || mapRef.current) return

    let map: maplibregl.Map | null = null

    try {
      // Initialize MapLibre GL JS map
      map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm-tiles',
              type: 'raster',
              source: 'osm'
            }
          ]
        },
        center: initialCenter,
        zoom: initialZoom,
        attributionControl: false
      })

      // Add attribution control in bottom right
      map.addControl(new maplibregl.AttributionControl(), 'bottom-right')

      // Add navigation controls
      map.addControl(new maplibregl.NavigationControl(), 'top-right')

      mapRef.current = map

      // Wait for map to be fully loaded
      map.on('load', () => {
        console.log('MapLibre map loaded successfully')
        
        // Add a source for the rectangle
        map.addSource('selection-box', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        })

        // Add fill layer for the rectangle
        map.addLayer({
          id: 'selection-fill',
          type: 'fill',
          source: 'selection-box',
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.25
          }
        })

        // Add outline layer for the rectangle
        map.addLayer({
          id: 'selection-outline',
          type: 'line',
          source: 'selection-box',
          paint: {
            'line-color': '#2563eb',
            'line-width': 2
          }
        })
        
        setMapLoaded(true)
      })

      map.on('error', (e) => {
        console.error('MapLibre error:', e)
        setError('Map failed to load. Please refresh the page.')
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize map')
      console.error('MapLibre initialization error:', err)
    }

    // Cleanup function
    return () => {
      if (map && !mapRef.current) { // Only cleanup if we're unmounting
        map.remove()
      }
    }
  }, [isClient, initialCenter, initialZoom])

  // Manage event listeners based on mode
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    const map = mapRef.current

    // Drawing functionality
    const startDrawing = (e: maplibregl.MapMouseEvent) => {
      if (mapMode !== 'select') return
      
      // Prevent default behavior
      e.preventDefault()
      
      // Start drawing
      drawingStateRef.current.isDrawing = true
      drawingStateRef.current.startPoint = [e.lngLat.lng, e.lngLat.lat]
      setIsDrawing(true)
    }

    const updateDrawing = (e: maplibregl.MapMouseEvent) => {
      if (!drawingStateRef.current.isDrawing || !drawingStateRef.current.startPoint || mapMode !== 'select') return
      
      const current: [number, number] = [e.lngLat.lng, e.lngLat.lat]
      const start = drawingStateRef.current.startPoint
      
      // Create rectangle coordinates
      const minLng = Math.min(start[0], current[0])
      const maxLng = Math.max(start[0], current[0])
      const minLat = Math.min(start[1], current[1])
      const maxLat = Math.max(start[1], current[1])
      
      const rectangleCoords = [
        [minLng, minLat],
        [minLng, maxLat],
        [maxLng, maxLat],
        [maxLng, minLat],
        [minLng, minLat]
      ]
      
      // Update the rectangle on the map
      const source = map.getSource('selection-box') as maplibregl.GeoJSONSource
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [rectangleCoords]
            },
            properties: {}
          }]
        })
      }
    }

    const finishDrawing = (e: maplibregl.MapMouseEvent) => {
      if (!drawingStateRef.current.isDrawing || !drawingStateRef.current.startPoint || mapMode !== 'select') return
      
      const end: [number, number] = [e.lngLat.lng, e.lngLat.lat]
      const start = drawingStateRef.current.startPoint
      
      // Reset drawing state
      drawingStateRef.current.isDrawing = false
      drawingStateRef.current.startPoint = null
      setIsDrawing(false)
      
      // Calculate bounds
      const minLng = Math.min(start[0], end[0])
      const maxLng = Math.max(start[0], end[0])
      const minLat = Math.min(start[1], end[1])
      const maxLat = Math.max(start[1], end[1])
      
      // Only process if the rectangle has some area
      if (Math.abs(maxLng - minLng) > 0.0001 && Math.abs(maxLat - minLat) > 0.0001) {
        const bounds = {
          north: maxLat,
          south: minLat,
          east: maxLng,
          west: minLng
        }
        
        const region: SelectedRegion = {
          center: {
            lat: (maxLat + minLat) / 2,
            lng: (maxLng + minLng) / 2
          },
          bounds,
          rectangleCoordinates: [minLng, maxLat, maxLng, minLat], // [lng_top_left, lat_top_left, lng_bottom_right, lat_bottom_right]
          area: calculateArea(bounds)
        }
        
        setSelectedRegion(region)
        
        if (onRegionSelect) {
          onRegionSelect(region)
        }
      } else {
        // Clear the selection if the rectangle is too small
        const source = map.getSource('selection-box') as maplibregl.GeoJSONSource
        if (source) {
          source.setData({
            type: 'FeatureCollection',
            features: []
          })
        }
      }
    }

    const cancelDrawing = () => {
      // Reset everything
      if (drawingStateRef.current.isDrawing) {
        drawingStateRef.current.isDrawing = false
        drawingStateRef.current.startPoint = null
        setIsDrawing(false)
        
        // Clear any partial rectangle
        const source = map.getSource('selection-box') as maplibregl.GeoJSONSource
        if (source) {
          source.setData({
            type: 'FeatureCollection',
            features: []
          })
        }
      }
    }

    // Only attach drawing listeners in select mode
    if (mapMode === 'select') {
      map.on('mousedown', startDrawing)
      map.on('mousemove', updateDrawing)
      map.on('mouseup', finishDrawing)
      map.on('mouseleave', cancelDrawing)
      
      // Handle touch events for mobile
      map.on('touchstart', startDrawing as any)
      map.on('touchmove', updateDrawing as any)
      map.on('touchend', finishDrawing as any)
    }

    // Cleanup function - remove listeners when mode changes or component unmounts
    return () => {
      map.off('mousedown', startDrawing)
      map.off('mousemove', updateDrawing)
      map.off('mouseup', finishDrawing)
      map.off('mouseleave', cancelDrawing)
      map.off('touchstart', startDrawing as any)
      map.off('touchmove', updateDrawing as any)
      map.off('touchend', finishDrawing as any)
    }
  }, [mapMode, mapLoaded, calculateArea, onRegionSelect])
  
  // Clear the current selection
  const handleClearSelection = useCallback(() => {
    if (mapRef.current) {
      const source = mapRef.current.getSource('selection-box') as maplibregl.GeoJSONSource
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: []
        })
      }
      setSelectedRegion(null)
      drawingStateRef.current.isDrawing = false
      drawingStateRef.current.startPoint = null
      setIsDrawing(false)
    }
  }, [])

  if (error) {
    return (
      <div 
        className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center p-4">
          <p className="text-red-600 dark:text-red-400 font-medium">Map Error</p>
          <p className="text-red-500 dark:text-red-300 text-sm mt-1">{error}</p>
          <button 
            onClick={() => {
              setError(null)
              window.location.reload()
            }}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  if (!isClient) {
    return (
      <div 
        className="bg-muted rounded-lg flex items-center justify-center border animate-pulse"
        style={{ height }}
      >
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-3">
      {/* Instructions panel */}
      <div className={`p-3 border rounded-lg ${
        mapMode === 'navigate' 
          ? 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800' 
          : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
      }`}>
        <div className="flex items-start space-x-2">
          <svg 
            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              mapMode === 'navigate'
                ? 'text-gray-600 dark:text-gray-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <div className="flex-1">
            {mapMode === 'navigate' ? (
              <>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Navigation Mode
                </p>
                <ul className="mt-1 text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Click and drag to pan around the map</li>
                  <li>• Use scroll wheel or navigation controls to zoom</li>
                  <li>• Double-click to zoom in</li>
                  <li>• Switch to "Select Region" mode to draw rectangles</li>
                </ul>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Selection Mode
                </p>
                <ul className="mt-1 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Click and drag to draw a selection rectangle</li>
                  <li>• Release mouse to complete the selection</li>
                  <li>• Use navigation controls (top-right) to zoom</li>
                  <li>• Switch to "Navigate" mode to pan the map</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Control bar with mode toggles and search */}
      <div className="flex gap-2">
        {/* Mode toggle buttons */}
        <button
          onClick={() => handleModeToggle('navigate')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            mapMode === 'navigate'
              ? 'bg-blue-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border'
          }`}
        >
          <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Navigate
        </button>
        <button
          onClick={() => handleModeToggle('select')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            mapMode === 'select'
              ? 'bg-blue-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border'
          }`}
        >
          <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
          Select Region
        </button>
        
        {/* Divider */}
        <div className="w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
        
        {/* Location Search */}
        <input
          type="text"
          placeholder="Search location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleLocationSearch()
            }
          }}
          className="w-48 px-3 py-1.5 text-xs border rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={isSearching}
        />
        <button
          onClick={handleLocationSearch}
          disabled={isSearching || !searchQuery.trim()}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            isSearching || !searchQuery.trim()
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border'
          }`}
        >
          {isSearching ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapContainer}
          className="w-full rounded-lg border overflow-hidden"
          style={{ height }}
        />
        
        {/* Drawing indicator overlay */}
        {isDrawing && (
          <div className="absolute top-2 left-2 right-2 pointer-events-none">
            <div className="bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded px-3 py-2 shadow-lg">
              <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                Drawing selection... Release mouse to complete
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Selected Region Info */}
      {selectedRegion && !isDrawing && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-green-900 dark:text-green-100">
              Region Selected ✓
            </h5>
            <button
              onClick={handleClearSelection}
              className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              Clear Selection
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-600 dark:text-green-400 text-xs uppercase tracking-wide">Center:</span>
              <div className="text-green-900 dark:text-green-100 font-mono mt-1">
                {selectedRegion.center.lat.toFixed(6)}, {selectedRegion.center.lng.toFixed(6)}
              </div>
            </div>
            <div>
              <span className="text-green-600 dark:text-green-400 text-xs uppercase tracking-wide">Area:</span>
              <div className="text-green-900 dark:text-green-100 font-mono mt-1">
                {selectedRegion.area.toFixed(2)} km²
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-green-600 dark:text-green-400 text-xs uppercase tracking-wide">Rectangle Coordinates:</span>
              <div className="text-green-900 dark:text-green-100 font-mono text-xs mt-1 p-2 bg-white dark:bg-gray-800 rounded">
                [{selectedRegion.rectangleCoordinates[0].toFixed(6)}, {selectedRegion.rectangleCoordinates[1].toFixed(6)}, {selectedRegion.rectangleCoordinates[2].toFixed(6)}, {selectedRegion.rectangleCoordinates[3].toFixed(6)}]
              </div>
              <div className="text-green-600 dark:text-green-400 text-xs mt-1">
                [lng_top_left, lat_top_left, lng_bottom_right, lat_bottom_right]
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}