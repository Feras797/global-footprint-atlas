import React, { useState, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { TimeSliderProps } from '@/lib/types/analysis'
import {
  Calendar,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

export const TimeSlider: React.FC<TimeSliderProps> = ({
  minDate,
  maxDate,
  selectedRange,
  onRangeChange,
  presetRanges = []
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  // Convert dates to timestamp values for the slider
  const minTimestamp = minDate.getTime()
  const maxTimestamp = maxDate.getTime()
  const totalDuration = maxTimestamp - minTimestamp

  // Convert selected range to slider values
  const sliderValues = useMemo(() => [
    selectedRange[0].getTime(),
    selectedRange[1].getTime()
  ], [selectedRange])

  const handleSliderChange = useCallback((values: number[]) => {
    const newRange: [Date, Date] = [
      new Date(values[0]),
      new Date(values[1])
    ]
    onRangeChange(newRange)
  }, [onRangeChange])

  const handlePresetSelect = useCallback((preset: { label: string; range: [Date, Date] }) => {
    onRangeChange(preset.range)
  }, [onRangeChange])

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined
    })
    const endStr = end.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
    return `${startStr} - ${endStr}`
  }

  const getDuration = () => {
    const diffTime = selectedRange[1].getTime() - selectedRange[0].getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} days`
    } else if (diffDays < 365) {
      const months = Math.ceil(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''}`
    } else {
      const years = Math.ceil(diffDays / 365)
      return `${years} year${years > 1 ? 's' : ''}`
    }
  }

  const stepBackward = () => {
    const duration = selectedRange[1].getTime() - selectedRange[0].getTime()
    const stepSize = duration * 0.1 // 10% of current range
    const newStart = new Date(Math.max(minTimestamp, selectedRange[0].getTime() - stepSize))
    const newEnd = new Date(Math.max(minTimestamp + duration, selectedRange[1].getTime() - stepSize))
    onRangeChange([newStart, newEnd])
  }

  const stepForward = () => {
    const duration = selectedRange[1].getTime() - selectedRange[0].getTime()
    const stepSize = duration * 0.1 // 10% of current range
    const newStart = new Date(Math.min(maxTimestamp - duration, selectedRange[0].getTime() + stepSize))
    const newEnd = new Date(Math.min(maxTimestamp, selectedRange[1].getTime() + stepSize))
    onRangeChange([newStart, newEnd])
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
    // In a real implementation, you would implement the playback logic here
  }

  const resetToFullRange = () => {
    onRangeChange([minDate, maxDate])
    setIsPlaying(false)
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-foreground">Time Range Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Select period for environmental impact analysis
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {getDuration()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToFullRange}
            className="h-8"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Preset Ranges */}
      {presetRanges.length > 0 && (
        <div className="mb-6">
          <div className="text-sm text-muted-foreground mb-3">Quick select:</div>
          <div className="flex flex-wrap gap-2">
            {presetRanges.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect(preset)}
                className={cn(
                  "h-8 text-xs",
                  selectedRange[0].getTime() === preset.range[0].getTime() &&
                  selectedRange[1].getTime() === preset.range[1].getTime() &&
                  "bg-primary/10 border-primary text-primary"
                )}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main Slider */}
      <div className="space-y-4">
        <div className="px-3">
          <Slider
            value={sliderValues}
            onValueChange={handleSliderChange}
            min={minTimestamp}
            max={maxTimestamp}
            step={86400000} // 1 day in milliseconds
            className="w-full"
          />
        </div>

        {/* Date Display */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            {minDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
          <div className="font-medium text-foreground text-center px-4">
            {formatDateRange(selectedRange[0], selectedRange[1])}
          </div>
          <div className="text-muted-foreground">
            {maxDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-2 mt-6 pt-4 border-t border-border/50">
        <Button
          variant="outline"
          size="sm"
          onClick={stepBackward}
          disabled={selectedRange[0].getTime() <= minTimestamp}
          className="h-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={togglePlayback}
          className="h-8 px-4"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              Play
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={stepForward}
          disabled={selectedRange[1].getTime() >= maxTimestamp}
          className="h-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Playback Speed */}
        {isPlaying && (
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-xs text-muted-foreground">Speed:</span>
            <div className="flex items-center space-x-1">
              {[0.5, 1, 2, 4].map(speed => (
                <Button
                  key={speed}
                  variant={playbackSpeed === speed ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPlaybackSpeed(speed)}
                  className="h-6 w-8 p-0 text-xs"
                >
                  {speed}x
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mt-4">
        <div className="w-full bg-muted rounded-full h-1">
          <div 
            className="bg-primary h-1 rounded-full transition-all duration-300"
            style={{ 
              width: `${((selectedRange[1].getTime() - minTimestamp) / totalDuration) * 100}%` 
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Start of available data</span>
          <span>Latest data point</span>
        </div>
      </div>
    </Card>
  )
}