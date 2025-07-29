import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ServiceCard } from "@/components/service-card";
import { Filters } from "@/components/filters";
import { Button } from "@/components/ui/button";
import type { PetService } from "@shared/schema";

export default function Services() {
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("all");

  const { data: services = [], isLoading } = useQuery<PetService[]>({
    queryKey: ["/api/services"]
  });

  const handleVisit = (service: PetService) => {
    // TODO: Implement visit functionality
    console.log("Visit service:", service);
  };

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log("Search with filters:", { location, rating, price, category });
  };

  // Filter services based on current filters
  const filteredServices = services.filter(service => {
    if (category !== "all" && service.category !== category) return false;
    
    if (rating === "4+" && parseFloat(service.rating) < 4) return false;
    if (rating === "3+" && parseFloat(service.rating) < 3) return false;
    
    return true;
  });

  const categories = [
    { value: "all", label: "All Services" },
    { value: "store", label: "Pet Stores" },
    { value: "trainer", label: "Trainers" },
    { value: "grooming", label: "Grooming" },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="flex space-x-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded w-24"></div>
            ))}
          </div>
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
        <h3 className="text-xl font-semibold text-foreground mb-4">Pet Stores & Trainers</h3>
        
        {/* Category Tabs */}
        <div className="flex space-x-4 mb-6">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={category === cat.value ? "default" : "outline"}
              onClick={() => setCategory(cat.value)}
              className={category === cat.value ? "bg-primary text-primary-foreground" : ""}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        <div className="mb-6">
          <Filters
            location={location}
            rating={rating}
            price={price}
            category={category}
            onLocationChange={setLocation}
            onRatingChange={setRating}
            onPriceChange={setPrice}
            onCategoryChange={setCategory}
            onSearch={handleSearch}
            showCategory={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onVisit={handleVisit}
            />
          ))}
        </div>
        
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No services found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
