import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PetCard } from "@/components/pet-card";
import { PetForm } from "@/components/pet-form";
import { PetProfile } from "@/components/pet-profile";
import { Plus, Calendar, Pill, TrendingUp } from "lucide-react";
import type { Pet } from "@shared/schema";

export default function Dashboard() {
  const [showPetForm, setShowPetForm] = useState(false);
  const [showPetProfile, setShowPetProfile] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  const { data: pets = [], isLoading } = useQuery<Pet[]>({
    queryKey: ["/api/pets"]
  });

  const handleAddPet = () => {
    setEditingPet(null);
    setShowPetForm(true);
  };

  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet);
    setShowPetForm(true);
  };

  const handleViewPet = (pet: Pet) => {
    setSelectedPet(pet);
    setShowPetProfile(true);
  };

  const handleEditFromProfile = (pet: Pet) => {
    setShowPetProfile(false);
    setEditingPet(pet);
    setShowPetForm(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-foreground">Your Pets</h3>
          <Button onClick={handleAddPet} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2" size={16} />
            Add Pet
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onEdit={handleEditPet}
              onView={handleViewPet}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Calendar className="text-primary" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Next Appointment</h4>
                <p className="text-muted-foreground text-sm">Vet checkup - Tomorrow 2:00 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
                <Pill className="text-warning" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Medication Reminder</h4>
                <p className="text-muted-foreground text-sm">Max's heartworm pill due</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-success" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Health Status</h4>
                <p className="text-muted-foreground text-sm">All pets healthy & up to date</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pet Form Dialog */}
      <PetForm
        pet={editingPet || undefined}
        isOpen={showPetForm}
        onClose={() => {
          setShowPetForm(false);
          setEditingPet(null);
        }}
      />

      {/* Pet Profile Dialog */}
      <PetProfile
        pet={selectedPet || undefined}
        isOpen={showPetProfile}
        onClose={() => {
          setShowPetProfile(false);
          setSelectedPet(null);
        }}
        onEdit={handleEditFromProfile}
      />
    </div>
  );
}
