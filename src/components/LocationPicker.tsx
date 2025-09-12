import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

interface LocationPickerProps {
  onLocationSaved?: (location: LocationData) => void;
  userType?: 'buyer' | 'seller';
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSaved, userType = 'buyer' }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]); // Default to Delhi, India

  // Component for handling map clicks
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setLocation({ latitude: lat, longitude: lng });
        reverseGeocode(lng, lat);
      },
    });
    return null;
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setMapCenter([latitude, longitude]);
        
        // Reverse geocoding
        reverseGeocode(longitude, latitude);
        
        setIsLoading(false);
        toast.success('Location found successfully!');
      },
      (error) => {
        setIsLoading(false);
        console.error('Error getting location:', error);
        toast.error('Failed to get your location. Please check permissions.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Reverse geocoding using OpenStreetMap Nominatim (free alternative)
  const reverseGeocode = async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await response.json();
      
      if (data) {
        setAddress(data.display_name || '');
        setCity(data.address?.city || data.address?.town || data.address?.village || '');
        setState(data.address?.state || '');
        setPostalCode(data.address?.postcode || '');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Save location to database
  const saveLocation = async () => {
    if (!location) {
      toast.error('Please select a location first.');
      return;
    }

    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please log in to save your location.');
        setIsSaving(false);
        return;
      }

      const locationData = {
        user_id: user.id,
        latitude: location.latitude,
        longitude: location.longitude,
        address,
        city,
        state,
        postal_code: postalCode,
        user_type: userType,
      };

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update(locationData)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('profiles')
          .insert([locationData]);
        
        if (error) throw error;
      }

      toast.success('Location saved successfully!');
      onLocationSaved?.(location);
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Failed to save location. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Getting your location...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Pin Your Location
          </CardTitle>
          <CardDescription>
            Click on the map to set your location or use your current location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={getCurrentLocation} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4 mr-2" />
              )}
              Get Current Location
            </Button>
            <Button 
              onClick={saveLocation}
              disabled={!location || isSaving}
              variant="default"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Location
            </Button>
          </div>
          
          {/* Map Container */}
          <div className="w-full h-96 rounded-lg border overflow-hidden">
            <MapContainer
              key={`${mapCenter[0]}-${mapCenter[1]}`}
              center={mapCenter}
              zoom={location ? 15 : 10}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler />
              {location && (
                <Marker position={[location.latitude, location.longitude]} />
              )}
            </MapContainer>
          </div>
          
          {/* Location Details */}
          {location && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal">Postal Code</Label>
                <Input
                  id="postal"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Postal code"
                />
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                <p>Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationPicker;