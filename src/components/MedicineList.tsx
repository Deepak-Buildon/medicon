import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { Search, ShoppingCart, MapPin } from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
  pharmacy: string;
  distance: string;
  category: string;
}

const sampleMedicines: Medicine[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    description: "Pain relief and fever reducer",
    price: 25,
    inStock: true,
    pharmacy: "City Pharmacy",
    distance: "0.5 km",
    category: "Pain Relief"
  },
  {
    id: "2",
    name: "Amoxicillin 250mg",
    description: "Antibiotic for bacterial infections",
    price: 120,
    inStock: true,
    pharmacy: "MedPlus",
    distance: "1.2 km",
    category: "Antibiotic"
  },
  {
    id: "3",
    name: "Cetirizine 10mg",
    description: "Antihistamine for allergies",
    price: 45,
    inStock: false,
    pharmacy: "Apollo Pharmacy",
    distance: "2.1 km",
    category: "Allergy"
  },
  {
    id: "4",
    name: "Omeprazole 20mg",
    description: "Proton pump inhibitor for acid reflux",
    price: 85,
    inStock: true,
    pharmacy: "Wellness Pharmacy",
    distance: "0.8 km",
    category: "Gastro"
  },
  {
    id: "5",
    name: "Metformin 500mg",
    description: "Diabetes medication",
    price: 95,
    inStock: true,
    pharmacy: "City Pharmacy",
    distance: "0.5 km",
    category: "Diabetes"
  }
];

export const MedicineList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [medicines] = useState<Medicine[]>(sampleMedicines);
  const { toast } = useToast();
  const { addToCart } = useCart();

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (medicine: Medicine) => {
    if (!medicine.inStock) {
      toast({
        title: "Out of Stock",
        description: "This medicine is currently out of stock",
        variant: "destructive"
      });
      return;
    }

    addToCart({
      id: medicine.id,
      name: medicine.name,
      price: medicine.price,
      pharmacy: medicine.pharmacy,
      distance: medicine.distance
    });

    toast({
      title: "Added to Cart",
      description: `${medicine.name} has been added to your cart`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search medicines or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <MapPin className="h-4 w-4 mr-2" />
          Change Location
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredMedicines.map((medicine) => (
          <Card key={medicine.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{medicine.name}</h3>
                    <Badge variant={medicine.inStock ? "default" : "secondary"}>
                      {medicine.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                    <Badge variant="outline">{medicine.category}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{medicine.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-medium">{medicine.pharmacy}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {medicine.distance}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary mb-2">
                    ₹{medicine.price}
                  </div>
                  <Button
                    onClick={() => handleAddToCart(medicine)}
                    disabled={!medicine.inStock}
                    className="w-full sm:w-auto"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMedicines.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No medicines found matching your search.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};