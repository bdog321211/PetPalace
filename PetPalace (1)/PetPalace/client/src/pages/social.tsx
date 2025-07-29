import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SocialPostComponent } from "@/components/social-post";
import { UserProfile } from "@/components/user-profile";
import { Image, User, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { SocialPost, Pet } from "@shared/schema";

export default function Social() {
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postRating, setPostRating] = useState("none");
  const [selectedPet, setSelectedPet] = useState("none");
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery<SocialPost[]>({
    queryKey: ["/api/posts"]
  });

  const { data: userPets = [] } = useQuery<Pet[]>({
    queryKey: ["/api/pets/user", "user-1"]
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; image?: string; rating?: string; petId?: string }) => {
      return apiRequest("POST", "/api/posts", {
        userId: "user-1",
        content: postData.content,
        image: postData.image || null,
        rating: postData.rating || null,
        petId: postData.petId || null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setPostContent("");
      setPostImage("");
      setPostRating("none");
      setSelectedPet("none");
    },
  });

  const handleCreatePost = () => {
    if (postContent.trim()) {
      createPostMutation.mutate({
        content: postContent,
        image: postImage || null,
        rating: postRating === "none" ? null : postRating,
        petId: selectedPet === "none" ? null : selectedPet
      });
    }
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserProfile(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-32 bg-muted rounded-xl"></div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold text-foreground mb-6">Pet Social Feed</h3>
      
      {/* Post Creation */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Avatar>
                <AvatarFallback>
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share something about your pet..."
                  rows={3}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Pet (optional)</Label>
                    <Select value={selectedPet} onValueChange={setSelectedPet}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a pet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No pet selected</SelectItem>
                        {userPets.map((pet) => (
                          <SelectItem key={pet.id} value={pet.id}>
                            {pet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Rating (optional)</Label>
                    <Select value={postRating} onValueChange={setPostRating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Rate experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No rating</SelectItem>
                        <SelectItem value="5">5 ⭐⭐⭐⭐⭐</SelectItem>
                        <SelectItem value="4">4 ⭐⭐⭐⭐</SelectItem>
                        <SelectItem value="3">3 ⭐⭐⭐</SelectItem>
                        <SelectItem value="2">2 ⭐⭐</SelectItem>
                        <SelectItem value="1">1 ⭐</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Photo URL (optional)</Label>
                    <Input
                      value={postImage}
                      onChange={(e) => setPostImage(e.target.value)}
                      placeholder="Enter image URL"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleCreatePost}
                disabled={!postContent.trim() || createPostMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {createPostMutation.isPending ? "Sharing..." : "Share Post"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Posts */}
      <div className="space-y-6">
        {posts.map((post) => (
          <SocialPostComponent 
            key={post.id} 
            post={post} 
            onUserClick={handleUserClick}
          />
        ))}
        
        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>

      {/* User Profile Dialog */}
      <UserProfile
        userId={selectedUserId}
        isOpen={showUserProfile}
        onClose={() => {
          setShowUserProfile(false);
          setSelectedUserId("");
        }}
      />
    </div>
  );
}
