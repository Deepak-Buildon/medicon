import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Store, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
interface LoginFormProps {
  userType: 'buyer' | 'seller';
  onLoginComplete: () => void;
  onSwitchToRegister: () => void;
}

export const LoginForm = ({ userType, onLoginComplete, onSwitchToRegister }: LoginFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error || !data.user) {
        toast({
          title: "Invalid credentials",
          description: "Email or password is incorrect",
          variant: "destructive",
        });
        return;
      }

      const userId = data.user.id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type, city')
        .eq('user_id', userId)
        .single();

      if (profile?.user_type && profile.user_type !== userType) {
        await supabase.auth.signOut();
        toast({
          title: "Account type mismatch",
          description: `This account is registered as ${profile.user_type}. Please switch to the correct login.`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login Successful!",
        description: `Welcome back to MediConnect${profile?.city ? ` — ${profile.city}` : ''}!`,
      });
      onLoginComplete();
    } catch (err) {
      toast({
        title: "Unexpected error",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            {userType === 'buyer' ? 'Buyer Login' : 'Seller Login'}
          </CardTitle>
          <CardDescription className="text-base">
            {userType === 'buyer' 
              ? 'Sign in to continue buying medicines' 
              : 'Sign in to manage your pharmacy'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Enter your password"
                className="transition-all duration-200 focus:shadow-[var(--shadow-glow)]"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] transition-all duration-300"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {loading ? 'Signing in...' : `Sign In as ${userType === 'buyer' ? 'Buyer' : 'Seller'}`}
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button 
                  variant="link" 
                  onClick={onSwitchToRegister}
                  className="p-0 h-auto text-primary hover:text-accent"
                >
                  Register here
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};