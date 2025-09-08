// Original interface for backward compatibility
export interface CompanyLocation {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'manufacturing' | 'mining' | 'agriculture' | 'energy';
  impactScore: number;
  country: string;
}

// Interface for individual mine/facility data
export interface MineData {
  name: string;
  location: string;
  coordinates: [number, number]; // [longitude, latitude]
  "Number of plants": number;
}

// Interface for company data from mockdata.JSON
export interface MockCompanyData {
  company: string;
  Industry: string;
  "Market cap": string; // e.g., "26.61 Billion"
  mines: MineData[];
}

// New flexible interface for external data (backward compatibility)
export interface RawCompanyData {
  company: string;
  mine?: string;
  location: string;
  coordinates: [number, number]; // [longitude, latitude]
  Industry: string;
  "Number of plants"?: number;
  "Market cap"?: number; // in billions
  [key: string]: any; // Allow additional properties
}

// Enhanced interface that combines both formats
export interface EnhancedCompanyLocation {
  id: string;
  name: string;
  displayName?: string; // For cases where we want a different display name
  facility?: string; // Mine, plant, facility name
  coordinates: [number, number]; // [longitude, latitude]
  location: string; // Human-readable location string
  industry: string;
  type: 'manufacturing' | 'mining' | 'agriculture' | 'energy' | 'chemical' | 'technology';
  impactScore: number;
  country: string;
  marketCap?: number; // In billions
  plantCount?: number;
  additionalData?: Record<string, any>; // Store any extra data
}

// Utility function to convert raw data to enhanced format
export function convertRawToEnhanced(raw: RawCompanyData, id?: string): EnhancedCompanyLocation {
  // Determine type based on industry
  const getTypeFromIndustry = (industry: string): EnhancedCompanyLocation['type'] => {
    const normalizedIndustry = industry.toLowerCase();
    if (normalizedIndustry.includes('coal') || normalizedIndustry.includes('oil') || 
        normalizedIndustry.includes('gas') || normalizedIndustry.includes('energy')) {
      return 'energy';
    }
    if (normalizedIndustry.includes('mining') || normalizedIndustry.includes('mineral')) {
      return 'mining';
    }
    if (normalizedIndustry.includes('manufacturing') || normalizedIndustry.includes('industrial')) {
      return 'manufacturing';
    }
    if (normalizedIndustry.includes('agriculture') || normalizedIndustry.includes('farming')) {
      return 'agriculture';
    }
    if (normalizedIndustry.includes('chemical') || normalizedIndustry.includes('petrochemical')) {
      return 'chemical';
    }
    if (normalizedIndustry.includes('technology') || normalizedIndustry.includes('tech')) {
      return 'technology';
    }
    return 'manufacturing'; // Default fallback
  };

  // Calculate impact score (this could be more sophisticated)
  const calculateImpactScore = (): number => {
    let score = 30; // Base score
    
    // Industry-based scoring
    const industry = raw.Industry.toLowerCase();
    if (industry.includes('coal')) score += 50;
    else if (industry.includes('oil')) score += 45;
    else if (industry.includes('gas')) score += 35;
    else if (industry.includes('mining')) score += 40;
    else if (industry.includes('chemical')) score += 35;
    else if (industry.includes('manufacturing')) score += 20;
    
    // Market cap influence
    if (raw["Market cap"]) {
      if (raw["Market cap"] > 50) score += 15;
      else if (raw["Market cap"] > 20) score += 10;
      else if (raw["Market cap"] > 5) score += 5;
    }
    
    // Plant count influence
    if (raw["Number of plants"]) {
      score += Math.min(raw["Number of plants"] * 2, 20);
    }
    
    return Math.min(Math.max(score, 0), 100);
  };

  // Extract country from location string (simple extraction)
  const extractCountry = (location: string): string => {
    const parts = location.split(',');
    return parts[parts.length - 1].trim();
  };

  return {
    id: id || `company-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: raw.company,
    displayName: raw.company,
    facility: raw.mine,
    coordinates: raw.coordinates,
    location: raw.location,
    industry: raw.Industry,
    type: getTypeFromIndustry(raw.Industry),
    impactScore: calculateImpactScore(),
    country: extractCountry(raw.location),
    marketCap: raw["Market cap"],
    plantCount: raw["Number of plants"],
    additionalData: {
      // Store any additional fields that don't fit the standard interface
      ...Object.fromEntries(
        Object.entries(raw).filter(([key]) => 
          !['company', 'mine', 'location', 'coordinates', 'Industry', 'Number of plants', 'Market cap'].includes(key)
        )
      )
    }
  };
}

// Convert enhanced format back to legacy format for compatibility
export function convertEnhancedToLegacy(enhanced: EnhancedCompanyLocation): CompanyLocation {
  return {
    id: enhanced.id,
    name: enhanced.displayName || enhanced.name,
    position: [enhanced.coordinates[0], enhanced.coordinates[1], 0], // Convert 2D to 3D
    type: enhanced.type === 'chemical' || enhanced.type === 'technology' ? 'manufacturing' : enhanced.type,
    impactScore: enhanced.impactScore,
    country: enhanced.country
  };
}

// Type guard to check if data is in raw format
export function isRawCompanyData(data: any): data is RawCompanyData {
  return (
    typeof data === 'object' &&
    typeof data.company === 'string' &&
    typeof data.location === 'string' &&
    Array.isArray(data.coordinates) &&
    data.coordinates.length === 2 &&
    typeof data.Industry === 'string'
  );
}

// Convert mock data to enhanced company locations (flattens mines)
export function convertMockDataToEnhanced(mockData: MockCompanyData[]): EnhancedCompanyLocation[] {
  const enhancedCompanies: EnhancedCompanyLocation[] = [];
  
  mockData.forEach((companyData, companyIndex) => {
    // Parse market cap string to number
    const parseMarketCap = (marketCapStr: string): number => {
      const numMatch = marketCapStr.match(/[\d.]+/);
      const num = numMatch ? parseFloat(numMatch[0]) : 0;
      
      if (marketCapStr.toLowerCase().includes('billion')) {
        return num;
      } else if (marketCapStr.toLowerCase().includes('million')) {
        return num / 1000; // Convert to billions
      }
      return num;
    };

    companyData.mines.forEach((mine, mineIndex) => {
      const enhanced: EnhancedCompanyLocation = {
        id: `${companyIndex}-${mineIndex}`,
        name: companyData.company,
        displayName: `${companyData.company}`,
        facility: mine.name,
        coordinates: mine.coordinates,
        location: mine.location,
        industry: companyData.Industry,
        type: getTypeFromIndustry(companyData.Industry),
        impactScore: calculateMockImpactScore(companyData.Industry, parseMarketCap(companyData["Market cap"]), mine["Number of plants"]),
        country: extractCountry(mine.location),
        marketCap: parseMarketCap(companyData["Market cap"]),
        plantCount: mine["Number of plants"],
        additionalData: {
          parentCompany: companyData.company,
          mineName: mine.name
        }
      };
      
      enhancedCompanies.push(enhanced);
    });
  });
  
  return enhancedCompanies;
}

// Helper function for mock data conversion
function getTypeFromIndustry(industry: string): EnhancedCompanyLocation['type'] {
  const normalizedIndustry = industry.toLowerCase();
  if (normalizedIndustry.includes('coal') || normalizedIndustry.includes('oil') || 
      normalizedIndustry.includes('gas') || normalizedIndustry.includes('energy')) {
    return 'energy';
  }
  if (normalizedIndustry.includes('mining') || normalizedIndustry.includes('mineral')) {
    return 'mining';
  }
  if (normalizedIndustry.includes('manufacturing') || normalizedIndustry.includes('industrial')) {
    return 'manufacturing';
  }
  if (normalizedIndustry.includes('agriculture') || normalizedIndustry.includes('farming')) {
    return 'agriculture';
  }
  if (normalizedIndustry.includes('chemical') || normalizedIndustry.includes('petrochemical')) {
    return 'chemical';
  }
  if (normalizedIndustry.includes('technology') || normalizedIndustry.includes('tech')) {
    return 'technology';
  }
  return 'energy'; // Default for coal/energy companies
}

// Calculate impact score for mock data
function calculateMockImpactScore(industry: string, marketCap: number, plantCount: number): number {
  let score = 30; // Base score
  
  // Industry-based scoring
  const normalizedIndustry = industry.toLowerCase();
  if (normalizedIndustry.includes('coal')) score += 50;
  else if (normalizedIndustry.includes('oil')) score += 45;
  else if (normalizedIndustry.includes('gas')) score += 35;
  else if (normalizedIndustry.includes('mining')) score += 40;
  else if (normalizedIndustry.includes('chemical')) score += 35;
  else if (normalizedIndustry.includes('manufacturing')) score += 20;
  
  // Market cap influence
  if (marketCap > 50) score += 15;
  else if (marketCap > 20) score += 10;
  else if (marketCap > 5) score += 5;
  else if (marketCap > 1) score += 3;
  else if (marketCap > 0.1) score += 1;
  
  // Plant count influence
  score += Math.min(plantCount * 2, 20);
  
  return Math.min(Math.max(score, 0), 100);
}

// Extract country from location string
function extractCountry(location: string): string {
  const parts = location.split(',');
  return parts[parts.length - 1].trim();
}

// Type guard to check if data is in enhanced format
export function isEnhancedCompanyLocation(data: any): data is EnhancedCompanyLocation {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    Array.isArray(data.coordinates) &&
    data.coordinates.length === 2 &&
    typeof data.industry === 'string' &&
    typeof data.type === 'string' &&
    typeof data.impactScore === 'number'
  );
}
