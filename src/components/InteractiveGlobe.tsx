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
  type: 'manufacturing' | 'mining' | 'agriculture' | 'energy';
  impactScore: number;
  country: string;
}

interface InteractiveGlobeProps {
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
  const { camera } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  const getMarkerColor = (type: string, impactScore: number) => {
    if (impactScore > 70) return '#ef4444'; // Red for high impact
    if (impactScore > 40) return '#f59e0b'; // Orange for medium impact
    return '#22c55e'; // Green for low impact
  };

  return (
    <group>
      {/* Earth Globe */}
      <Sphere ref={meshRef} args={[2, 64, 64]}>
        <meshPhongMaterial
          color="#1e40af"
          transparent
          opacity={0.8}
          shininess={100}
          specular="#87ceeb"
        />
      </Sphere>

      {/* Atmosphere */}
      <Sphere args={[2.05, 64, 64]}>
        <meshBasicMaterial
          color="#87ceeb"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Company Markers */}
      {companies.map((company) => (
        <group key={company.id}>
          <mesh
            position={[
              company.position[0] * 2.1,
              company.position[1] * 2.1,
              company.position[2] * 2.1
            ]}
            onClick={() => onCompanySelect(company)}
          >
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color={getMarkerColor(company.type, company.impactScore)} />
          </mesh>

          {/* Floating Info Card */}
          <Html
            position={[
              company.position[0] * 2.3,
              company.position[1] * 2.3,
              company.position[2] * 2.3
            ]}
            distanceFactor={8}
            occlude
          >
            <Card 
              className="p-3 bg-background/90 backdrop-blur-sm border shadow-earth cursor-pointer hover:shadow-glow transition-all duration-300"
              onClick={() => onCompanySelect(company)}
            >
              <div className="text-sm">
                <div className="font-semibold text-foreground">{company.name}</div>
                <div className="text-muted-foreground">{company.country}</div>
                <Badge 
                  variant={company.impactScore > 70 ? "destructive" : company.impactScore > 40 ? "secondary" : "default"}
                  className="mt-1"
                >
                  Impact: {company.impactScore}%
                </Badge>
              </div>
            </Card>
          </Html>
        </group>
      ))}
    </group>
  );
};

export const InteractiveGlobe: React.FC<InteractiveGlobeProps> = ({
  companies,
  onCompanySelect,
  filters
}) => {
  const [filteredCompanies, setFilteredCompanies] = useState(companies);

  useEffect(() => {
    let filtered = companies;

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(company => company.type === filters.type);
    }

    // Filter by impact range
    filtered = filtered.filter(company => 
      company.impactScore >= filters.impactRange[0] && 
      company.impactScore <= filters.impactRange[1]
    );

    setFilteredCompanies(filtered);
  }, [companies, filters]);

  return (
    <div className="h-full w-full relative">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Globe companies={filteredCompanies} onCompanySelect={onCompanySelect} />
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          zoomSpeed={0.6}
          rotateSpeed={0.5}
          minDistance={3}
          maxDistance={10}
        />
      </Canvas>

      {/* Globe Stats Overlay */}
      <div className="absolute bottom-6 left-6 z-10">
        <Card className="p-4 bg-background/90 backdrop-blur-sm">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Active Facilities</div>
            <div className="text-2xl font-bold text-foreground">{filteredCompanies.length}</div>
            <div className="text-sm text-muted-foreground">
              Avg Impact: {Math.round(filteredCompanies.reduce((sum, c) => sum + c.impactScore, 0) / filteredCompanies.length || 0)}%
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};