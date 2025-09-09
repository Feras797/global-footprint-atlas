import React from 'react'
import { MetricCard } from './metric-card'
import { Globe, TrendingUp, TrendingDown, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompanyLocation {
  id: string
  name: string
  position: [number, number, number]
  type: 'manufacturing' | 'mining' | 'agriculture' | 'energy' | 'nuclear' | 'thermal'
  impactScore: number
  country: string
}

interface MetricGridProps {
  companies: CompanyLocation[]
  loading?: boolean
  className?: string
}

export const MetricGrid = ({ 
  companies, 
  loading = false,
  className 
}: MetricGridProps) => {
  // Calculate metrics from company data
  const activeCompanies = companies.length
  const avgImpactScore = companies.length > 0 
    ? Math.round(companies.reduce((sum, company) => sum + company.impactScore, 0) / companies.length)
    : 0
  
  // Mock trend calculation (in real app this would come from historical data)
  const impactReduction = -12 // Negative indicates improvement
  
  // Count unique countries
  const uniqueCountries = new Set(companies.map(company => company.country)).size
  
  const metrics = [
    {
      title: 'Active Companies',
      value: activeCompanies,
      trend: {
        value: 8.2,
        direction: 'up' as const,
        period: 'this month'
      },
      icon: Globe,
      variant: 'default' as const
    },
    {
      title: 'Avg Impact Score',
      value: `${avgImpactScore}%`,
      trend: {
        value: 3.1,
        direction: 'up' as const,
        period: 'vs last month'
      },
      icon: TrendingUp,
      variant: avgImpactScore > 70 ? 'danger' as const : avgImpactScore > 50 ? 'warning' as const : 'success' as const
    },
    {
      title: 'Impact Reduction',
      value: `${impactReduction}%`,
      trend: {
        value: Math.abs(impactReduction),
        direction: impactReduction < 0 ? 'down' as const : 'up' as const,
        period: 'this quarter'
      },
      icon: impactReduction < 0 ? TrendingDown : TrendingUp,
      variant: 'success' as const
    },
    {
      title: 'Countries',
      value: uniqueCountries,
      trend: {
        value: 15,
        direction: 'up' as const,
        period: 'global reach'
      },
      icon: Leaf,
      variant: 'default' as const
    }
  ]
  
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {metrics.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          trend={metric.trend}
          icon={metric.icon}
          variant={metric.variant}
          loading={loading}
          className="transform transition-all duration-300 hover:scale-105"
        />
      ))}
    </div>
  )
}