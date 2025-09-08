# Enhanced Company Analysis View Implementation Plan

## Project Context
This plan outlines the enhancement of the company analysis page for the Global Footprint Atlas environmental monitoring platform. The current implementation provides basic company information and placeholder analysis tiles. We need to transform it into a comprehensive, interactive analysis dashboard.

## Technical Stack
- **Framework**: Vite + React 18 + TypeScript
- **Routing**: React Router DOM v6
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Charts**: Recharts v2.15.4
- **Animations**: Framer Motion v12
- **Icons**: Lucide React

## Current State Analysis
The current Company.tsx page (`/src/pages/Company.tsx`) includes:
- Basic header with company name and back navigation
- Simple patches section showing main patch + 3 reference patches
- Placeholder analysis tiles with "coming soon" messages
- Uses existing Company type from `/src/lib/companies.ts`

## Implementation Plan

### 1. Type Definitions & Data Structure
**File**: `/src/lib/types/analysis.ts`

Create comprehensive TypeScript interfaces for:
- `PatchData` - satellite imagery, coordinates, analysis metadata
- `AnalysisMetric` - different environmental metrics
- `TimeSeriesData` - temporal data points for charts
- `CompanyAnalysis` - complete analysis data structure

**Implementation Requirements**:
- Include proper type definitions for chart data compatibility with Recharts
- Support for multiple time ranges (daily, monthly, yearly)
- Environmental metrics: deforestation, NDVI, water bodies, soil cover, air quality
- Patch similarity scoring system
- Mock data generators with realistic environmental trends

### 2. Reusable Components

#### 2.1 PatchCard Component
**File**: `/src/components/company/patch-card.tsx`

**Features**:
- Responsive design (2 columns for main patch, 1 column for reference patches)
- Patch type badges (Main/Reference) with appropriate styling
- Similarity scores for reference patches (e.g., "95% similar")
- Location coordinates and analysis dates
- Mock satellite imagery placeholder with proper aspect ratios
- Interactive hover effects and loading states
- Accessibility: keyboard navigation, ARIA labels, screen reader support

**Technical Implementation**:
- Use shadcn Card, Badge components
- Implement with forwardRef for proper ref handling
- Memoization for performance optimization
- Support for different sizes (main vs reference)

#### 2.2 AnalysisChart Component
**File**: `/src/components/company/analysis-chart.tsx`

**Chart Types to Implement**:
- **Deforestation Over Time**: Area chart showing forest loss progression
- **Vegetation Index (NDVI)**: Line chart comparing main vs reference patches
- **Water Body Changes**: Bar chart showing water coverage changes
- **Soil/Land Cover Shifts**: Stacked area chart for different land types
- **Air Quality/Emissions**: Combination chart with multiple metrics

**Technical Requirements**:
- Use Recharts library with proper TypeScript typing
- Responsive design with mobile-optimized legends
- Interactive tooltips showing detailed data points
- Consistent color scheme aligned with app design
- Trend indicators (up/down arrows with percentages)
- Export functionality placeholder
- Loading states and error boundaries

**Accessibility Requirements**:
- Proper ARIA labels for chart elements
- Color-blind friendly color schemes
- Keyboard navigation for interactive elements
- Alternative text descriptions for screen readers

#### 2.3 TimeSlider Component
**File**: `/src/components/company/time-slider.tsx`

**Features**:
- Horizontal slider for time range selection
- Draggable handles for start/end dates
- Display current selected time range
- Preset time range buttons (1Y, 3Y, 5Y, All)
- Smooth animations during range changes
- Integration hooks for chart updates

**Technical Implementation**:
- Use shadcn Slider component as base
- Custom styling for environmental theme
- useCallback for performance optimization
- Debounced updates to prevent excessive re-renders

### 3. Enhanced Company Page
**File**: `/src/pages/Company.tsx` (Major Enhancement)

#### 3.1 Layout Structure
```
- Header (company info + breadcrumbs + back navigation)
- Main Content Area
  - Side Panel (analysis controls)
  - Content Area
    - Enhanced Patches Section
    - Comprehensive Analysis Section
    - Interactive Time Controls
```

#### 3.2 Side Panel Controls
- Metric selection dropdown (deforestation, NDVI, water, soil, air quality)
- View options (chart type, comparison mode)
- Time range presets
- Export functionality
- Filter options for data granularity

#### 3.3 Enhanced Features
- **Responsive Design**: Mobile-first approach with collapsible side panel
- **Loading States**: Skeleton loaders for all sections
- **Smooth Transitions**: Framer Motion animations between states
- **Breadcrumb Navigation**: Show company → analysis navigation path
- **Error Handling**: Graceful error states with retry functionality
- **Performance**: Lazy loading for charts, memoization for expensive operations

### 4. Mock Data Generation
**File**: `/src/lib/data/mock-analysis.ts`

**Data Requirements**:
- Realistic environmental trend patterns
- Seasonal variations in data
- Correlation between different metrics
- Proper time series data for 5-year history
- Patch comparison data showing meaningful differences
- Multiple companies with varied impact profiles

**Data Generation Functions**:
- `generateTimeSeriesData(metric, timeRange, trend)`
- `generatePatchComparisonData(mainPatch, referencePatches)`
- `generateCompanyAnalysis(companyId)`
- `simulateSeasonalPatterns(baseData, intensity)`

### 5. UI/UX Enhancements

#### 5.1 Design System Compliance
- Use existing shadcn/ui components: Card, Badge, Button, Separator, Select, Slider, Tabs
- Maintain consistent spacing using Tailwind utilities
- Follow existing color scheme and typography
- Implement proper loading and error states

#### 5.2 Responsive Design
- Mobile: Single column layout, collapsible side panel
- Tablet: Adjusted grid for patches, responsive charts
- Desktop: Full multi-column layout with side panel

#### 5.3 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- Screen reader optimization
- High contrast mode support
- Focus management and proper tab order

### 6. Integration Points

#### 6.1 Existing Codebase Integration
- Maintain compatibility with existing Company type from `/src/lib/companies.ts`
- Use existing utility functions from `/src/lib/utils.ts`
- Follow existing component patterns from `/src/components/company/`

#### 6.2 State Management
- Local state for UI controls (time range, selected metrics)
- React Query for data fetching simulation
- Context for sharing analysis state between components

### 7. Performance Optimization

#### 7.1 Component Optimization
- React.memo for pure components
- useCallback for event handlers
- useMemo for expensive calculations
- Lazy loading for chart components

#### 7.2 Bundle Optimization
- Dynamic imports for chart library
- Code splitting for analysis components
- Optimized re-renders using React DevTools profiling

### 8. File Structure
```
src/
├── lib/
│   ├── types/
│   │   └── analysis.ts (new)
│   └── data/
│       └── mock-analysis.ts (new)
├── components/
│   └── company/
│       ├── patch-card.tsx (new)
│       ├── analysis-chart.tsx (new)
│       ├── time-slider.tsx (new)
│       └── index.ts (update exports)
└── pages/
    └── Company.tsx (major enhancement)
```

### 9. Implementation Phases

#### Phase 1: Foundation
1. Create TypeScript interfaces and mock data generators
2. Implement basic PatchCard component
3. Set up TimeSlider component structure

#### Phase 2: Visualization
1. Implement AnalysisChart component with all chart types
2. Integrate Recharts with proper typing and styling
3. Add interactive features and tooltips

#### Phase 3: Integration
1. Enhance main Company page with new components
2. Implement side panel and responsive layout
3. Add loading states and error handling

#### Phase 4: Polish
1. Implement animations and micro-interactions
2. Optimize performance and accessibility
3. Add comprehensive error boundaries

### 10. Code Quality Requirements

#### 10.1 TypeScript Standards
- Strict type checking enabled
- Proper interface definitions for all data structures
- Generic types for reusable components
- No `any` types allowed

#### 10.2 Component Standards
- Functional components with proper prop types
- forwardRef for components that need ref access
- Proper error boundaries for chart components
- Consistent naming conventions (PascalCase for components)

#### 10.3 Styling Standards
- Use Tailwind utilities for layout and spacing
- shadcn/ui components for consistency
- Mobile-first responsive approach
- Consistent color scheme and typography

### 11. Testing Considerations
- Component unit tests for all new components
- Integration tests for data flow
- Accessibility testing with screen readers
- Performance testing for chart rendering
- Responsive design testing across devices

### 12. Future Extensibility
- Plugin architecture for additional chart types
- Configurable metric definitions
- Custom time range selections
- Export functionality for reports
- Real API integration preparation

## Success Criteria
1. **Visual Excellence**: Modern, professional UI that matches environmental monitoring context
2. **Performance**: Smooth interactions, fast chart rendering, optimized bundle size
3. **Accessibility**: WCAG 2.1 AA compliant with keyboard and screen reader support
4. **Responsiveness**: Seamless experience across all device sizes
5. **Code Quality**: Well-typed, maintainable, and extensible codebase
6. **User Experience**: Intuitive navigation, clear data visualization, meaningful interactions

## Package Dependencies
All required dependencies are already available in the project:
- `recharts`: Chart library for data visualization
- `framer-motion`: Animation library for smooth transitions
- `@radix-ui/*`: Component primitives for shadcn/ui
- `lucide-react`: Icon library for UI elements
- `date-fns`: Date manipulation for time controls

## Next Steps
1. Review and approve this implementation plan
2. Begin Phase 1 implementation with type definitions and mock data
3. Iteratively build and test each component
4. Integrate components into the main Company page
5. Perform comprehensive testing and optimization

This plan ensures a comprehensive enhancement of the company analysis view while maintaining code quality, accessibility, and performance standards.