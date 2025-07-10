import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Minus, MapPin, Smartphone, QrCode, CreditCard, Truck } from "lucide-react";

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
    setShowPaymentModal(true);
  };

  const handlePayment = (method: string, type: string) => {
    const selectedItems = getSelectedItems();
    let description = "";
    
    switch(type) {
      case "upi":
        description = `Redirecting to ${method} for payment of ₹${getTotalCost()}`;
        break;
      case "card":
        description = `Processing ${method} payment of ₹${getTotalCost()}`;
        break;
      case "cod":
        description = `Order placed with Cash on Delivery of ₹${getTotalCost()}`;
        break;
    }
    
    toast({
      title: "Payment Processing",
      description
    });
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Payment Successful!",
        description: `Order placed successfully via ${method}`
      });
      selectedItems.forEach(item => removeFromCart(item.id));
      setShowPaymentModal(false);
    }, 2000);
  };

  const upiApps = [
    { name: "Google Pay", icon: "🟢" },
    { name: "PhonePe", icon: "🟣" },
    { name: "Paytm", icon: "🔵" },
    { name: "Amazon Pay", icon: "🟠" },
    { name: "BHIM UPI", icon: "🔴" },
    { name: "WhatsApp Pay", icon: "🟢" }
  ];

  const cardTypes = [
    { name: "Credit Card", icon: "💳", description: "Visa, MasterCard, Rupay" },
    { name: "Debit Card", icon: "💳", description: "All major banks supported" }
  ];

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

      {/* Payment Options Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Choose Payment Method
            </DialogTitle>
          </DialogHeader>
          
          <Card className="mb-4">
            <CardContent className="p-4 text-center">
              <div className="text-lg font-semibold">Total Amount</div>
              <div className="text-2xl font-bold text-primary">₹{getTotalCost()}</div>
              <div className="text-sm text-muted-foreground">
                {getSelectedItems().length} items selected
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="upi" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upi" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                UPI
              </TabsTrigger>
              <TabsTrigger value="cards" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Cards
              </TabsTrigger>
              <TabsTrigger value="cod" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                COD
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upi" className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Pay via UPI Apps</h4>
                <div className="grid grid-cols-2 gap-3">
                  {upiApps.map((app) => (
                    <Button
                      key={app.name}
                      variant="outline"
                      className="h-16 flex flex-col items-center justify-center gap-1 hover:shadow-md transition-all"
                      onClick={() => handlePayment(app.name, "upi")}
                    >
                      <div className="text-2xl">{app.icon}</div>
                      <div className="text-xs font-medium">{app.name}</div>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cards" className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Pay with Cards</h4>
                <div className="space-y-3">
                  {cardTypes.map((card) => (
                    <Button
                      key={card.name}
                      variant="outline"
                      className="w-full h-16 flex items-center justify-between p-4 hover:shadow-md transition-all"
                      onClick={() => handlePayment(card.name, "card")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{card.icon}</div>
                        <div className="text-left">
                          <div className="font-medium">{card.name}</div>
                          <div className="text-xs text-muted-foreground">{card.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cod" className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Cash on Delivery</h4>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Truck className="h-8 w-8 text-primary" />
                      <div>
                        <div className="font-medium">Pay when delivered</div>
                        <div className="text-sm text-muted-foreground">
                          Pay cash to the delivery person
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handlePayment("Cash on Delivery", "cod")}
                    >
                      Confirm COD Order
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};