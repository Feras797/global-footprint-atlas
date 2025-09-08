export interface PatchData {
  id: string
  type: 'main' | 'reference'
  name: string
  coordinates: {
    lat: number
    lng: number
  }
  similarityScore?: number
  analysisDate: string
  size: number
  country: string
  imageUrl?: string
}

export interface TimeSeriesDataPoint {
  date: string
  mainPatch: number
  reference1: number
  reference2: number
  reference3: number
  timestamp: number
}

export interface AnalysisMetric {
  id: string
  name: string
  description: string
  unit: string
  chartType: 'area' | 'line' | 'bar' | 'stackedArea' | 'combination'
  color: string
  data: TimeSeriesDataPoint[]
  trend: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
    period: string
  }
  currentValue: number
  previousValue: number
}

export interface CompanyAnalysis {
  companyId: string
  mainPatch: PatchData
  referencePatches: PatchData[]
  metrics: AnalysisMetric[]
  lastUpdated: string
  timeRange: {
    start: string
    end: string
  }
}

export interface TimeSliderProps {
  minDate: Date
  maxDate: Date
  selectedRange: [Date, Date]
  onRangeChange: (range: [Date, Date]) => void
  presetRanges?: Array<{
    label: string
    range: [Date, Date]
  }>
}

export interface AnalysisChartProps {
  metric: AnalysisMetric
  selectedTimeRange: [Date, Date]
  showComparison: boolean
  height?: number
  isLoading?: boolean
}

export interface PatchCardProps {
  patch: PatchData
  isSelected?: boolean
  onSelect?: (patch: PatchData) => void
  className?: string
  showSimilarityScore?: boolean
}