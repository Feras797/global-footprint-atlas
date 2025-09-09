import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapLibreRegionSelector } from "@/components/MapLibreRegionSelector";
import { 
  MapPin, 
  Plus, 
  Search, 
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

  const getTypeColor = (type: Region['type']) => {
    switch (type) {
      case 'forest': return 'bg-green-100 text-green-800';
      case 'agricultural': return 'bg-yellow-100 text-yellow-800';
      case 'industrial': return 'bg-gray-100 text-gray-800';
      case 'urban': return 'bg-blue-100 text-blue-800';
      case 'coastal': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Region Analysis</h2>
          <p className="text-muted-foreground mt-1">
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
          <h3 className="text-lg font-semibold mb-4">Create New Analysis Region</h3>
          
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
                    <p className="text-xs text-muted-foreground mt-1">
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
                <h4 className="text-md font-medium">Select Region on Map</h4>
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMapSelector(false)}
                >
                  Back to Form
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Click and drag on the map to draw a rectangle over your region of interest. The coordinates and area will be automatically calculated.
              </p>
              
              <MapLibreRegionSelector 
                height="500px"
                onRegionSelect={handleMapRegionSelect}
              />
              
              {newRegion.lat && newRegion.lng && (
                <div className="p-4 bg-muted rounded-lg">
                  <h5 className="font-medium mb-2">Selected Region</h5>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground">Center: </span>
                        <span className="font-mono">{parseFloat(newRegion.lat).toFixed(6)}, {parseFloat(newRegion.lng).toFixed(6)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Area: </span>
                        <span>{newRegion.area} km²</span>
                      </div>
                    </div>
                    {newRegion.rectangleCoordinates && (
                      <div>
                        <span className="text-muted-foreground">Rectangle Coordinates: </span>
                        <div className="font-mono text-xs mt-1 p-2 bg-background rounded border">
                          {newRegion.rectangleCoordinates}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          [lng_top_left, lat_top_left, lng_bottom_right, lat_bottom_right]
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end space-x-3 mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowMapSelector(false)}
                        className="border-red-500 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => setShowMapSelector(false)} 
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
          <Card key={region.id} className="p-6 hover:shadow-earth transition-all duration-300">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{region.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {region.coordinates.lat.toFixed(4)}, {region.coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteRegion(region.id)}
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
                  <div className="text-sm text-muted-foreground">
                    {region.area.toLocaleString()} km²
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Created {region.createdAt.toLocaleDateString()}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground">
                {region.description}
              </p>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Globe className="h-4 w-4 mr-2" />
                  View Map
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {regions.length === 0 && (
        <Card className="p-12 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">No Regions Created Yet</h3>
          <p className="text-muted-foreground mb-6">
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