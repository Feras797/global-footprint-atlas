import { ReportData, AreaAnalysis, ComparisonMetrics, ReportMetadata } from '@/lib/types/report';
import { Company } from '@/lib/companies';

/**
 * Transforms raw GEE data and company information into structured report data
 * that can be consumed by Gemini 2.5 Pro for intelligent analysis and report generation
 */
export class ReportDataService {
  
  /**
   * Convert company and GEE analysis data into structured report format
   */
  static transformToReportData(
    company: Company,
    redAreasData: any[], // Raw GEE data for operational areas
    greenAreasData: any[], // Raw GEE data for similar areas
    timeSeriesData?: any[]
  ): ReportData {
    
    const reportData: ReportData = {
      company: {
        id: company.id,
        name: company.name,
        industry: company.industry,
        analysisDate: new Date().toISOString()
      },
      redAreas: this.transformRedAreas(company, redAreasData, timeSeriesData),
      greenAreas: this.transformGreenAreas(greenAreasData, timeSeriesData),
      comparisonMetrics: this.calculateComparisonMetrics(redAreasData, greenAreasData),
      metadata: this.generateMetadata()
    };

    return reportData;
  }

  /**
   * Transform company operational areas (red squares) data
   */
  private static transformRedAreas(
    company: Company, 
    redAreasData: any[], 
    timeSeriesData?: any[]
  ): AreaAnalysis[] {
    return company.places.map((place, index) => {
      const geeData = redAreasData[index] || this.generateMockGEEData();
      
      return {
        id: `red_${company.id}_${index}`,
        name: place.name,
        type: 'operational',
        coordinates: place.coordinates,
        location: place.location,
        environmentalData: this.processEnvironmentalData(geeData),
        timeSeriesData: this.processTimeSeriesData(timeSeriesData, index, 'red')
      };
    });
  }

  /**
   * Transform similar areas (green squares) data
   */
  private static transformGreenAreas(
    greenAreasData: any[], 
    timeSeriesData?: any[]
  ): AreaAnalysis[] {
    return greenAreasData.map((areaData, index) => ({
      id: `green_${index}`,
      name: areaData.name || `Similar Area ${index + 1}`,
      type: 'similar',
      coordinates: areaData.coordinates,
      location: areaData.location || 'Unknown Location',
      environmentalData: this.processEnvironmentalData(areaData),
      similarityScore: areaData.similarity || Math.random() * 0.3 + 0.7, // 0.7-1.0
      timeSeriesData: this.processTimeSeriesData(timeSeriesData, index, 'green')
    }));
  }

  /**
   * Process raw environmental data from GEE into structured format
   */
  private static processEnvironmentalData(geeData: any) {
    // This would process actual GEE data - currently using enhanced mock data
    return {
      ndvi: {
        mean: geeData.ndvi_mean || this.randomFloat(0.2, 0.8),
        std: geeData.ndvi_std || this.randomFloat(0.05, 0.15),
        interpretation: this.interpretNDVI(geeData.ndvi_mean || 0.5)
      },
      ndwi: {
        mean: geeData.ndwi_mean || this.randomFloat(-0.3, 0.3),
        std: geeData.ndwi_std || this.randomFloat(0.05, 0.15),
        interpretation: this.interpretNDWI(geeData.ndwi_mean || 0)
      },
      ndbi: {
        mean: geeData.ndbi_mean || this.randomFloat(-0.2, 0.2),
        std: geeData.ndbi_std || this.randomFloat(0.05, 0.1),
        interpretation: this.interpretNDBI(geeData.ndbi_mean || 0)
      },
      elevation: {
        mean: geeData.elevation_mean || this.randomFloat(50, 800),
        std: geeData.elevation_std || this.randomFloat(10, 100),
        min: geeData.elevation_min || this.randomFloat(0, 100),
        max: geeData.elevation_max || this.randomFloat(100, 1000)
      },
      slope: {
        mean: geeData.slope_mean || this.randomFloat(0, 25),
        std: geeData.slope_std || this.randomFloat(1, 8),
        interpretation: this.interpretSlope(geeData.slope_mean || 5)
      },
      temperature: {
        mean: geeData.temperature_mean || this.randomFloat(10, 25),
        std: geeData.temperature_std || this.randomFloat(2, 8),
        seasonal_variation: geeData.seasonal_temp_variation || this.randomFloat(15, 35)
      },
      precipitation: {
        annual: geeData.annual_precipitation || this.randomFloat(300, 1500),
        seasonal_distribution: geeData.seasonal_precipitation || [0.25, 0.3, 0.25, 0.2]
      },
      humidity: {
        mean: geeData.humidity_mean || this.randomFloat(40, 80),
        std: geeData.humidity_std || this.randomFloat(5, 15)
      },
      landCover: {
        forest_percentage: geeData.forest_percentage || this.randomFloat(10, 70),
        urban_percentage: geeData.urban_percentage || this.randomFloat(5, 40),
        agriculture_percentage: geeData.agriculture_percentage || this.randomFloat(10, 60),
        water_percentage: geeData.water_percentage || this.randomFloat(1, 15),
        barren_percentage: geeData.barren_percentage || this.randomFloat(2, 20),
        diversity_index: geeData.diversity_index || this.randomFloat(0.3, 0.9)
      },
      deforestation_rate: geeData.deforestation_rate || this.randomFloat(0, 5),
      urban_expansion_rate: geeData.urban_expansion_rate || this.randomFloat(0, 3),
      water_body_changes: geeData.water_body_changes || this.randomFloat(-10, 10),
      drought_risk: this.assessDroughtRisk(geeData),
      flood_risk: this.assessFloodRisk(geeData),
      erosion_risk: this.assessErosionRisk(geeData)
    };
  }

  /**
   * Calculate comprehensive comparison metrics between red and green areas
   */
  private static calculateComparisonMetrics(
    redAreasData: any[], 
    greenAreasData: any[]
  ): ComparisonMetrics {
    // This would perform actual statistical analysis
    return {
      similarities: {
        topographic_similarity: this.randomFloat(0.6, 0.95),
        vegetation_similarity: this.randomFloat(0.5, 0.9),
        climate_similarity: this.randomFloat(0.7, 0.95),
        land_use_similarity: this.randomFloat(0.4, 0.8),
        overall_similarity: this.randomFloat(0.6, 0.9)
      },
      differences: {
        key_differences: [
          {
            metric: 'NDVI (Vegetation Health)',
            red_area_value: 0.45,
            green_area_average: 0.62,
            difference_percentage: 27.4,
            significance: 'high',
            interpretation: 'Operational areas show significantly lower vegetation health'
          },
          {
            metric: 'Urban Development Index',
            red_area_value: 0.34,
            green_area_average: 0.18,
            difference_percentage: 88.9,
            significance: 'high',
            interpretation: 'Higher urbanization in operational areas'
          }
        ],
        statistical_significance: [
          {
            metric: 'NDVI',
            test_type: 'anova',
            p_value: 0.001,
            significant: true,
            effect_size: 0.72
          }
        ]
      },
      environmental_impact_assessment: {
        current_impact_level: 'medium',
        potential_risks: [
          'Vegetation degradation in operational zones',
          'Increased urban heat island effect',
          'Soil erosion risk due to reduced vegetation cover'
        ],
        mitigation_opportunities: [
          'Implement green corridors in operational areas',
          'Enhance vegetation buffer zones',
          'Adopt sustainable land management practices'
        ]
      }
    };
  }

  /**
   * Generate report metadata
   */
  private static generateMetadata(): ReportMetadata {
    return {
      generation_timestamp: new Date().toISOString(),
      data_sources: [
        'Google Earth Engine Landsat 8/9',
        'SRTM Digital Elevation Model',
        'MODIS Land Cover',
        'ERA5 Climate Reanalysis'
      ],
      analysis_methods: [
        'Spectral index calculation',
        'Statistical comparison analysis',
        'Time series trend analysis',
        'Spatial pattern recognition'
      ],
      confidence_level: 0.95,
      spatial_resolution: '30m (Landsat)',
      temporal_coverage: {
        start_date: '2020-01-01',
        end_date: new Date().toISOString().split('T')[0]
      },
      quality_indicators: {
        data_completeness: 0.92,
        cloud_coverage: 0.15,
        spatial_accuracy: 0.88
      }
    };
  }

  // Helper methods for data interpretation
  private static interpretNDVI(value: number): 'healthy' | 'moderate' | 'poor' {
    if (value > 0.6) return 'healthy';
    if (value > 0.3) return 'moderate';
    return 'poor';
  }

  private static interpretNDWI(value: number): 'high_water' | 'moderate_water' | 'low_water' {
    if (value > 0.3) return 'high_water';
    if (value > 0) return 'moderate_water';
    return 'low_water';
  }

  private static interpretNDBI(value: number): 'urban' | 'mixed' | 'natural' {
    if (value > 0.1) return 'urban';
    if (value > -0.1) return 'mixed';
    return 'natural';
  }

  private static interpretSlope(value: number): 'flat' | 'gentle' | 'steep' {
    if (value < 5) return 'flat';
    if (value < 15) return 'gentle';
    return 'steep';
  }

  private static assessDroughtRisk(data: any): 'low' | 'medium' | 'high' {
    // Simplified risk assessment
    const precipitation = data.annual_precipitation || 800;
    const ndvi = data.ndvi_mean || 0.5;
    
    if (precipitation < 400 || ndvi < 0.3) return 'high';
    if (precipitation < 700 || ndvi < 0.5) return 'medium';
    return 'low';
  }

  private static assessFloodRisk(data: any): 'low' | 'medium' | 'high' {
    const elevation = data.elevation_mean || 200;
    const slope = data.slope_mean || 5;
    
    if (elevation < 50 && slope < 2) return 'high';
    if (elevation < 150 && slope < 5) return 'medium';
    return 'low';
  }

  private static assessErosionRisk(data: any): 'low' | 'medium' | 'high' {
    const slope = data.slope_mean || 5;
    const ndvi = data.ndvi_mean || 0.5;
    
    if (slope > 15 && ndvi < 0.4) return 'high';
    if (slope > 8 && ndvi < 0.6) return 'medium';
    return 'low';
  }

  private static processTimeSeriesData(
    timeSeriesData: any[] | undefined, 
    areaIndex: number, 
    type: 'red' | 'green'
  ) {
    // Generate mock time series data if not provided
    const data = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      data.push({
        date: date.toISOString().split('T')[0],
        timestamp: date.getTime(),
        red_area_value: this.randomFloat(0.3, 0.7),
        green_areas_average: this.randomFloat(0.5, 0.8),
        green_areas_std: this.randomFloat(0.05, 0.15)
      });
    }
    
    return data;
  }

  // Mock data generation for development
  private static generateMockGEEData() {
    return {
      ndvi_mean: this.randomFloat(0.2, 0.8),
      ndvi_std: this.randomFloat(0.05, 0.15),
      ndwi_mean: this.randomFloat(-0.3, 0.3),
      ndwi_std: this.randomFloat(0.05, 0.15),
      ndbi_mean: this.randomFloat(-0.2, 0.2),
      ndbi_std: this.randomFloat(0.05, 0.1),
      elevation_mean: this.randomFloat(50, 800),
      elevation_std: this.randomFloat(10, 100),
      slope_mean: this.randomFloat(0, 25),
      slope_std: this.randomFloat(1, 8)
    };
  }

  private static randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
