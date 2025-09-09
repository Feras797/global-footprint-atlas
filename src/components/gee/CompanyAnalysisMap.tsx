import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, MapPin } from 'lucide-react';

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyDxCaV_ArUKahmWNSsO2OVni3dUoPSqfPI';

// API endpoint placeholder
const ANALYSIS_API_ENDPOINT = 'https://api.your-backend.com/analyze-area';

interface CompanyLocation {
  name: string;
  coordinates: [number, number, number, number]; // [tlx, tly, brx, bry]
  location: string;
}

interface AnalysisMapProps {
  companyName: string;
  locations: CompanyLocation[];
  className?: string;
}

interface SimilarArea {
  coordinates: [number, number, number, number]; // [tlx, tly, brx, bry]
  similarity: number;
}

interface AnalysisResponse {
  top_3: [
    [number, number, number, number],
    [number, number, number, number], 
    [number, number, number, number]
  ];
  similarity: [number, number, number];
}

export const CompanyAnalysisMap: React.FC<AnalysisMapProps> = ({
  companyName,
  locations,
  className = ''
}) => {
  // Refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rectangles, setRectangles] = useState<google.maps.Rectangle[]>([]);
  const [apiRequestsCompleted, setApiRequestsCompleted] = useState(0);
  const [totalApiRequests, setTotalApiRequests] = useState(0);
  const [similarAreas, setSimilarAreas] = useState<SimilarArea[]>([]);
  const [isAnalysisEnabled, setIsAnalysisEnabled] = useState(false);

  /**
   * Initialize Google Maps
   */
  const initializeGoogleMaps = async () => {
    if (!mapContainer.current) return false;

    try {
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['geometry']
      });

      await loader.load();
      
      // Calculate center from all locations (using rectangle centers)
      const centerLat = locations.reduce((sum, loc) => {
        const [tlx, tly, brx, bry] = loc.coordinates;
        return sum + (tly + bry) / 2; // Average of top and bottom
      }, 0) / locations.length;
      
      const centerLng = locations.reduce((sum, loc) => {
        const [tlx, tly, brx, bry] = loc.coordinates;
        return sum + (tlx + brx) / 2; // Average of left and right
      }, 0) / locations.length;

      mapInstance.current = new google.maps.Map(mapContainer.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false
      });

      console.log('🗺️ Google Maps initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Maps:', error);
      setError('Failed to load Google Maps. Please check your API key.');
      return false;
    }
  };

  /**
   * Create red squares (company locations) and trigger API calls
   */
  const createCompanySquares = async () => {
    if (!mapInstance.current || locations.length === 0) return;

    setTotalApiRequests(locations.length);
    setApiRequestsCompleted(0);
    
    const newRectangles: google.maps.Rectangle[] = [];

    for (const location of locations) {
      // Use the rectangular coordinates directly from mockdata
      const [tlx, tly, brx, bry] = location.coordinates;
      
      const bounds = {
        north: tly,    // top latitude
        south: bry,    // bottom latitude
        east: brx,     // right longitude
        west: tlx      // left longitude
      };

      // Create red rectangle
      const rectangle = new google.maps.Rectangle({
        bounds,
        fillColor: '#ef4444',
        fillOpacity: 0.3,
        strokeColor: '#dc2626',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        clickable: true,
      });

      rectangle.setMap(mapInstance.current);
      newRectangles.push(rectangle);

      // Add click handler with location info
      rectangle.addListener('click', () => {
        console.log('Clicked company location:', location.name);
      });

      // Add hover effects
      rectangle.addListener('mouseover', () => {
        rectangle.setOptions({ fillOpacity: 0.5, strokeWeight: 4 });
      });

      rectangle.addListener('mouseout', () => {
        rectangle.setOptions({ fillOpacity: 0.3, strokeWeight: 3 });
      });

      // Make API call for similar areas using the location's coordinates
      await fetchSimilarAreas([tlx, tly, brx, bry]); // [tlx, tly, brx, bry]
    }

    setRectangles(newRectangles);
  };

  /**
   * Fetch similar areas from backend API
   */
  const fetchSimilarAreas = async (coordinates: [number, number, number, number]) => {
    try {
      console.log('📡 Requesting similar areas for coordinates:', coordinates);
      
      const response = await fetch(ANALYSIS_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coordinates }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: AnalysisResponse = await response.json();
      
      // Convert response to SimilarArea format
      const newSimilarAreas: SimilarArea[] = data.top_3.map((coords, index) => ({
        coordinates: coords,
        similarity: data.similarity[index]
      }));

      setSimilarAreas(prev => [...prev, ...newSimilarAreas]);
      
    } catch (error) {
      console.warn('⚠️ API request failed, using mock data for demo:', error);
      // For now, create mock similar areas for demo
      createMockSimilarAreas(coordinates);
    } finally {
      setApiRequestsCompleted(prev => {
        const newCount = prev + 1;
        if (newCount === totalApiRequests) {
          setIsAnalysisEnabled(true);
        }
        return newCount;
      });
    }
  };

  /**
   * Create mock similar areas for demo (until API is ready)
   */
  const createMockSimilarAreas = (baseCoords: [number, number, number, number]) => {
    const [tlx, tly, brx, bry] = baseCoords;
    const centerLng = (tlx + brx) / 2;
    const centerLat = (tly + bry) / 2;
    
    // Generate 3 mock similar areas around the base coordinates
    const mockAreas: SimilarArea[] = [
      {
        coordinates: [centerLng + 0.02, centerLat + 0.01, centerLng + 0.03, centerLat],
        similarity: 0.95
      },
      {
        coordinates: [centerLng - 0.03, centerLat + 0.02, centerLng - 0.02, centerLat + 0.01],
        similarity: 0.87
      },
      {
        coordinates: [centerLng + 0.01, centerLat - 0.02, centerLng + 0.02, centerLat - 0.01],
        similarity: 0.76
      }
    ];

    setSimilarAreas(prev => [...prev, ...mockAreas]);
  };

  /**
   * Plot green squares for similar areas
   */
  const plotGreenSquares = () => {
    if (!mapInstance.current) return;

    // Clear existing green rectangles (keep red ones)
    const redRectangles = rectangles.slice(0, locations.length);
    rectangles.slice(locations.length).forEach(rect => rect.setMap(null));

    const greenRectangles: google.maps.Rectangle[] = [];

    similarAreas.forEach((area, index) => {
      const [tlx, tly, brx, bry] = area.coordinates;
      
      const rectangle = new google.maps.Rectangle({
        bounds: {
          north: tly,
          south: bry,
          east: brx,
          west: tlx
        },
        fillColor: '#22c55e',
        fillOpacity: 0.3,
        strokeColor: '#16a34a',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        clickable: true,
      });

      rectangle.setMap(mapInstance.current);
      greenRectangles.push(rectangle);

      // Add click handler
      rectangle.addListener('click', () => {
        console.log(`Clicked similar area ${index + 1}, similarity: ${area.similarity}`);
      });

      // Add hover effects
      rectangle.addListener('mouseover', () => {
        rectangle.setOptions({ fillOpacity: 0.5, strokeWeight: 4 });
      });

      rectangle.addListener('mouseout', () => {
        rectangle.setOptions({ fillOpacity: 0.3, strokeWeight: 3 });
      });
    });

    setRectangles([...redRectangles, ...greenRectangles]);
  };

  // Initialize map and load company squares
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setError(null);

      const mapsReady = await initializeGoogleMaps();
      if (!mapsReady) return;

      await createCompanySquares();
      setIsLoading(false);
    };

    initialize();
  }, [locations]);

  // Plot green squares when similar areas are updated
  useEffect(() => {
    if (similarAreas.length > 0 && apiRequestsCompleted === totalApiRequests) {
      plotGreenSquares();
    }
  }, [similarAreas, apiRequestsCompleted, totalApiRequests]);

  const handlePerformAnalysis = () => {
    console.log('🔬 Performing detailed analysis for all areas...');
    // This will trigger the detailed analysis API call later
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Container with Fixed Height */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Environmental Analysis Map</h3>
              <p className="text-sm text-muted-foreground">
                {companyName} operational areas and similar regions
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {locations.length} location{locations.length !== 1 ? 's' : ''}
              </Badge>
              {apiRequestsCompleted > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {apiRequestsCompleted}/{totalApiRequests} areas analyzed
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Fixed Height Map Container */}
        <div className="relative">
          <div ref={mapContainer} className="h-[500px] w-full" />
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div>
                    <p className="font-medium">Loading Map...</p>
                    <p className="text-xs text-muted-foreground">
                      Initializing satellite view and company locations
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="absolute top-4 left-4 right-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* API Progress Display */}
          {!isLoading && totalApiRequests > 0 && apiRequestsCompleted < totalApiRequests && (
            <div className="absolute top-4 left-4">
              <Card className="p-3 bg-background/90 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm">
                    Finding similar areas... {apiRequestsCompleted}/{totalApiRequests}
                  </span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>

      {/* Analysis Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handlePerformAnalysis}
          disabled={!isAnalysisEnabled}
          size="lg"
          className="min-w-[200px]"
        >
          {isAnalysisEnabled ? (
            <>Perform Analysis</>
          ) : (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Waiting for area data...
            </>
          )}
        </Button>
      </div>

      {/* Results Summary */}
      {isAnalysisEnabled && (
        <Card className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Analysis Ready:</span>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                {locations.length} Company Area{locations.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                {similarAreas.length} Similar Area{similarAreas.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
