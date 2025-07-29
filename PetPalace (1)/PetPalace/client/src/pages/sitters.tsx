import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SitterCard } from "@/components/sitter-card";
import { Filters } from "@/components/filters";
import type { PetSitter } from "@shared/schema";

export default function Sitters() {
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState("");
  const [price, setPrice] = useState("");

  const { data: sitters = [], isLoading } = useQuery<PetSitter[]>({
    queryKey: ["/api/sitters"]
  });

  const handleBook = (sitter: PetSitter) => {
    // TODO: Implement booking functionality
    console.log("Book sitter:", sitter);
  };

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log("Search with filters:", { location, rating, price });
  };

  // Filter sitters based on current filters
  const filteredSitters = sitters.filter(sitter => {
    if (rating === "4+" && parseFloat(sitter.rating) < 4) return false;
    if (rating === "3+" && parseFloat(sitter.rating) < 3) return false;
    
    if (price === "20-40") {
      const priceNum = parseFloat(sitter.pricePerDay);
      if (priceNum < 20 || priceNum > 40) return false;
    }
    if (price === "40-60") {
      const priceNum = parseFloat(sitter.pricePerDay);
      if (priceNum < 40 || priceNum > 60) return false;
    }
    if (price === "60+") {
      const priceNum = parseFloat(sitter.pricePerDay);
      if (priceNum < 60) return false;
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-32 bg-muted rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">Local Pet Sitters</h3>
        
        <div className="mb-6">
          <Filters
            location={location}
            rating={rating}
            price={price}
            onLocationChange={setLocation}
            onRatingChange={setRating}
            onPriceChange={setPrice}
            onSearch={handleSearch}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSitters.map((sitter) => (
            <SitterCard
              key={sitter.id}
              sitter={sitter}
              onBook={handleBook}
            />
          ))}
        </div>
        
        {filteredSitters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No sitters found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
