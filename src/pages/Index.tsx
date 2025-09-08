import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import Globe from "@/components/magicui/globe";
import { BarChart3, TrendingUp, Globe2, Users, Zap, MapPin, FileText, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle text-foreground">
      <Navigation />
      
      {/* Hero Section with Globe */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-primary">
        {/* Subtle Grid Background */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(58, 159, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(58, 159, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Globe Container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative translate-x-1/4 translate-y-1/4">
            <Globe className="w-[100vw] h-[100vw] min-w-[1000px] min-h-[1000px]" />
            {/* Blue Glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-blue opacity-20 blur-3xl"></div>
          </div>
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 text-center text-foreground max-w-4xl mx-auto px-6">
          <div className="bg-background/20 backdrop-blur-md rounded-lg p-8 border border-primary/20">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-primary">PROTECT</span>
              <span className="block text-foreground">EARTH</span>
              <span className="block text-sm md:text-lg font-normal text-white mt-2">
                ENVIRONMENTAL IMPACT MONITORING
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white">
              Monitor and analyze how companies impact the environment worldwide. 
              Make data-driven decisions for a <span className="text-primary font-semibold">sustainable future</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary-glow text-white px-8 py-4 text-lg shadow-glow transition-smooth hover:scale-105 font-semibold rounded-lg"
                >
                  <BarChart3 className="mr-2 h-5 w-5 text-white" />
                  Start Analysis
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary/30 text-primary hover:bg-primary/10 hover:text-white px-8 py-4 text-lg backdrop-blur-sm font-semibold rounded-lg"
              >
                <Search className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Platform Capabilities</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced environmental monitoring and analysis tools for corporate sustainability assessment
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-glow transition-spring hover:-translate-y-1 bg-card border-primary/20 rounded-xl">
              <Globe2 className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-3">Global Monitoring</h3>
              <p className="text-muted-foreground">
                Real-time tracking of environmental impact zones with comprehensive satellite data analysis
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-glow transition-spring hover:-translate-y-1 bg-card border-primary/20 rounded-xl">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-3">Impact Analysis</h3>
              <p className="text-muted-foreground">
                Track environmental changes over time with predictive modeling and trend analysis
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-glow transition-spring hover:-translate-y-1 bg-card border-primary/20 rounded-xl">
              <FileText className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-3">Detailed Reports</h3>
              <p className="text-muted-foreground">
                Generate comprehensive reports with detailed environmental impact assessments
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Data Insights */}
      <section className="py-20 bg-gradient-primary border-y border-primary/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="bg-background/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold text-primary mb-2">2,500+</div>
              <div className="text-muted-foreground font-medium">Companies Monitored</div>
            </div>
            <div className="bg-background/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold text-primary mb-2">150+</div>
              <div className="text-muted-foreground font-medium">Countries Covered</div>
            </div>
            <div className="bg-background/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground font-medium">Data Accuracy</div>
            </div>
            <div className="bg-background/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground font-medium">Live Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Access */}
      <section className="py-20 bg-gradient-surface">
        <div className="max-w-4xl mx-auto text-center px-6">
          <Zap className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h2 className="text-4xl font-bold mb-6">Access the Platform</h2>
          <p className="text-xl mb-8 text-muted-foreground">
            Join environmental researchers and organizations using ProtectEarth 
            to monitor corporate environmental impact worldwide.
          </p>
          <Link to="/dashboard">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-4 text-lg shadow-glow transition-spring hover:scale-105 font-semibold rounded-lg"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Open Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-primary/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-lg font-bold">PROTECTEARTH</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              Environmental Impact Monitoring Platform<br/>
              <span className="text-primary">Protecting Earth Through Data</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;