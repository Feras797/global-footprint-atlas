// Mock environmental data for demonstration purposes

export interface EnvironmentalMetric {
  date: string
  mainPatch: number
  reference1: number
  reference2: number
  reference3: number
}

export interface MetricConfig {
  name: string
  key: keyof typeof environmentalData
  unit: string
  description: string
  color: string
  thresholds: {
    good: number
    warning: number
    danger: number
  }
}

// Environmental metrics data over time (2019-2024)
export const environmentalData = {
  deforestation: [
    { date: '2019-01', mainPatch: 2.3, reference1: 1.8, reference2: 2.1, reference3: 1.9 },
    { date: '2019-06', mainPatch: 2.8, reference1: 1.9, reference2: 2.3, reference3: 2.0 },
    { date: '2020-01', mainPatch: 3.2, reference1: 2.1, reference2: 2.4, reference3: 2.2 },
    { date: '2020-06', mainPatch: 3.8, reference1: 2.3, reference2: 2.6, reference3: 2.4 },
    { date: '2021-01', mainPatch: 4.5, reference1: 2.4, reference2: 2.8, reference3: 2.6 },
    { date: '2021-06', mainPatch: 5.2, reference1: 2.6, reference2: 3.0, reference3: 2.8 },
    { date: '2022-01', mainPatch: 6.1, reference1: 2.8, reference2: 3.2, reference3: 3.0 },
    { date: '2022-06', mainPatch: 7.3, reference1: 3.0, reference2: 3.4, reference3: 3.2 },
    { date: '2023-01', mainPatch: 8.9, reference1: 3.2, reference2: 3.6, reference3: 3.4 },
    { date: '2023-06', mainPatch: 10.2, reference1: 3.4, reference2: 3.8, reference3: 3.6 },
    { date: '2024-01', mainPatch: 12.1, reference1: 3.6, reference2: 4.0, reference3: 3.8 },
    { date: '2024-06', mainPatch: 14.5, reference1: 3.8, reference2: 4.2, reference3: 4.0 }
  ] as EnvironmentalMetric[],
  
  co2Emissions: [
    { date: '2019-01', mainPatch: 145, reference1: 98, reference2: 112, reference3: 105 },
    { date: '2019-06', mainPatch: 152, reference1: 101, reference2: 115, reference3: 108 },
    { date: '2020-01', mainPatch: 138, reference1: 95, reference2: 108, reference3: 102 },
    { date: '2020-06', mainPatch: 142, reference1: 97, reference2: 110, reference3: 104 },
    { date: '2021-01', mainPatch: 168, reference1: 102, reference2: 118, reference3: 110 },
    { date: '2021-06', mainPatch: 175, reference1: 105, reference2: 122, reference3: 114 },
    { date: '2022-01', mainPatch: 189, reference1: 108, reference2: 125, reference3: 118 },
    { date: '2022-06', mainPatch: 198, reference1: 112, reference2: 128, reference3: 122 },
    { date: '2023-01', mainPatch: 216, reference1: 115, reference2: 132, reference3: 125 },
    { date: '2023-06', mainPatch: 225, reference1: 118, reference2: 135, reference3: 128 },
    { date: '2024-01', mainPatch: 242, reference1: 122, reference2: 138, reference3: 132 },
    { date: '2024-06', mainPatch: 258, reference1: 125, reference2: 142, reference3: 135 }
  ] as EnvironmentalMetric[],
  
  moisture: [
    { date: '2019-01', mainPatch: 78.5, reference1: 82.3, reference2: 81.1, reference3: 83.2 },
    { date: '2019-06', mainPatch: 76.2, reference1: 81.8, reference2: 80.5, reference3: 82.9 },
    { date: '2020-01', mainPatch: 74.8, reference1: 81.2, reference2: 79.8, reference3: 82.4 },
    { date: '2020-06', mainPatch: 72.1, reference1: 80.9, reference2: 79.2, reference3: 81.8 },
    { date: '2021-01', mainPatch: 69.5, reference1: 80.4, reference2: 78.6, reference3: 81.2 },
    { date: '2021-06', mainPatch: 67.2, reference1: 79.8, reference2: 78.1, reference3: 80.6 },
    { date: '2022-01', mainPatch: 64.8, reference1: 79.2, reference2: 77.5, reference3: 80.1 },
    { date: '2022-06', mainPatch: 62.3, reference1: 78.6, reference2: 76.8, reference3: 79.4 },
    { date: '2023-01', mainPatch: 59.7, reference1: 78.1, reference2: 76.2, reference3: 78.8 },
    { date: '2023-06', mainPatch: 56.8, reference1: 77.5, reference2: 75.6, reference3: 78.2 },
    { date: '2024-01', mainPatch: 54.2, reference1: 76.9, reference2: 75.0, reference3: 77.6 },
    { date: '2024-06', mainPatch: 51.3, reference1: 76.3, reference2: 74.3, reference3: 77.0 }
  ] as EnvironmentalMetric[],
  
  airQuality: [
    { date: '2019-01', mainPatch: 48, reference1: 72, reference2: 65, reference3: 68 },
    { date: '2019-06', mainPatch: 45, reference1: 71, reference2: 64, reference3: 67 },
    { date: '2020-01', mainPatch: 52, reference1: 73, reference2: 67, reference3: 69 },
    { date: '2020-06', mainPatch: 49, reference1: 72, reference2: 66, reference3: 68 },
    { date: '2021-01', mainPatch: 42, reference1: 70, reference2: 63, reference3: 66 },
    { date: '2021-06', mainPatch: 38, reference1: 69, reference2: 62, reference3: 65 },
    { date: '2022-01', mainPatch: 35, reference1: 68, reference2: 61, reference3: 64 },
    { date: '2022-06', mainPatch: 32, reference1: 67, reference2: 60, reference3: 63 },
    { date: '2023-01', mainPatch: 28, reference1: 66, reference2: 59, reference3: 62 },
    { date: '2023-06', mainPatch: 25, reference1: 65, reference2: 58, reference3: 61 },
    { date: '2024-01', mainPatch: 22, reference1: 64, reference2: 57, reference3: 60 },
    { date: '2024-06', mainPatch: 18, reference1: 63, reference2: 56, reference3: 59 }
  ] as EnvironmentalMetric[],
  
  biodiversity: [
    { date: '2019-01', mainPatch: 8.7, reference1: 9.2, reference2: 9.0, reference3: 9.3 },
    { date: '2019-06', mainPatch: 8.4, reference1: 9.1, reference2: 8.9, reference3: 9.2 },
    { date: '2020-01', mainPatch: 8.1, reference1: 9.0, reference2: 8.8, reference3: 9.1 },
    { date: '2020-06', mainPatch: 7.8, reference1: 8.9, reference2: 8.7, reference3: 9.0 },
    { date: '2021-01', mainPatch: 7.4, reference1: 8.8, reference2: 8.6, reference3: 8.9 },
    { date: '2021-06', mainPatch: 7.0, reference1: 8.7, reference2: 8.5, reference3: 8.8 },
    { date: '2022-01', mainPatch: 6.6, reference1: 8.6, reference2: 8.4, reference3: 8.7 },
    { date: '2022-06', mainPatch: 6.1, reference1: 8.5, reference2: 8.3, reference3: 8.6 },
    { date: '2023-01', mainPatch: 5.7, reference1: 8.4, reference2: 8.2, reference3: 8.5 },
    { date: '2023-06', mainPatch: 5.2, reference1: 8.3, reference2: 8.1, reference3: 8.4 },
    { date: '2024-01', mainPatch: 4.8, reference1: 8.2, reference2: 8.0, reference3: 8.3 },
    { date: '2024-06', mainPatch: 4.3, reference1: 8.1, reference2: 7.9, reference3: 8.2 }
  ] as EnvironmentalMetric[],
  
  waterQuality: [
    { date: '2019-01', mainPatch: 62, reference1: 78, reference2: 74, reference3: 76 },
    { date: '2019-06', mainPatch: 59, reference1: 77, reference2: 73, reference3: 75 },
    { date: '2020-01', mainPatch: 56, reference1: 76, reference2: 72, reference3: 74 },
    { date: '2020-06', mainPatch: 53, reference1: 75, reference2: 71, reference3: 73 },
    { date: '2021-01', mainPatch: 49, reference1: 74, reference2: 70, reference3: 72 },
    { date: '2021-06', mainPatch: 46, reference1: 73, reference2: 69, reference3: 71 },
    { date: '2022-01', mainPatch: 42, reference1: 72, reference2: 68, reference3: 70 },
    { date: '2022-06', mainPatch: 38, reference1: 71, reference2: 67, reference3: 69 },
    { date: '2023-01', mainPatch: 35, reference1: 70, reference2: 66, reference3: 68 },
    { date: '2023-06', mainPatch: 31, reference1: 69, reference2: 65, reference3: 67 },
    { date: '2024-01', mainPatch: 28, reference1: 68, reference2: 64, reference3: 66 },
    { date: '2024-06', mainPatch: 24, reference1: 67, reference2: 63, reference3: 65 }
  ] as EnvironmentalMetric[]
}

// Configuration for each metric
export const metricConfigs: MetricConfig[] = [
  {
    name: 'Deforestation Rate',
    key: 'deforestation',
    unit: '% per year',
    description: 'Rate of forest cover loss over time',
    color: '#ef4444',
    thresholds: { good: 2, warning: 5, danger: 10 }
  },
  {
    name: 'CO2 Emissions',
    key: 'co2Emissions',
    unit: 'tons per hectare',
    description: 'Carbon dioxide emissions from industrial activities',
    color: '#f97316',
    thresholds: { good: 100, warning: 150, danger: 200 }
  },
  {
    name: 'Soil Moisture',
    key: 'moisture',
    unit: '% saturation',
    description: 'Average soil moisture content',
    color: '#3b82f6',
    thresholds: { good: 70, warning: 50, danger: 30 }
  },
  {
    name: 'Air Quality Index',
    key: 'airQuality',
    unit: 'AQI score',
    description: 'Overall air quality measurement',
    color: '#10b981',
    thresholds: { good: 50, warning: 30, danger: 20 }
  },
  {
    name: 'Biodiversity Index',
    key: 'biodiversity',
    unit: 'species richness',
    description: 'Measure of ecosystem biodiversity',
    color: '#8b5cf6',
    thresholds: { good: 8, warning: 6, danger: 4 }
  },
  {
    name: 'Water Quality',
    key: 'waterQuality',
    unit: 'quality index',
    description: 'Overall water quality assessment',
    color: '#06b6d4',
    thresholds: { good: 70, warning: 50, danger: 30 }
  }
]

// Get latest values for summary
export const getLatestValues = () => {
  const latest: Record<string, any> = {}
  
  metricConfigs.forEach(config => {
    const data = environmentalData[config.key]
    const latestEntry = data[data.length - 1]
    latest[config.key] = {
      mainPatch: latestEntry.mainPatch,
      reference1: latestEntry.reference1,
      reference2: latestEntry.reference2,
      reference3: latestEntry.reference3,
      config
    }
  })
  
  return latest
}

// Calculate percentage change over time
export const calculateTrend = (data: EnvironmentalMetric[], field: keyof EnvironmentalMetric) => {
  if (data.length < 2) return 0
  
  const firstValue = data[0][field] as number
  const lastValue = data[data.length - 1][field] as number
  
  return ((lastValue - firstValue) / firstValue) * 100
}