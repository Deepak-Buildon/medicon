import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Eye, EyeOff } from "lucide-react";

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: formData.fullName,
            user_type: 'buyer'
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
        // Create user profile in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            display_name: formData.fullName,
            phone: formData.phone || null,
            address: formData.address || null,
            user_type: 'buyer'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast({
            title: "Warning",
            description: "Account created but profile setup incomplete. You can update it later.",
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Registration Successful!",
        description: authData.user?.email_confirmed_at 
          ? "Welcome to QuickDose! You can now start using the app." 
          : "Please check your email to verify your account before signing in."
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        address: ""
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during registration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password (min 6 characters)"
            minLength={6}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter your phone number (optional)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter your address (optional)"
          rows={3}
        />
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
};