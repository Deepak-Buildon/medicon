import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera } from "lucide-react";
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface BuyerProfileProps {
  user: SupabaseUser;
}

interface ProfileData {
  id: string;
  user_id: string;
  display_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export const BuyerProfile = ({ user }: BuyerProfileProps) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<ProfileData>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, [user.id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setProfile(data);
        setEditedProfile(data);
      } else {
        // Create initial profile if doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            display_name: user.user_metadata?.display_name || '',
            user_type: 'buyer'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          setProfile(newProfile);
          setEditedProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editedProfile.display_name,
          phone: editedProfile.phone,
          address: editedProfile.address,
          city: editedProfile.city,
          state: editedProfile.state,
          postal_code: editedProfile.postal_code,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated."
      });

      await fetchProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Failed to load profile data.</p>
            <Button onClick={fetchProfile} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-[var(--shadow-elegant)]">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/20">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">
                {profile.display_name || 'Buyer Profile'}
              </CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Badge variant="secondary" className="mr-2">Buyer</Badge>
                <Mail className="h-3 w-3 mr-1" />
                {user.email}
              </CardDescription>
            </div>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <User className="h-5 w-5 mr-2" />
            Personal Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="display_name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="display_name"
                  value={editedProfile.display_name || ''}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="p-2 bg-muted/50 rounded">
                  {profile.display_name || 'Not provided'}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={editedProfile.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="p-2 bg-muted/50 rounded flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  {profile.phone || 'Not provided'}
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Address Information
          </h3>
          <div>
            <Label htmlFor="address">Street Address</Label>
            {isEditing ? (
              <Textarea
                id="address"
                value={editedProfile.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your street address"
                rows={2}
              />
            ) : (
              <div className="p-2 bg-muted/50 rounded">
                {profile.address || 'Not provided'}
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              {isEditing ? (
                <Input
                  id="city"
                  value={editedProfile.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                />
              ) : (
                <div className="p-2 bg-muted/50 rounded">
                  {profile.city || 'Not provided'}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              {isEditing ? (
                <Input
                  id="state"
                  value={editedProfile.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State"
                />
              ) : (
                <div className="p-2 bg-muted/50 rounded">
                  {profile.state || 'Not provided'}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="postal_code">Postal Code</Label>
              {isEditing ? (
                <Input
                  id="postal_code"
                  value={editedProfile.postal_code || ''}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  placeholder="Postal Code"
                />
              ) : (
                <div className="p-2 bg-muted/50 rounded">
                  {profile.postal_code || 'Not provided'}
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Account Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Account Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Account Created</Label>
              <div className="p-2 bg-muted/50 rounded">
                {new Date(profile.created_at).toLocaleDateString()}
              </div>
            </div>
            <div>
              <Label>Last Updated</Label>
              <div className="p-2 bg-muted/50 rounded">
                {new Date(profile.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};