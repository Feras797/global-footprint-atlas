import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, MapPin, TrendingUp, Eye } from "lucide-react";

interface CompanyLocation {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'manufacturing' | 'mining' | 'agriculture' | 'energy';
  impactScore: number;
  country: string;
}

interface CompanyListProps {
  companies: CompanyLocation[];
  onCompanySelect: (company: CompanyLocation) => void;
  showAll?: boolean;
}

export const CompanyList: React.FC<CompanyListProps> = ({ 
  companies, 
  onCompanySelect,
  showAll = false 
}) => {
  const displayedCompanies = showAll ? companies : companies.slice(0, 5);

  const getImpactColor = (score: number) => {
    if (score > 70) return 'destructive';
    if (score > 40) return 'secondary';
    return 'default';
  };

  const getTypeIcon = (type: string) => {
    return Building2;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manufacturing': return 'bg-blue-100 text-blue-800';
      case 'energy': return 'bg-green-100 text-green-800';
      case 'agriculture': return 'bg-yellow-100 text-yellow-800';
      case 'mining': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <ScrollArea className={showAll ? "h-96" : "h-auto"}>
        <div className="space-y-3">
          {displayedCompanies.map((company) => {
            const TypeIcon = getTypeIcon(company.type);
            
            return (
              <Card 
                key={company.id}
                className="p-4 hover:shadow-earth transition-all duration-300 cursor-pointer"
                onClick={() => onCompanySelect(company)}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <TypeIcon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold text-sm text-foreground">
                          {company.name}
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{company.country}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompanySelect(company);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center justify-between">
                    <Badge 
                      className={`text-xs ${getTypeColor(company.type)}`}
                      variant="secondary"
                    >
                      {company.type.charAt(0).toUpperCase() + company.type.slice(1)}
                    </Badge>
                    
                    <Badge 
                      variant={getImpactColor(company.impactScore)}
                      className="text-xs"
                    >
                      {company.impactScore}% Impact
                    </Badge>
                  </div>

                  {/* Impact Trend */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Recent Trend</span>
                    <div className="flex items-center space-x-1 text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>-2.3% this month</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {!showAll && companies.length > 5 && (
        <div className="text-center pt-2">
          <Button variant="outline" size="sm" className="text-xs">
            View All {companies.length} Companies
          </Button>
        </div>
      )}

      {companies.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <div className="text-sm">No companies found</div>
        </div>
      )}
    </div>
  );
};