import { Button } from "@/components/ui/button";
import { Globe, Menu, Search, User } from "lucide-react";
import { useState } from "react";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">EarthImpact</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#explore" className="text-foreground hover:text-primary transition-colors">
              Explore
            </a>
            <a href="#companies" className="text-foreground hover:text-primary transition-colors">
              Companies
            </a>
            <a href="#reports" className="text-foreground hover:text-primary transition-colors">
              Reports
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">
              About
            </a>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary-glow">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col space-y-3">
              <a href="#explore" className="text-foreground hover:text-primary py-2">
                Explore
              </a>
              <a href="#companies" className="text-foreground hover:text-primary py-2">
                Companies
              </a>
              <a href="#reports" className="text-foreground hover:text-primary py-2">
                Reports
              </a>
              <a href="#about" className="text-foreground hover:text-primary py-2">
                About
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary-glow">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};