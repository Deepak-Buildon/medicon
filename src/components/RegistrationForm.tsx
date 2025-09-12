import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RegistrationFormProps {
  userType: 'buyer' | 'seller';
  onRegistrationComplete: () => void;
  onSwitchToLogin: () => void;
}

export const RegistrationForm = ({ userType, onRegistrationComplete, onSwitchToLogin }: RegistrationFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    // Seller specific fields
    storeName: '',
    licenseNumber: '',
    description: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Additional validation for sellers
    if (userType === 'seller') {
      if (!formData.storeName || !formData.licenseNumber || !formData.address || !formData.phone) {
        toast({
          title: "Error",
          description: "Please fill in all required seller fields",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      // Sign up the user
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: formData.name,
            user_type: userType
          }
        }
      });

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            display_name: formData.name,
            user_type: userType,
            phone: formData.phone || null,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            postal_code: formData.postalCode || null
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // If seller, create shop record
        if (userType === 'seller') {
          const { error: shopError } = await supabase
            .from('medical_shops')
            .insert({
              owner_id: data.user.id,
              shop_name: formData.storeName,
              owner_name: formData.name,
              license_number: formData.licenseNumber,
              phone: formData.phone,
              email: formData.email,
              address: formData.address,
              city: formData.city || '',
              state: formData.state || '',
              postal_code: formData.postalCode || '',
              latitude: 0, // Will be updated when location is provided
              longitude: 0, // Will be updated when location is provided
              is_verified: false,
              is_active: true
            });

          if (shopError) {
            console.error('Shop creation error:', shopError);
            toast({
              title: "Warning",
              description: "Account created but shop registration failed. Please contact support.",
              variant: "destructive"
            });
          }
        }

        toast({
          title: "Registration Successful!",
          description: data.user.email_confirmed_at 
            ? `Welcome to QuickDose as a ${userType}!`
            : `Please check your email to confirm your account before signing in.`
        });
        
        onRegistrationComplete();
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-[image:var(--gradient-bg)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-elegant)]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full w-fit shadow-inner">
            {userType === 'buyer' ? (
              <UserPlus className="h-8 w-8 text-primary" />
            ) : (
              <Store className="h-8 w-8 text-secondary" />
            )}
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {userType === 'buyer' ? 'Buyer Registration' : 'Seller Registration'}
          </CardTitle>
          <CardDescription className="text-base">
            {userType === 'buyer' 
              ? 'Create your account to start buying medicines' 
              : 'Register your pharmacy to start selling'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="transition-all duration-200 focus:shadow-[var(--shadow-glow)]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="transition-all duration-200 focus:shadow-[var(--shadow-glow)]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="transition-all duration-200 focus:shadow-[var(--shadow-glow)]"
                required
              />
            </div>

            {userType === 'seller' && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="transition-all duration-200 focus:shadow-[var(--shadow-glow)]"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                className="transition-all duration-200 focus:shadow-[var(--shadow-glow)]"
                rows={2}
                required
              />
            </div>

            {userType === 'seller' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store/Pharmacy Name *</Label>
                  <Input
                    id="storeName"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    placeholder="Enter your store name"
                    className="transition-all duration-200 focus:shadow-[var(--shadow-glow)]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="Enter your pharmacy license number"
                    className="transition-all duration-200 focus:shadow-[var(--shadow-glow)]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Store Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of your pharmacy"
                    className="transition-all duration-200 focus:shadow-[var(--shadow-glow)]"
                    rows={2}
                  />
                </div>
              </>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] transition-all duration-300"
            >
              Register as {userType === 'buyer' ? 'Buyer' : 'Seller'}
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button 
                  variant="link" 
                  onClick={onSwitchToLogin}
                  className="p-0 h-auto text-primary hover:text-accent"
                >
                  Sign in here
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};