import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pill, Syringe, Store, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    storeName: '',
    licenseNumber: ''
  });

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const fillDemoData = (type: 'buyer' | 'seller') => {
    if (type === 'buyer') {
      setFormData({
        email: 'buyer@demo.com',
        password: 'Demo123!',
        name: 'Demo Buyer',
        phone: '+91 9876543210',
        address: '123 Demo Street, Demo City',
        storeName: '',
        licenseNumber: ''
      });
    } else {
      setFormData({
        email: 'seller@demo.com',
        password: 'Demo123!',
        name: 'Demo Seller',
        phone: '+91 9876543211',
        address: '456 Pharmacy Lane, Demo City',
        storeName: 'Demo Pharmacy',
        licenseNumber: 'LIC123456'
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        // Check user type in profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', data.user.id)
          .single();

        if (profile && profile.user_type !== userType) {
          toast.error(`This account is registered as a ${profile.user_type}, not a ${userType}`);
          await supabase.auth.signOut();
          return;
        }

        toast.success('Login successful!');
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Register user with Supabase Auth - trigger will create profile automatically
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: formData.name,
            user_type: userType,
            phone: formData.phone,
            address: formData.address,
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      const newUser = data.user;
      if (newUser) {
        // If seller, create medical shop entry
        if (userType === 'seller') {
          const { error: shopError } = await supabase.from('medical_shops').insert({
            owner_id: newUser.id,
            shop_name: formData.storeName,
            license_number: formData.licenseNumber,
            owner_name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            city: 'Demo City',
            state: 'Demo State',
            postal_code: '123456',
            latitude: 0,
            longitude: 0,
          });

          if (shopError) {
            toast.error("Shop registration failed: " + shopError.message);
            return;
          }
        }

        toast.success('Registration successful! Please check your email to verify your account.');
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Pill className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold">QuickDose</h1>
            <Syringe className="h-8 w-8 text-secondary ml-2" />
          </div>
          <p className="text-muted-foreground">Demo Authentication</p>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {isLogin ? 'Login' : 'Register'} as {userType === 'buyer' ? 'Buyer' : 'Seller'}
              </CardTitle>
              <CardDescription className="text-center">
                Use demo credentials or create new account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Type Toggle */}
              <Tabs defaultValue={userType} onValueChange={(value) => setUserType(value as 'buyer' | 'seller')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buyer" className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Buyer
                  </TabsTrigger>
                  <TabsTrigger value="seller" className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Seller
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Demo Data Button */}
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => fillDemoData(userType)}
              >
                Fill Demo {userType === 'buyer' ? 'Buyer' : 'Seller'} Data
              </Button>

              <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {userType === 'seller' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="storeName">Store Name</Label>
                          <Input
                            id="storeName"
                            name="storeName"
                            value={formData.storeName}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="licenseNumber">License Number</Label>
                          <Input
                            id="licenseNumber"
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                </Button>
              </form>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Need to register?' : 'Already have an account?'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;