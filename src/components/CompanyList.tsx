import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CompanyCard } from "@/components/company";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Building2, Search } from "lucide-react";

interface CompanyLocation {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'manufacturing' | 'mining' | 'agriculture' | 'energy' | 'nuclear' | 'thermal';
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
  const [query, setQuery] = useState("");

  const filteredCompanies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q)
    );
  }, [companies, query]);

  const displayedCompanies = showAll ? filteredCompanies : companies.slice(0, 5);

  return (
    <div className="space-y-4">
      {showAll && (
        <div className="sticky top-0 z-10 pb-2 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 pr-8 md:pr-12">
          <div className="relative w-full md:w-[calc(50%-0.75rem)]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies..."
              className="h-9 pl-9 rounded-full w-full"
            />
          </div>
        </div>
      )}

      <ScrollArea className={showAll ? "h-[calc(100vh-10rem)]" : "h-auto"}>
        <div className={showAll ? "pr-8 md:pr-12" : undefined}>
        {showAll ? (
          <Accordion type="multiple" defaultValue={["manufacturing","energy","agriculture","mining"]} className="space-y-2">
            {['manufacturing','energy','agriculture','mining'].map((type) => {
              const group = displayedCompanies.filter((c) => c.type === type);
              if (group.length === 0) return null;
              const title = type.charAt(0).toUpperCase() + type.slice(1);
              return (
                <AccordionItem key={type} value={type} className="px-0">
                  <AccordionTrigger className="py-2 hover:no-underline hover:border-b hover:border-primary/30 transition-all duration-200">
                    <div className="flex items-center justify-between w-full">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h4>
                      <div className="text-xs text-muted-foreground mr-2 md:mr-3">{group.length} companies</div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 [&>div:nth-child(-n+2)]:mt-1 md:[&>div:nth-child(-n+2)]:mt-2">
                      {group.map((company) => (
                        <CompanyCard
                          key={company.id}
                          company={company}
                          onSelect={onCompanySelect}
                          variant="default"
                          className="rounded-none bg-transparent shadow-none p-6"
                          showActions
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
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
        </div>
      </ScrollArea>

      {!showAll && companies.length > 5 && (
        <div className="text-center pt-2">
          <Button variant="outline" size="sm" className="text-xs">
            View All {companies.length} Companies
          </Button>
        </div>
      )}

      {displayedCompanies.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <div className="text-sm">No companies found</div>
        </div>
      )}
    </div>
  );
};