import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Navigation, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MedicalShop {
  id: string;
  shop_name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  operating_hours: any;
  services: string[];
  is_verified: boolean;
  distance?: number;
}

interface MedicalShopsMapProps {
  onClose: () => void;
}

const MedicalShopsMap: React.FC<MedicalShopsMapProps> = ({ onClose }) => {
  const [shops, setShops] = useState<MedicalShop[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getCurrentLocation = () => {
    return new Promise<[number, number]>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.latitude, position.coords.longitude]);
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const fetchNearbyShops = async () => {
    try {
      setLoading(true);
      
      // Get user's current location
      const [lat, lng] = await getCurrentLocation();
      setUserLocation([lat, lng]);

      // Fetch shops from Supabase using the secure RPC
      const { data: shopsData, error } = await supabase
        .rpc('get_public_medical_shops');

      if (error) {
        console.error('Error fetching shops:', error);
        toast.error('Failed to fetch nearby shops');
        return;
      }

      if (!shopsData || shopsData.length === 0) {
        toast.info('No medical shops found in the database');
        return;
      }

      // Calculate distances and filter nearby shops (within 50km)
      const shopsWithDistance = shopsData
        .map((shop: any) => ({
          ...shop,
          distance: calculateDistance(lat, lng, shop.latitude, shop.longitude)
        }))
        .filter((shop: any) => shop.distance <= 50)
        .sort((a: any, b: any) => a.distance - b.distance);

      setShops(shopsWithDistance);

      if (shopsWithDistance.length === 0) {
        toast.info('No medical shops found within 50km of your location');
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get your location. Please enable location services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyShops();
  }, []);

  const openInMaps = (lat: number, lng: number, shopName: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(shopName)}`;
    window.open(url, '_blank');
  };

  const formatOperatingHours = (operatingHours: any) => {
    if (!operatingHours) return 'Hours not available';
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = operatingHours[today];
    
    if (!todayHours) return 'Hours not available';
    if (todayHours.closed) return 'Closed today';
    
    return `${todayHours.open} - ${todayHours.close}`;
  };

  // Custom hook to center map on user location
  const MapController = () => {
    const map = useMap();
    
    useEffect(() => {
      if (userLocation) {
        map.setView(userLocation, 13);
      }
    }, [map, userLocation]);
    
    return null;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading nearby medical shops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Nearby Medical Shops</h2>
          <Button variant="outline" onClick={onClose}>
            Close Map
          </Button>
        </div>
        
        <div className="flex-1 relative">
          <MapContainer
            center={userLocation || [20.5937, 78.9629]} 
            zoom={userLocation ? 13 : 5}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <MapController />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User location marker */}
            {userLocation && (
              <Marker 
                position={userLocation}
                icon={L.divIcon({
                  html: '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.5);"></div>',
                  className: 'custom-marker',
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                })}
              >
                <Popup>
                  <div className="text-center">
                    <strong>Your Location</strong>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Medical shop markers */}
            {shops.map((shop) => (
              <Marker 
                key={shop.id} 
                position={[shop.latitude, shop.longitude]}
                icon={L.divIcon({
                  html: '<div style="background-color: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(16,185,129,0.5);"></div>',
                  className: 'custom-marker',
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                })}
              >
                <Popup maxWidth={300}>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{shop.shop_name}</h3>
                      {shop.is_verified && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>{shop.address}, {shop.city}</span>
                      </div>
                      
                      {shop.distance && (
                        <div className="text-primary font-medium">
                          {shop.distance.toFixed(1)} km away
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>{formatOperatingHours(shop.operating_hours)}</span>
                      </div>
                    </div>
                    
                    {shop.services && shop.services.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Services: </span>
                        <span>{shop.services.slice(0, 3).join(', ')}</span>
                        {shop.services.length > 3 && <span> +{shop.services.length - 3} more</span>}
                      </div>
                    )}
                    
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => openInMaps(shop.latitude, shop.longitude, shop.shop_name)}
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Get Directions
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        
        <div className="p-4 bg-muted text-sm text-muted-foreground">
          {shops.length > 0 ? (
            <span>Found {shops.length} medical shop{shops.length > 1 ? 's' : ''} within 50km</span>
          ) : (
            <span>No medical shops found nearby</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalShopsMap;