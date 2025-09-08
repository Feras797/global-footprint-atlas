import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Globe, Search, TrendingUp, Leaf, BarChart3, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";
import earthHero from "@/assets/earth-hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${earthHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-sky opacity-20"></div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <Shield className="w-16 h-16 mx-auto mb-6 text-accent animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Protect Our Planet
            <span className="block bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              Through Data
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Analyze corporate environmental impact through advanced visualization and comprehensive sustainability metrics. Make data-driven decisions to protect our Earth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-4 text-lg shadow-glow transition-all duration-300 hover:scale-105"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Start Analysis
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comprehensive Environmental Intelligence</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced tools and data to understand corporate environmental impact worldwide
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-earth transition-all duration-300 hover:-translate-y-1">
              <Globe className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-3">Global Analysis</h3>
              <p className="text-muted-foreground">
                Analyze environmental impact across global facilities with comprehensive data visualization
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-earth transition-all duration-300 hover:-translate-y-1">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <h3 className="text-xl font-semibold mb-3">Time-based Insights</h3>
              <p className="text-muted-foreground">
                Track environmental changes over time with detailed temporal analysis and trends
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-earth transition-all duration-300 hover:-translate-y-1">
              <Leaf className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h3 className="text-xl font-semibold mb-3">Impact Reports</h3>
              <p className="text-muted-foreground">
                Generate comprehensive reports with detailed environmental metrics and recommendations
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">2,500+</div>
              <div className="text-muted-foreground">Companies Analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">150+</div>
              <div className="text-muted-foreground">Countries Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">98%</div>
              <div className="text-muted-foreground">Data Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-earth text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <Users className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join environmental scientists, researchers, and organizations using ProtectEarth to drive sustainable change.
          </p>
          <Link to="/dashboard">
            <Button 
              size="lg" 
              variant="secondary"
              className="px-8 py-4 text-lg shadow-glow transition-all duration-300 hover:scale-105"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Access Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-background">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-6 w-6" />
            <span className="text-lg font-bold">ProtectEarth</span>
          </div>
          <p className="text-sm opacity-80">
            Making environmental data accessible for a sustainable future.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;