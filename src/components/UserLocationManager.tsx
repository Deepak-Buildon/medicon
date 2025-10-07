import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import LocationPicker from './LocationPicker';

interface UserProfile {
  id: string;
  user_id: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  user_type: string | null;
  display_name: string | null;
  phone: string | null;
}

interface UserLocationManagerProps {
  userType?: 'buyer' | 'seller';
}

const UserLocationManager: React.FC<UserLocationManagerProps> = ({ userType = 'buyer' }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Load user profile and location
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSaved = () => {
    loadUserProfile();
    setIsEditing(false);
    toast.success('Location updated successfully!');
  };

  const deleteLocation = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          latitude: null,
          longitude: null,
          address: null,
          city: null,
          state: null,
          postal_code: null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      await loadUserProfile();
      toast.success('Location removed successfully');
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to remove location');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isEditing || (!profile?.latitude && !profile?.longitude)) {
    return (
      <div className="space-y-4">
        {profile?.latitude && profile?.longitude && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
            className="mb-4"
          >
            Cancel
          </Button>
        )}
        <LocationPicker 
          onLocationSaved={handleLocationSaved}
          userType={userType}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Your Location
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deleteLocation}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Your saved location information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile?.address && (
          <div>
            <strong>Address:</strong> {profile.address}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          {profile?.city && (
            <div>
              <strong>City:</strong> {profile.city}
            </div>
          )}
          {profile?.state && (
            <div>
              <strong>State:</strong> {profile.state}
            </div>
          )}
          {profile?.postal_code && (
            <div>
              <strong>Postal Code:</strong> {profile.postal_code}
            </div>
          )}
          {profile?.user_type && (
            <div>
              <strong>Type:</strong> 
              <Badge variant="secondary" className="ml-2">
                {profile.user_type}
              </Badge>
            </div>
          )}
        </div>
        
        {profile?.latitude && profile?.longitude && (
          <div className="text-sm text-muted-foreground border-t pt-4">
            <strong>Coordinates:</strong> {profile.latitude.toFixed(6)}, {profile.longitude.toFixed(6)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserLocationManager;