export interface ReportData {
  company: {
    id: string;
    name: string;
    industry: string;
    analysisDate: string;
  };
  redAreas: AreaAnalysis[];
  greenAreas: AreaAnalysis[];
  comparisonMetrics: ComparisonMetrics;
  metadata: ReportMetadata;
}

export interface AreaAnalysis {
  id: string;
  name: string;
  type: 'operational' | 'similar';
  coordinates: [number, number, number, number]; // [tlx, tly, brx, bry]
  location: string;
  environmentalData: {
    // Vegetation indices
    ndvi: {
      mean: number;
      std: number;
      interpretation: 'healthy' | 'moderate' | 'poor';
    };
    ndwi: {
      mean: number;
      std: number;
      interpretation: 'high_water' | 'moderate_water' | 'low_water';
    };
    ndbi: {
      mean: number;
      std: number;
      interpretation: 'urban' | 'mixed' | 'natural';
    };
    
    // Topographic data
    elevation: {
      mean: number;
      std: number;
      min: number;
      max: number;
    };
    slope: {
      mean: number;
      std: number;
      interpretation: 'flat' | 'gentle' | 'steep';
    };
    
    // Climate data
    temperature: {
      mean: number;
      std: number;
      seasonal_variation: number;
    };
    precipitation: {
      annual: number;
      seasonal_distribution: number[];
    };
    humidity: {
      mean: number;
      std: number;
    };
    
    // Land cover
    landCover: {
      forest_percentage: number;
      urban_percentage: number;
      agriculture_percentage: number;
      water_percentage: number;
      barren_percentage: number;
      diversity_index: number;
    };
    
    // Environmental change indicators
    deforestation_rate: number;
    urban_expansion_rate: number;
    water_body_changes: number;
    
    // Environmental stress indicators
    drought_risk: 'low' | 'medium' | 'high';
    flood_risk: 'low' | 'medium' | 'high';
    erosion_risk: 'low' | 'medium' | 'high';
  };
  similarityScore?: number; // Only for green areas
  timeSeriesData: TimeSeriesDataPoint[];
}

export interface ComparisonMetrics {
  similarities: {
    topographic_similarity: number;
    vegetation_similarity: number;
    climate_similarity: number;
    land_use_similarity: number;
    overall_similarity: number;
  };
  differences: {
    key_differences: KeyDifference[];
    statistical_significance: StatisticalTest[];
  };
  environmental_impact_assessment: {
    current_impact_level: 'low' | 'medium' | 'high' | 'severe';
    potential_risks: string[];
    mitigation_opportunities: string[];
  };
}

export interface KeyDifference {
  metric: string;
  red_area_value: number;
  green_area_average: number;
  difference_percentage: number;
  significance: 'low' | 'medium' | 'high';
  interpretation: string;
}

export interface StatisticalTest {
  metric: string;
  test_type: 'anova' | 't_test' | 'kruskal_wallis';
  p_value: number;
  significant: boolean;
  effect_size: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  timestamp: number;
  red_area_value: number;
  green_areas_average: number;
  green_areas_std: number;
}

export interface ReportMetadata {
  generation_timestamp: string;
  data_sources: string[];
  analysis_methods: string[];
  confidence_level: number;
  spatial_resolution: string;
  temporal_coverage: {
    start_date: string;
    end_date: string;
  };
  quality_indicators: {
    data_completeness: number;
    cloud_coverage: number;
    spatial_accuracy: number;
  };
}

export interface ReportRequest {
  companyId: string;
  reportType: 'comprehensive' | 'summary' | 'technical';
  includeVisualizations: boolean;
  includeRecommendations: boolean;
  customPrompt?: string;
}

export interface ReportResponse {
  reportId: string;
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
  preview?: string;
  error?: string;
  estimatedCompletionTime?: number;
}

export interface GeminiReportPrompt {
  systemPrompt: string;
  dataContext: string;
  analysisInstructions: string;
  visualizationRequirements: string;
  outputFormat: string;
}
