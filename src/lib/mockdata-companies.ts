import mockData from '@/data/mockdata.json';

export interface MockPlace {
  name: string;
  location: string;
  coordinates: [number, number, number, number]; // [tlx, tly, brx, bry]
}

export interface MockCompany {
  company: string;
  Industry: string;
  "Market cap"?: string;
  "Number of plants"?: number;
  Revenue?: Record<string, string>;
  Status?: string;
  places: MockPlace[];
}

// Load companies from mockdata.json
export const mockCompanies: MockCompany[] = mockData as MockCompany[];

/**
 * Get company by index (since we don't have IDs in mockdata)
 */
export function getMockCompanyByIndex(index: number): MockCompany | undefined {
  return mockCompanies[index];
}

/**
 * Get company by name
 */
export function getMockCompanyByName(name: string): MockCompany | undefined {
  return mockCompanies.find(company => company.company.toLowerCase().includes(name.toLowerCase()));
}

/**
 * Get all company names for routing
 */
export function getAllMockCompanyNames(): string[] {
  return mockCompanies.map(company => company.company);
}

/**
 * Convert company index to URL-friendly ID
 */
export function companyIndexToId(index: number): string {
  return `mock-${index}`;
}

/**
 * Convert URL-friendly ID back to company index
 */
export function companyIdToIndex(id: string): number | null {
  if (id.startsWith('mock-')) {
    const index = parseInt(id.replace('mock-', ''), 10);
    return isNaN(index) ? null : index;
  }
  return null;
}

/**
 * Get company by ID (supports both old format and new mock format)
 */
export function getCompanyByMockId(id: string): MockCompany | undefined {
  // Try new mock format first
  const mockIndex = companyIdToIndex(id);
  if (mockIndex !== null) {
    return getMockCompanyByIndex(mockIndex);
  }
  
  // For backward compatibility, try by name
  return getMockCompanyByName(id);
}
