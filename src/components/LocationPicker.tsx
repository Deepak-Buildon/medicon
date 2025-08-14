import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  
  const [mapboxToken, setMapboxToken] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Initialize map when token is provided
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [77.2090, 28.6139], // Default to Delhi, India
      zoom: 10,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add click event to place marker
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      setLocation({ latitude: lat, longitude: lng });
      
      // Remove existing marker
      if (marker.current) {
        marker.current.remove();
      }
      
      // Add new marker
      marker.current = new mapboxgl.Marker({ color: '#10b981' })
        .setLngLat([lng, lat])
        .addTo(map.current!);
      
      // Reverse geocoding to get address
      reverseGeocode(lng, lat);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

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
        
        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 15,
          });
          
          // Remove existing marker
          if (marker.current) {
            marker.current.remove();
          }
          
          // Add new marker
          marker.current = new mapboxgl.Marker({ color: '#10b981' })
            .setLngLat([longitude, latitude])
            .addTo(map.current);
          
          // Reverse geocoding
          reverseGeocode(longitude, latitude);
        }
        
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

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (lng: number, lat: number) => {
    if (!mapboxToken) return;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const addressComponents = feature.context || [];
        
        setAddress(feature.place_name || '');
        
        // Extract city, state, postal code from context
        const cityFeature = addressComponents.find((c: any) => 
          c.id.includes('place') || c.id.includes('locality')
        );
        const stateFeature = addressComponents.find((c: any) => 
          c.id.includes('region')
        );
        const postalFeature = addressComponents.find((c: any) => 
          c.id.includes('postcode')
        );
        
        if (cityFeature) setCity(cityFeature.text);
        if (stateFeature) setState(stateFeature.text);
        if (postalFeature) setPostalCode(postalFeature.text);
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

  if (!mapboxToken) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Setup Map
          </CardTitle>
          <CardDescription>
            Enter your Mapbox public token to use the map. Get it from{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
            <Input
              id="mapbox-token"
              type="password"
              placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiI..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => mapboxToken && toast.success('Token set! You can now use the map.')}
            disabled={!mapboxToken}
            className="w-full"
          >
            Set Token
          </Button>
        </CardContent>
      </Card>
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
          <div 
            ref={mapContainer} 
            className="w-full h-96 rounded-lg border"
            style={{ minHeight: '400px' }}
          />
          
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