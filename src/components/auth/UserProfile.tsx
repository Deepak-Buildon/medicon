import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Edit, Save, X } from "lucide-react";
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfileProps {
  user: SupabaseUser;
}

interface Profile {
  display_name: string | null;
  phone: string | null;
  address: string | null;
  user_type: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const UserProfile = ({ user }: UserProfileProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
        return;
      }

      const profileData = data || {
        display_name: user.user_metadata?.display_name || '',
        phone: null,
        address: null,
        user_type: 'buyer',
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      setProfile(profileData);
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setEditedProfile({ ...profile! });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: editedProfile.display_name,
          phone: editedProfile.phone,
          address: editedProfile.address,
          user_type: editedProfile.user_type || 'buyer',
          updated_at: new Date().toISOString()
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive"
        });
        return;
      }

      setProfile(editedProfile);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated"
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(null);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out"
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading profile...</div>;
  }

  const currentProfile = isEditing ? editedProfile! : profile!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>User Profile</CardTitle>
                  <CardDescription>Manage your account information</CardDescription>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>User Type</Label>
                <Input value={currentProfile.user_type || 'buyer'} disabled />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="display_name"
                    value={editedProfile?.display_name || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, display_name: e.target.value} : null)}
                  />
                ) : (
                  <Input value={currentProfile.display_name || ''} disabled />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editedProfile?.phone || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                  />
                ) : (
                  <Input value={currentProfile.phone || ''} disabled />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={editedProfile?.address || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, address: e.target.value} : null)}
                    rows={3}
                  />
                ) : (
                  <Textarea value={currentProfile.address || ''} disabled rows={3} />
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>

            {currentProfile.created_at && (
              <div className="text-sm text-muted-foreground pt-4 border-t">
                <p>Account created: {new Date(currentProfile.created_at).toLocaleDateString()}</p>
                {currentProfile.updated_at && (
                  <p>Last updated: {new Date(currentProfile.updated_at).toLocaleDateString()}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};