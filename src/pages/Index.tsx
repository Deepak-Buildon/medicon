import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { HeaderWithCart } from '@/components/HeaderWithCart';
import { MedicineList } from '@/components/MedicineList';
import { AuthPage } from '@/components/auth/AuthPage';
import { UserProfile } from '@/components/auth/UserProfile';
import MedicalShopsMap from '@/components/MedicalShopsMap';
import UserLocationManager from '@/components/UserLocationManager';
import { CartProvider } from '@/contexts/CartContext';
import { Navigation } from '@/components/Navigation';
import { Settings } from '@/components/Settings';
import { InventoryManagement } from '@/components/InventoryManagement';
import NearbyShops from '@/components/NearbyShops';
import ShopRegistration from '@/components/ShopRegistration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, Syringe, ShoppingBag, Store, Clock, Shield, Users } from 'lucide-react';
import type { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'auth' | 'profile' | 'map' | 'settings' | 'inventory' | 'nearby' | 'shop-registration'>('home');
  const [userType, setUserType] = useState<'buyer' | 'seller' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserType(session.user.id);
          }, 0);
        } else {
          setUserType(null);
          setCurrentView('home');
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserType(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserType = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (data) {
        setUserType(data.user_type as 'buyer' | 'seller');
      }
    } catch (error) {
      console.error('Error fetching user type:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <Pill className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Loading QuickDose...</p>
        </div>
      </div>
    );
  }

  // Render authentication page
  if (currentView === 'auth') {
    return <AuthPage />;
  }

  // Show user profile if logged in and on profile view
  if (user && currentView === 'profile') {
    return <UserProfile user={user} />;
  }

  // Show other views based on currentView
  if (user) {
    return (
      <CartProvider>
        <div className="min-h-screen bg-background">
          <main className="container mx-auto px-4 py-6">
            {currentView === 'home' && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <h1 className="text-3xl font-bold mb-4">Welcome to QuickDose</h1>
                  <p className="text-muted-foreground">Find medicines and pharmacies near you</p>
                </div>
                <MedicineList />
              </div>
            )}
            {currentView === 'map' && (
              <MedicalShopsMap onClose={() => setCurrentView('home')} />
            )}
            {currentView === 'settings' && (
              <Settings 
                userType={userType} 
                onSwitchMode={() => setCurrentView('home')}
                onClose={() => setCurrentView('home')}
              />
            )}
            {currentView === 'inventory' && userType === 'seller' && <InventoryManagement />}
            {currentView === 'nearby' && <NearbyShops />}
            {currentView === 'shop-registration' && userType === 'seller' && <ShopRegistration />}
          </main>
        </div>
      </CartProvider>
    );
  }

  // Welcome page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Pill className="h-10 w-10 text-primary mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              QuickDose
            </h1>
            <Syringe className="h-10 w-10 text-secondary ml-3" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your trusted marketplace connecting medicine buyers with local pharmacies
          </p>
        </div>

        {/* Authentication CTA */}
        <div className="max-w-md mx-auto mb-16">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Get Started
              </CardTitle>
              <CardDescription>
                Join QuickDose to find medicines and connect with pharmacies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setCurrentView('auth')}
                className="w-full h-12 text-base bg-gradient-to-r from-primary to-accent"
              >
                Login or Register
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User Type Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full w-fit">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">For Buyers</CardTitle>
              <CardDescription>Find and order medicines from nearby pharmacies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                Fast delivery in your area
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Shield className="h-4 w-4 mr-2" />
                Verified medicines & pharmacies
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                Compare prices across stores
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-full w-fit">
                <Store className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-2xl">For Sellers</CardTitle>
              <CardDescription>List your pharmacy and reach more customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                Reach customers in your area
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Manage orders & inventory
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Shield className="h-4 w-4 mr-2" />
                Secure payment processing
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Why Choose QuickDose?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-3">
              <div className="mx-auto w-fit p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Fast Delivery</h3>
              <p className="text-muted-foreground">Get your medicines delivered quickly from nearby pharmacies</p>
            </div>
            <div className="space-y-3">
              <div className="mx-auto w-fit p-3 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-full">
                <Syringe className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Medical Excellence</h3>
              <p className="text-muted-foreground">Professional medical supplies and verified pharmaceuticals</p>
            </div>
            <div className="space-y-3">
              <div className="mx-auto w-fit p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Trusted Network</h3>
              <p className="text-muted-foreground">Connect with licensed pharmacies in your neighborhood</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;