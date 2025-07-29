import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import type { Pet } from "@shared/schema";

interface PetCardProps {
  pet: Pet;
  onEdit?: (pet: Pet) => void;
  onView?: (pet: Pet) => void;
}

export function PetCard({ pet, onEdit, onView }: PetCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video overflow-hidden">
        <img 
          src={pet.image || "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"} 
          alt={pet.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold text-foreground">{pet.name}</h4>
        <p className="text-muted-foreground text-sm">
          {pet.breed} • {pet.age} year{pet.age !== 1 ? 's' : ''} old
        </p>
        <div className="mt-3 flex space-x-2">
          <Button 
            className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            onClick={() => onView?.(pet)}
          >
            View Profile
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onEdit?.(pet)}
          >
            <Edit size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
