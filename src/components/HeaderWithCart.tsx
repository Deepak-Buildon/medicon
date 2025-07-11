import React from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Settings, Syringe } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import bluePillLogo from "@/assets/blue-pill-logo.png";

interface HeaderWithCartProps {
  userType: 'buyer' | 'seller';
  onSwitchMode: () => void;
  onCartClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

export const HeaderWithCart: React.FC<HeaderWithCartProps> = ({ 
  userType, 
  onSwitchMode,
  onCartClick,
  onProfileClick,
  onSettingsClick
}) => {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <img src={bluePillLogo} alt="Blue Pill" className="h-8 w-8 mr-2" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">QuickDose</span>
          <Syringe className="h-6 w-6 text-secondary ml-2" />
        </div>
        
        <div className="flex items-center space-x-4">
          {userType === 'buyer' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative hover:bg-primary/10"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5 text-primary" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="hover:bg-primary/10"
            onClick={onProfileClick}
          >
            <User className="h-5 w-5 text-primary mr-2" />
            Profile
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onSettingsClick}
            className="hover:bg-primary/10"
          >
            <Settings className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </div>
    </header>
  );
};