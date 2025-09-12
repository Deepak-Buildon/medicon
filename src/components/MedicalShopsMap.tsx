import React, { useEffect, useRef, useState } from 'react';
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
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // Default to India center

  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const mapContainerEl = useRef<HTMLDivElement | null>(null);

  // initialize map once
  useEffect(() => {
    if (mapRef.current || !mapContainerEl.current) return;
    mapRef.current = L.map(mapContainerEl.current).setView(mapCenter, userLocation ? 13 : 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapRef.current);
    markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
  }, [mapCenter, userLocation]);

  // keep view in sync
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(mapCenter, userLocation ? 13 : 5);
    }
  }, [mapCenter, userLocation]);

  // update markers when data changes
  useEffect(() => {
    if (!markersLayerRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    if (userLocation) {
      L.marker(userLocation).bindPopup('<strong>Your Location</strong>').addTo(layer);
    }

    shops.forEach((shop) => {
      const html = `
        <div class="space-y-2">
          <div style="font-weight:600">${shop.shop_name}</div>
          <div style="font-size:12px;opacity:.75">${shop.address}, ${shop.city}</div>
          ${shop.distance !== undefined ? `<div style="color:var(--primary)">${shop.distance.toFixed(1)} km away</div>` : ''}
        </div>
      `;
      L.marker([shop.latitude, shop.longitude]).bindPopup(html, { maxWidth: 300 }).addTo(layer);
    });
  }, [shops, userLocation]);

  // cleanup
  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

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
      setMapCenter([lat, lng]);

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
          <div className="absolute inset-0">
            <div ref={mapContainerEl} className="w-full h-full" />
          </div>
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