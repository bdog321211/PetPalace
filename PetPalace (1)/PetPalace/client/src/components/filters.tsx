import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface FiltersProps {
  onLocationChange?: (location: string) => void;
  onRatingChange?: (rating: string) => void;
  onPriceChange?: (price: string) => void;
  onCategoryChange?: (category: string) => void;
  onSearch?: () => void;
  showCategory?: boolean;
  location?: string;
  rating?: string;
  price?: string;
  category?: string;
}

export function Filters({
  onLocationChange,
  onRatingChange,
  onPriceChange,
  onCategoryChange,
  onSearch,
  showCategory = false,
  location = "",
  rating = "",
  price = "",
  category = ""
}: FiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2">Location</Label>
            <Input
              value={location}
              onChange={(e) => onLocationChange?.(e.target.value)}
              placeholder="Enter your area"
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-2">Rating</Label>
            <Select value={rating} onValueChange={onRatingChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4+">4+ Stars</SelectItem>
                <SelectItem value="3+">3+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-2">Price Range</Label>
            <Select value={price} onValueChange={onPriceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Any Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Price</SelectItem>
                <SelectItem value="20-40">$20-40/day</SelectItem>
                <SelectItem value="40-60">$40-60/day</SelectItem>
                <SelectItem value="60+">$60+/day</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {showCategory && (
            <div>
              <Label className="text-sm font-medium mb-2">Category</Label>
              <Select value={category} onValueChange={onCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="store">Pet Stores</SelectItem>
                  <SelectItem value="trainer">Trainers</SelectItem>
                  <SelectItem value="grooming">Grooming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex items-end">
            <Button onClick={onSearch} className="w-full">
              <Search className="mr-2" size={16} />
              Search
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
