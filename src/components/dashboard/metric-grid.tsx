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
  // Basic counts; avoid fabricated trends
  const activeCompanies = companies.length
  const avgImpactScore = companies.length > 0 
    ? Math.round(companies.reduce((sum, company) => sum + company.impactScore, 0) / companies.length)
    : 0
  
  // Count unique countries
  const uniqueCountries = new Set(companies.map(company => company.country)).size
  
  const metrics = [
    {
      title: 'Active Companies',
      value: activeCompanies,
      trend: undefined,
      icon: Globe,
      variant: 'default' as const
    },
    {
      title: 'Avg Impact Score',
      value: `${avgImpactScore}%`,
      trend: undefined,
      icon: TrendingUp,
      variant: avgImpactScore > 70 ? 'danger' as const : avgImpactScore > 50 ? 'warning' as const : 'success' as const
    },
    {
      title: 'Impact Reduction',
      value: '—',
      trend: undefined,
      icon: TrendingDown,
      variant: 'default' as const
    },
    {
      title: 'Countries',
      value: uniqueCountries,
      trend: undefined,
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