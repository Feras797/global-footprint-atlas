export interface MineLocation {
  name: string;
  location: string;
  coordinates: [number, number]; // [longitude, latitude]
  "Number of plants": number;
}

export interface CompanyData {
  company: string;
  Industry: string;
  "Market cap": string;
  Revenue?: Record<string, string>; // More flexible revenue structure
  places?: MineLocation[]; // For mockdata.JSON compatibility
  mines?: MineLocation[];  // For src/data/mockdata.json compatibility
}

export interface GlobeEntity {
  id: string;
  name: string;
  company: string;
  industry: string;
  marketCap: string;
  longitude: number;
  latitude: number;
  numberOfPlants: number;
  location: string;
}

export interface GlobeViewProps {
  longitude?: number;
  latitude?: number;
  height?: number;
  heading?: number;
  pitch?: number;
  roll?: number;
}

export interface CesiumGlobeProps {
  companies: CompanyData[];
  onEntitySelect?: (entity: GlobeEntity | null) => void;
  defaultView?: GlobeViewProps;
  showControls?: boolean;
  className?: string;
}
