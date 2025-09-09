import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Mountain, 
  Leaf, 
  Droplets, 
  Building, 
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react';

import { GEEDataPanelProps, GEEAreaData } from '@/lib/gee/types';

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
}> = ({ icon, title, value, unit = '', description, trend }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-2">
        <div className="text-primary">{icon}</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-foreground">
          {typeof value === 'number' ? value.toFixed(3) : value}
          <span className="text-sm text-muted-foreground ml-1">{unit}</span>
        </p>
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-muted-foreground'
          }`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend}
          </div>
        )}
      </div>
    </div>
  </Card>
);

const SimilarityDisplay: React.FC<{ score: number }> = ({ score }) => {
  const percentage = Math.round(score * 100);
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Similarity Score</span>
          </div>
          <span className={`text-lg font-bold ${getScoreColor(score)}`}>
            {percentage}%
          </span>
        </div>
        
        <Progress value={percentage} className="h-2" />
        
        <p className="text-xs text-muted-foreground">
          Compared to reference area using NDVI, elevation, slope, and land cover data
        </p>
      </div>
    </Card>
  );
};

const AreaOverview: React.FC<{ area: GEEAreaData }> = ({ area }) => (
  <Card className="p-4">
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{area.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {area.center.latitude.toFixed(4)}°N, {area.center.longitude.toFixed(4)}°E
            </span>
          </div>
        </div>
        <Badge 
          variant={area.type === 'reference' ? 'destructive' : 'secondary'}
          className="text-xs"
        >
          {area.type === 'reference' ? 'Reference' : 'Similar'} Area
        </Badge>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Area Size</p>
          <p className="font-medium">{area.area_hectares.toFixed(1)} ha</p>
        </div>
        <div>
          <p className="text-muted-foreground">Analysis Date</p>
          <p className="font-medium">
            {new Date(area.features.analysisDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      {area.distanceFromReference && (
        <div className="text-sm">
          <p className="text-muted-foreground">Distance from Reference</p>
          <p className="font-medium">{(area.distanceFromReference / 1000).toFixed(1)} km</p>
        </div>
      )}
    </div>
  </Card>
);

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-32 w-full" />
    <div className="grid grid-cols-1 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  </div>
);

export const GEEDataPanel: React.FC<GEEDataPanelProps> = ({
  selectedArea,
  analysisResult,
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (!selectedArea) {
    return (
      <div className={`p-6 ${className}`}>
        <Card className="p-8 text-center">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Area Selected</h3>
          <p className="text-muted-foreground text-sm">
            Click on a highlighted area on the map to view detailed environmental analysis
          </p>
        </Card>
      </div>
    );
  }

  const { features } = selectedArea;

  return (
    <div className={`p-6 space-y-6 overflow-auto ${className}`}>
      {/* Area Overview */}
      <AreaOverview area={selectedArea} />
      
      {/* Similarity Score (only for similar areas) */}
      {selectedArea.type === 'similar' && selectedArea.similarityScore && (
        <SimilarityDisplay score={selectedArea.similarityScore} />
      )}
      
      {/* Environmental Features */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Leaf className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-foreground">Environmental Features</h4>
        </div>
        
        <div className="space-y-3">
          <FeatureCard
            icon={<Leaf className="h-4 w-4" />}
            title="Vegetation Index (NDVI)"
            value={features.ndvi_mean}
            unit="±0.001"
            description="Normalized Difference Vegetation Index"
          />
          
          <FeatureCard
            icon={<Droplets className="h-4 w-4" />}
            title="Water Index (NDWI)"
            value={features.ndwi_mean}
            unit="±0.001"
            description="Normalized Difference Water Index"
          />
          
          <FeatureCard
            icon={<Building className="h-4 w-4" />}
            title="Built-up Index (NDBI)"
            value={features.ndbi_mean}
            unit="±0.001"
            description="Normalized Difference Built-up Index"
          />
        </div>
      </div>
      
      {/* Topographic Features */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Mountain className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-foreground">Topographic Features</h4>
        </div>
        
        <div className="space-y-3">
          <FeatureCard
            icon={<Mountain className="h-4 w-4" />}
            title="Elevation"
            value={features.elevation_mean}
            unit="m"
            description={`Standard deviation: ${features.elevation_std.toFixed(1)}m`}
          />
          
          <FeatureCard
            icon={<TrendingUp className="h-4 w-4" />}
            title="Slope"
            value={features.slope_mean}
            unit="°"
            description={`Standard deviation: ${features.slope_std.toFixed(1)}°`}
          />
        </div>
      </div>
      
      {/* Land Cover */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-foreground">Land Cover Analysis</h4>
        </div>
        
        <FeatureCard
          icon={<BarChart3 className="h-4 w-4" />}
          title="Land Cover Diversity"
          value={features.landcover_diversity}
          unit="types"
          description="Number of different land cover types"
        />
      </div>
      
      {/* Analysis Metadata */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-foreground">Analysis Information</h4>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Analysis Date:</span>
            <span>{new Date(features.analysisDate).toLocaleDateString()}</span>
          </div>
          
          {features.dataQuality && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Quality:</span>
              <span>{Math.round(features.dataQuality * 100)}%</span>
            </div>
          )}
          
          {selectedArea.gridPosition && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Grid Position:</span>
              <span>{selectedArea.gridPosition}</span>
            </div>
          )}
        </div>
      </Card>
      
      {/* Summary Statistics (only show for reference area) */}
      {selectedArea.type === 'reference' && analysisResult && (
        <Card className="p-4">
          <h4 className="font-semibold text-foreground mb-3">Analysis Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Similar Areas Found:</span>
              <span>{analysisResult.similarAreas.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Candidates:</span>
              <span>{analysisResult.totalCandidatesAnalyzed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Search Radius:</span>
              <span>{(analysisResult.searchConfig.searchRadius / 1000).toFixed(0)} km</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
