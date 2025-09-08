import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TrendData {
  value: number
  direction: 'up' | 'down' | 'neutral'
  period?: string
}

interface MetricCardProps {
  title: string
  value: string | number
  trend?: TrendData
  icon: LucideIcon
  variant?: 'default' | 'success' | 'warning' | 'danger'
  loading?: boolean
  className?: string
}

const AnimatedCounter = ({ 
  value, 
  duration = 1000 
}: { 
  value: number | string
  duration?: number 
}) => {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    if (typeof value === 'string') return
    
    let startTime: number
    let animationFrame: number
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      setDisplayValue(Math.floor(progress * value))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])
  
  if (typeof value === 'string') return <span>{value}</span>
  return <span>{displayValue.toLocaleString()}</span>
}

const TrendIndicator = ({ trend }: { trend: TrendData }) => {
  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />
      case 'down':
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }
  
  const getTrendColor = () => {
    switch (trend.direction) {
      case 'up':
        return 'text-green-600 dark:text-green-400'
      case 'down':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }
  
  return (
    <div className={cn('flex items-center space-x-1 text-xs', getTrendColor())}>
      {getTrendIcon()}
      <span>{Math.abs(trend.value)}%</span>
      {trend.period && (
        <span className="text-xs text-muted-foreground">{trend.period}</span>
      )}
    </div>
  )
}

export const MetricCard = ({
  title,
  value,
  trend,
  icon: Icon,
  variant = 'default',
  loading = false,
  className
}: MetricCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-500/30 bg-card'
      case 'warning':
        return 'border-orange-500/30 bg-card'
      case 'danger':
        return 'border-red-500/30 bg-card'
      default:
        return 'border bg-card'
    }
  }
  
  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600 dark:text-green-400'
      case 'warning':
        return 'text-orange-600 dark:text-orange-400'
      case 'danger':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-primary'
    }
  }
  
  if (loading) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </Card>
    )
  }
  
  return (
    <Card 
      className={cn(
        'p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border',
        getVariantStyles(),
        className
      )}
    >
      <div className="space-y-3">
        {/* Header with title and icon */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground tracking-tight">
            {title}
          </h3>
          <div className={cn('p-1.5 rounded-full bg-muted', getIconColor())}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        
        {/* Value */}
        <div>
          <div className="text-2xl font-bold text-foreground">
            <AnimatedCounter value={value} />
          </div>
        </div>
        
        {/* Trend indicator */}
        {trend && (
          <div className="flex items-center justify-between">
            <TrendIndicator trend={trend} />
          </div>
        )}
      </div>
    </Card>
  )
}