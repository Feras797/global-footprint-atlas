import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Download,
  Globe,
  BarChart3
} from "lucide-react";

interface Region {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  area: number; // in square kilometers
  type: 'urban' | 'forest' | 'agricultural' | 'industrial' | 'coastal';
  description: string;
  createdAt: Date;
}

export const RegionAnalyzer = () => {
  const [regions, setRegions] = useState<Region[]>([
    {
      id: '1',
      name: 'Amazon Basin Study Area',
      coordinates: { lat: -3.4653, lng: -62.2159 },
      area: 15420,
      type: 'forest',
      description: 'Deforestation monitoring region in the central Amazon',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2', 
      name: 'California Agricultural Valley',
      coordinates: { lat: 36.7783, lng: -119.4179 },
      area: 8760,
      type: 'agricultural',
      description: 'Water usage and soil health analysis in Central Valley',
      createdAt: new Date('2024-02-20')
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRegion, setNewRegion] = useState({
    name: '',
    lat: '',
    lng: '',
    area: '',
    type: 'forest' as Region['type'],
    description: ''
  });

  const handleCreateRegion = () => {
    if (!newRegion.name || !newRegion.lat || !newRegion.lng) return;

    const region: Region = {
      id: Date.now().toString(),
      name: newRegion.name,
      coordinates: {
        lat: parseFloat(newRegion.lat),
        lng: parseFloat(newRegion.lng)
      },
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
      type: 'forest',
      description: ''
    });
    setShowCreateForm(false);
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

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRegion} className="bg-primary hover:bg-primary-glow">
              <MapPin className="h-4 w-4 mr-2" />
              Create Region
            </Button>
          </div>
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