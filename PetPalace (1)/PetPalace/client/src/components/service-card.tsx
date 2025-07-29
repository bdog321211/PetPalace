import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { PetService } from "@shared/schema";

interface ServiceCardProps {
  service: PetService;
  onVisit?: (service: PetService) => void;
}

const categoryColors = {
  store: "bg-accent/20 text-accent",
  trainer: "bg-warning/20 text-warning",
  grooming: "bg-mint/20 text-mint-foreground",
};

export function ServiceCard({ service, onVisit }: ServiceCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video overflow-hidden">
        <img 
          src={service.image || "https://images.unsplash.com/photo-1601758003122-53c40e686a19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"} 
          alt={service.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-foreground">{service.name}</h4>
          <div className="flex items-center space-x-1">
            <Star className="text-yellow-400 fill-current" size={16} />
            <span className="text-sm text-muted-foreground">{service.rating}</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-2">{service.description}</p>
        <div className="flex items-center space-x-2 mb-3">
          <Badge 
            className={categoryColors[service.category as keyof typeof categoryColors] || "bg-muted text-muted-foreground"}
          >
            {service.category}
          </Badge>
          <span className="text-sm text-muted-foreground">{service.distance} km away</span>
        </div>
        {service.priceRange && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-primary">{service.priceRange}</span>
          </div>
        )}
        <Button 
          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
          onClick={() => onVisit?.(service)}
        >
          {service.category === 'store' ? 'Visit Store' : service.category === 'trainer' ? 'Book Training' : 'Book Grooming'}
        </Button>
      </CardContent>
    </Card>
  );
}
