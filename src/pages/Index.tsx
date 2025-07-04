import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Store, Pill, Users, Clock, Shield } from "lucide-react";
import { RegistrationForm } from "@/components/RegistrationForm";
import { MedicineList } from "@/components/MedicineList";
import { InventoryManagement } from "@/components/InventoryManagement";

const Index = () => {
  const [userType, setUserType] = useState<'buyer' | 'seller' | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  // Show registration form if user type is selected but not registered
  if (userType && !isRegistered) {
    return (
      <RegistrationForm 
        userType={userType} 
        onRegistrationComplete={() => setIsRegistered(true)} 
      />
    );
  }

  if (userType === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Pill className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold text-foreground">MediConnect</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your trusted marketplace connecting medicine buyers with local pharmacies and retailers
            </p>
          </div>

          {/* User Type Selection */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/20" 
                  onClick={() => setUserType('buyer')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Buy Medicine</CardTitle>
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
                <Button className="w-full mt-4">
                  Start Shopping
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/20" 
                  onClick={() => setUserType('seller')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-secondary/10 rounded-full w-fit">
                  <Store className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-2xl">Sell Medicine</CardTitle>
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
                <Button variant="secondary" className="w-full mt-4">
                  Register Your Store
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold mb-8">Why Choose MediConnect?</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="space-y-3">
                <div className="mx-auto w-fit p-3 bg-primary/10 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Fast Delivery</h3>
                <p className="text-muted-foreground">Get your medicines delivered quickly from nearby pharmacies</p>
              </div>
              <div className="space-y-3">
                <div className="mx-auto w-fit p-3 bg-primary/10 rounded-full">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Verified Quality</h3>
                <p className="text-muted-foreground">All medicines and pharmacies are verified for your safety</p>
              </div>
              <div className="space-y-3">
                <div className="mx-auto w-fit p-3 bg-primary/10 rounded-full">
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Pill className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold">MediConnect</span>
          </div>
          <Button variant="outline" onClick={() => {
            setUserType(null);
            setIsRegistered(false);
          }}>
            Switch Mode
          </Button>
        </div>
      </header>

      {/* Content based on user type */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue={userType === 'buyer' ? 'search' : 'dashboard'} className="w-full">
          {userType === 'buyer' ? (
            <>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="search">Search Medicine</TabsTrigger>
                <TabsTrigger value="orders">My Orders</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>
              
              <TabsContent value="search" className="space-y-6">
                <h1 className="text-3xl font-bold">Find Your Medicine</h1>
                <MedicineList />
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
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">User profile settings will be here...</p>
                  </CardContent>
                </Card>
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
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">Store profile and settings will be here...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
