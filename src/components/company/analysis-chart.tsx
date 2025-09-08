import React, { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { AnalysisChartProps } from '@/lib/types/analysis'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Download,
  Maximize2,
  Filter
} from 'lucide-react'

const COLORS = {
  mainPatch: '#3b82f6',
  reference1: '#10b981',
  reference2: '#f59e0b',
  reference3: '#ef4444',
  grid: '#e5e7eb',
  text: '#6b7280'
}

export const AnalysisChart: React.FC<AnalysisChartProps> = ({
  metric,
  selectedTimeRange,
  showComparison = true,
  height = 300,
  isLoading = false
}) => {
  const filteredData = useMemo(() => {
    const [startDate, endDate] = selectedTimeRange
    return metric.data.filter(point => {
      const pointDate = new Date(point.date)
      return pointDate >= startDate && pointDate <= endDate
    }).map(point => ({
      ...point,
      date: new Date(point.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }))
  }, [metric.data, selectedTimeRange])

  const getTrendIcon = () => {
    switch (metric.trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = () => {
    switch (metric.trend.direction) {
      case 'up':
        return metric.id === 'deforestation' || metric.id === 'air-quality' 
          ? 'text-red-600 bg-red-50 border-red-200' 
          : 'text-green-600 bg-green-50 border-green-200'
      case 'down':
        return metric.id === 'deforestation' || metric.id === 'air-quality'
          ? 'text-green-600 bg-green-50 border-green-200'
          : 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatTooltipValue = (value: number) => {
    if (typeof value !== 'number') return value
    
    if (metric.unit === 'index' || metric.unit === 'percentage') {
      return value.toFixed(2)
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`
    }
    return value.toFixed(1)
  }

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean
    payload?: Array<{
      value: number
      dataKey: string
      color: string
    }>
    label?: string
  }) => {
    if (!active || !payload || !payload.length) return null

    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry, index) => {
          const seriesName = {
            mainPatch: 'Main Patch',
            reference1: 'Reference Alpha',
            reference2: 'Reference Beta', 
            reference3: 'Reference Gamma'
          }[entry.dataKey] || entry.dataKey
          
          return (
            <div key={index} className="flex items-center space-x-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{seriesName}:</span>
              <span className="font-medium text-foreground">
                {formatTooltipValue(entry.value)} {metric.unit}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    }

    switch (metric.chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <XAxis dataKey="date" stroke={COLORS.text} fontSize={12} />
            <YAxis stroke={COLORS.text} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showComparison && (
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
            )}
            <Area
              type="monotone"
              dataKey="mainPatch"
              stackId="1"
              stroke={COLORS.mainPatch}
              fill={COLORS.mainPatch}
              fillOpacity={0.6}
              name="Main Patch"
            />
            {showComparison && (
              <>
                <Area
                  type="monotone"
                  dataKey="reference1"
                  stackId="2"
                  stroke={COLORS.reference1}
                  fill={COLORS.reference1}
                  fillOpacity={0.4}
                  name="Reference Alpha"
                />
                <Area
                  type="monotone"
                  dataKey="reference2"
                  stackId="3"
                  stroke={COLORS.reference2}
                  fill={COLORS.reference2}
                  fillOpacity={0.4}
                  name="Reference Beta"
                />
                <Area
                  type="monotone"
                  dataKey="reference3"
                  stackId="4"
                  stroke={COLORS.reference3}
                  fill={COLORS.reference3}
                  fillOpacity={0.4}
                  name="Reference Gamma"
                />
              </>
            )}
          </AreaChart>
        )

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <XAxis dataKey="date" stroke={COLORS.text} fontSize={12} />
            <YAxis stroke={COLORS.text} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showComparison && (
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="line"
              />
            )}
            <Line
              type="monotone"
              dataKey="mainPatch"
              stroke={COLORS.mainPatch}
              strokeWidth={2}
              dot={{ fill: COLORS.mainPatch, strokeWidth: 2, r: 4 }}
              name="Main Patch"
            />
            {showComparison && (
              <>
                <Line
                  type="monotone"
                  dataKey="reference1"
                  stroke={COLORS.reference1}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: COLORS.reference1, strokeWidth: 2, r: 3 }}
                  name="Reference Alpha"
                />
                <Line
                  type="monotone"
                  dataKey="reference2"
                  stroke={COLORS.reference2}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: COLORS.reference2, strokeWidth: 2, r: 3 }}
                  name="Reference Beta"
                />
                <Line
                  type="monotone"
                  dataKey="reference3"
                  stroke={COLORS.reference3}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: COLORS.reference3, strokeWidth: 2, r: 3 }}
                  name="Reference Gamma"
                />
              </>
            )}
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <XAxis dataKey="date" stroke={COLORS.text} fontSize={12} />
            <YAxis stroke={COLORS.text} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showComparison && (
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="rect"
              />
            )}
            <Bar dataKey="mainPatch" fill={COLORS.mainPatch} name="Main Patch" />
            {showComparison && (
              <>
                <Bar dataKey="reference1" fill={COLORS.reference1} name="Reference Alpha" />
                <Bar dataKey="reference2" fill={COLORS.reference2} name="Reference Beta" />
                <Bar dataKey="reference3" fill={COLORS.reference3} name="Reference Gamma" />
              </>
            )}
          </BarChart>
        )

      case 'combination':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <XAxis dataKey="date" stroke={COLORS.text} fontSize={12} />
            <YAxis stroke={COLORS.text} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showComparison && (
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
            )}
            <Bar dataKey="mainPatch" fill={COLORS.mainPatch} name="Main Patch" />
            {showComparison && (
              <>
                <Line
                  type="monotone"
                  dataKey="reference1"
                  stroke={COLORS.reference1}
                  strokeWidth={2}
                  name="Reference Alpha"
                />
                <Line
                  type="monotone"
                  dataKey="reference2"
                  stroke={COLORS.reference2}
                  strokeWidth={2}
                  name="Reference Beta"
                />
                <Line
                  type="monotone"
                  dataKey="reference3"
                  stroke={COLORS.reference3}
                  strokeWidth={2}
                  name="Reference Gamma"
                />
              </>
            )}
          </ComposedChart>
        )

      default:
        return <div className="flex items-center justify-center h-full text-muted-foreground">Unsupported chart type</div>
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className="p-6 group hover:shadow-lg transition-all duration-300"
      role="region"
      aria-labelledby={`chart-title-${metric.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 id={`chart-title-${metric.id}`} className="text-lg font-semibold text-foreground">{metric.name}</h3>
            <Badge 
              variant="outline" 
              className={cn('text-xs font-medium', getTrendColor())}
            >
              {getTrendIcon()}
              <span className="ml-1">
                {metric.trend.direction === 'up' ? '+' : metric.trend.direction === 'down' ? '-' : ''}
                {metric.trend.percentage}%
              </span>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{metric.description}</p>
          <div className="flex items-center space-x-4 text-sm">
            <div>
              <span className="text-muted-foreground">Current: </span>
              <span className="font-medium text-foreground">
                {formatTooltipValue(metric.currentValue)} {metric.unit}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Previous: </span>
              <span className="font-medium text-foreground">
                {formatTooltipValue(metric.previousValue)} {metric.unit}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Info className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Data range: {selectedTimeRange[0].toLocaleDateString()} - {selectedTimeRange[1].toLocaleDateString()}</span>
          <span>Trend over {metric.trend.period}</span>
        </div>
      </div>
    </Card>
  )
}