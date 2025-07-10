import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Bell, Shield, User, LogOut, Palette, Globe } from "lucide-react";

interface SettingsProps {
  userType: 'buyer' | 'seller';
  onSwitchMode: () => void;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ userType, onSwitchMode, onClose }) => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <SettingsIcon className="h-5 w-5 mr-2" />
          Settings
        </CardTitle>
        <CardDescription>
          Manage your account preferences and app settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Account Settings */}
        <div>
          <h3 className="text-lg font-medium mb-4">Account</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Switch User Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Currently using as {userType}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={onSwitchMode}>
                Switch to {userType === 'buyer' ? 'Seller' : 'Buyer'}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Notification Settings */}
        <div>
          <h3 className="text-lg font-medium mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <Label>Push Notifications</Label>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <Label>Order Updates</Label>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <Separator />

        {/* App Settings */}
        <div>
          <h3 className="text-lg font-medium mb-4">App Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Palette className="h-5 w-5 text-muted-foreground" />
                <Label>Dark Mode</Label>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <Label>Language</Label>
              </div>
              <Button variant="outline" size="sm">
                English
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Privacy & Security */}
        <div>
          <h3 className="text-lg font-medium mb-4">Privacy & Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <Label>Two-factor Authentication</Label>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="destructive" className="flex items-center">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          
          <Button onClick={onClose}>
            Close Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};