-- Create a secure function that returns only public shop information without exposing sensitive owner data
CREATE OR REPLACE FUNCTION public.get_secure_public_medical_shops()
RETURNS TABLE(
  id uuid,
  shop_name text,
  address text,
  city text,
  state text,
  postal_code text,
  latitude numeric,
  longitude numeric,
  operating_hours jsonb,
  services jsonb,
  is_verified boolean,
  is_active boolean,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id, 
    shop_name, 
    address, 
    city, 
    state, 
    postal_code, 
    latitude, 
    longitude, 
    operating_hours, 
    services, 
    is_verified, 
    is_active, 
    created_at
  FROM public.medical_shops
  WHERE is_active = true AND is_verified = true;
$$;