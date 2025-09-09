# Google Earth Engine Integration - Design Specifications

## 🎯 Project Overview
Integrate Google Earth Engine's satellite data analysis into our environmental footprint atlas, showing reference areas and similar regions with comprehensive environmental data.

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React + TypeScript
- **Map Engine**: Google Earth Engine JavaScript API (ee.js)
- **Base Map**: Google Maps JavaScript API
- **Authentication**: GEE Service Account (Project: tum-cdtm25mun-8787)
- **Data Flow**: Client-side GEE API calls → Real-time analysis → Display

### Layout Design
```
┌─────────────────────────────────────────────────────────────┐
│                     Environmental Analysis                  │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│         MAP VIEW         │        ANALYSIS DATA             │
│        (50% width)       │        (50% width)               │
│                          │                                  │
│  ┌─────────────────┐     │  ┌─────────────────────────────┐  │
│  │   Reference     │     │  │    Selected Area Info       │  │
│  │   Area (Red)    │     │  │                             │  │
│  └─────────────────┘     │  │  • NDVI: 0.65 ± 0.12        │  │
│                          │  │  • Elevation: 245m ± 45m    │  │
│  ┌───┐ ┌───┐ ┌───┐       │  │  • Slope: 5.2° ± 2.1°       │  │
│  │ G │ │ G │ │ G │       │  │  • Land Cover Diversity: 4  │  │
│  └───┘ └───┘ └───┘       │  │  • Similarity Score: 0.87   │  │
│  Similar Areas (Green)   │  │                             │  │
│                          │  │  [Interactive Charts]       │  │
│                          │  └─────────────────────────────┘  │
└──────────────────────────┴──────────────────────────────────┘
```

## 🔧 Technical Implementation

### 1. GEE Component Structure
```typescript
interface GEEAnalysisProps {
  referenceArea?: {
    coordinates: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
    name?: string;
  };
  onAreaSelect: (areaData: GEEAreaData) => void;
}

interface GEEAreaData {
  id: string;
  geometry: ee.Geometry.Rectangle;
  features: {
    ndvi_mean: number;
    ndvi_std: number;
    elevation_mean: number;
    elevation_std: number;
    slope_mean: number;
    slope_std: number;
    landcover_diversity: number;
    // ... other features from your script
  };
  similarityScore?: number;
  type: 'reference' | 'similar';
}
```

### 2. User Interaction Flow
1. **Page Load**: Show default reference area (from your script: Mitteldeutschland)
2. **Auto Analysis**: Trigger similarity search, display green bordered areas
3. **Click Interaction**: User clicks on any bordered area (red reference OR green similar)
4. **Data Display**: Right panel shows detailed analysis for clicked area
5. **Real-time**: All analysis happens via live GEE API calls

### 3. GEE JavaScript API Integration
```javascript
// Authentication
ee.initialize({
  project: 'tum-cdtm25mun-8787',
  // Service account credentials
});

// Core functions from your script:
// 1. extractComprehensiveFeatures(geometry)
// 2. generateIntelligentCandidates(refRect, searchConfig)  
// 3. calculateVectorSimilarity(refFeatures, candFeatures, weights)
```

## 📊 Data Display Components

### Right Panel Sections
1. **Area Overview**
   - Name/Location
   - Area size
   - Coordinates
   - Analysis date

2. **Environmental Features**
   - NDVI (Vegetation Index)
   - Elevation statistics
   - Slope analysis
   - Land cover diversity

3. **Similarity Analysis** (for green areas only)
   - Similarity score vs reference
   - Feature comparison charts
   - Difference metrics

4. **Interactive Visualizations**
   - Time-series charts (NDVI over time)
   - Feature comparison radar chart
   - Satellite imagery preview

## 🎨 Visual Design

### Map Styling
- **Reference Area**: Thick red border, semi-transparent red fill
- **Similar Areas**: Thick green border, semi-transparent green fill
- **Base Map**: Satellite imagery (Google Earth style)
- **Hover Effects**: Highlight border, show tooltip with similarity score

### Data Panel Styling
- **Cards**: Use existing shadcn/ui Card components
- **Charts**: Recharts library for consistency
- **Colors**: Match existing environmental theme (blues/greens)
- **Typography**: Consistent with current design system

## 🔗 Integration Points

### Existing Codebase
- **Replace**: Mock analysis data with real GEE analysis
- **Keep**: Company data, navigation, overall layout structure
- **Enhance**: Add GEE analysis as new section in Dashboard

### File Structure
```
src/
├── components/
│   ├── gee/
│   │   ├── GEEAnalysisMap.tsx     // Main map component
│   │   ├── GEEDataPanel.tsx       // Right panel data display
│   │   ├── GEEAreaCard.tsx        // Individual area info card
│   │   └── GEECharts.tsx          // Analysis charts
│   └── ...
├── lib/
│   ├── gee/
│   │   ├── auth.ts                // GEE authentication
│   │   ├── analysis.ts            // Core analysis functions
│   │   └── types.ts               // GEE data types
│   └── ...
```

## 🚀 Implementation Phases

### Phase 1: Foundation
- [ ] Set up GEE authentication
- [ ] Create basic map component with Google Maps API
- [ ] Implement area rendering (rectangles with borders)

### Phase 2: Core Analysis
- [ ] Port your GEE JavaScript functions to component
- [ ] Implement feature extraction for areas
- [ ] Add similarity calculation algorithm

### Phase 3: Interaction & Data
- [ ] Add click handlers for area selection
- [ ] Create data panel with area information
- [ ] Implement real-time analysis pipeline

### Phase 4: Polish & Enhancement
- [ ] Add interactive charts and visualizations
- [ ] Optimize performance and error handling
- [ ] Add loading states and user feedback

## 📝 Notes
- All analysis happens client-side using GEE JavaScript API
- Focus on areas and similarity analysis (skip weather module initially)
- Use service account authentication for simplicity
- Maintain existing company data structure
- Integrate seamlessly with current dashboard design
