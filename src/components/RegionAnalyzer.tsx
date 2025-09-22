import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapLibreRegionSelector } from "@/components/MapLibreRegionSelector";
import { EnvironmentalDashboard } from "@/components/environmental/EnvironmentalDashboard";
import { RegionSimilarityAnalyzer } from "@/components/gee/RegionSimilarityAnalyzer";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit, 
  Download,
  Globe,
  BarChart3,
  Map
} from "lucide-react";

interface Region {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rectangleCoordinates?: [number, number, number, number]; // [lng_top_left, lat_top_left, lng_bottom_right, lat_bottom_right]
  area: number; // in square kilometers
  type: 'urban' | 'forest' | 'agricultural' | 'industrial' | 'coastal';
  description: string;
  createdAt: Date;
}

export const RegionAnalyzer = () => {
  // Load regions from localStorage on component mount
  const [regions, setRegions] = useState<Region[]>(() => {
    const savedRegions = localStorage.getItem('regions');
    if (savedRegions) {
      try {
        const parsed = JSON.parse(savedRegions);
        // Convert date strings back to Date objects and ensure all fields are preserved
        const loadedRegions = parsed.map((r: any) => ({
          id: r.id,
          name: r.name,
          coordinates: r.coordinates,
          rectangleCoordinates: r.rectangleCoordinates, // Explicitly preserve rectangle coordinates
          area: r.area,
          type: r.type,
          description: r.description,
          createdAt: new Date(r.createdAt)
        }));
        return loadedRegions;
      } catch (e) {
        console.error('Failed to parse saved regions:', e);
      }
    }
    // Default regions if nothing in localStorage
    return [
      {
        id: '1',
        name: 'Amazon Basin Study Area',
        coordinates: { lat: -3.4653, lng: -62.2159 },
        area: 15420,
        type: 'forest',
        description: 'Deforestation monitoring region in the central Amazon',
        createdAt: new Date('2024-01-15'),
        rectangleCoordinates: undefined
      },
      {
        id: '2', 
        name: 'California Agricultural Valley',
        coordinates: { lat: 36.7783, lng: -119.4179 },
        area: 8760,
        type: 'agricultural',
        description: 'Water usage and soil health analysis in Central Valley',
        createdAt: new Date('2024-02-20'),
        rectangleCoordinates: undefined
      }
    ];
  });

  // Save regions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('regions', JSON.stringify(regions));
  }, [regions]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [analyzingRegion, setAnalyzingRegion] = useState<Region | null>(null);
  const [showSimilarityAnalysis, setShowSimilarityAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState<{
    redAreas: any[];
    greenAreas: any[];
    apiResponse?: any;
  }>({ redAreas: [], greenAreas: [] });
  const [newRegion, setNewRegion] = useState({
    name: '',
    lat: '',
    lng: '',
    area: '',
    rectangleCoordinates: '' as string, // Will store the formatted string
    type: 'forest' as Region['type'],
    description: ''
  });

  const handleMapRegionSelect = (selectedRegion: {
    center: { lat: number; lng: number };
    bounds: { north: number; south: number; east: number; west: number };
    rectangleCoordinates: [number, number, number, number];
    area: number;
  }) => {
    if (selectedRegion.area > 0) {
      setNewRegion({
        ...newRegion,
        lat: selectedRegion.center.lat.toFixed(6),
        lng: selectedRegion.center.lng.toFixed(6),
        area: Math.round(selectedRegion.area).toString(),
        rectangleCoordinates: `[${selectedRegion.rectangleCoordinates.map(coord => coord.toFixed(6)).join(', ')}]`
      });
    }
  };

  const handleCreateRegion = () => {
    if (!newRegion.name || !newRegion.lat || !newRegion.lng) {
      alert('Please fill in the required fields: Region Name, Latitude, and Longitude');
      return;
    }

    // Parse rectangle coordinates if they exist
    let rectangleCoords: [number, number, number, number] | undefined;
    if (newRegion.rectangleCoordinates) {
      try {
        const parsed = JSON.parse(newRegion.rectangleCoordinates);
        if (Array.isArray(parsed) && parsed.length === 4) {
          rectangleCoords = parsed as [number, number, number, number];
        }
      } catch (e) {
        console.warn('Could not parse rectangle coordinates:', e);
      }
    }

    const region: Region = {
      id: Date.now().toString(),
      name: newRegion.name,
      coordinates: {
        lat: parseFloat(newRegion.lat),
        lng: parseFloat(newRegion.lng)
      },
      rectangleCoordinates: rectangleCoords,
      area: parseFloat(newRegion.area) || 0,
      type: newRegion.type,
      description: newRegion.description,
      createdAt: new Date()
    };
    
    setRegions([...regions, region]);
    setNewRegion({
      name: '',
      lat: '',
      lng: '',
      area: '',
      rectangleCoordinates: '',
      type: 'forest',
      description: ''
    });
    setShowCreateForm(false);
    setShowMapSelector(false);
  };

  const handleDeleteRegion = (id: string) => {
    setRegions(regions.filter(region => region.id !== id));
  };

  const handleAnalyzeRegion = (region: Region) => {
    // Check if region has coordinates for analysis
    if (region.rectangleCoordinates && region.rectangleCoordinates.length === 4) {
      setAnalyzingRegion(region);
      setShowSimilarityAnalysis(true);
    } else {
      // Fallback to mock data analysis for regions without coordinates
      setAnalyzingRegion(region);
      setShowSimilarityAnalysis(false);
    }
  };

  const handleAnalysisComplete = (redAreas: any[], greenAreas: any[]) => {
    setAnalysisData({ redAreas, greenAreas });
  };

  const handleAnalysisPerformed = (batchAnalysisData?: any) => {
    setAnalysisData(prev => ({
      ...prev,
      apiResponse: batchAnalysisData
    }));
    setShowSimilarityAnalysis(false);
  };

  const handleCloseAnalysis = () => {
    setAnalyzingRegion(null);
    setShowSimilarityAnalysis(false);
    setAnalysisData({ redAreas: [], greenAreas: [] });
  };

  const getTypeColor = (type: Region['type']) => {
    switch (type) {
      case 'forest': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'agricultural': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'industrial': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'urban': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'coastal': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Show similarity analysis interface if analyzing a region with coordinates
  if (analyzingRegion && showSimilarityAnalysis) {
    return (
      <RegionSimilarityAnalyzer
        region={analyzingRegion}
        onAnalysisComplete={handleAnalysisComplete}
        onAnalysisPerformed={handleAnalysisPerformed}
      />
    )
  }

  // Show environmental dashboard if analyzing a region (after analysis or for regions without coordinates)
  if (analyzingRegion && !showSimilarityAnalysis) {
    return (
      <EnvironmentalDashboard
        regionName={analyzingRegion.name}
        onClose={handleCloseAnalysis}
        analysisData={analysisData}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Region Analysis</h2>
          <p className="text-white/80 mt-1">
            Create and analyze custom environmental regions worldwide
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-primary hover:bg-primary-glow"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Region
        </Button>
      </div>

      {/* Create Region Form */}
      {showCreateForm && (
        <Card className="p-6 border-primary/20 bg-primary/5">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Create New Analysis Region</h3>
          
          {!showMapSelector ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="region-name">Region Name</Label>
                  <Input
                    id="region-name"
                    placeholder="e.g., Pacific Coast Study Area"
                    value={newRegion.name}
                    onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      placeholder="e.g., 40.7128"
                      value={newRegion.lat}
                      onChange={(e) => setNewRegion({ ...newRegion, lat: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      placeholder="e.g., -74.0060"
                      value={newRegion.lng}
                      onChange={(e) => setNewRegion({ ...newRegion, lng: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="area">Area (km²)</Label>
                    <Input
                      id="area"
                      placeholder="e.g., 1500"
                      value={newRegion.area}
                      onChange={(e) => setNewRegion({ ...newRegion, area: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Region Type</Label>
                    <Select value={newRegion.type} onValueChange={(value) => setNewRegion({ ...newRegion, type: value as Region['type'] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="forest">Forest</SelectItem>
                        <SelectItem value="agricultural">Agricultural</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="urban">Urban</SelectItem>
                        <SelectItem value="coastal">Coastal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Rectangle Coordinates Field */}
                {newRegion.rectangleCoordinates && (
                  <div>
                    <Label htmlFor="rectangle-coords">Rectangle Coordinates</Label>
                    <Input
                      id="rectangle-coords"
                      placeholder="[lng_top_left, lat_top_left, lng_bottom_right, lat_bottom_right]"
                      value={newRegion.rectangleCoordinates}
                      onChange={(e) => setNewRegion({ ...newRegion, rectangleCoordinates: e.target.value })}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Format: [longitude_top_left, latitude_top_left, longitude_bottom_right, latitude_bottom_right]
                    </p>
                  </div>
                )}
                
                <div className="pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowMapSelector(true)}
                    className="w-full"
                  >
                    <Map className="h-4 w-4 mr-2" />
                    Select Region on Map
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose and focus of this analysis region..."
                  className="h-32"
                  value={newRegion.description}
                  onChange={(e) => setNewRegion({ ...newRegion, description: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Select Region on Map</h4>
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMapSelector(false)}
                >
                  Back to Form
                </Button>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click and drag on the map to draw a rectangle over your region of interest. The coordinates and area will be automatically calculated.
              </p>
              
              <MapLibreRegionSelector 
                height="500px"
                onRegionSelect={handleMapRegionSelect}
                onCancel={() => setShowMapSelector(false)}
                onContinue={() => setShowMapSelector(false)}
              />
              
              {/* Removed duplicate selected-region info and local buttons; handled inside selector */}
            </div>
          )}

          {!showMapSelector && (
            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateRegion} 
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Save Region
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Regions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {regions.map((region) => (
          <Card key={region.id} className="p-6 hover:shadow-earth transition-all duration-300 bg-gray-800 dark:bg-gray-900 border-gray-700 dark:border-gray-800">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{region.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="h-4 w-4 text-white/80" />
                    <span className="text-sm text-white/80">
                      {region.coordinates.lat.toFixed(4)}, {region.coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteRegion(region.id)}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center space-x-4">
                <Badge className={getTypeColor(region.type)} variant="secondary">
                  {region.type.charAt(0).toUpperCase() + region.type.slice(1)}
                </Badge>
                
                {region.area > 0 && (
                  <div className="text-sm text-white/90">
                    {region.area.toLocaleString()} km²
                  </div>
                )}
                
                <div className="text-xs text-white/70">
                  Created {region.createdAt.toLocaleDateString()}
                </div>
                
                {region.rectangleCoordinates && region.rectangleCoordinates.length === 4 && (
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    🛰️ Real Analysis
                  </Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-white/80">
                {region.description}
              </p>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-white border-white/30 hover:bg-white/10 hover:border-white/50"
                  onClick={() => handleAnalyzeRegion(region)}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-white border-white/30 hover:bg-white/10 hover:border-white/50">
                  <Globe className="h-4 w-4 mr-2" />
                  View Map
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-white border-white/30 hover:bg-white/10 hover:border-white/50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {regions.length === 0 && (
        <Card className="p-12 text-center bg-gray-800 dark:bg-gray-900 border-gray-700 dark:border-gray-800">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-white/50" />
          <h3 className="text-lg font-semibold mb-2 text-white">No Regions Created Yet</h3>
          <p className="text-white/70 mb-6">
            Create your first analysis region to start monitoring environmental impact
          </p>
          <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary-glow">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Region
          </Button>
        </Card>
      )}
    </div>
  );
};