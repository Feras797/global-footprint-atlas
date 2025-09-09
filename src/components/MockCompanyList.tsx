import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { mockCompanies, companyIndexToId } from "@/lib/mockdata-companies";
import { Building2, MapPin } from "lucide-react";

export const MockCompanyList: React.FC = () => {
  const navigate = useNavigate();

  const handleCompanyClick = (index: number) => {
    const companyId = companyIndexToId(index);
    navigate(`/company/${companyId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Mock Companies (Real Data)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {mockCompanies.map((company, index) => (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                <div onClick={() => handleCompanyClick(index)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{company.company}</h3>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{company.Industry}</Badge>
                        {company["Market cap"] && (
                          <span className="text-xs">Cap: {company["Market cap"]}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{company.places.length} operational site{company.places.length !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Places: {company.places.map(place => place.name).join(', ')}
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCompanyClick(index);
                    }}
                  >
                    View Analysis (ID: {companyIndexToId(index)})
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
