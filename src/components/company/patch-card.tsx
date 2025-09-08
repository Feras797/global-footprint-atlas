import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { PatchCardProps } from '@/lib/types/analysis'
import {
  MapPin,
  Calendar,
  Ruler,
  Eye,
  Download,
  Star,
  ExternalLink
} from 'lucide-react'

export const PatchCard: React.FC<PatchCardProps> = ({
  patch,
  isSelected = false,
  onSelect,
  className,
  showSimilarityScore = true
}) => {
  const handleCardClick = () => {
    if (onSelect) {
      onSelect(patch)
    }
  }

  const formatCoordinates = (lat: number, lng: number) => {
    const latDir = lat >= 0 ? 'N' : 'S'
    const lngDir = lng >= 0 ? 'E' : 'W'
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`
  }

  const formatSize = (size: number) => {
    if (size >= 1000) {
      return `${(size / 1000).toFixed(1)}k hectares`
    }
    return `${size.toFixed(0)} hectares`
  }

  const isMainPatch = patch.type === 'main'
  
  return (
    <Card 
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        'cursor-pointer border border-border/50 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        isMainPatch ? 'bg-gradient-to-br from-primary/5 to-primary/10' : 'bg-gradient-to-br from-background to-muted/20',
        className
      )}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`${patch.type === 'main' ? 'Main operational patch' : 'Reference patch'}: ${patch.name} in ${patch.country}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {isMainPatch ? (
              <Badge variant="default" className="font-medium">
                Main Patch
              </Badge>
            ) : (
              <Badge variant="outline" className="font-medium">
                Reference
              </Badge>
            )}
            {showSimilarityScore && patch.similarityScore && (
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-muted-foreground">
                  {patch.similarityScore}% similar
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                // Handle view action
              }}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                // Handle download action
              }}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                // Handle external link action
              }}
              className="h-8 w-8 p-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {patch.name}
        </h3>
      </div>

      {/* Satellite Image Placeholder */}
      <div className="mx-4 mb-4">
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted/40 border border-border/30">
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20" />
          
          {/* Simulated satellite imagery pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full" style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 70% 60%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 90% 20%, rgba(234, 179, 8, 0.2) 0%, transparent 40%)
              `
            }} />
          </div>
          
          {/* Loading state overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2 opacity-50" />
              <span className="text-xs text-muted-foreground">Loading imagery...</span>
            </div>
          </div>
          
          {/* Analysis date badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs opacity-90">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(patch.analysisDate).toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </div>

      <Separator className="mx-4" />

      {/* Details */}
      <div className="p-4 pt-3 space-y-3">
        {/* Location */}
        <div className="flex items-start space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground">{patch.country}</div>
            <div className="text-muted-foreground text-xs font-mono">
              {formatCoordinates(patch.coordinates.lat, patch.coordinates.lng)}
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="flex items-center space-x-2 text-sm">
          <Ruler className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">Area:</span>
          <span className="font-medium text-foreground">{formatSize(patch.size)}</span>
        </div>

        {/* Similarity score for reference patches */}
        {!isMainPatch && patch.similarityScore && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-muted-foreground">Similarity to main patch</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-green-500 transition-all duration-500"
                  style={{ width: `${patch.similarityScore}%` }}
                />
              </div>
              <span className="text-sm font-medium text-foreground">
                {patch.similarityScore}%
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
      )}
    </Card>
  )
}