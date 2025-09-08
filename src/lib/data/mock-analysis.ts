import { PatchData, AnalysisMetric, CompanyAnalysis, TimeSeriesDataPoint } from '../types/analysis'

export function generateMockTimeSeriesData(
  startDate: Date,
  endDate: Date,
  baseValue: number,
  volatility = 0.1
): TimeSeriesDataPoint[] {
  const data: TimeSeriesDataPoint[] = []
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const interval = Math.max(1, Math.floor(totalDays / 24)) // 24 data points max
  
  for (let i = 0; i <= totalDays; i += interval) {
    const currentDate = new Date(startDate.getTime() + i * 1000 * 60 * 60 * 24)
    const progress = i / totalDays
    
    // Create different trends for each data series
    const mainValue = baseValue + (Math.sin(progress * Math.PI * 2) * volatility * baseValue) + (Math.random() - 0.5) * volatility * baseValue
    const ref1Value = baseValue * 0.95 + (Math.cos(progress * Math.PI * 2) * volatility * baseValue * 0.8) + (Math.random() - 0.5) * volatility * baseValue
    const ref2Value = baseValue * 1.05 + (Math.sin(progress * Math.PI * 1.5) * volatility * baseValue * 0.9) + (Math.random() - 0.5) * volatility * baseValue
    const ref3Value = baseValue * 0.98 + (Math.cos(progress * Math.PI * 1.8) * volatility * baseValue * 0.7) + (Math.random() - 0.5) * volatility * baseValue
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      mainPatch: Math.max(0, mainValue),
      reference1: Math.max(0, ref1Value),
      reference2: Math.max(0, ref2Value),
      reference3: Math.max(0, ref3Value),
      timestamp: currentDate.getTime()
    })
  }
  
  return data
}

export function generateMockPatchData(companyId: string): PatchData[] {
  const patches: PatchData[] = [
    // Main patch
    {
      id: `${companyId}-main`,
      type: 'main',
      name: 'Primary Operational Site',
      coordinates: {
        lat: 40.7128 + (Math.random() - 0.5) * 2,
        lng: -74.0060 + (Math.random() - 0.5) * 2
      },
      analysisDate: '2024-01-15',
      size: 2500 + Math.random() * 1000,
      country: 'United States'
    },
    // Reference patches
    {
      id: `${companyId}-ref1`,
      type: 'reference',
      name: 'Reference Site Alpha',
      coordinates: {
        lat: 41.8781 + (Math.random() - 0.5) * 2,
        lng: -87.6298 + (Math.random() - 0.5) * 2
      },
      similarityScore: 96,
      analysisDate: '2024-01-15',
      size: 2300 + Math.random() * 800,
      country: 'United States'
    },
    {
      id: `${companyId}-ref2`,
      type: 'reference',
      name: 'Reference Site Beta',
      coordinates: {
        lat: 34.0522 + (Math.random() - 0.5) * 2,
        lng: -118.2437 + (Math.random() - 0.5) * 2
      },
      similarityScore: 94,
      analysisDate: '2024-01-15',
      size: 2700 + Math.random() * 600,
      country: 'United States'
    },
    {
      id: `${companyId}-ref3`,
      type: 'reference',
      name: 'Reference Site Gamma',
      coordinates: {
        lat: 29.7604 + (Math.random() - 0.5) * 2,
        lng: -95.3698 + (Math.random() - 0.5) * 2
      },
      similarityScore: 92,
      analysisDate: '2024-01-15',
      size: 2400 + Math.random() * 700,
      country: 'United States'
    }
  ]
  
  return patches
}

export function generateMockAnalysisMetrics(): AnalysisMetric[] {
  const now = new Date()
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  
  const metrics: AnalysisMetric[] = [
    {
      id: 'deforestation',
      name: 'Deforestation Rate',
      description: 'Forest cover loss over time measured in hectares per month',
      unit: 'hectares',
      chartType: 'area',
      color: '#ef4444',
      data: generateMockTimeSeriesData(oneYearAgo, now, 50, 0.3),
      trend: {
        direction: 'down',
        percentage: 15,
        period: 'last 6 months'
      },
      currentValue: 42,
      previousValue: 58
    },
    {
      id: 'ndvi',
      name: 'Vegetation Index (NDVI)',
      description: 'Normalized Difference Vegetation Index measuring vegetation health',
      unit: 'index',
      chartType: 'line',
      color: '#22c55e',
      data: generateMockTimeSeriesData(oneYearAgo, now, 0.65, 0.15),
      trend: {
        direction: 'up',
        percentage: 8,
        period: 'last 3 months'
      },
      currentValue: 0.72,
      previousValue: 0.67
    },
    {
      id: 'water-bodies',
      name: 'Water Body Changes',
      description: 'Surface water area changes measured in square kilometers',
      unit: 'km²',
      chartType: 'bar',
      color: '#3b82f6',
      data: generateMockTimeSeriesData(oneYearAgo, now, 15.5, 0.2),
      trend: {
        direction: 'stable',
        percentage: 2,
        period: 'last 12 months'
      },
      currentValue: 15.8,
      previousValue: 15.5
    },
    {
      id: 'land-cover',
      name: 'Land Cover Shifts',
      description: 'Changes in land use categories over time',
      unit: 'percentage',
      chartType: 'stackedArea',
      color: '#f59e0b',
      data: generateMockTimeSeriesData(oneYearAgo, now, 78, 0.1),
      trend: {
        direction: 'down',
        percentage: 5,
        period: 'last 8 months'
      },
      currentValue: 74,
      previousValue: 78
    },
    {
      id: 'air-quality',
      name: 'Air Quality Index',
      description: 'Combined air quality measurements including PM2.5, NO2, and O3',
      unit: 'AQI',
      chartType: 'combination',
      color: '#8b5cf6',
      data: generateMockTimeSeriesData(oneYearAgo, now, 85, 0.25),
      trend: {
        direction: 'up',
        percentage: 12,
        period: 'last 4 months'
      },
      currentValue: 95,
      previousValue: 85
    }
  ]
  
  return metrics
}

export function generateMockCompanyAnalysis(companyId: string): CompanyAnalysis {
  const patches = generateMockPatchData(companyId)
  const metrics = generateMockAnalysisMetrics()
  
  return {
    companyId,
    mainPatch: patches[0],
    referencePatches: patches.slice(1),
    metrics,
    lastUpdated: new Date().toISOString(),
    timeRange: {
      start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  }
}

export const TIME_RANGE_PRESETS = [
  {
    label: 'Last 3 months',
    range: [
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date()
    ] as [Date, Date]
  },
  {
    label: 'Last 6 months', 
    range: [
      new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      new Date()
    ] as [Date, Date]
  },
  {
    label: 'Last year',
    range: [
      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      new Date()
    ] as [Date, Date]
  },
  {
    label: 'Last 2 years',
    range: [
      new Date(Date.now() - 730 * 24 * 60 * 60 * 1000),
      new Date()
    ] as [Date, Date]
  }
]