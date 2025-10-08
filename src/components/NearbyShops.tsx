import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Clock, Star, Navigation, Loader2 } from "lucide-react";

interface MedicalShop {
  id: string;
  shop_name: string;
  owner_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  distance?: number;
  license_number: string;
  created_at: string;
}

const NearbyShops = () => {
  const { toast } = useToast();
  const [shops, setShops] = useState<MedicalShop[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearbyShops = async () => {
    setLoading(true);
    try {
      // Get user's current location
      const location = await getCurrentLocation();
      setUserLocation(location);

      // Fetch all medical shops
      const { data: shopsData, error } = await supabase
        .from("medical_shops")
        .select("*");

      if (error) throw error;

      // Calculate distances and sort by proximity
      const shopsWithDistance = shopsData.map((shop) => ({
        ...shop,
        distance: calculateDistance(
          location.latitude,
          location.longitude,
          shop.latitude,
          shop.longitude
        ),
      })) as MedicalShop[];

      // Sort by distance and filter within 50km
      const nearbyShops = shopsWithDistance
        .filter((shop) => shop.distance <= 50)
        .sort((a, b) => a.distance - b.distance);

      setShops(nearbyShops);

      if (nearbyShops.length === 0) {
        toast({
          title: "No nearby shops found",
          description: "There are no registered medical shops within 50km of your location.",
        });
      }
    } catch (error: any) {
      console.error("Error finding nearby shops:", error);
      toast({
        title: "Location Error",
        description: error.message || "Please enable location access to find nearby shops",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (shop: MedicalShop) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`;
    window.open(url, "_blank");
  };

  const formatOperatingHours = (hours: any) => {
    if (!hours) return "Hours not specified";
    
    const today = new Date().toDateString().toLowerCase();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[new Date().getDay()];
    
    const todayHours = hours[currentDay];
    if (!todayHours) return "Hours not specified";
    
    if (todayHours.closed) return "Closed today";
    
    return `${todayHours.open} - ${todayHours.close}`;
  };

  useEffect(() => {
    // Auto-load nearby shops when component mounts
    findNearbyShops();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Nearby Medical Shops</h2>
          <p className="text-muted-foreground">
            Find verified medical shops near your location
          </p>
        </div>
        <Button onClick={findNearbyShops} disabled={loading} className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          {loading ? "Finding..." : "Refresh Location"}
        </Button>
      </div>

      {userLocation && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            Your location: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shops.map((shop) => (
          <Card key={shop.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{shop.shop_name}</CardTitle>
                  <CardDescription>{shop.owner_name}</CardDescription>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Licensed
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-primary">
                  {shop.distance?.toFixed(1)} km away
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">
                    {shop.address}, {shop.city}, {shop.state}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{shop.phone}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`tel:${shop.phone}`, "_self")}
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => openInMaps(shop)}
                  className="flex-1"
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  Directions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && shops.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No nearby shops found</h3>
          <p className="text-muted-foreground mb-4">
            There are no registered medical shops within 50km of your current location.
          </p>
          <Button onClick={findNearbyShops} variant="outline">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default NearbyShops;