import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, Filter, RotateCcw } from "lucide-react";

interface FilterPanelProps {
  filters: {
    type: string;
    impactRange: [number, number];
    timeRange: string;
  };
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClose
}) => {
  const handleTypeChange = (value: string) => {
    onFiltersChange({ ...filters, type: value });
  };

  const handleImpactRangeChange = (value: number[]) => {
    onFiltersChange({ ...filters, impactRange: [value[0], value[1]] });
  };

  const handleTimeRangeChange = (value: string) => {
    onFiltersChange({ ...filters, timeRange: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      type: 'all',
      impactRange: [0, 100],
      timeRange: '2024'
    });
  };

  return (
    <div className="h-full bg-background border-l border-border shadow-elevated overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Filters & Controls</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Company Type Filter */}
          <Card className="p-4">
            <Label className="text-sm font-medium mb-3 block">Company Type</Label>
            <Select value={filters.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="mining">Mining</SelectItem>
                <SelectItem value="agriculture">Agriculture</SelectItem>
                <SelectItem value="energy">Energy</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* Impact Score Range */}
          <Card className="p-4">
            <Label className="text-sm font-medium mb-3 block">
              Impact Score Range: {filters.impactRange[0]}% - {filters.impactRange[1]}%
            </Label>
            <div className="px-3">
              <Slider
                value={filters.impactRange}
                onValueChange={handleImpactRangeChange}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Low Impact</span>
              <span>High Impact</span>
            </div>
          </Card>

          {/* Time Range */}
          <Card className="p-4">
            <Label className="text-sm font-medium mb-3 block">Time Period</Label>
            <Select value={filters.timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2020">2020</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* Visualization Options */}
          <Card className="p-4">
            <Label className="text-sm font-medium mb-3 block">Visualization</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Show Impact Zones</span>
                <Button variant="outline" size="sm">Toggle</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Satellite Overlay</span>
                <Button variant="outline" size="sm">Toggle</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Heat Map</span>
                <Button variant="outline" size="sm">Toggle</Button>
              </div>
            </div>
          </Card>

          {/* Reset Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={resetFilters}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All Filters
          </Button>

          {/* Environmental Insights */}
          <Card className="p-4 bg-secondary/10 border-secondary/20">
            <h4 className="font-medium mb-2 text-secondary">💡 Quick Insights</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>• Manufacturing facilities show highest impact scores</div>
              <div>• Energy sector improvements visible in 2024 data</div>
              <div>• 23% reduction in agricultural impact since 2020</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};