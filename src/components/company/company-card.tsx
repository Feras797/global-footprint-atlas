import React from 'react'
import { Card } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { AnalysisStatus } from '@/lib/types/analysis'
import { ImpactIndicator } from './impact-indicator'
import {
  Building2,
  Factory,
  Wheat,
  Zap,
  MapPin,
  TrendingDown,
  TrendingUp,
  Minus,
  Eye,
  FileText,
  MoreHorizontal
} from 'lucide-react'

interface CompanyLocation {
  id: string
  name: string
  position: [number, number, number]
  type: 'manufacturing' | 'mining' | 'agriculture' | 'energy' | 'nuclear' | 'thermal'
  impactScore: number
  country: string
}

interface CompanyCardProps {
  company: CompanyLocation
  onSelect: (company: CompanyLocation) => void
  variant?: 'default' | 'compact' | 'detailed'
  showActions?: boolean
  className?: string
  realAnalysisData?: {
    trend: {
      direction: 'up' | 'down' | 'stable'
      value: number
      period: string
    }
    sparklineData?: number[]
  }
  analysisStatus?: AnalysisStatus
  onStartAnalysis?: (companyId: string) => void
}

// Deterministic pseudo-random helpers for stable mock data per company
const hashStringToSeed = (str: string) => {
  // Safety check to prevent errors if str is undefined/null
  if (!str || typeof str !== 'string') {
    console.warn('hashStringToSeed received invalid input:', str)
    return 12345 // fallback seed
  }
  
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = (hash * 16777619) >>> 0
  }
  return hash >>> 0
}

const createSeededRandom = (seed: number) => {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 4294967296
  }
}

// Mock trend data - in real app this would come from API
const generateMockTrend = (id: string) => {
  const rng = createSeededRandom(hashStringToSeed(id))
  const value = Math.floor(rng() * 5) + 1
  return {
    direction: 'down' as const,
    value,
    period: 'this month'
  }
}

const CompanyTypeIcon = ({ type }: { type: string }) => {
  const iconMap = {
    manufacturing: Factory,
    mining: Building2,
    agriculture: Wheat,
    energy: Zap,
    nuclear: Zap,
    thermal: Zap
  }
  
  const Icon = iconMap[type as keyof typeof iconMap] || Building2
  return <Icon className="h-4 w-4" />
}

const getTypeColor = (type: string) => {
  const colorMap = {
    manufacturing: 'bg-blue-100 text-blue-800 border-blue-200',
    energy: 'bg-green-100 text-green-800 border-green-200',
    agriculture: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    mining: 'bg-orange-100 text-orange-800 border-orange-200',
    nuclear: 'bg-purple-100 text-purple-800 border-purple-200',
    thermal: 'bg-red-100 text-red-800 border-red-200'
  }
  return colorMap[type as keyof typeof colorMap] || 'bg-gray-100 text-gray-800 border-gray-200'
}

// Removed mocked impact helpers; we only surface real analysis results now

// Simple sparkline component
const Sparkline = ({ className, seed, realData, colorClassName }: { 
  className?: string, 
  seed?: string,
  realData?: number[],
  colorClassName?: string
}) => {
  const points = React.useMemo(() => {
    // Use real data if available, otherwise fall back to seeded random data
    if (realData && realData.length > 0) {
      return realData.slice(0, 12) // Take first 12 points
    }
    
    const rng = seed ? createSeededRandom(hashStringToSeed(seed)) : null
    return Array.from({ length: 12 }, () => {
      const r = rng ? rng() : Math.random()
      return r * 40 + 10
    })
  }, [seed, realData])
  const maxValue = Math.max(...points)
  const minValue = Math.min(...points)
  const range = maxValue - minValue || 1
  
  const normalizedPoints = points.map((point, index) => {
    const x = (index / (points.length - 1)) * 100
    const y = 100 - ((point - minValue) / range) * 80 - 10
    return `${x},${y}`
  }).join(' ')

  return (
    <svg 
      className={cn('w-16 h-8', className)} 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
    >
      <polyline
        points={normalizedPoints}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={cn('text-green-500', colorClassName)}
      />
    </svg>
  )
}

export const CompanyCard = ({
  company,
  onSelect,
  variant = 'default',
  showActions = true,
  className,
  realAnalysisData,
  analysisStatus,
  onStartAnalysis
}: CompanyCardProps) => {
  const navigate = useNavigate()

  const trend = realAnalysisData?.trend
  // No mocked impact score; analysis info is derived from saved results only

  const trendColor = trend?.direction === 'down'
    ? 'text-red-600'
    : trend?.direction === 'up'
      ? 'text-green-600'
      : 'text-muted-foreground'

  const sparkColor = trend?.direction === 'down'
    ? 'text-red-500'
    : trend?.direction === 'up'
      ? 'text-green-500'
      : 'text-muted-foreground'

  const TrendIcon = trend?.direction === 'down' ? TrendingDown : trend?.direction === 'up' ? TrendingUp : Minus
  const trendSign = trend?.direction === 'down' ? '-' : trend?.direction === 'up' ? '+' : ''


  const handleCardClick = () => {
    onSelect(company)
    navigate(`/company/${company.id}`)
  }

  if (variant === 'compact') {
    return (
      <Card 
        className={cn(
          'p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
          'border border-border/50 bg-gradient-to-br from-background to-muted/20',
          className
        )}
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <CompanyTypeIcon type={company.type} />
              <div>
                <div className="font-semibold text-sm">{company.name}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{company.country}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(analysisStatus === 'not_analyzed' || analysisStatus === 'new_quarter') && (
              <Button
                variant="outline"
                size="sm"
                className="text-[10px] h-7"
                onClick={(e) => {
                  e.stopPropagation()
                  if (onStartAnalysis) onStartAnalysis(company.id)
                  else navigate(`/company/${company.id}`)
                }}
              >
                {analysisStatus === 'new_quarter' ? 'Refresh' : 'Start'}
              </Button>
            )}
            <ImpactIndicator score={company.impactScore} size="sm" showLabel={false} />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className={cn(
        'p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        'border border-border/50 bg-gradient-to-br from-background to-muted/20',
        'group',
        className
      )}
      onClick={handleCardClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <CompanyTypeIcon type={company.type} />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {company.name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{company.country}</span>
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(company)
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {(analysisStatus === 'not_analyzed' || analysisStatus === 'new_quarter') && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onStartAnalysis) onStartAnalysis(company.id)
                    else navigate(`/company/${company.id}`)
                  }}
                >
                  {analysisStatus === 'new_quarter' ? 'Refresh Analysis' : 'Start Analysis'}
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Content */}
        <div className="grid grid-cols-2 gap-4">

          {/* Left: Type and analysis status */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2">
              <Badge 
                variant="outline"
                className={cn('w-fit text-xs', getTypeColor(company.type))}
              >
                {company.type.charAt(0).toUpperCase() + company.type.slice(1)}
              </Badge>
              <Badge 
                variant="outline" 
                className="w-fit text-xs"
              >
                {analysisStatus === 'analyzed' && 'Analyzed'}
                {analysisStatus === 'new_quarter' && 'Update available'}
                {(!analysisStatus || analysisStatus === 'not_analyzed') && 'No analysis yet'}
              </Badge>
            </div>
          </div>

          {/* Right: Trend and Sparkline */}
          <div className="space-y-3">
            {trend ? (
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">Recent Trend</div>
                <div className={cn('flex items-center justify-end space-x-1 text-sm', trendColor)}>
                  <TrendIcon className="h-3 w-3" />
                  <span>{trendSign}{trend.value}% {trend.period}</span>
                </div>
              </div>
            ) : (
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">No analysis yet</div>
              </div>
            )}
            
            <div className="flex justify-end">
              {realAnalysisData?.sparklineData && realAnalysisData.sparklineData.length > 0 ? (
                <Sparkline 
                  className="opacity-70 group-hover:opacity-100 transition-opacity" 
                  seed={company.id}
                  realData={realAnalysisData.sparklineData}
                  colorClassName={sparkColor}
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* Footer */}
        {variant === 'detailed' && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last updated: 2h ago</span>
              <span>ID: {company.id}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}