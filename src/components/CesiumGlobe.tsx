import React, { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CesiumGlobeProps, 
  GlobeEntity,
  CompanyData 
} from '@/types/globe';
import { 
  convertCompaniesToGlobeEntities,
  calculateOptimalView,
  getIndustryColor,
  getMarketCapColor,
  getPlantSizeScale,
  createIndustryPin,
  getUniqueIndustries,
  getIndustryStats
} from '@/lib/globe-utils';
import { Home, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Cesium Ion Configuration
// To enable premium features like World Terrain and high-res imagery:
// 1. Go to https://cesium.com/ion/signup
// 2. Create a free account 
// 3. Get your access token from https://cesium.com/ion/tokens
// 4. Uncomment the line below and add your token:
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhOTdkN2IxMi0xZWJhLTRjNjUtYjI2MC0xZTE4OTdhZmJhODciLCJpZCI6MzM5NTQ1LCJpYXQiOjE3NTczNjYwNjB9.gYZjtoAS3r9jYVAhv7N1CV2hEwyGTd39oyMgXVP3Gm4';

export const CesiumGlobe: React.FC<CesiumGlobeProps> = ({
  companies,
  onEntitySelect,
  defaultView,
  showControls = true,
  className = ''
}) => {
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const viewer = useRef<Cesium.Viewer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<GlobeEntity | null>(null);
  const entities = useRef<GlobeEntity[]>([]);

  // Initialize Cesium viewer
  useEffect(() => {
    if (!cesiumContainer.current) return;

    const initializeViewer = () => {
      try {
        // Use basic ellipsoid terrain provider (free, no token required)
        const terrainProvider = new Cesium.EllipsoidTerrainProvider();

        // Create the viewer with optimized settings for 2025
        viewer.current = new Cesium.Viewer(cesiumContainer.current, {
          // Disable default UI elements we don't need
          animation: false,
          timeline: false,
          fullscreenButton: false,
          vrButton: false,
          homeButton: false,
          sceneModePicker: false,
          baseLayerPicker: false,
          navigationHelpButton: false,
          geocoder: false,
          infoBox: false, // Disable info box that disrupts view
          selectionIndicator: false, // Disable selection indicator
          
          // Enable terrain for better visualization
          terrainProvider: terrainProvider,
          
          // Use better satellite-style imagery (ArcGIS World Imagery - free)
          imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
          }),
          
          // Performance optimizations
          requestRenderMode: true,
          maximumRenderTimeChange: Infinity,
        });

        // Configure globe appearance - disable lighting to avoid black areas
        const globe = viewer.current.scene.globe;
        globe.enableLighting = false; // Disable to avoid dark/black areas
        globe.showWaterEffect = false;
        // Use even darker blue that matches the theme better
        globe.baseColor = Cesium.Color.fromCssColorString('#0f172a').withAlpha(0.95); // Very dark slate blue
        
        // Set up better lighting
        viewer.current.scene.sun.show = false; // Hide sun to prevent shadows
        viewer.current.scene.skyBox.show = true;
        viewer.current.scene.backgroundColor = Cesium.Color.BLACK;

        // Configure camera and disable tracking
        viewer.current.scene.screenSpaceCameraController.enableCollisionDetection = false;
        viewer.current.trackedEntity = undefined; // Prevent entity tracking
        viewer.current.selectedEntity = undefined; // Clear any selection

        // Disable default entity selection behavior (prevents view disruption)
        viewer.current.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        viewer.current.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        
        // Store initial camera position to prevent unwanted movements
        const initialCameraPosition = viewer.current.camera.position.clone();
        const initialCameraDirection = viewer.current.camera.direction.clone();
        const initialCameraUp = viewer.current.camera.up.clone();
        
        // Add custom click handler that doesn't disrupt the view
        viewer.current.screenSpaceEventHandler.setInputAction((event: any) => {
          const pickedObject = viewer.current?.scene.pick(event.position);
          
          if (pickedObject && pickedObject.id && entities.current.find(e => e.id === pickedObject.id.id)) {
            const entityData = entities.current.find(e => e.id === pickedObject.id.id);
            setSelectedEntity(entityData || null);
            onEntitySelect?.(entityData || null);
            
            // Prevent any camera movement by restoring position if it changed
            setTimeout(() => {
              if (viewer.current) {
                viewer.current.camera.position = initialCameraPosition;
                viewer.current.camera.direction = initialCameraDirection;
                viewer.current.camera.up = initialCameraUp;
              }
            }, 0);
          } else {
            setSelectedEntity(null);
            onEntitySelect?.(null);
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // Add hover effects with proper Cesium property handling
        let currentlyHovered: Cesium.Entity | null = null;
        
        viewer.current.screenSpaceEventHandler.setInputAction((event: any) => {
          const pickedObject = viewer.current?.scene.pick(event.endPosition);
          
          // Clear previous hover effect
          if (currentlyHovered) {
            if (currentlyHovered.label) {
              (currentlyHovered.label.show as any) = new Cesium.ConstantProperty(false);
            }
            if (currentlyHovered.billboard) {
              (currentlyHovered.billboard.scale as any) = new Cesium.ConstantProperty(1.0);
            }
          }
          
          if (pickedObject && pickedObject.id && entities.current.find(e => e.id === pickedObject.id.id)) {
            // Show hover effect
            currentlyHovered = pickedObject.id;
            if (currentlyHovered.label) {
              (currentlyHovered.label.show as any) = new Cesium.ConstantProperty(true);
            }
            if (currentlyHovered.billboard) {
              (currentlyHovered.billboard.scale as any) = new Cesium.ConstantProperty(1.2);
            }
            
            // Change cursor
            viewer.current!.canvas.style.cursor = 'pointer';
          } else {
            currentlyHovered = null;
            viewer.current!.canvas.style.cursor = 'default';
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        setIsLoading(false);
        
      } catch (err) {
        console.error('Failed to initialize Cesium:', err);
        setError('Failed to initialize 3D globe. Please check your internet connection.');
        setIsLoading(false);
      }
    };

    // Start the initialization
    initializeViewer();

    // Cleanup
    return () => {
      if (viewer.current) {
        viewer.current.destroy();
        viewer.current = null;
      }
    };
  }, [onEntitySelect]);

  // Add entities when companies data changes
  useEffect(() => {
    if (!viewer.current || !companies.length) return;

    try {
      // Clear existing entities
      viewer.current.entities.removeAll();
      
      // Convert companies to globe entities
      entities.current = convertCompaniesToGlobeEntities(companies);
      
      // Add entities to the globe with beautiful industry-based pins
      entities.current.forEach((entity) => {
        const position = Cesium.Cartesian3.fromDegrees(
          entity.longitude,
          entity.latitude,
          0 // Height above ground
        );

        const industryColor = getIndustryColor(entity.industry);
        const marketCapColor = getMarketCapColor(entity.marketCap);
        const pinSize = 24 + (getPlantSizeScale(entity.numberOfPlants) * 8); // Dynamic size based on plants
        
        const cesiumEntity = viewer.current!.entities.add({
          id: entity.id,
          name: entity.name,
          position: position,
          
          // Beautiful billboard pin visualization
          billboard: {
            image: createIndustryPin(entity.industry, industryColor, pinSize),
            scale: 1.0,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 1.5e7, 0.5), // Scale based on distance
          },

          // Secondary point for glow effect
          point: {
            pixelSize: pinSize * 0.7,
            color: Cesium.Color.fromCssColorString(marketCapColor).withAlpha(0.3),
            outlineColor: Cesium.Color.fromCssColorString(industryColor).withAlpha(0.8),
            outlineWidth: 3,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.2, 1.5e7, 0.4),
          },

          // Enhanced label
          label: {
            text: entity.name,
            font: 'bold 14pt sans-serif',
            pixelOffset: new Cesium.Cartesian2(0, -pinSize - 10),
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            show: false, // Initially hidden, show on hover
            scale: 0.8,
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.6),
          },

          // Info box content
          description: `
            <div style="font-family: sans-serif;">
              <h3 style="margin: 0 0 10px 0; color: #333;">${entity.name}</h3>
              <p><strong>Company:</strong> ${entity.company}</p>
              <p><strong>Industry:</strong> ${entity.industry}</p>
              <p><strong>Market Cap:</strong> ${entity.marketCap}</p>
              <p><strong>Location:</strong> ${entity.location}</p>
              <p><strong>Number of Plants:</strong> ${entity.numberOfPlants}</p>
            </div>
          `
        });
      });

      // Always use optimal view based on entities for consistent behavior
      const optimalView = calculateOptimalView(entities.current);
      viewer.current.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
          optimalView.longitude,
          optimalView.latitude,
          optimalView.height
        ),
        orientation: {
          heading: 0,
          pitch: Cesium.Math.toRadians(-15), // Much less steep for better globe centering
          roll: 0,
        }
      });
      
      // Ensure the globe is properly lit and visible
      viewer.current.scene.requestRender();

    } catch (err) {
      console.error('Failed to add entities to globe:', err);
      setError('Failed to display locations on globe.');
    }
  }, [companies, defaultView]);

  // Control functions
  const zoomIn = () => {
    if (viewer.current) {
      const camera = viewer.current.camera;
      camera.zoomIn(camera.positionCartographic.height * 0.5);
    }
  };

  const zoomOut = () => {
    if (viewer.current) {
      const camera = viewer.current.camera;
      camera.zoomOut(camera.positionCartographic.height * 0.5);
    }
  };

  const resetView = () => {
    if (viewer.current && entities.current.length > 0) {
      const optimalView = calculateOptimalView(entities.current);
      viewer.current.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          optimalView.longitude,
          optimalView.latitude,
          optimalView.height
        ),
        duration: 2,
      });
    }
  };

  const goHome = () => {
    if (viewer.current) {
      viewer.current.camera.flyHome(2);
    }
  };

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Globe Loading Error</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading 3D Globe...</p>
          </div>
        </div>
      )}

      {/* Control panel */}
      {showControls && !isLoading && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <Button size="sm" variant="secondary" onClick={goHome} title="Go to world view">
            <Home className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" onClick={zoomIn} title="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" onClick={zoomOut} title="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" onClick={resetView} title="Reset to optimal view">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Enhanced Info panel */}
      {selectedEntity && (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm">
          <Card className="p-4 bg-background/95 backdrop-blur-sm border-l-4" 
                style={{ borderLeftColor: getIndustryColor(selectedEntity.industry) }}>
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-base">{selectedEntity.name}</h4>
              <button 
                onClick={() => setSelectedEntity(null)}
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
                <div 
                  className="w-3 h-3 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: getIndustryColor(selectedEntity.industry) }}
                />
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
              
              <div className="text-xs text-muted-foreground pt-2 border-t">
                <p>Coordinates: {selectedEntity.latitude.toFixed(3)}°, {selectedEntity.longitude.toFixed(3)}°</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Stats panel */}
      {!isLoading && (
        <div className="absolute top-4 left-4 z-20">
          <Badge variant="secondary">
            {entities.current.length} facilities
          </Badge>
        </div>
      )}

      {/* Compact Industry Legend */}
      {!isLoading && entities.current.length > 0 && (
        <div className="absolute top-14 left-4 z-20">
          <Card className="p-2 bg-background/90 backdrop-blur-sm max-w-48">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-xs">Legend</h4>
              <Badge variant="outline" className="text-xs px-1 py-0">
                {getUniqueIndustries(entities.current).length} types
              </Badge>
            </div>
            <div className="space-y-1">
              {getUniqueIndustries(entities.current).map((industry) => {
                const industryColor = getIndustryColor(industry);
                const stats = getIndustryStats(entities.current)[industry];
                return (
                  <div key={industry} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5">
                      <div 
                        className="w-2 h-2 rounded-full border border-white/50 shadow-sm"
                        style={{ backgroundColor: industryColor }}
                      />
                      <span className="font-medium text-xs">{industry}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">{stats.count}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Cesium container */}
      <div 
        ref={cesiumContainer} 
        className="w-full h-full min-h-[400px] rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};
