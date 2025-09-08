import { CompanyData, GlobeEntity, MineLocation } from "@/types/globe";

/**
 * Converts company data to globe entities for visualization
 */
export function convertCompaniesToGlobeEntities(companies: CompanyData[]): GlobeEntity[] {
  const entities: GlobeEntity[] = [];

  companies.forEach((company, companyIndex) => {
    // Handle both 'places' and 'mines' properties for data compatibility
    const locations = company.places || company.mines || [];
    
    locations.forEach((location: MineLocation, locationIndex) => {
      entities.push({
        id: `${companyIndex}-${locationIndex}`,
        name: location.name,
        company: company.company,
        industry: company.Industry,
        marketCap: company["Market cap"],
        longitude: location.coordinates[0],
        latitude: location.coordinates[1],
        numberOfPlants: location["Number of plants"],
        location: location.location,
      });
    });
  });

  return entities;
}

/**
 * Calculates appropriate globe view to show all entities
 */
export function calculateOptimalView(entities: GlobeEntity[]) {
  if (entities.length === 0) {
    return {
      longitude: 10,
      latitude: 45,
      height: 8000000, // 8,000 km for good global view like reset button
    };
  }

  const longitudes = entities.map(e => e.longitude);
  const latitudes = entities.map(e => e.latitude);
  
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  
  const centerLon = (minLon + maxLon) / 2;
  const centerLat = (minLat + maxLat) / 2;
  
  // Calculate appropriate height based on the span of coordinates
  const lonSpan = maxLon - minLon;
  const latSpan = maxLat - minLat;
  const maxSpan = Math.max(lonSpan, latSpan);
  
  // Height calculation that matches the reset button behavior
  const height = Math.max(4000000, maxSpan * 200000); // Minimum 4000km for closer view
  
  return {
    longitude: centerLon,
    latitude: centerLat,
    height: Math.min(height, 8000000), // Cap at 8,000km to match reset button
  };
}

/**
 * Gets color based on industry type for visual distinction
 */
export function getIndustryColor(industry: string): string {
  const industryLower = industry.toLowerCase();
  
  // Industry-based color mapping for visual distinction
  if (industryLower.includes('coal')) return '#2c3e50'; // Dark gray/black for coal
  if (industryLower.includes('oil') || industryLower.includes('petroleum')) return '#8b4513'; // Brown for oil
  if (industryLower.includes('gas') || industryLower.includes('natural gas')) return '#4169e1'; // Royal blue for gas
  if (industryLower.includes('mining') || industryLower.includes('metal')) return '#cd853f'; // Peru for mining
  if (industryLower.includes('renewable') || industryLower.includes('solar') || industryLower.includes('wind')) return '#228b22'; // Forest green for renewables
  if (industryLower.includes('nuclear')) return '#ffd700'; // Gold for nuclear
  if (industryLower.includes('hydro')) return '#1e90ff'; // Dodger blue for hydro
  if (industryLower.includes('manufacturing')) return '#708090'; // Slate gray for manufacturing
  if (industryLower.includes('agriculture') || industryLower.includes('farming')) return '#9acd32'; // Yellow green for agriculture
  if (industryLower.includes('technology') || industryLower.includes('tech')) return '#6a5acd'; // Slate blue for tech
  
  // Default color for unknown industries
  return '#dc143c'; // Crimson as fallback
}

/**
 * Gets color based on market cap value for secondary visual indication
 */
export function getMarketCapColor(marketCap: string): string {
  const value = parseFloat(marketCap.replace(/[^\d.]/g, ''));
  const unit = marketCap.toLowerCase();
  
  let normalizedValue = value;
  if (unit.includes('billion')) {
    normalizedValue = value * 1000; // Convert to millions for comparison
  }
  
  // Color scale based on market cap in millions (used for outlines/secondary indicators)
  if (normalizedValue >= 10000) return '#ff1744'; // Bright red for very large (>10B)
  if (normalizedValue >= 1000) return '#ff9800'; // Orange for large (1-10B)
  if (normalizedValue >= 100) return '#ffc107'; // Amber for medium (100M-1B)
  return '#4caf50'; // Green for small (<100M)
}

/**
 * Gets size scale based on number of plants
 */
export function getPlantSizeScale(numberOfPlants: number): number {
  // Scale from 1 to 3 based on number of plants
  return Math.max(1, Math.min(3, numberOfPlants / 2));
}

/**
 * Formats market cap for display
 */
export function formatMarketCap(marketCap: string): string {
  return marketCap;
}

/**
 * Groups entities by company for clustering
 */
export function groupEntitiesByCompany(entities: GlobeEntity[]): Record<string, GlobeEntity[]> {
  return entities.reduce((groups, entity) => {
    if (!groups[entity.company]) {
      groups[entity.company] = [];
    }
    groups[entity.company].push(entity);
    return groups;
  }, {} as Record<string, GlobeEntity[]>);
}

/**
 * Creates an SVG pin icon for a specific industry
 */
export function createIndustryPin(industry: string, color: string, size: number = 32): string {
  const industryLower = industry.toLowerCase();
  let iconPath = '';
  
  // Industry-specific icon paths (SVG paths)
  if (industryLower.includes('coal')) {
    iconPath = 'M12 2l3.09 6.26L22 9l-5 4.87L18.18 22 12 18.77 5.82 22 7 13.87 2 9l6.91-.74L12 2z'; // Diamond/crystal for coal
  } else if (industryLower.includes('oil') || industryLower.includes('petroleum')) {
    iconPath = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'; // Oil drop/gear
  } else if (industryLower.includes('gas')) {
    iconPath = 'M12 2L13.09 8.26L22 9L16 14L18 22L12 19L6 22L8 14L2 9L10.91 8.26L12 2Z'; // Flame-like shape
  } else if (industryLower.includes('renewable') || industryLower.includes('solar') || industryLower.includes('wind')) {
    iconPath = 'M12 2l3.09 6.26L22 9l-5 4.87L18.18 22 12 18.77 5.82 22 7 13.87 2 9l6.91-.74L12 2z'; // Sun/wind turbine
  } else if (industryLower.includes('manufacturing')) {
    iconPath = 'M22 9L12 2 2 9h3v13h14V9h3zM12 17.5L6.5 12H10V8h4v4h3.5L12 17.5z'; // Factory/building
  } else if (industryLower.includes('agriculture')) {
    iconPath = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'; // Leaf/plant
  } else {
    // Default pin icon
    iconPath = 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';
  }
  
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <path d="${iconPath}" fill="${color}" stroke="white" stroke-width="1" filter="url(#shadow)"/>
    </svg>
  `)}`;
}

/**
 * Gets all unique industries from entities for legend
 */
export function getUniqueIndustries(entities: GlobeEntity[]): string[] {
  const industries = new Set(entities.map(entity => entity.industry));
  return Array.from(industries).sort();
}

/**
 * Gets statistics for each industry
 */
export function getIndustryStats(entities: GlobeEntity[]): Record<string, { count: number; totalPlants: number; avgMarketCap: number }> {
  const stats: Record<string, { count: number; totalPlants: number; avgMarketCap: number; marketCaps: number[] }> = {};
  
  entities.forEach(entity => {
    if (!stats[entity.industry]) {
      stats[entity.industry] = { count: 0, totalPlants: 0, avgMarketCap: 0, marketCaps: [] };
    }
    
    stats[entity.industry].count++;
    stats[entity.industry].totalPlants += entity.numberOfPlants;
    
    // Parse market cap for averaging
    const value = parseFloat(entity.marketCap.replace(/[^\d.]/g, ''));
    const unit = entity.marketCap.toLowerCase();
    let normalizedValue = value;
    if (unit.includes('billion')) {
      normalizedValue = value * 1000; // Convert to millions
    }
    stats[entity.industry].marketCaps.push(normalizedValue);
  });
  
  // Calculate averages
  Object.keys(stats).forEach(industry => {
    const industryStats = stats[industry];
    industryStats.avgMarketCap = industryStats.marketCaps.reduce((sum, val) => sum + val, 0) / industryStats.marketCaps.length;
    delete (industryStats as any).marketCaps; // Remove temporary array
  });
  
  return stats as Record<string, { count: number; totalPlants: number; avgMarketCap: number }>;
}
