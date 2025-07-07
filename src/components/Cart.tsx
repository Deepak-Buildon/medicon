import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Minus, MapPin } from "lucide-react";

export const Cart = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    toggleItemSelection, 
    selectAllItems, 
    getTotalCost, 
    getSelectedItems,
    clearCart 
  } = useCart();
  const { toast } = useToast();

  const handleBuy = () => {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to purchase",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Order Placed!",
      description: `Successfully ordered ${selectedItems.length} items for ₹${getTotalCost()}`
    });
    
    // Remove selected items from cart after purchase
    selectedItems.forEach(item => removeFromCart(item.id));
  };

  const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected);
  const someSelected = cartItems.some(item => item.selected);

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Your cart is empty</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Select All */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={allSelected}
                onCheckedChange={(checked) => selectAllItems(!!checked)}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select All ({cartItems.length} items)
              </label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCart}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cart Items */}
      <div className="space-y-3">
        {cartItems.map((item) => (
          <Card key={item.id} className={`transition-all ${item.selected ? 'ring-2 ring-primary/20' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={item.selected}
                  onCheckedChange={() => toggleItemSelection(item.id)}
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span>{item.pharmacy}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.distance}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="w-16 text-center"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-right">
                  <div className="font-bold">₹{item.price * item.quantity}</div>
                  <div className="text-sm text-muted-foreground">₹{item.price} each</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total and Buy Section */}
      <Card className="sticky bottom-4 border-2 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-muted-foreground">
                {getSelectedItems().length} items selected
              </div>
              <div className="text-2xl font-bold">
                Total: ₹{getTotalCost()}
              </div>
            </div>
            <Button
              onClick={handleBuy}
              disabled={!someSelected}
              className="bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] transition-all duration-300"
              size="lg"
            >
              Buy Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};