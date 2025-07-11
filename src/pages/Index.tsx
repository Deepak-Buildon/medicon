import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Store, Pill, Users, Clock, Shield, ShoppingCart, User, Syringe, Phone, ArrowLeft } from "lucide-react";
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


const IndexContent = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [userType, setUserType] = useState<'buyer' | 'seller' | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [currentTab, setCurrentTab] = useState('search');
  const [showSettings, setShowSettings] = useState(false);
  const [registeredNumbers, setRegisteredNumbers] = useState<string[]>([]);

  // Check if phone number is already registered
  useEffect(() => {
    const saved = localStorage.getItem('registeredNumbers');
    if (saved) {
      setRegisteredNumbers(JSON.parse(saved));
    }
  }, []);

  const generateOTP = () => {
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(newOTP);
    // In production, you would send this OTP via SMS
    console.log('Generated OTP:', newOTP);
    alert(`Your OTP is: ${newOTP} (In production, this would be sent via SMS)`);
  };

  const verifyOTP = () => {
    if (otp === generatedOTP) {
      // Save the verified phone number
      const updatedNumbers = [...registeredNumbers, phoneNumber];
      setRegisteredNumbers(updatedNumbers);
      localStorage.setItem('registeredNumbers', JSON.stringify(updatedNumbers));
      
      setShowOTPVerification(false);
      setShowPhoneVerification(false);
      setShowWelcome(false);
    } else {
      alert('Invalid OTP. Please try again.');
    }
  };

  const checkPhoneNumber = (phone: string) => {
    return registeredNumbers.includes(phone);
  };

  // Show welcome page first
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-[image:var(--gradient-bg)]">
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-8">
              <Pill className="h-12 w-12 text-primary mr-4 drop-shadow-sm" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">QuickDose</h1>
              <Syringe className="h-12 w-12 text-secondary ml-4 drop-shadow-sm" />
            </div>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              India's BEST Pharmaceutical Delivery App
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
              Your trusted marketplace connecting medicine buyers with local pharmacies and retailers across India
            </p>
            <Button 
              onClick={() => {
                setShowWelcome(false);
                setShowPhoneVerification(true);
              }}
              className="text-lg px-8 py-4 bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] transition-all duration-300"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show phone verification page
  if (showPhoneVerification && !showOTPVerification) {
    return (
      <div className="min-h-screen bg-[image:var(--gradient-bg)]">
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
          <div className="max-w-md w-full">
            <Card className="border-2 border-primary/20 shadow-[var(--shadow-elegant)]">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full w-fit">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Verify Your Phone</CardTitle>
                <CardDescription>
                  Enter your phone number to receive an OTP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] transition-all duration-300"
                  onClick={() => {
                    if (phoneNumber.length >= 10) {
                      if (checkPhoneNumber(phoneNumber)) {
                        setShowPhoneVerification(false);
                        setShowWelcome(false);
                      } else {
                        generateOTP();
                        setShowOTPVerification(true);
                      }
                    } else {
                      alert('Please enter a valid phone number');
                    }
                  }}
                  disabled={!phoneNumber}
                >
                  {checkPhoneNumber(phoneNumber) ? 'Continue' : 'Send OTP'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setShowPhoneVerification(false);
                    setShowWelcome(true);
                  }}
                >
                  Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show OTP verification page
  if (showOTPVerification) {
    return (
      <div className="min-h-screen bg-[image:var(--gradient-bg)]">
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
          <div className="max-w-md w-full">
            <Card className="border-2 border-primary/20 shadow-[var(--shadow-elegant)]">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full w-fit">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Enter OTP</CardTitle>
                <CardDescription>
                  We've sent a 6-digit code to {phoneNumber}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">6-Digit OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-lg text-center tracking-widest"
                    maxLength={6}
                  />
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] transition-all duration-300"
                  onClick={verifyOTP}
                  disabled={otp.length !== 6}
                >
                  Verify OTP
                </Button>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setShowOTPVerification(false);
                      setOtp('');
                    }}
                  >
                    Back
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex-1"
                    onClick={generateOTP}
                  >
                    Resend OTP
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show login/registration forms if user type is selected but not authenticated
  if (userType && !isRegistered) {
    if (isLoginMode) {
      return (
        <LoginForm 
          userType={userType} 
          onLoginComplete={() => setIsRegistered(true)}
          onSwitchToRegister={() => setIsLoginMode(false)}
        />
      );
    } else {
      return (
        <RegistrationForm 
          userType={userType} 
          onRegistrationComplete={() => setIsRegistered(true)}
          onSwitchToLogin={() => setIsLoginMode(true)}
        />
      );
    }
  }

  if (userType === null) {
    return (
      <div className="min-h-screen bg-[image:var(--gradient-bg)]">
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
            <Card className="hover:shadow-[var(--shadow-elegant)] transition-all duration-300 cursor-pointer border-2 hover:border-primary/30 group" 
                  onClick={() => setUserType('buyer')}>
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
                <Button 
                  variant="outline" 
                  className="w-full mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserType('buyer');
                    setIsLoginMode(true);
                  }}
                >
                  Login as Buyer
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-[var(--shadow-elegant)] transition-all duration-300 cursor-pointer border-2 hover:border-secondary/30 group" 
                  onClick={() => setUserType('seller')}>
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
                <Button 
                  variant="outline" 
                  className="w-full mt-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserType('seller');
                    setIsLoginMode(true);
                  }}
                >
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
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowSettings(false)}
              className="hover:bg-primary/10 mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <Pill className="h-6 w-6 text-primary mr-2" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">QuickDose</span>
              <Syringe className="h-6 w-6 text-secondary ml-2" />
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <Settings 
            userType={userType!}
            onSwitchMode={() => {
              setUserType(null);
              setIsRegistered(false);
              setIsLoginMode(true);
              setShowSettings(false);
            }}
            onClose={() => setShowSettings(false)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderWithCart 
        userType={userType}
        onSwitchMode={() => {
          setUserType(null);
          setIsRegistered(false);
          setIsLoginMode(true);
        }}
        onCartClick={() => setCurrentTab('cart')}
        onProfileClick={() => setCurrentTab('profile')}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* Content based on user type */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          {userType === 'buyer' ? (
            <>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="search">Search Medicine</TabsTrigger>
                <TabsTrigger value="cart">Cart</TabsTrigger>
                <TabsTrigger value="orders">My Orders</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>
              
              <TabsContent value="search" className="space-y-6">
                <h1 className="text-3xl font-bold">Find Your Medicine</h1>
                <MedicineList />
              </TabsContent>

              <TabsContent value="cart" className="space-y-6">
                <h1 className="text-3xl font-bold">My Cart</h1>
                <Cart />
              </TabsContent>
              
              <TabsContent value="orders" className="space-y-6">
                <h1 className="text-3xl font-bold">My Orders</h1>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">Order history will be displayed here...</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="profile" className="space-y-6">
                <h1 className="text-3xl font-bold">My Profile</h1>
                <div className="grid gap-6">
                  <ProfilePhoto />
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">John Doe</h3>
                          <p className="text-muted-foreground">Customer since 2024</p>
                          <p className="text-sm text-muted-foreground">Phone: {phoneNumber}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </>
          ) : (
            <>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="profile">Store Profile</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="space-y-6">
                <h1 className="text-3xl font-bold">Store Dashboard</h1>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Today's Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">0</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">₹0</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">0</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="inventory" className="space-y-6">
                <InventoryManagement />
              </TabsContent>
              
              <TabsContent value="orders" className="space-y-6">
                <h1 className="text-3xl font-bold">Customer Orders</h1>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">Customer orders will be displayed here...</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="profile" className="space-y-6">
                <h1 className="text-3xl font-bold">Store Profile</h1>
                <div className="grid gap-6">
                  <ProfilePhoto />
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center">
                          <Store className="h-8 w-8 text-secondary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">ABC Pharmacy</h3>
                          <p className="text-muted-foreground">Licensed since 2020</p>
                          <p className="text-sm text-muted-foreground">Phone: {phoneNumber}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
};

const Index = () => {
  return (
    <CartProvider>
      <IndexContent />
    </CartProvider>
  );
};

export default Index;