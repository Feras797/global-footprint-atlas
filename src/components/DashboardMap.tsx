import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface CompanyLocation {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'manufacturing' | 'mining' | 'agriculture' | 'energy' | 'nuclear' | 'thermal';
  impactScore: number;
  country: string;
}

interface DashboardMapProps {
  companies: CompanyLocation[];
  onCompanySelect: (company: CompanyLocation) => void;
  filters: {
    type: string;
    impactRange: [number, number];
    timeRange: string;
  };
}

const Globe = ({ companies, onCompanySelect }: { companies: CompanyLocation[], onCompanySelect: (company: CompanyLocation) => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001; // Slower rotation for dashboard
    }
  });

  const getMarkerColor = (type: string, impactScore: number) => {
    if (impactScore > 70) return '#ef4444'; // Red for high impact
    if (impactScore > 40) return '#f59e0b'; // Orange for medium impact
    return '#22c55e'; // Green for low impact
  };

  return (
    <group>
      {/* Earth Globe - smaller and more subtle for dashboard */}
      <Sphere ref={meshRef} args={[1.5, 32, 32]}>
        <meshPhongMaterial
          color="#1e40af"
          transparent
          opacity={0.7}
          shininess={80}
          specular="#87ceeb"
        />
      </Sphere>

      {/* Atmosphere */}
      <Sphere args={[1.55, 32, 32]}>
        <meshBasicMaterial
          color="#87ceeb"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Company Markers - smaller for dashboard */}
      {companies.map((company) => (
        <group key={company.id}>
          <mesh
            position={[
              company.position[0] * 1.6,
              company.position[1] * 1.6,
              company.position[2] * 1.6
            ]}
            onClick={() => onCompanySelect(company)}
          >
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshBasicMaterial color={getMarkerColor(company.type, company.impactScore)} />
          </mesh>

          {/* Simplified hover info - only show on hover */}
          <Html
            position={[
              company.position[0] * 1.8,
              company.position[1] * 1.8,
              company.position[2] * 1.8
            ]}
            distanceFactor={6}
            occlude
          >
            <div 
              className="opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            >
              <Card className="p-2 bg-background/95 backdrop-blur-sm border shadow-sm">
                <div className="text-xs">
                  <div className="font-medium text-foreground">{company.name}</div>
                  <Badge 
                    variant={company.impactScore > 70 ? "destructive" : company.impactScore > 40 ? "secondary" : "default"}
                    className="mt-1 text-xs"
                  >
                    {company.impactScore}%
                  </Badge>
                </div>
              </Card>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};

export const DashboardMap: React.FC<DashboardMapProps> = ({
  companies,
  onCompanySelect,
  filters
}) => {
  const [filteredCompanies, setFilteredCompanies] = useState(companies);

  useEffect(() => {
    let filtered = companies;

    // Apply same filtering logic as the original InteractiveGlobe
    if (filters.type !== 'all') {
      filtered = filtered.filter(company => company.type === filters.type);
    }

    filtered = filtered.filter(company => 
      company.impactScore >= filters.impactRange[0] && 
      company.impactScore <= filters.impactRange[1]
    );

    setFilteredCompanies(filtered);
  }, [companies, filters]);

  return (
    <div className="h-full w-full relative rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.4} />
        
        <Globe companies={filteredCompanies} onCompanySelect={onCompanySelect} />
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          zoomSpeed={0.4}
          rotateSpeed={0.3}
          minDistance={2.5}
          maxDistance={6}
        />
      </Canvas>

      {/* Compact Stats Overlay for Dashboard */}
      <div className="absolute bottom-2 right-2 z-10">
        <Card className="p-2 bg-background/90 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground">
            {filteredCompanies.length} facilities
          </div>
        </Card>
      </div>
    </div>
  );
};