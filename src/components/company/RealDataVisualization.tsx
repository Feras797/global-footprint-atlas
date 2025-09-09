import React, { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnalysisChart } from './analysis-chart'
import { TimeSlider } from './time-slider'
import { BatchAnalysisTransformer } from '@/lib/data/batch-analysis-transformer'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Leaf,
  Thermometer,
  Wind,
  Mountain,
  Factory,
  Calendar,
  Download,
  Share2
} from 'lucide-react'

interface RealDataVisualizationProps {
  batchAnalysisData: any
  companyName: string
  className?: string
}

const MetricIcon = ({ metricId }: { metricId: string }) => {
  const icons = {
    vegetation: Leaf,
    thermal: Thermometer,
    dust: Wind,
    soil: Mountain,
    industrial: Factory
  }
  const Icon = icons[metricId as keyof typeof icons] || Activity
  return <Icon className="h-4 w-4" />
}

export const RealDataVisualization: React.FC<RealDataVisualizationProps> = ({
  batchAnalysisData,
  companyName,
  className
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<[Date, Date]>([
    new Date('2022-01-01'),
    new Date('2023-12-31')
  ])
  const [showComparison, setShowComparison] = useState(true)
  const [activeMetric, setActiveMetric] = useState<string>('vegetation')

  // Transform the batch analysis data into chart-ready format
  const analysisMetrics = useMemo(() => {
    return BatchAnalysisTransformer.transformToAnalysisMetrics(batchAnalysisData)
  }, [batchAnalysisData])

  // Get summary statistics
  const summaryStats = useMemo(() => {
    return BatchAnalysisTransformer.getSummaryStats(batchAnalysisData)
  }, [batchAnalysisData])

  const currentMetric = analysisMetrics.find(m => m.id === activeMetric)

  // Preset time ranges
  const presetRanges = [
    {
      label: '2022',
      range: [new Date('2022-01-01'), new Date('2022-12-31')] as [Date, Date]
    },
    {
      label: '2023',
      range: [new Date('2023-01-01'), new Date('2023-12-31')] as [Date, Date]
    },
    {
      label: 'Last 6 Months',
      range: [new Date('2023-07-01'), new Date('2023-12-31')] as [Date, Date]
    },
    {
      label: 'All Data',
      range: [new Date('2022-01-01'), new Date('2023-12-31')] as [Date, Date]
    }
  ]

  if (!batchAnalysisData || analysisMetrics.length === 0) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Analysis Data Available</h3>
          <p className="text-sm text-muted-foreground">
            Please perform the satellite analysis first to view environmental data visualizations.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Summary Stats */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Environmental Analysis Results
            </h2>
            <p className="text-muted-foreground">
              Real-time satellite data analysis for {companyName}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{summaryStats.areasAnalyzed}</div>
            <div className="text-sm text-muted-foreground">Areas Analyzed</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{summaryStats.timePeriodsAnalyzed}</div>
            <div className="text-sm text-muted-foreground">Time Periods</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-destructive">{summaryStats.totalAnomalies}</div>
            <div className="text-sm text-muted-foreground">Anomalies Detected</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground">Last Updated</div>
            <div className="text-sm font-medium text-foreground">
              {new Date(summaryStats.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </Card>

     

      {/* Metric Selection Tabs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Environmental Metrics</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant={showComparison ? "default" : "outline"}
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? 'Hide' : 'Show'} Comparison
            </Button>
          </div>
        </div>

        <Tabs value={activeMetric} onValueChange={setActiveMetric} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            {analysisMetrics.map((metric) => (
              <TabsTrigger key={metric.id} value={metric.id} className="flex items-center space-x-2">
                <MetricIcon metricId={metric.id} />
                <span className="hidden sm:inline">{metric.name.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {analysisMetrics.map((metric) => (
            <TabsContent key={metric.id} value={metric.id}>
              <AnalysisChart
                metric={metric}
                selectedTimeRange={selectedTimeRange}
                showComparison={showComparison}
                height={400}
              />
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analysisMetrics.map((metric) => (
          <Card key={metric.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MetricIcon metricId={metric.id} />
                <h4 className="font-semibold text-sm">{metric.name}</h4>
              </div>
              <Badge 
                variant="outline"
                className={cn(
                  'text-xs',
                  metric.trend.direction === 'up' && metric.id !== 'vegetation' 
                    ? 'text-red-600 bg-red-50 border-red-200'
                    : metric.trend.direction === 'down' && metric.id !== 'vegetation'
                    ? 'text-green-600 bg-green-50 border-green-200'
                    : metric.trend.direction === 'up' && metric.id === 'vegetation'
                    ? 'text-green-600 bg-green-50 border-green-200'
                    : metric.trend.direction === 'down' && metric.id === 'vegetation'
                    ? 'text-red-600 bg-red-50 border-red-200'
                    : 'text-gray-600 bg-gray-50 border-gray-200'
                )}
              >
                {metric.trend.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : metric.trend.direction === 'down' ? (
                  <TrendingDown className="h-3 w-3 mr-1" />
                ) : (
                  <Activity className="h-3 w-3 mr-1" />
                )}
                {metric.trend.percentage}%
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current:</span>
                <span className="font-medium">{metric.currentValue.toFixed(2)} {metric.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Previous:</span>
                <span className="font-medium">{metric.previousValue.toFixed(2)} {metric.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Change:</span>
                <span className={cn(
                  'font-medium',
                  metric.trend.direction === 'up' ? 'text-red-600' : 
                  metric.trend.direction === 'down' ? 'text-green-600' : 'text-gray-600'
                )}>
                  {metric.trend.direction === 'up' ? '+' : metric.trend.direction === 'down' ? '-' : ''}
                  {Math.abs(metric.currentValue - metric.previousValue).toFixed(2)} {metric.unit}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
