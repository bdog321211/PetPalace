import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Upload, User, LogOut } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@shared/schema";

export default function Profile() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    emergencyContactEmail: "",
  });

  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: false,
    locationServices: true,
  });

  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: ["/api/users", "user-1"]
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.city || "",
        address: user.address || "",
        emergencyContactName: user.emergencyContactName || "",
        emergencyContactPhone: user.emergencyContactPhone || "",
        emergencyContactRelationship: user.emergencyContactRelationship || "",
        emergencyContactEmail: user.emergencyContactEmail || "",
      });
      
      if (user.settings && typeof user.settings === 'object') {
        const userSettings = user.settings as any;
        setSettings({
          notifications: userSettings.notifications ?? true,
          emailNotifications: userSettings.emailNotifications ?? false,
          locationServices: userSettings.locationServices ?? true,
        });
      }
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("PATCH", "/api/users/user-1", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", "user-1"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      return apiRequest("PATCH", "/api/users/user-1", {
        settings: newSettings
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", "user-1"] });
    },
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleUpdateEmergencyContact = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleSettingChange = (setting: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    updateSettingsMutation.mutate({ ...settings, theme: newTheme });
  };

  const handleImageUpload = () => {
    // TODO: Implement image upload functionality
    console.log("Image upload clicked");
  };

  const handleSignOut = () => {
    // TODO: Implement sign out functionality
    console.log("Sign out clicked");
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-muted rounded-xl"></div>
              <div className="h-64 bg-muted rounded-xl"></div>
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-muted rounded-xl"></div>
              <div className="h-64 bg-muted rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold text-foreground mb-6">Profile & Settings</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2">First Name</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2">Last Name</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium mb-2">Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2">Phone</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2">City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium mb-2">Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleUpdateProfile}
                disabled={updateProfileMutation.isPending}
                className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Update Profile
              </Button>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2">Contact Name</Label>
                  <Input
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2">Relationship</Label>
                  <Input
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => handleInputChange("emergencyContactRelationship", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2">Phone</Label>
                  <Input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2">Email</Label>
                  <Input
                    type="email"
                    value={formData.emergencyContactEmail}
                    onChange={(e) => handleInputChange("emergencyContactEmail", e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleUpdateEmergencyContact}
                disabled={updateProfileMutation.isPending}
                className="mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                Update Contact
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Profile Picture & Settings */}
        <div>
          {/* Profile Picture */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">Profile Picture</h4>
              <div className="text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4">
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-4xl">
                    <User size={48} />
                  </AvatarFallback>
                </Avatar>
                <Button 
                  onClick={handleImageUpload}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 mb-2"
                >
                  <Upload className="mr-2" size={16} />
                  Upload Photo
                </Button>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF (max 5MB)</p>
              </div>
            </CardContent>
          </Card>

          {/* App Settings */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">App Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Dark Mode</span>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={handleThemeToggle}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Push Notifications</span>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Email Notifications</span>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Location Services</span>
                  <Switch
                    checked={settings.locationServices}
                    onCheckedChange={(checked) => handleSettingChange("locationServices", checked)}
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Button 
                  onClick={handleSignOut}
                  variant="destructive"
                  className="w-full"
                >
                  <LogOut className="mr-2" size={16} />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
