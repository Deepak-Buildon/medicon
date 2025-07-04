import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Store } from "lucide-react";

interface RegistrationFormProps {
  userType: 'buyer' | 'seller';
  onRegistrationComplete: () => void;
}

export const RegistrationForm = ({ userType, onRegistrationComplete }: RegistrationFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    // Seller specific fields
    storeName: '',
    licenseNumber: '',
    description: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
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

    // Simulate registration
    toast({
      title: "Registration Successful!",
      description: `Welcome to MediConnect as a ${userType}!`
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            {userType === 'buyer' ? (
              <UserPlus className="h-8 w-8 text-primary" />
            ) : (
              <Store className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {userType === 'buyer' ? 'Buyer Registration' : 'Seller Registration'}
          </CardTitle>
          <CardDescription>
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
                    rows={2}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full">
              Register as {userType === 'buyer' ? 'Buyer' : 'Seller'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};