export type Company = {
  id: string
  name: string
  position: [number, number, number]
  type: 'manufacturing' | 'mining' | 'agriculture' | 'energy'
  impactScore: number
  country: string
}

export const companies: Company[] = [
  { id: '1', name: 'TechCorp Manufacturing', position: [1.2, 0.8, 0.9], type: 'manufacturing', impactScore: 72, country: 'USA' },
  { id: '2', name: 'GreenEnergy Solutions', position: [-0.5, 0.3, 1.1], type: 'energy', impactScore: 45, country: 'Germany' },
  { id: '3', name: 'AgroGiant Facilities', position: [0.8, -0.6, 0.7], type: 'agriculture', impactScore: 88, country: 'Brazil' },
  { id: '4', name: 'BlueSteel Mining', position: [-0.9, 0.4, -0.6], type: 'mining', impactScore: 65, country: 'Canada' },
  { id: '5', name: 'Solaris Power', position: [0.2, 1.0, -0.3], type: 'energy', impactScore: 38, country: 'Australia' },
  { id: '6', name: 'AgriFoods Ltd', position: [-1.0, -0.2, 0.5], type: 'agriculture', impactScore: 54, country: 'India' },
  { id: '7', name: 'EuroManufacture', position: [0.6, 0.1, -0.9], type: 'manufacturing', impactScore: 47, country: 'France' },
  { id: '8', name: 'ShinTech Fabrication', position: [-0.3, -0.9, 0.8], type: 'manufacturing', impactScore: 59, country: 'Japan' },
  { id: '9', name: 'Nordic Minerals', position: [0.7, -0.2, 0.9], type: 'mining', impactScore: 33, country: 'Norway' },
  { id: '10', name: 'Desert Oil Fields', position: [0.9, 0.5, -0.4], type: 'energy', impactScore: 81, country: 'Saudi Arabia' },
  { id: '11', name: 'RiverValley Farms', position: [-0.4, 0.7, 0.6], type: 'agriculture', impactScore: 42, country: 'Argentina' },
  { id: '12', name: 'MetroWorks Assembly', position: [0.5, 0.9, -0.2], type: 'manufacturing', impactScore: 36, country: 'UK' },
  { id: '13', name: 'Siberia Metals', position: [-0.8, -0.5, 0.4], type: 'mining', impactScore: 76, country: 'Russia' },
  { id: '14', name: 'Coastal Wind Co', position: [0.1, -1.1, 0.6], type: 'energy', impactScore: 29, country: 'Spain' },
  { id: '15', name: 'Mediterranean Agro', position: [-0.6, 0.2, -1.0], type: 'agriculture', impactScore: 51, country: 'Italy' },
  { id: '16', name: 'TransPacific Fabricators', position: [1.0, -0.1, 0.2], type: 'manufacturing', impactScore: 63, country: 'China' },
  { id: '17', name: 'Andes Mining Group', position: [-0.7, 0.8, -0.1], type: 'mining', impactScore: 57, country: 'Peru' },
  { id: '18', name: 'Equatorial BioFarms', position: [0.2, -0.8, 1.0], type: 'agriculture', impactScore: 46, country: 'Indonesia' },
  { id: '19', name: 'Gulf Petro Energy', position: [0.4, 0.6, 0.9], type: 'energy', impactScore: 84, country: 'UAE' },
  { id: '20', name: 'Savanna Growers', position: [-0.2, 0.9, -0.7], type: 'agriculture', impactScore: 40, country: 'South Africa' }
]

export function getCompanyById (id: string): Company | undefined {
  return companies.find(c => c.id === id)
}

export function getSimilarCompanies (base: Company, count = 3): Company[] {
  const pool = companies.filter(c => c.type === base.type && c.id !== base.id)
  return pool
    .sort((a, b) => Math.abs(a.impactScore - base.impactScore) - Math.abs(b.impactScore - base.impactScore))
    .slice(0, count)
}


