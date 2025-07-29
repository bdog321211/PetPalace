import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { PetSitter } from "@shared/schema";

interface SitterCardProps {
  sitter: PetSitter;
  onBook?: (sitter: PetSitter) => void;
}

export function SitterCard({ sitter, onBook }: SitterCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video overflow-hidden">
        <img 
          src={sitter.image || "https://images.unsplash.com/photo-1560807707-8cc77767d783?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"} 
          alt={sitter.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-foreground">{sitter.name}</h4>
          <div className="flex items-center space-x-1">
            <Star className="text-yellow-400 fill-current" size={16} />
            <span className="text-sm text-muted-foreground">{sitter.rating}</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-3">{sitter.description}</p>
        <div className="flex justify-between items-center mb-3">
          <span className="text-lg font-semibold text-primary">${sitter.pricePerDay}/day</span>
          <span className="text-sm text-muted-foreground">{sitter.distance} km away</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {Array.isArray(sitter.specialties) && sitter.specialties.map((specialty, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {specialty}
            </Badge>
          ))}
        </div>
        <Button 
          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
          onClick={() => onBook?.(sitter)}
        >
          Book Now
        </Button>
      </CardContent>
    </Card>
  );
}
