import mockData from '@/data/mockdata.json';

// Enhanced Company interface that works with real mockdata
export interface Company {
  id: string;
  name: string;
  position: [number, number, number]; // [lng, lat, 0] for compatibility
  type: 'manufacturing' | 'mining' | 'agriculture' | 'energy' | 'nuclear' | 'thermal';
  impactScore: number;
  country: string;
  
  // Additional real data fields
  industry: string;
  marketCap?: string;
  numberOfPlants?: number;
  revenue?: Record<string, string>;
  status?: string;
  places: CompanyPlace[];
}

export interface CompanyPlace {
  name: string;
  location: string;
  coordinates: [number, number, number, number]; // [tlx, tly, brx, bry]
}

// Raw mockdata interfaces
interface MockPlace {
  name: string;
  location: string;
  coordinates: [number, number, number, number];
}

interface MockCompany {
  company: string;
  Industry: string;
  "Market cap"?: string;
  "Number of plants"?: number;
  Revenue?: Record<string, string>;
  Status?: string;
  places: MockPlace[];
}

/**
 * Convert industry to standardized type
 */
function industryToType(industry: string): Company['type'] {
  const normalizedIndustry = industry.toLowerCase();
  
  if (normalizedIndustry.includes('coal')) return 'mining';
  if (normalizedIndustry.includes('nuclear')) return 'nuclear';
  if (normalizedIndustry.includes('thermal')) return 'thermal';
  if (normalizedIndustry.includes('oil') || normalizedIndustry.includes('gas')) return 'energy';
  if (normalizedIndustry.includes('mining')) return 'mining';
  if (normalizedIndustry.includes('manufacturing')) return 'manufacturing';
  if (normalizedIndustry.includes('agriculture')) return 'agriculture';
  
  return 'energy'; // Default fallback
}

/**
 * Calculate impact score based on industry and size
 */
function calculateImpactScore(industry: string, marketCap?: string, numberOfPlants?: number): number {
  let score = 30; // Base score
  
  // Industry-based scoring
  const normalizedIndustry = industry.toLowerCase();
  if (normalizedIndustry.includes('coal')) score += 50;
  else if (normalizedIndustry.includes('nuclear')) score += 45;
  else if (normalizedIndustry.includes('oil')) score += 40;
  else if (normalizedIndustry.includes('gas')) score += 35;
  else if (normalizedIndustry.includes('thermal')) score += 35;
  else if (normalizedIndustry.includes('mining')) score += 30;
  else if (normalizedIndustry.includes('manufacturing')) score += 20;
  
  // Market cap influence
  if (marketCap) {
    const value = parseFloat(marketCap.replace(/[^\d.]/g, ''));
    if (marketCap.toLowerCase().includes('billion')) {
      if (value > 50) score += 15;
      else if (value > 20) score += 10;
      else if (value > 5) score += 5;
    }
  }
  
  // Plant count influence
  if (numberOfPlants) {
    score += Math.min(numberOfPlants * 3, 20);
  }
  
  return Math.min(Math.max(score, 0), 100);
}

/**
 * Extract country from location string
 */
function extractCountry(places: CompanyPlace[]): string {
  if (places.length === 0) return 'Unknown';
  
  const location = places[0].location;
  const parts = location.split(',');
  return parts[parts.length - 1].trim();
}

/**
 * Calculate center position from all places
 */
function calculateCenterPosition(places: CompanyPlace[]): [number, number, number] {
  if (places.length === 0) return [0, 0, 0];
  
  const totalLng = places.reduce((sum, place) => {
    const [tlx, tly, brx, bry] = place.coordinates;
    return sum + (tlx + brx) / 2;
  }, 0);
  
  const totalLat = places.reduce((sum, place) => {
    const [tlx, tly, brx, bry] = place.coordinates;
    return sum + (tly + bry) / 2;
  }, 0);
  
  return [totalLng / places.length, totalLat / places.length, 0];
}

/**
 * Convert mockdata to Company format
 */
function convertMockToCompany(mockCompany: MockCompany, index: number): Company {
  const places: CompanyPlace[] = mockCompany.places.map(place => ({
    name: place.name,
    location: place.location,
    coordinates: place.coordinates
  }));

  return {
    id: `mock-${index}`,
    name: mockCompany.company,
    position: calculateCenterPosition(places),
    type: industryToType(mockCompany.Industry),
    impactScore: calculateImpactScore(
      mockCompany.Industry, 
      mockCompany["Market cap"], 
      mockCompany["Number of plants"]
    ),
    country: extractCountry(places),
    
    // Additional fields
    industry: mockCompany.Industry,
    marketCap: mockCompany["Market cap"],
    numberOfPlants: mockCompany["Number of plants"],
    revenue: mockCompany.Revenue,
    status: mockCompany.Status,
    places
  };
}

// Load and convert all companies from mockdata
const mockCompanies: MockCompany[] = mockData as MockCompany[];
export const companies: Company[] = mockCompanies.map((mockCompany, index) => 
  convertMockToCompany(mockCompany, index)
);

/**
 * Get company by ID
 */
export function getCompanyById(id: string): Company | undefined {
  return companies.find(c => c.id === id);
}

/**
 * Get similar companies based on type and impact score
 */
export function getSimilarCompanies(base: Company, count = 3): Company[] {
  const pool = companies.filter(c => c.type === base.type && c.id !== base.id);
  return pool
    .sort((a, b) => Math.abs(a.impactScore - base.impactScore) - Math.abs(b.impactScore - base.impactScore))
    .slice(0, count);
}

/**
 * Get companies by type
 */
export function getCompaniesByType(type: Company['type']): Company[] {
  return companies.filter(c => c.type === type);
}

/**
 * Get companies by industry
 */
export function getCompaniesByIndustry(industry: string): Company[] {
  return companies.filter(c => 
    c.industry.toLowerCase().includes(industry.toLowerCase())
  );
}

/**
 * Get all unique industries
 */
export function getAllIndustries(): string[] {
  const industries = new Set(companies.map(c => c.industry));
  return Array.from(industries).sort();
}

/**
 * Get all unique countries
 */
export function getAllCountries(): string[] {
  const countries = new Set(companies.map(c => c.country));
  return Array.from(countries).sort();
}