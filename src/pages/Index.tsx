import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Store, Pill, Users, Clock, Shield, ShoppingCart, User as UserIcon, Syringe, LogOut, MapPin, ArrowLeft } from "lucide-react";
import { RegistrationForm } from "@/components/RegistrationForm";
import { LoginForm } from "@/components/LoginForm";
import { MedicineList } from "@/components/MedicineList";
import { InventoryManagement } from "@/components/InventoryManagement";
import { Cart } from "@/components/Cart";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { Input } from "@/components/ui/input";
import { HeaderWithCart } from "@/components/HeaderWithCart";
import { Label } from "@/components/ui/label";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { Settings } from "@/components/Settings";
import NearbyShops from "@/components/NearbyShops";
import ShopRegistration from "@/components/ShopRegistration";
import UserLocationManager from "@/components/UserLocationManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import type { User, Session } from '@supabase/supabase-js';

const IndexContent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<'buyer' | 'seller' | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [currentTab, setCurrentTab] = useState('search');
  const [showSettings, setShowSettings] = useState(false);
  const [userLocation, setUserLocation] = useState<string>("");
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Set up authentication state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

        if (data) {
          setProfile(data);
          if (data.user_type === 'buyer' || data.user_type === 'seller') {
            setUserType(data.user_type);
          }
          if (data.city) {
            setUserLocation(data.city);
          }
        }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserType(null);
      setUserLocation("");
      toast.success("Signed out successfully");
    }
  };

  const handleLocationRequest = async () => {
    if (!user) {
      toast.error("Please sign in to save your location");
      return;
    }
    
    setIsLocationLoading(true);
    
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      setIsLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use OpenStreetMap Nominatim for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
          );
          const data = await response.json();
          const city = data.address?.city || data.address?.town || data.address?.village || "Unknown Location";
          const state = data.address?.state || "";
          const postalCode = data.address?.postcode || "";
          
          // Update user profile with location
          const { error } = await supabase
            .from('profiles')
            .upsert({
              user_id: user.id,
              latitude: latitude,
              longitude: longitude,
              city: city,
              state: state,
              postal_code: postalCode,
              updated_at: new Date().toISOString()
            });
          
          if (error) {
            console.error('Error saving location:', error);
            toast.error("Failed to save location");
          } else {
            setUserLocation(city);
            
            // If user is a seller, also update their shop location
            if (userType === 'seller') {
              const { error: shopError } = await supabase
                .from('medical_shops')
                .update({
                  latitude: latitude,
                  longitude: longitude,
                  city: city,
                  state: state,
                  postal_code: postalCode,
                  updated_at: new Date().toISOString()
                })
                .eq('owner_id', user.id);
              
              if (shopError) {
                console.error('Error updating shop location:', shopError);
              }
            }
            
            toast.success(`Location saved: ${city}`);
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          setUserLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          toast.success("Location accessed successfully");
        }
        
        setIsLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLocationLoading(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location access denied. Please enable location permissions.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out.");
            break;
          default:
            toast.error("An unknown error occurred while retrieving location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Show login/registration forms if user type is selected but not authenticated
  if (userType && !user) {
    if (isLoginMode) {
      return <LoginForm userType={userType} onLoginComplete={() => {}} onSwitchToRegister={() => setIsLoginMode(false)} />;
    } else {
      return <RegistrationForm userType={userType} onRegistrationComplete={() => {}} onSwitchToLogin={() => setIsLoginMode(true)} />;
    }
  }
  // Show welcome page for new users
  if (!user) {
    return <div className="min-h-screen bg-background dark">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Pill className="h-10 w-10 text-primary mr-3 drop-shadow-sm" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">QuickDose</h1>
              <Syringe className="h-10 w-10 text-secondary ml-3 drop-shadow-sm" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your trusted marketplace connecting medicine buyers with local pharmacies and retailers
            </p>
          </div>

          {/* User Type Selection */}
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-[var(--shadow-elegant)] transition-all duration-300 cursor-pointer border-2 hover:border-primary/30 group" onClick={() => setUserType('buyer')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full w-fit shadow-inner group-hover:shadow-[var(--shadow-glow)] transition-all duration-300">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">Buy Medicine</CardTitle>
                <CardDescription className="text-base">
                  Find and order medicines from nearby pharmacies
                </CardDescription>
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
                <Button className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] transition-all duration-300">
                  Start Shopping
                </Button>
                <Button variant="outline" className="w-full mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={e => {
                e.stopPropagation();
                setUserType('buyer');
                setIsLoginMode(true);
              }}>
                  Login as Buyer
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-[var(--shadow-elegant)] transition-all duration-300 cursor-pointer border-2 hover:border-secondary/30 group" onClick={() => setUserType('seller')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-full w-fit shadow-inner group-hover:shadow-[var(--shadow-glow)] transition-all duration-300">
                  <Store className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl group-hover:bg-gradient-to-r group-hover:from-secondary group-hover:to-accent group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">Sell Medicine</CardTitle>
                <CardDescription className="text-base">
                  List your pharmacy and reach more customers
                </CardDescription>
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
                <Button className="w-full mt-4 bg-gradient-to-r from-secondary to-accent hover:shadow-[var(--shadow-glow)] transition-all duration-300">
                  Register Your Store
                </Button>
                <Button variant="outline" className="w-full mt-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground" onClick={e => {
                e.stopPropagation();
                setUserType('seller');
                setIsLoginMode(true);
              }}>
                  Login as Seller
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Why Choose QuickDose?</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="space-y-3">
                <div className="mx-auto w-fit p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full shadow-inner">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Fast Delivery</h3>
                <p className="text-muted-foreground">Get your medicines delivered quickly from nearby pharmacies</p>
              </div>
              <div className="space-y-3">
                <div className="mx-auto w-fit p-3 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-full shadow-inner">
                  <Syringe className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold">Medical Excellence</h3>
                <p className="text-muted-foreground">Professional medical supplies and verified pharmaceuticals</p>
              </div>
              <div className="space-y-3">
                <div className="mx-auto w-fit p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full shadow-inner">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Trusted Network</h3>
                <p className="text-muted-foreground">Connect with licensed pharmacies in your neighborhood</p>
              </div>
            </div>
          </div>
        </div>
      </div>;
  }
  if (showSettings) {
    return <div className="min-h-screen tablet-bg relative">
        <div className="absolute inset-0 bg-white/90"></div>
        <header className="border-b bg-card/90 shadow-sm relative z-10">
          <div className="container mx-auto px-4 py-4 flex items-center">
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)} className="hover:bg-primary/10 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <Pill className="h-6 w-6 text-primary mr-2" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">QuickDose</span>
              <Syringe className="h-6 w-6 text-secondary ml-2" />
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8 relative z-10">
          <Settings userType={userType!} onSwitchMode={handleLogout} onClose={() => setShowSettings(false)} />
        </main>
      </div>;
  }
  return <div className="min-h-screen bg-background dark pb-16">
      {/* Header - Apollo Pharmacy Style */}
      <header className="bg-primary sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 bg-[#451c8d]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <div className="flex items-center mb-1">
                  <Pill className="h-4 w-4 text-white mr-2" />
                  <span className="mx-0 my-[2px] py-[3px] px-[3px] text-2xl font-extrabold text-black">QuickDose</span>
                </div>
                <div className="text-sm opacity-80">Delivery Address</div>
                <Button 
                  variant="ghost" 
                  className="font-medium text-white hover:bg-white/20 p-0 h-auto justify-start"
                  onClick={handleLocationRequest}
                  disabled={isLocationLoading}
                >
                  {isLocationLoading ? "Getting location..." : (userLocation ? userLocation : "Select Address ▼")}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="secondary" size="sm" className="text-sm bg-white/20 text-white border-white/30 hover:bg-white/30">
                Login
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 relative" onClick={() => setCurrentTab("cart")}>
                <ShoppingCart className="h-5 w-5" />
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">0</div>
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 relative">
              <Pill className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search Medicines" className="pl-10 bg-white rounded-lg" />
            </div>
          </div>
        </div>
      </header>

      {/* Feature Cards */}
      <div className="bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center bg-card/80 backdrop-blur-sm">
              <div className="text-blue-500 text-3xl mb-2">📋</div>
              <h3 className="font-semibold text-sm">Order Via Prescription</h3>
              <p className="text-xs text-violet-600 font-medium">UPTO 20% OFF</p>
            </Card>
            <Card className="p-4 text-center bg-card/80 backdrop-blur-sm">
              <div className="text-green-500 text-3xl mb-2">🏷️</div>
              <h3 className="font-semibold text-sm">Popular Picks At</h3>
              <p className="text-xs text-violet-600 font-medium">HALF PRICE</p>
            </Card>
            <Button 
              variant="outline" 
              className="p-4 h-auto flex-col bg-card/80 backdrop-blur-sm hover:bg-primary/10 transition-all duration-300 hover:shadow-[var(--shadow-glow)]"
              onClick={() => setCurrentTab('nearby')}
            >
              <div className="text-teal-500 text-3xl mb-2">🏪</div>
              <h3 className="font-semibold text-sm">Find Nearby Medical Shops</h3>
              <p className="text-xs text-violet-600 font-medium">LOCATION BASED</p>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsContent value="search" className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <MedicineList />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cart">
            <Cart />
          </TabsContent>

          {userType === 'buyer' && <TabsContent value="nearby">
              <NearbyShops />
            </TabsContent>}

          {userType === 'seller' && <>
              <TabsContent value="register">
                <ShopRegistration />
              </TabsContent>
              <TabsContent value="inventory">
                <InventoryManagement />
              </TabsContent>
            </>}

          <TabsContent value="profile" className="space-y-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <ProfilePhoto />
                  <CardTitle className="text-2xl text-primary">
                    User Profile
                  </CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => setShowSettings(true)}>
                    Open Settings
                  </Button>
          <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
                </CardContent>
              </Card>
              
              {/* Location Management */}
              <UserLocationManager userType={userType} />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation - Apollo Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="grid grid-cols-5 py-2">
          <Button variant="ghost" className="flex flex-col items-center gap-1 p-2 h-auto" onClick={() => setCurrentTab("search")}>
            <Pill className={`h-5 w-5 ${currentTab === 'search' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-xs ${currentTab === 'search' ? 'text-primary' : 'text-muted-foreground'}`}>Medicines</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 p-2 h-auto">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Consult Doc</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 p-2 h-auto">
            <Syringe className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Lab Tests</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 p-2 h-auto">
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Insurance</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 p-2 h-auto" onClick={() => setCurrentTab("profile")}>
            <UserIcon className={`h-5 w-5 ${currentTab === 'profile' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-xs ${currentTab === 'profile' ? 'text-primary' : 'text-muted-foreground'}`}>Health Records</span>
          </Button>
        </div>
      </div>
    </div>;
};
const Index = () => {
  return <CartProvider>
      <IndexContent />
      <Toaster />
    </CartProvider>;
};
export default Index;