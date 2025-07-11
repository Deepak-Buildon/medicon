import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Settings, User, Pill, Syringe } from "lucide-react";


interface NavigationProps {
  onBack?: () => void;
  onForward?: () => void;
  onSettings?: () => void;
  showBackButton?: boolean;
  showForwardButton?: boolean;
  title?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  onBack,
  onForward,
  onSettings,
  showBackButton = false,
  showForwardButton = false,
  title = "QuickDose"
}) => {
  return (
    <nav className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onBack}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center">
            <Pill className="h-6 w-6 text-primary mr-2" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {title}
            </span>
            <Syringe className="h-6 w-6 text-secondary ml-2" />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {showForwardButton && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onForward}
              className="hover:bg-primary/10"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onSettings}
            className="hover:bg-primary/10"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};