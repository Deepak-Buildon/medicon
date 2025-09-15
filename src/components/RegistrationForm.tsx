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
    // Seller specific fields
    storeName: '',
    licenseNumber: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (userType === 'seller' && (!formData.storeName || !formData.licenseNumber)) {
      toast({
        title: "Error",
        description: "Please fill in store name and license number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: formData.name,
            user_type: userType
          }
        }
      });

      if (authError) {
        toast({
          title: "Registration Failed",
          description: authError.message,
          variant: "destructive"
        });
        return;
      }

      if (authData.user) {
        // Create user profile with comprehensive data
        const profileData = {
          user_id: authData.user.id,
          display_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          user_type: userType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileData);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Try to update existing profile if insert failed
          const { error: updateError } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('user_id', authData.user.id);
          
          if (updateError) {
            console.error('Profile update error:', updateError);
            toast({
              title: "Warning", 
              description: "Account created but profile setup failed. Please complete your profile later.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Profile Updated!",
              description: "Your profile has been successfully updated."
            });
          }
        } else {
          toast({
            title: "Profile Created!",
            description: "Your profile has been successfully created."
          });
        }

        // If seller, create medical shop entry
        if (userType === 'seller') {
          const { error: shopError } = await supabase
            .from('medical_shops')
            .insert({
              owner_id: authData.user.id,
              shop_name: formData.storeName,
              license_number: formData.licenseNumber,
              owner_name: formData.name,
              phone: formData.phone,
              email: formData.email,
              address: formData.address,
              city: '', // Will be updated when location is set
              state: '', // Will be updated when location is set
              postal_code: '', // Will be updated when location is set
              latitude: 0, // Will be updated when location is set
              longitude: 0, // Will be updated when location is set
              services: formData.description ? [formData.description] : []
            });

          if (shopError) {
            console.error('Shop creation error:', shopError);
            toast({
              title: "Warning",
              description: "Account created but shop registration failed. Please complete shop setup later.",
              variant: "destructive"
            });
          }
        }
      }

      toast({
        title: "Registration Successful!",
        description: `Welcome to QuickDose as a ${userType}! ${authData.user?.email_confirmed_at ? 'You can now sign in.' : 'Please check your email to verify your account.'}`
      });
      
      onRegistrationComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during registration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
                placeholder="Enter your password (min 6 characters)"
                className="transition-all duration-200 focus:shadow-[var(--shadow-glow)]"
                minLength={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="transition-all duration-200 focus:shadow-[var(--shadow-glow)]"
                required
              />
            </div>

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
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] transition-all duration-300"
            >
              {isLoading ? 'Creating Account...' : `Register as ${userType === 'buyer' ? 'Buyer' : 'Seller'}`}
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