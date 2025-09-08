import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import Globe from "@/components/magicui/globe";
import { Shield, Target, TrendingUp, Crosshair, BarChart3, Radar, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-stealth text-foreground">
      <Navigation />
      
      {/* Hero Section with Globe */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-tactical">
        {/* Tactical Grid Background */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(251, 100, 21, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(251, 100, 21, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Globe Container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <Globe className="w-[600px] h-[600px]" />
            {/* Tactical Orange Glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-orange opacity-20 blur-3xl"></div>
          </div>
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 text-center text-foreground max-w-4xl mx-auto px-6">
          <div className="bg-background/20 backdrop-blur-md rounded-lg p-8 border border-primary/20">
            <Target className="w-16 h-16 mx-auto mb-6 text-primary animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-primary">PROTECT</span>
              <span className="block text-foreground">EARTH</span>
              <span className="block text-sm md:text-lg font-normal text-muted-foreground mt-2">
                TACTICAL ENVIRONMENTAL INTELLIGENCE
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 text-muted-foreground">
              Advanced surveillance and analysis of corporate environmental impact. 
              Deploy data-driven strategies to defend our planet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-4 text-lg shadow-tactical transition-all duration-300 hover:scale-105 font-semibold"
                >
                  <Radar className="mr-2 h-5 w-5" />
                  DEPLOY ANALYSIS
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary/30 text-primary hover:bg-primary/10 px-8 py-4 text-lg backdrop-blur-sm font-semibold"
              >
                <Crosshair className="mr-2 h-5 w-5" />
                TACTICAL BRIEF
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Capabilities */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">MISSION CAPABILITIES</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced tactical systems for environmental intelligence and corporate impact assessment
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-tactical transition-all duration-300 hover:-translate-y-1 bg-card border-primary/20">
              <Radar className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-3">GLOBAL SURVEILLANCE</h3>
              <p className="text-muted-foreground">
                Real-time monitoring of environmental impact zones with advanced satellite intelligence
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-tactical transition-all duration-300 hover:-translate-y-1 bg-card border-primary/20">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-3">THREAT ANALYSIS</h3>
              <p className="text-muted-foreground">
                Track environmental threats over time with predictive modeling and trend analysis
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-tactical transition-all duration-300 hover:-translate-y-1 bg-card border-primary/20">
              <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-3">DEFENSE REPORTS</h3>
              <p className="text-muted-foreground">
                Generate classified tactical reports with detailed environmental impact assessments
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Intel Statistics */}
      <section className="py-20 bg-gradient-tactical border-y border-primary/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="bg-background/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold text-primary mb-2">2,500+</div>
              <div className="text-muted-foreground font-medium">TARGETS ANALYZED</div>
            </div>
            <div className="bg-background/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold text-primary mb-2">150+</div>
              <div className="text-muted-foreground font-medium">REGIONS SECURED</div>
            </div>
            <div className="bg-background/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground font-medium">INTEL ACCURACY</div>
            </div>
            <div className="bg-background/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground font-medium">ACTIVE MONITORING</div>
            </div>
          </div>
        </div>
      </section>

      {/* Command Center Access */}
      <section className="py-20 bg-gradient-command">
        <div className="max-w-4xl mx-auto text-center px-6">
          <Zap className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h2 className="text-4xl font-bold mb-6">ACCESS COMMAND CENTER</h2>
          <p className="text-xl mb-8 text-muted-foreground">
            Join environmental defense operatives using ProtectEarth tactical systems 
            to conduct critical planetary protection missions.
          </p>
          <Link to="/dashboard">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-4 text-lg shadow-tactical transition-all duration-300 hover:scale-105 font-semibold"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              ENTER COMMAND CENTER
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-primary/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">PROTECTEARTH</span>
              <span className="text-xs text-muted-foreground ml-2">CLASSIFIED</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              TACTICAL ENVIRONMENTAL INTELLIGENCE SYSTEM<br/>
              <span className="text-primary">DEFENDING EARTH THROUGH DATA</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;