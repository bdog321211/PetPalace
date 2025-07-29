import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Pill, Edit, Heart, MapPin, Weight, Palette } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Pet } from "@shared/schema";

interface PetProfileProps {
  pet: Pet | null | undefined;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (pet: Pet) => void;
}

export function PetProfile({ pet, isOpen, onClose, onEdit }: PetProfileProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deletePetMutation = useMutation({
    mutationFn: async (petId: string) => {
      return apiRequest("DELETE", `/api/pets/${petId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets/user", "user-1"] });
      toast({
        title: "Pet removed",
        description: `${pet?.name} has been removed from your pets.`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove pet. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!pet) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getHealthStatusColor = (status: string | null) => {
    if (!status) return 'bg-muted text-muted-foreground';
    switch (status) {
      case 'healthy': return 'bg-success/20 text-success';
      case 'needs_attention': return 'bg-warning/20 text-warning';
      case 'sick': return 'bg-error/20 text-error';
      case 'recovering': return 'bg-accent/20 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove ${pet.name} from your pets? This action cannot be undone.`)) {
      deletePetMutation.mutate(pet.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{pet.name}'s Profile</span>
            <div className="flex space-x-2">
              <Button onClick={() => onEdit(pet)} size="sm">
                <Edit size={16} className="mr-1" />
                Edit
              </Button>
              <Button 
                onClick={handleDelete}
                variant="destructive"
                size="sm"
                disabled={deletePetMutation.isPending}
              >
                Remove Pet
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pet Photo & Basic Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <img 
                    src={pet.image || "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"}
                    alt={pet.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-2xl font-bold text-foreground mb-2">{pet.name}</h3>
                  <p className="text-muted-foreground mb-4">{pet.breed}</p>
                  
                  <div className="space-y-2">
                    <Badge className={getHealthStatusColor(pet.healthStatus)}>
                      {pet.healthStatus.replace('_', ' ').toUpperCase()}
                    </Badge>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <Heart size={14} className="mr-1 text-primary" />
                        {pet.age} year{pet.age !== 1 ? 's' : ''} old
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1">🐾</span>
                        {pet.type}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details & Health */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {pet.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About {pet.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{pet.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar size={20} className="mr-2 text-primary" />
                  Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(pet.appointments) && pet.appointments.length > 0 ? (
                  <div className="space-y-3">
                    {pet.appointments.map((appointment, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-foreground">{appointment.type}</h4>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                              <MapPin size={14} className="mr-1" />
                              {appointment.location}
                            </p>
                            {appointment.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{appointment.notes}</p>
                            )}
                          </div>
                          <Badge variant="outline">
                            {formatDate(appointment.date)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No upcoming appointments</p>
                )}
              </CardContent>
            </Card>

            {/* Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Pill size={20} className="mr-2 text-warning" />
                  Medications & Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(pet.medications) && pet.medications.length > 0 ? (
                  <div className="space-y-3">
                    {pet.medications.map((medication, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-foreground">{medication.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Frequency: {medication.frequency}
                            </p>
                            {medication.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{medication.notes}</p>
                            )}
                          </div>
                          <Badge variant="outline">
                            Due: {new Date(medication.nextDue).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No medications or reminders</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}