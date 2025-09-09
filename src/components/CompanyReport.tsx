import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Factory, 
  Leaf, 
  Droplets, 
  Wind,
  Calendar,
  MapPin,
  BarChart3
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface CompanyLocation {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'manufacturing' | 'mining' | 'agriculture' | 'energy' | 'nuclear' | 'thermal';
  impactScore: number;
  country: string;
}

interface CompanyReportProps {
  company: CompanyLocation;
  onClose: () => void;
}

export const CompanyReport: React.FC<CompanyReportProps> = ({ company, onClose }) => {
  const [timeSlider, setTimeSlider] = useState([2024]);
  
  // Mock environmental data that would come from API
  const environmentalData = {
    carbonEmissions: {
      current: 2450,
      trend: -12,
      unit: 'tons CO2/year'
    },
    waterUsage: {
      current: 15600,
      trend: -8,
      unit: 'gallons/day'
    },
    landImpact: {
      current: 340,
      trend: 5,
      unit: 'acres affected'
    },
    biodiversity: {
      current: 76,
      trend: -3,
      unit: 'species count'
    }
  };

  const getImpactColor = (score: number) => {
    if (score > 70) return 'destructive';
    if (score > 40) return 'secondary';
    return 'default';
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? 
      <TrendingUp className="h-4 w-4 text-red-500" /> : 
      <TrendingDown className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background shadow-elevated">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-earth text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Factory className="h-6 w-6" />
                <Badge variant="secondary" className="text-white bg-white/20">
                  {company.type.toUpperCase()}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold mb-2">{company.name}</h2>
              <div className="flex items-center space-x-4 text-sm opacity-90">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{company.country}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>Impact Score: {company.impactScore}%</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Time Controls */}
          <Card className="p-4 mb-6 bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <Label className="font-medium">Time Analysis: {timeSlider[0]}</Label>
              </div>
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Compare Years
              </Button>
            </div>
            <div className="px-3">
              <Slider
                value={timeSlider}
                onValueChange={setTimeSlider}
                min={2020}
                max={2024}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>2020</span>
              <span>2024</span>
            </div>
          </Card>

          {/* Environmental Metrics Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Wind className="h-5 w-5 text-primary" />
                  <span className="font-medium">Carbon Emissions</span>
                </div>
                {getTrendIcon(environmentalData.carbonEmissions.trend)}
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-foreground">
                  {environmentalData.carbonEmissions.current.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {environmentalData.carbonEmissions.unit}
                </div>
                <Progress value={Math.max(0, 100 - Math.abs(environmentalData.carbonEmissions.trend))} />
                <div className="text-sm text-green-600">
                  {Math.abs(environmentalData.carbonEmissions.trend)}% reduction this year
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Water Usage</span>
                </div>
                {getTrendIcon(environmentalData.waterUsage.trend)}
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-foreground">
                  {environmentalData.waterUsage.current.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {environmentalData.waterUsage.unit}
                </div>
                <Progress value={Math.max(0, 100 - Math.abs(environmentalData.waterUsage.trend))} />
                <div className="text-sm text-green-600">
                  {Math.abs(environmentalData.waterUsage.trend)}% reduction this year
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">Land Impact</span>
                </div>
                {getTrendIcon(environmentalData.landImpact.trend)}
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-foreground">
                  {environmentalData.landImpact.current}
                </div>
                <div className="text-sm text-muted-foreground">
                  {environmentalData.landImpact.unit}
                </div>
                <Progress value={environmentalData.landImpact.trend + 60} className="bg-orange-100" />
                <div className="text-sm text-orange-600">
                  {environmentalData.landImpact.trend}% increase this year
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Leaf className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Biodiversity Index</span>
                </div>
                {getTrendIcon(environmentalData.biodiversity.trend)}
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-foreground">
                  {environmentalData.biodiversity.current}
                </div>
                <div className="text-sm text-muted-foreground">
                  {environmentalData.biodiversity.unit}
                </div>
                <Progress value={environmentalData.biodiversity.current} />
                <div className="text-sm text-orange-600">
                  {Math.abs(environmentalData.biodiversity.trend)}% decline this year
                </div>
              </div>
            </Card>
          </div>

          {/* Overall Impact Score */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Overall Environmental Impact</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Progress value={company.impactScore} className="h-3" />
              </div>
              <Badge variant={getImpactColor(company.impactScore)} className="px-3 py-1">
                {company.impactScore}% Impact
              </Badge>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              Based on carbon emissions, water usage, land impact, and biodiversity metrics
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 bg-primary hover:bg-primary-glow">
              <Download className="h-4 w-4 mr-2" />
              Download Full Report
            </Button>
            <Button variant="outline" className="flex-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              Compare Similar Companies
            </Button>
            <Button variant="outline" className="flex-1">
              <MapPin className="h-4 w-4 mr-2" />
              View Satellite Data
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};