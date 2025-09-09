import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Loader2, MapPin } from 'lucide-react';

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyDxCaV_ArUKahmWNSsO2OVni3dUoPSqfPI';

// Real similarity analysis API
const SIMILARITY_API_BASE = 'https://similar1-370308594166.europe-west1.run.app/similarity/top3';

interface CompanyLocation {
  name: string;
  coordinates: [number, number, number, number]; // [tlx, tly, brx, bry]
  location: string;
}

interface AnalysisMapProps {
  companyName: string;
  locations: CompanyLocation[];
  className?: string;
  onAnalysisComplete?: (redAreas: any[], greenAreas: any[]) => void;
  onAnalysisPerformed?: () => void;
}

interface SimilarArea {
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat] 
  similarity: number;
  rank: number;
  index: number;
  position: string;
  belongsToRedBox: number; // Index of the red box this green area belongs to
  features: {
    ndvi_mean: number;
    ndvi_std: number;
    elevation_mean: number;
    elevation_std: number;
    slope_mean: number;
    slope_std: number;
    ndwi_mean: number;
    ndbi_mean: number;
    landcover_diversity: number;
  };
}

// Real API response structure
interface RealApiResponse {
  status: string;
  timestamp: string;
  config: {
    reference_bbox: [number, number, number, number];
    start_date: string;
    end_date: string;
    search_radius_km: number;
    sampling_resolution_m: number;
    max_candidates: number;
    similarity_threshold: number;
    weights: {
      ndvi: number;
      elevation: number;
      slope: number;
      landcover: number;
    };
  };
  reference: {
    bbox: [number, number, number, number];
  };
  candidates_generated: number;
  top_matches: {
    rank: number;
    index: number;
    position: string;
    similarity: number;
    bbox: [number, number, number, number];
    features: {
      ndvi_mean: number;
      ndvi_std: number;
      elevation_mean: number;
      elevation_std: number;
      slope_mean: number;
      slope_std: number;
      ndwi_mean: number;
      ndbi_mean: number;
      landcover_diversity: number;
    };
  }[];
}

/**
 * Transform coordinates from [tlx, tly, brx, bry] to API format and build URL
 */
const buildSimilarityApiUrl = (coordinates: [number, number, number, number]): string => {
  const [tlx, tly, brx, bry] = coordinates;
  
  // Convert to minLng, minLat, maxLng, maxLat format
  const minLng = Math.min(tlx, brx);
  const maxLng = Math.max(tlx, brx);
  const minLat = Math.min(tly, bry);
  const maxLat = Math.max(tly, bry);
  
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
  });
  
  return `${SIMILARITY_API_BASE}?${params.toString()}`;
};

/**
 * Parse real API response and convert to internal SimilarArea format
 */
const parseRealApiResponse = (apiResponse: RealApiResponse, redBoxIndex: number): SimilarArea[] => {
  return apiResponse.top_matches.map(match => {
    console.log(`🔄 Converting Rank ${match.rank} for Red Box ${redBoxIndex}:`, {
      position: match.position,
      bbox: match.bbox,
      similarity: match.similarity,
      features: match.features
    });
    
    return {
      bbox: match.bbox,
      similarity: match.similarity,
      rank: match.rank,
      index: match.index,
      position: match.position,
      belongsToRedBox: redBoxIndex,
      features: match.features
    };
  });
};


export const CompanyAnalysisMap: React.FC<AnalysisMapProps> = ({
  companyName,
  locations,
  className = '',
  onAnalysisComplete,
  onAnalysisPerformed
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
  const [selectedArea, setSelectedArea] = useState<{
    type: 'company' | 'similar';
    data: any;
  } | null>(null);
  const [selectedRedBoxIndex, setSelectedRedBoxIndex] = useState<number | null>(null);
  const [batchAnalysisData, setBatchAnalysisData] = useState<any>(null);
  const [isAnalysisInProgress, setIsAnalysisInProgress] = useState(false);

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

    console.log(`🎯 Starting analysis for ${locations.length} company locations`);
    setTotalApiRequests(locations.length);
    setApiRequestsCompleted(0);
    setIsAnalysisEnabled(false); // Reset analysis button
    setSimilarAreas([]); // Clear previous green areas
    
    const newRectangles: google.maps.Rectangle[] = [];

    // Create all red rectangles first
    locations.forEach((location, locationIndex) => {
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

      // Add click handler with location info and red box tracking
      rectangle.addListener('click', () => {
        console.log('🔴 Clicked company location:', location.name, 'Index:', locationIndex);
        setSelectedArea({
          type: 'company',
          data: { ...location, redBoxIndex: locationIndex }
        });
        setSelectedRedBoxIndex(locationIndex);
      });

      // Add hover effects
      rectangle.addListener('mouseover', () => {
        rectangle.setOptions({ fillOpacity: 0.5, strokeWeight: 4 });
      });

      rectangle.addListener('mouseout', () => {
        rectangle.setOptions({ fillOpacity: 0.3, strokeWeight: 3 });
      });
    });

    setRectangles(newRectangles);

    // Make concurrent API calls for all locations
    console.log('🚀 Starting concurrent API calls for all red boxes...');
    const apiPromises = locations.map((location, locationIndex) => 
      fetchSimilarAreas([...location.coordinates], locationIndex)
    );

    // Don't await all - let them complete individually and update UI progressively
    apiPromises.forEach((promise, index) => {
      promise.catch(error => {
        console.error(`❌ API call failed for location ${index}:`, error);
      });
    });
  };

  /**
   * Fetch similar areas from real similarity API
   */
  const fetchSimilarAreas = async (coordinates: [number, number, number, number], redBoxIndex: number) => {
    try {
      const apiUrl = buildSimilarityApiUrl(coordinates);
      console.log(`📡 Requesting similar areas for Red Box ${redBoxIndex}, coordinates:`, coordinates);
      console.log('🔗 Using real API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        // No additional headers needed for GET request
      });

      console.log(`📡 Response status for Red Box ${redBoxIndex}:`, response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📥 Raw API response for Red Box ${redBoxIndex}:`, data);
      console.log('📊 Response status:', data.status);
      console.log('📊 Top matches count:', data.top_matches ? data.top_matches.length : 'undefined');
      
      let newSimilarAreas: SimilarArea[] = [];
      
      // Check if it's the real API format
      if (data.status === 'success' && data.top_matches && Array.isArray(data.top_matches)) {
        console.log(`🔄 Processing real API format with top_matches for Red Box ${redBoxIndex}`);
        try {
          newSimilarAreas = parseRealApiResponse(data as RealApiResponse, redBoxIndex);
          console.log(`✅ Successfully parsed ${newSimilarAreas.length} similar areas for Red Box ${redBoxIndex}`);
        } catch (parseError) {
          console.error('❌ Error during parsing:', parseError);
          throw parseError;
        }
      } else {
        console.error('❌ Invalid response format:', { status: data.status, hasTopMatches: !!data.top_matches, isArray: Array.isArray(data.top_matches) });
        throw new Error(`Unrecognized API response format. Expected 'status: success' and 'top_matches' array.`);
      }

      console.log(`✅ Parsed similar areas for Red Box ${redBoxIndex}:`, newSimilarAreas);
      console.log(`🟢 API call successful - received ${newSimilarAreas.length} green areas for Red Box ${redBoxIndex}`);
      
      setSimilarAreas(prev => {
        const updated = [...prev, ...newSimilarAreas];
        console.log('📈 Total similar areas now:', updated.length);
        
        // Enable analysis button as soon as we have first green areas
        if (prev.length === 0 && newSimilarAreas.length > 0) {
          console.log('🎯 First green areas received - enabling analysis button early!');
          setIsAnalysisEnabled(true);
        }
        
        return updated;
      });
      
    } catch (error) {
      console.error(`❌ Real API request failed for Red Box ${redBoxIndex}:`, error);
      
      // Enhanced error logging for different types of failures
      if (error instanceof TypeError) {
        console.error('🚫 CORS Error: The similarity API may not allow cross-origin requests from this domain');
        console.error('🔧 Potential solution: API needs to add CORS headers for http://localhost:8080');
      } else if (error instanceof Error) {
        console.error('📄 Error details:', error.message);
      }
      
      console.log(`❌ No green boxes will be shown for Red Box ${redBoxIndex} - real API unavailable`);
      // No fallback to mock data - real API only
    } finally {
      setApiRequestsCompleted(prev => {
        const newCount = prev + 1;
        console.log(`🔢 API requests: ${newCount}/${totalApiRequests} completed`);
        return newCount;
      });
    }
  };


  /**
   * Plot green squares for similar areas with color coding
   */
  const plotGreenSquares = () => {
    if (!mapInstance.current) return;

    // Clear existing green rectangles (keep red ones)
    const redRectangles = rectangles.slice(0, locations.length);
    rectangles.slice(locations.length).forEach(rect => rect.setMap(null));

    const greenRectangles: google.maps.Rectangle[] = [];

    similarAreas.forEach((area, index) => {
      const [minLng, minLat, maxLng, maxLat] = area.bbox;
      
      // Color coding: yellowish for selected red box's green areas, regular green for others
      const isFromSelectedRedBox = selectedRedBoxIndex !== null && area.belongsToRedBox === selectedRedBoxIndex;
      const fillColor = isFromSelectedRedBox ? '#eab308' : '#22c55e'; // Yellow vs Green
      const strokeColor = isFromSelectedRedBox ? '#ca8a04' : '#16a34a'; // Darker yellow vs Darker green
      
      const rectangle = new google.maps.Rectangle({
        bounds: {
          north: maxLat,
          south: minLat,
          east: maxLng,
          west: minLng
        },
        fillColor,
        fillOpacity: 0.3,
        strokeColor,
        strokeOpacity: 0.8,
        strokeWeight: 3,
        clickable: true,
      });

      rectangle.setMap(mapInstance.current);
      greenRectangles.push(rectangle);

      // Add click handler with enhanced info
      rectangle.addListener('click', () => {
        console.log(`🟢 Clicked similar area: Position ${area.position} (Rank ${area.rank}) from Red Box ${area.belongsToRedBox}, similarity: ${(area.similarity * 100).toFixed(1)}%`);
        console.log('📊 Environmental features:', area.features);
        setSelectedArea({
          type: 'similar',
          data: area
        });
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

  // Track if we've already called onAnalysisComplete to prevent infinite loops
  const [hasNotifiedCompletion, setHasNotifiedCompletion] = useState(false);

  // Plot green squares when similar areas are updated
  useEffect(() => {
    if (similarAreas.length > 0) {
      plotGreenSquares();
      
      // Notify parent component that analysis is complete (only once)
      if (onAnalysisComplete && !hasNotifiedCompletion && apiRequestsCompleted === totalApiRequests) {
        const redAreasData = locations.map((location, index) => ({
          ...location,
          environmentalData: null // Company areas don't have environmental features yet
        }));
        
        const greenAreasData = similarAreas.map((area, index) => ({
          name: `Area ${area.position}`,
          coordinates: area.bbox,
          location: 'Environmentally Similar Region',
          similarity: area.similarity,
          rank: area.rank,
          environmentalData: area.features
        }));
        
        onAnalysisComplete(redAreasData, greenAreasData);
        setHasNotifiedCompletion(true);
      }
    }
  }, [similarAreas, selectedRedBoxIndex, apiRequestsCompleted, totalApiRequests, onAnalysisComplete, locations, hasNotifiedCompletion]);

  const handlePerformAnalysis = async () => {
    console.log('🔬 Performing comprehensive batch analysis...');
    console.log('📊 Analysis data:', {
      redAreas: locations.length,
      greenAreas: similarAreas.length,
      totalAreas: locations.length + similarAreas.length
    });
    
    try {
      setIsAnalysisInProgress(true);
      console.log('📡 Calling real industrial analysis API...');
      
      // We need to make separate requests for each red area with its 3 greens
      const allBatchResults = [];
      
      for (let i = 0; i < locations.length; i++) {
        const redArea = locations[i];
        // Get 3 green areas for this red area (filter by belongsToRedBox)
        const greenAreasForThisRed = similarAreas.filter(green => green.belongsToRedBox === i);
        
        if (greenAreasForThisRed.length !== 3) {
          console.warn(`⚠️ Red area ${i} has ${greenAreasForThisRed.length} green areas, expected 3`);
        }
        
        // Transform coordinates: [tlx, tly, brx, bry] -> [minLon, minLat, maxLon, maxLat]
        const rectangles = [];
        const rectangle_names = [];
        
        // Add red area (company location)
        const [tlx, tly, brx, bry] = redArea.coordinates;
        const minLon = Math.min(tlx, brx);
        const maxLon = Math.max(tlx, brx);
        const minLat = Math.min(tly, bry);
        const maxLat = Math.max(tly, bry);
        
        rectangles.push([minLon, minLat, maxLon, maxLat]);
        rectangle_names.push(redArea.name);
        
        // Add green areas (similar areas)
        greenAreasForThisRed.forEach((green, index) => {
          const [minLng, minLat, maxLng, maxLat] = green.bbox;
          rectangles.push([minLng, minLat, maxLng, maxLat]);
          rectangle_names.push(`Similar_Area_${index + 1}`);
        });
        
        console.log(`📊 Request ${i + 1}/${locations.length}:`, {
          rectangles,
          rectangle_names
        });
        
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
        };
        
        const response = await fetch('https://weather-370308594166.europe-west1.run.app/analysis/industrial', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload)
        });
        
        if (!response.ok) {
          throw new Error(`API request ${i + 1} failed: ${response.status} ${response.statusText}`);
        }
        
        const batchResult = await response.json();
        console.log(`✅ Request ${i + 1} response:`, batchResult);
        allBatchResults.push(batchResult);
      }
      
      // Combine all batch results
      const combinedAnalysisData = {
        status: "success",
        timestamp: new Date().toISOString(),
        total_requests: allBatchResults.length,
        batch_results: allBatchResults,
        combined_summary: {
          total_areas_analyzed: allBatchResults.reduce((sum, result) => sum + (result.summary?.areas_analyzed || 0), 0),
          total_periods: allBatchResults[0]?.summary?.total_periods_analyzed || 8,
          total_anomalies: allBatchResults.reduce((sum, result) => sum + (result.anomaly_summary?.total_anomalies || 0), 0),
          total_requests: allBatchResults.length
        }
      };
      
      console.log('✅ All batch analysis requests completed:', combinedAnalysisData);
      
      // Store the comprehensive analysis data
      setBatchAnalysisData(combinedAnalysisData);
      
      // Call the callback to notify parent that analysis was performed
      if (onAnalysisPerformed) {
        onAnalysisPerformed();
      }
      
      // Show success message with key metrics
      alert(`🎉 Real API Analysis Complete!\n\n` +
            `📊 Requests Made: ${combinedAnalysisData.total_requests}\n` +
            `📊 Total Areas: ${combinedAnalysisData.combined_summary.total_areas_analyzed}\n` +
            `📈 Time Periods: ${combinedAnalysisData.combined_summary.total_periods} quarters\n` +
            `🚨 Total Anomalies: ${combinedAnalysisData.combined_summary.total_anomalies}\n\n` +
            `Real environmental data loaded successfully!`);
      
    } catch (error) {
      console.error('❌ Batch analysis failed:', error);
      alert(`❌ Analysis Failed\n\nError: ${error.message}\n\nPlease try again or check the server connection.`);
    } finally {
      setIsAnalysisInProgress(false);
    }
  };


  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
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

      {/* Main Content: Map (75%) + Info Panel (25%) */}
      <div className="flex gap-4 h-[600px]">
        {/* Map Container - 75% width */}
        <Card className="flex-[3] p-0 overflow-hidden">
          <div className="relative h-full">
            <div ref={mapContainer} className="h-full w-full" />
          
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
              <div className="absolute top-4 left-4 right-4">
                <Card className="p-4 bg-background/90 backdrop-blur-sm">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm font-medium">
                        Finding similar areas... {apiRequestsCompleted}/{totalApiRequests}
                      </span>
                    </div>
                    <Progress 
                      value={(apiRequestsCompleted / totalApiRequests) * 100} 
                      className="w-full h-2" 
                    />
                    <div className="text-xs text-muted-foreground">
                      {similarAreas.length} green areas found so far
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </Card>

        {/* Info Panel - 25% width */}
        <Card className="flex-1 p-4 overflow-auto">
          <div className="h-full">
            {selectedArea ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded ${selectedArea.type === 'company' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <h4 className="font-semibold">
                    {selectedArea.type === 'company' ? 'Company Area' : 'Similar Area'}
                  </h4>
                </div>
                
                {selectedArea.type === 'similar' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Position:</span>
                      <Badge variant="outline">{selectedArea.data.position}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Rank:</span>
                      <Badge variant="secondary">#{selectedArea.data.rank}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Similar to:</span>
                      <Badge variant="outline" className="text-xs">
                        Red Box {selectedArea.data.belongsToRedBox + 1}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Similarity:</span>
                      <span className="text-sm font-mono">{(selectedArea.data.similarity * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Center:</span>
                      <span className="text-xs font-mono">
                        {(() => {
                          const [minLng, minLat, maxLng, maxLat] = selectedArea.data.bbox;
                          const centerLng = ((minLng + maxLng) / 2).toFixed(4);
                          const centerLat = ((minLat + maxLat) / 2).toFixed(4);
                          return `${centerLat}°, ${centerLng}°`;
                        })()}
                      </span>
                    </div>
                    
                    <div className="border-t pt-3">
                      <h5 className="font-medium text-sm mb-2">Environmental Features</h5>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>NDVI (vegetation):</span>
                          <span className="font-mono">{selectedArea.data.features.ndvi_mean.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Elevation:</span>
                          <span className="font-mono">{selectedArea.data.features.elevation_mean.toFixed(1)}m</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Slope:</span>
                          <span className="font-mono">{selectedArea.data.features.slope_mean.toFixed(1)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span>NDWI (water):</span>
                          <span className="font-mono">{selectedArea.data.features.ndwi_mean.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>NDBI (built-up):</span>
                          <span className="font-mono">{selectedArea.data.features.ndbi_mean.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Landcover diversity:</span>
                          <span className="font-mono">{selectedArea.data.features.landcover_diversity} types</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedArea.type === 'company' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Name:</span>
                      <span className="text-sm">{selectedArea.data.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Location:</span>
                      <span className="text-sm">{selectedArea.data.location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Center:</span>
                      <span className="text-xs font-mono">
                        {(() => {
                          const [tlx, tly, brx, bry] = selectedArea.data.coordinates;
                          const centerLng = ((tlx + brx) / 2).toFixed(4);
                          const centerLat = ((tly + bry) / 2).toFixed(4);
                          return `${centerLat}°, ${centerLng}°`;
                        })()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="font-medium mb-2">Select an Area</h4>
                  <p className="text-sm text-muted-foreground">
                    Click on a red (company) or green (similar) area on the map to view detailed information
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Analysis Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handlePerformAnalysis}
          disabled={!isAnalysisEnabled || isAnalysisInProgress}
          size="lg"
          className="min-w-[200px]"
        >
          {isAnalysisInProgress ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing with Real API...
            </>
          ) : isAnalysisEnabled ? (
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
