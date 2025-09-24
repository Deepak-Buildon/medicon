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
    confirmPassword: '',
    phone: '',
    address: '',
    // Seller specific fields
    storeName: '',
    licenseNumber: '',
    description: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please enter and confirm your password",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
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

    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          user_type: userType,
          display_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          // Store seller data for later use
          ...(userType === 'seller' && {
            store_name: formData.storeName,
            license_number: formData.licenseNumber,
            store_description: formData.description
          })
        }
      },
    });

    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Registration Successful!",
      description: data.user ? `Welcome to MediConnect as a ${userType}!` : 'Check your email to confirm your account, then sign in.',
    });

    onRegistrationComplete();
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="transition-all duration-200 focus:shadow-[var(--shadow-glow)]"
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