import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface ImpactIndicatorProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export const ImpactIndicator = ({
  score,
  size = 'md',
  showLabel = true,
  className
}: ImpactIndicatorProps) => {
  const getImpactLevel = (score: number) => {
    if (score > 70) return { level: 'high', color: 'red', label: 'High Impact' }
    if (score > 40) return { level: 'medium', color: 'orange', label: 'Medium Impact' }
    return { level: 'low', color: 'green', label: 'Low Impact' }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { ring: 'w-10 h-10', text: 'text-xs' }
      case 'lg':
        return { ring: 'w-16 h-16', text: 'text-lg' }
      default:
        return { ring: 'w-12 h-12', text: 'text-sm' }
    }
  }

  const impact = getImpactLevel(score)
  const sizeClasses = getSizeClasses()

  const getColorClasses = (color: string, variant: 'ring' | 'text' | 'badge') => {
    const colorMap = {
      red: {
        ring: 'stroke-red-500 text-red-600',
        text: 'text-red-600',
        badge: 'bg-red-100 text-red-800 border-red-200'
      },
      orange: {
        ring: 'stroke-orange-500 text-orange-600',
        text: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-800 border-orange-200'
      },
      green: {
        ring: 'stroke-green-500 text-green-600',
        text: 'text-green-600',
        badge: 'bg-green-100 text-green-800 border-green-200'
      }
    }
    return colorMap[color as keyof typeof colorMap]?.[variant] || colorMap.green[variant]
  }

  const circumference = 2 * Math.PI * 16 // radius of 16
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className={cn('flex items-center space-x-3', className)}>
      {/* Circular Progress Ring */}
      <div className="relative">
        <svg 
          className={cn(sizeClasses.ring, 'transform -rotate-90')}
          viewBox="0 0 36 36"
        >
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-foreground/20"
          />
          {/* Progress circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            className={getColorClasses(impact.color, 'ring')}
            style={{
              strokeDasharray,
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-in-out'
            }}
          />
        </svg>
        {/* Score text in center */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center font-semibold',
          sizeClasses.text,
          getColorClasses(impact.color, 'text')
        )}>
          {score}%
        </div>
      </div>

      {/* Label and badge */}
      {showLabel && (
        <div className="flex flex-col space-y-1">
          <Badge 
            variant="outline" 
            className={cn('text-xs w-fit', getColorClasses(impact.color, 'badge'))}
          >
            {impact.label}
          </Badge>
        </div>
      )}
    </div>
  )
}