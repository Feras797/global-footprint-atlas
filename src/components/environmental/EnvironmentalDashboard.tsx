import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Download,
  Filter,
  Calendar
} from 'lucide-react'
import { environmentalData, metricConfigs, getLatestValues, calculateTrend } from '@/data/environmental-mock-data'

interface EnvironmentalDashboardProps {
  regionName: string
  onClose?: () => void
  showCloseButton?: boolean
  analysisData?: {
    redAreas: any[]
    greenAreas: any[]
    apiResponse?: any
  }
}

type TimeRange = '6m' | '1y' | '2y' | 'all'

export function EnvironmentalDashboard({ regionName, onClose, showCloseButton = true, analysisData }: EnvironmentalDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState(metricConfigs[0].key)
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [showReferences, setShowReferences] = useState(true)
  const [chartType, setChartType] = useState<'line' | 'area'>('line')
  
  const latestValues = useMemo(() => getLatestValues(), [])
  
  // Filter data based on time range
  const filteredData = useMemo(() => {
    const data = environmentalData[selectedMetric]
    
    switch (timeRange) {
      case '6m':
        return data.slice(-6)
      case '1y':
        return data.slice(-12)
      case '2y':
        return data.slice(-24)
      default:
        return data
    }
  }, [selectedMetric, timeRange])
  
  const currentConfig = metricConfigs.find(m => m.key === selectedMetric)!
  
  // Calculate status for current metric
  const getStatus = (value: number) => {
    if (currentConfig.key === 'deforestation' || currentConfig.key === 'co2Emissions') {
      // Higher is worse for these metrics
      if (value <= currentConfig.thresholds.good) return 'good'
      if (value <= currentConfig.thresholds.warning) return 'warning'
      return 'danger'
    } else {
      // Higher is better for these metrics
      if (value >= currentConfig.thresholds.good) return 'good'
      if (value >= currentConfig.thresholds.warning) return 'warning'
      return 'danger'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'danger': return <XCircle className="h-4 w-4 text-red-500" />
      default: return null
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'danger': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  
  // Calculate trends
  const mainPatchTrend = calculateTrend(filteredData, 'mainPatch')
  const avgReferenceTrend = filteredData.length > 1 ? 
    (calculateTrend(filteredData, 'reference1') + 
     calculateTrend(filteredData, 'reference2') + 
     calculateTrend(filteredData, 'reference3')) / 3 : 0
  
  const renderChart = () => {
    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)} ${currentConfig.unit}`,
                name === 'mainPatch' ? 'Company Patch' :
                name === 'reference1' ? 'Reference 1' :
                name === 'reference2' ? 'Reference 2' : 'Reference 3'
              ]}
              labelFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              }}
            />
            <Legend />
            
            {/* Threshold lines */}
            <ReferenceLine 
              y={currentConfig.thresholds.warning} 
              stroke="#f59e0b" 
              strokeDasharray="5 5" 
              label="Warning"
            />
            <ReferenceLine 
              y={currentConfig.thresholds.danger} 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
              label="Critical"
            />
            
            <Area
              type="monotone"
              dataKey="mainPatch"
              stroke="#dc2626"
              fill="rgba(220, 38, 38, 0.1)"
              strokeWidth={3}
              name="Company Patch"
            />
            
            {showReferences && (
              <>
                <Area
                  type="monotone"
                  dataKey="reference1"
                  stroke="#059669"
                  fill="rgba(5, 150, 105, 0.05)"
                  strokeWidth={2}
                  name="Reference 1"
                  strokeDasharray="2 2"
                />
                <Area
                  type="monotone"
                  dataKey="reference2"
                  stroke="#0d9488"
                  fill="rgba(13, 148, 136, 0.05)"
                  strokeWidth={2}
                  name="Reference 2"
                  strokeDasharray="4 4"
                />
                <Area
                  type="monotone"
                  dataKey="reference3"
                  stroke="#0891b2"
                  fill="rgba(8, 145, 178, 0.05)"
                  strokeWidth={2}
                  name="Reference 3"
                  strokeDasharray="6 6"
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      )
    }
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
            }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)} ${currentConfig.unit}`,
              name === 'mainPatch' ? 'Company Patch' :
              name === 'reference1' ? 'Reference 1' :
              name === 'reference2' ? 'Reference 2' : 'Reference 3'
            ]}
            labelFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            }}
          />
          <Legend />
          
          {/* Threshold lines */}
          <ReferenceLine 
            y={currentConfig.thresholds.warning} 
            stroke="#f59e0b" 
            strokeDasharray="5 5" 
            label="Warning"
          />
          <ReferenceLine 
            y={currentConfig.thresholds.danger} 
            stroke="#ef4444" 
            strokeDasharray="5 5" 
            label="Critical"
          />
          
          <Line
            type="monotone"
            dataKey="mainPatch"
            stroke="#dc2626"
            strokeWidth={3}
            name="Company Patch"
          />
          
          {showReferences && (
            <>
              <Line
                type="monotone"
                dataKey="reference1"
                stroke="#059669"
                strokeWidth={2}
                name="Reference 1"
                strokeDasharray="2 2"
              />
              <Line
                type="monotone"
                dataKey="reference2"
                stroke="#0d9488"
                strokeWidth={2}
                name="Reference 2"
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="reference3"
                stroke="#0891b2"
                strokeWidth={2}
                name="Reference 3"
                strokeDasharray="6 6"
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    )
  }
  
  const latestMainValue = filteredData[filteredData.length - 1]?.mainPatch || 0
  const status = getStatus(latestMainValue)
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Environmental Analysis</h2>
          <p className="text-muted-foreground mt-1">{regionName}</p>
          {analysisData && analysisData.greenAreas.length > 0 && (
            <Badge variant="secondary" className="mt-2">
              ✓ Real Analysis Data ({analysisData.greenAreas.length} similar regions found)
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          {showCloseButton && onClose && (
            <Button variant="outline" onClick={onClose}>
              Close Analysis
            </Button>
          )}
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(status)}
              <Badge className={getStatusColor(status)}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Company Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {mainPatchTrend > 0 ? 
                <TrendingUp className="h-4 w-4 text-red-500" /> : 
                <TrendingDown className="h-4 w-4 text-green-500" />
              }
              <span className={`font-semibold ${mainPatchTrend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {Math.abs(mainPatchTrend).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">vs References</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {avgReferenceTrend < mainPatchTrend ? 
                <TrendingUp className="h-4 w-4 text-red-500" /> : 
                <TrendingDown className="h-4 w-4 text-green-500" />
              }
              <span className={`font-semibold ${avgReferenceTrend < mainPatchTrend ? 'text-red-600' : 'text-green-600'}`}>
                {(mainPatchTrend - avgReferenceTrend).toFixed(1)}% difference
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Environmental Metrics</CardTitle>
              <CardDescription>
                Compare company environmental impact against reference regions
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="show-references" className="text-sm">References</Label>
                <Switch
                  id="show-references"
                  checked={showReferences}
                  onCheckedChange={setShowReferences}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as typeof selectedMetric)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metricConfigs.map(config => (
                    <SelectItem key={config.key} value={config.key}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6m">6 months</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                  <SelectItem value="2y">2 years</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                Line
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('area')}
              >
                Area
              </Button>
            </div>
          </div>
          
          {/* Chart */}
          {renderChart()}
          
          {/* Metric description */}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold text-sm mb-1">{currentConfig.name}</h4>
            <p className="text-sm text-muted-foreground">{currentConfig.description}</p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
              <span>Unit: {currentConfig.unit}</span>
              <span>Good: ≤{currentConfig.thresholds.good}</span>
              <span>Warning: ≤{currentConfig.thresholds.warning}</span>
              <span>Critical: &gt;{currentConfig.thresholds.danger}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricConfigs.map(config => {
          const latest = latestValues[config.key]
          const status = getStatus(latest.mainPatch)
          const trend = calculateTrend(environmentalData[config.key], 'mainPatch')
          
          return (
            <Card key={config.key} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{config.name}</CardTitle>
                  {getStatusIcon(status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold" style={{ color: config.color }}>
                      {latest.mainPatch.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">{config.unit}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {trend > 0 ? 
                        <TrendingUp className="h-3 w-3 text-red-500" /> : 
                        <TrendingDown className="h-3 w-3 text-green-500" />
                      }
                      <span className={`text-xs ${trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {Math.abs(trend).toFixed(1)}% from baseline
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Ref 1:</span>
                      <span>{latest.reference1.toFixed(1)} {config.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ref 2:</span>
                      <span>{latest.reference2.toFixed(1)} {config.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ref 3:</span>
                      <span>{latest.reference3.toFixed(1)} {config.unit}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}