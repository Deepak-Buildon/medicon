-- Tighten SELECT policy to authenticated only and create a safe public RPC

-- 1) Drop existing public SELECT policy
DROP POLICY IF EXISTS "Buyers can view active verified shops" ON public.medical_shops;

-- 2) Recreate SELECT policy restricted to authenticated users only
CREATE POLICY "Authenticated users can view active verified shops"
ON public.medical_shops
FOR SELECT
TO authenticated
USING ((is_active = true) AND (is_verified = true));

-- Keep existing owner management policy as-is

-- 3) Create a SECURITY DEFINER function exposing only non-sensitive fields for public access
CREATE OR REPLACE FUNCTION public.get_public_medical_shops()
RETURNS TABLE (
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
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id, shop_name, address, city, state, postal_code, latitude, longitude, 
    operating_hours, services, is_verified, is_active, created_at, updated_at
  FROM public.medical_shops
  WHERE is_active = true AND is_verified = true;
$$;

-- 4) Allow anonymous and authenticated roles to execute the safe function
GRANT EXECUTE ON FUNCTION public.get_public_medical_shops() TO anon, authenticated;