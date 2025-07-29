import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Heart, PawPrint } from "lucide-react";
import { SocialPostComponent } from "@/components/social-post";
import { PetCard } from "@/components/pet-card";
import type { User as UserType, Pet, SocialPost } from "@shared/schema";

interface UserProfileProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ userId, isOpen, onClose }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "pets">("posts");

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/users", userId],
    enabled: isOpen && !!userId,
  });

  const { data: userPets = [] } = useQuery<Pet[]>({
    queryKey: ["/api/pets/user", userId],
    enabled: isOpen && !!userId && activeTab === "pets",
  });

  const { data: allPosts = [] } = useQuery<SocialPost[]>({
    queryKey: ["/api/posts"],
    enabled: isOpen && activeTab === "posts",
  });

  // Filter posts by this user
  const userPosts = allPosts.filter(post => post.userId === userId);

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-2xl">
                    <User size={32} />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-muted-foreground">@{user.username}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                    {user.email && (
                      <div className="flex items-center">
                        <Mail size={14} className="mr-1" />
                        {user.email}
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center">
                        <Phone size={14} className="mr-1" />
                        {user.phone}
                      </div>
                    )}
                    {user.city && (
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1" />
                        {user.city}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-4 mt-4">
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{userPosts.length}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{userPets.length}</div>
                      <div className="text-xs text-muted-foreground">Pets</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">
                        {userPosts.reduce((sum, post) => sum + (post.likes || 0), 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Likes</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex space-x-4 border-b border-border">
            <Button
              variant={activeTab === "posts" ? "default" : "ghost"}
              onClick={() => setActiveTab("posts")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Heart size={16} className="mr-2" />
              Posts ({userPosts.length})
            </Button>
            <Button
              variant={activeTab === "pets" ? "default" : "ghost"}
              onClick={() => setActiveTab("pets")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <PawPrint size={16} className="mr-2" />
              Pets ({userPets.length})
            </Button>
          </div>

          {/* Content */}
          <div className="min-h-[400px]">
            {activeTab === "posts" && (
              <div className="space-y-4">
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <SocialPostComponent key={post.id} post={post} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Heart size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No posts yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "pets" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userPets.length > 0 ? (
                  userPets.map((pet) => (
                    <PetCard
                      key={pet.id}
                      pet={pet}
                      onView={() => {}} // Read-only view
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <PawPrint size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No pets to show</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}