import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  expiryDate: string;
}

const sampleInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    description: "Pain relief and fever reducer",
    price: 25,
    stock: 150,
    category: "Pain Relief",
    expiryDate: "2025-12-31"
  },
  {
    id: "2",
    name: "Amoxicillin 250mg",
    description: "Antibiotic for bacterial infections",
    price: 120,
    stock: 75,
    category: "Antibiotic",
    expiryDate: "2025-08-15"
  },
  {
    id: "3",
    name: "Cetirizine 10mg",
    description: "Antihistamine for allergies",
    price: 45,
    stock: 0,
    category: "Allergy",
    expiryDate: "2025-10-20"
  }
];

export const InventoryManagement = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(sampleInventory);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    expiryDate: ''
  });
  const { toast } = useToast();

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price || !newItem.stock) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const item: InventoryItem = {
      id: Date.now().toString(),
      name: newItem.name,
      description: newItem.description,
      price: parseFloat(newItem.price),
      stock: parseInt(newItem.stock),
      category: newItem.category,
      expiryDate: newItem.expiryDate
    };

    setInventory(prev => [...prev, item]);
    setNewItem({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      expiryDate: ''
    });
    setIsAddDialogOpen(false);

    toast({
      title: "Item Added",
      description: "Medicine has been added to your inventory"
    });
  };

  const handleDeleteItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Item Deleted",
      description: "Medicine has been removed from your inventory"
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (stock < 10) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-muted-foreground">Manage your medicine inventory</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Medicine
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Medicine</DialogTitle>
              <DialogDescription>
                Add a new medicine to your inventory
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Medicine Name *</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter medicine name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newItem.stock}
                    onChange={(e) => setNewItem(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Pain Relief, Antibiotic"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newItem.expiryDate}
                  onChange={(e) => setNewItem(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>
              <Button onClick={handleAddItem} className="w-full">
                Add Medicine
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {inventory.map((item) => {
          const stockStatus = getStockStatus(item.stock);
          return (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <Badge variant={stockStatus.variant}>
                        {stockStatus.label}
                      </Badge>
                      {item.category && (
                        <Badge variant="outline">{item.category}</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        Stock: {item.stock}
                      </span>
                      <span>Price: ₹{item.price}</span>
                      {item.expiryDate && (
                        <span>Expires: {new Date(item.expiryDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {inventory.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No medicines in inventory. Add your first medicine to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};