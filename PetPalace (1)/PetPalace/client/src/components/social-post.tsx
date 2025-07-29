import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Star, User } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { SocialPost, PostComment, User as UserType } from "@shared/schema";

interface SocialPostProps {
  post: SocialPost;
  onUserClick?: (userId: string) => void;
}

export function SocialPostComponent({ post, onUserClick }: SocialPostProps) {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery<PostComment[]>({
    queryKey: ["/api/posts", post.id, "comments"],
    enabled: showComments,
  });

  const { data: likes = [] } = useQuery({
    queryKey: ["/api/posts", post.id, "likes"],
  });

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/users", post.userId],
  });

  const isLiked = Array.isArray(likes) && likes.some((like: any) => like.userId === "user-1"); // Using default user

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        return apiRequest("DELETE", `/api/likes/${post.id}/user-1`);
      } else {
        return apiRequest("POST", "/api/likes", {
          postId: post.id,
          userId: "user-1"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", post.id, "likes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/comments", {
        postId: post.id,
        userId: "user-1",
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", post.id, "comments"] });
      setCommentText("");
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleComment = () => {
    if (commentText.trim()) {
      commentMutation.mutate(commentText);
    }
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const renderStars = (rating: string | null) => {
    if (!rating) return null;
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;
    
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={i} className="text-yellow-400 fill-current" size={16} />
        ))}
        {hasHalfStar && <Star className="text-yellow-400" size={16} />}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar 
              className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
              onClick={() => onUserClick?.(post.userId)}
            >
              <AvatarFallback>
                <User size={16} />
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 
                className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                onClick={() => onUserClick?.(post.userId)}
              >
                {user ? `${user.firstName} ${user.lastName}` : "Unknown User"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {formatTimeAgo(post.createdAt!)}
              </p>
            </div>
          </div>
          <p className="text-foreground mb-4">{post.content}</p>
        </div>
        
        {post.image && (
          <img 
            src={post.image} 
            alt="Post content"
            className="w-full h-64 object-cover"
          />
        )}
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`space-x-2 ${isLiked ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
              >
                <Heart className={isLiked ? "fill-current" : ""} size={18} />
                <span>{post.likes || 0}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="space-x-2 text-muted-foreground hover:text-foreground"
              >
                <MessageCircle size={18} />
                <span>{comments.length}</span>
              </Button>
            </div>
            {post.rating && (
              <div className="flex items-center space-x-1">
                {renderStars(post.rating)}
              </div>
            )}
          </div>
          
          {showComments && (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3 p-2 rounded-lg bg-muted/30">
                  <Avatar 
                    className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
                    onClick={() => onUserClick?.(comment.userId)}
                  >
                    <AvatarFallback>
                      <User size={12} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span 
                        className="font-semibold cursor-pointer hover:text-primary transition-colors"
                        onClick={() => onUserClick?.(comment.userId)}
                      >
                        {user ? `${user.firstName} ${user.lastName}` : "User"}:
                      </span>{" "}
                      {comment.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(comment.createdAt!)}
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="flex space-x-2 mt-4">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                />
                <Button 
                  onClick={handleComment}
                  disabled={!commentText.trim() || commentMutation.isPending}
                >
                  Post
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
