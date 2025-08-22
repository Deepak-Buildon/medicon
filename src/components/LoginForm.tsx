import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Store, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface LoginFormProps {
  userType: "buyer" | "seller";
  onLoginComplete: () => void;
  onSwitchToRegister: () => void;
}

export const LoginForm = ({
  userType,
  onLoginComplete,
  onSwitchToRegister,
}: LoginFormProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [authMode, setAuthMode] = useState<"password" | "otp">("otp");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState<"enter-phone" | "enter-otp">(
    "enter-phone"
  );
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  // Avoid state updates after unmount
  useEffect(() => {
    let isMounted = true;
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
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
          title: "Invalid Credentials",
          description: "Email or password is incorrect.",
          variant: "destructive",
        });
        return;
      }

      const userId = data.user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type, city")
        .eq("user_id", userId)
        .maybeSingle();

      if (profile?.user_type && profile.user_type !== userType) {
        await supabase.auth.signOut();
        toast({
          title: "Account Type Mismatch",
          description: `This account is registered as ${profile.user_type}. Please switch login type.`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login Successful!",
        description: `Welcome back to MediConnect${profile?.city ? ` — ${profile.city}` : ""}!`,
      });
      onLoginComplete();
    } catch (err) {
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) {
      toast({
        title: "Phone Required",
        description: "Please enter your mobile number.",
        variant: "destructive",
      });
      return;
    }

    const isValidPhone = /^\+\d{10,15}$/.test(phone);
    if (!isValidPhone) {
      toast({
        title: "Invalid Phone Format",
        description: "Enter a valid international number (e.g. +919999999999).",
        variant: "destructive",
      });
      return;
    }

    try {
      setOtpSending(true);
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: { shouldCreateUser: true },
      });

      if (error) {
        toast({
          title: "Failed to Send OTP",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "OTP Sent",
        description: "Check your SMS for the 6-digit code.",
      });
      setOtpStep("enter-otp");
    } catch (err) {
      toast({
        title: "Unexpected Error",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Enter the full 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    try {
      setOtpVerifying(true);
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });

      if (error || !data?.user) {
        toast({
          title: "OTP Verification Failed",
          description: "The code is incorrect or expired.",
          variant: "destructive",
        });
        return;
      }

      const userId = data.user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type, city")
        .eq("user_id", userId)
        .maybeSingle();

      if (profile?.user_type && profile.user_type !== userType) {
        await supabase.auth.signOut();
        toast({
          title: "Account Type Mismatch",
          description: `This account is registered as ${profile.user_type}. Please switch login type.`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login Successful!",
        description: `Welcome back${profile?.city ? ` — ${profile.city}` : ""}!`,
      });
      onLoginComplete();
    } catch (err) {
      toast({
        title: "Unexpected Error",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-[image:var(--gradient-bg)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-elegant)]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full w-fit shadow-inner">
            {userType === "buyer" ? (
              <UserPlus className="h-8 w-8 text-primary" />
            ) : (
              <Store className="h-8 w-8 text-secondary" />
            )}
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {userType === "buyer" ? "Buyer Login" : "Seller Login"}
          </CardTitle>
          <CardDescription className="text-base">
            {userType === "buyer"
              ? "Sign in to continue buying medicines"
              : "Sign in to manage your pharmacy"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Auth Mode Toggle */}
          <div className="flex justify-center gap-2 mb-4">
            <Button
              type="button"
              variant={authMode === "otp" ? "default" : "outline"}
              onClick={() => !loading && !otpSending && !otpVerifying && setAuthMode("otp")}
              disabled={loading || otpSending || otpVerifying}
            >
              SMS OTP
            </Button>
            <Button
              type="button"
              variant={authMode === "password" ? "default" : "outline"}
              onClick={() => !loading && !otpSending && !otpVerifying && setAuthMode("password")}
              disabled={loading || otpSending || otpVerifying}
            >
              Email & Password
            </Button>
          </div>

          {authMode === "password" ? (
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
                {loading ? "Signing in..." : `Sign In as ${userType === "buyer" ? "Buyer" : "Seller"}`}
              </Button>
            </form>
          ) : otpStep === "enter-phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +919025267350"
                  className="transition-all duration-200 focus:shadow-[var(--shadow-glow)]"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use international format with country code.
                </p>
              </div>

              <Button
                type="submit"
                disabled={otpSending}
                className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] transition-all duration-300"
              >
                {otpSending ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label>Enter OTP sent to {phone}</Label>
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="submit"
                disabled={otpVerifying}
                className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] transition-all duration-300"
              >
                {otpVerifying ? "Verifying..." : "Verify OTP"}
              </Button>

              <div className="flex justify-between text-sm text-muted-foreground">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setOtp("");
                    setOtpStep("enter-phone");
                  }}
                >
                  Enter different phone
                </Button>
                <Button type="button" variant="link" onClick={handleSendOtp}>
                  Resend OTP
                </Button>
              </div>
            </form>
          )}

          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button
                variant="link"
                onClick={onSwitchToRegister}
                className="p-0 h-auto text-primary hover:text-accent"
              >
                Register here
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
