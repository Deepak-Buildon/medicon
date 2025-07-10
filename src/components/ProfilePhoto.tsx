import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Plus, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ProfilePhoto: React.FC = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
        toast({
          title: "Profile photo updated",
          description: "Your profile photo has been updated successfully"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const openGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handleImageUpload(e as any);
    input.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="h-5 w-5 mr-2" />
          Profile Photo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={profileImage || ""} />
            <AvatarFallback className="text-2xl">
              <User className="h-16 w-16" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex space-x-2">
            <Button 
              onClick={openGallery}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Photo</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={openGallery}
              className="flex items-center space-x-2"
            >
              <Camera className="h-4 w-4" />
              <span>Gallery</span>
            </Button>
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Upload a profile photo from your device gallery</p>
          <p>Supported formats: JPG, PNG (Max 5MB)</p>
        </div>
      </CardContent>
    </Card>
  );
};