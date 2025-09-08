import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CompanyCard } from "@/components/company";
import { Building2 } from "lucide-react";

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

  return (
    <div className="space-y-4">
      <ScrollArea className={showAll ? "h-[calc(100vh-10rem)]" : "h-auto"}>
        {showAll ? (
          <div className="space-y-8">
            {['manufacturing','energy','agriculture','mining'].map((type) => {
              const group = companies.filter((c) => c.type === type)
              if (group.length === 0) return null
              const title = type.charAt(0).toUpperCase() + type.slice(1)
              return (
                <div key={type} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h4>
                    <div className="text-xs text-muted-foreground">{group.length} companies</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.map((company) => (
                      <CompanyCard
                        key={company.id}
                        company={company}
                        onSelect={onCompanySelect}
                        variant="default"
                        showActions
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onSelect={onCompanySelect}
                variant="compact"
                showActions={false}
              />
            ))}
          </div>
        )}
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