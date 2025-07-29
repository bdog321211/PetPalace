import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Plus, Trash2, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Pet, InsertPet } from "@shared/schema";

interface PetFormProps {
  pet?: Pet;
  isOpen: boolean;
  onClose: () => void;
}

interface Appointment {
  type: string;
  date: string;
  location: string;
  notes?: string;
}

interface Medication {
  name: string;
  frequency: string;
  nextDue: string;
  notes?: string;
}

export function PetForm({ pet, isOpen, onClose }: PetFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAppointments, setShowAppointments] = useState(false);
  const [showMedications, setShowMedications] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    type: "dog",
    weight: "",
    color: "",
    gender: "male",
    description: "",
    image: "",
    healthStatus: "healthy",
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name || "",
        breed: pet.breed || "",
        age: pet.age?.toString() || "",
        type: pet.type || "dog",
        weight: "",
        color: "",
        gender: "male",
        description: pet.description || "",
        image: pet.image || "",
        healthStatus: pet.healthStatus || "healthy",
      });
      setAppointments(Array.isArray(pet.appointments) ? pet.appointments : []);
      setMedications(Array.isArray(pet.medications) ? pet.medications : []);
    } else {
      setFormData({
        name: "",
        breed: "",
        age: "",
        type: "dog",
        weight: "",
        color: "",
        gender: "male",
        description: "",
        image: "",
        healthStatus: "healthy",
      });
      setAppointments([]);
      setMedications([]);
    }
  }, [pet]);

  const savePetMutation = useMutation({
    mutationFn: async (petData: InsertPet) => {
      if (pet) {
        return apiRequest("PATCH", `/api/pets/${pet.id}`, petData);
      } else {
        return apiRequest("POST", "/api/pets", petData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets/user", "user-1"] });
      toast({
        title: pet ? "Pet updated" : "Pet added",
        description: `${formData.name} has been ${pet ? "updated" : "added"} successfully.`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${pet ? "update" : "add"} pet. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.breed || !formData.age) {
      toast({
        title: "Missing information",
        description: "Please fill in the pet's name, breed, and age.",
        variant: "destructive",
      });
      return;
    }

    const petData: InsertPet = {
      userId: "user-1",
      name: formData.name,
      breed: formData.breed,
      age: parseInt(formData.age),
      type: formData.type,
      description: formData.description,
      image: formData.image,
      healthStatus: formData.healthStatus,
      appointments: appointments,
      medications: medications,
    };

    savePetMutation.mutate(petData);
  };

  const addAppointment = () => {
    setAppointments([...appointments, {
      type: "",
      date: "",
      location: "",
      notes: ""
    }]);
  };

  const updateAppointment = (index: number, field: keyof Appointment, value: string) => {
    const updated = [...appointments];
    updated[index] = { ...updated[index], [field]: value };
    setAppointments(updated);
  };

  const removeAppointment = (index: number) => {
    setAppointments(appointments.filter((_, i) => i !== index));
  };

  const addMedication = () => {
    setMedications([...medications, {
      name: "",
      frequency: "",
      nextDue: "",
      notes: ""
    }]);
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pet ? "Edit Pet" : "Add New Pet"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pet Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter pet name"
                  />
                </div>
                <div>
                  <Label>Breed *</Label>
                  <Input
                    value={formData.breed}
                    onChange={(e) => setFormData({...formData, breed: e.target.value})}
                    placeholder="Enter breed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Age *</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    placeholder="Age in years"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                      <SelectItem value="bird">Bird</SelectItem>
                      <SelectItem value="rabbit">Rabbit</SelectItem>
                      <SelectItem value="hamster">Hamster</SelectItem>
                      <SelectItem value="fish">Fish</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Weight (lbs)</Label>
                  <Input
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="Weight"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Color</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    placeholder="Pet color"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Health Status</Label>
                <Select value={formData.healthStatus} onValueChange={(value) => setFormData({...formData, healthStatus: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="needs_attention">Needs Attention</SelectItem>
                    <SelectItem value="sick">Sick</SelectItem>
                    <SelectItem value="recovering">Recovering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell us about your pet..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Photo URL</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="Enter image URL"
                />
              </div>
            </CardContent>
          </Card>

          {/* Appointments & Medications */}
          <div className="space-y-6">
            {/* Appointments */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Appointments</CardTitle>
                  <Button onClick={addAppointment} size="sm">
                    <Plus size={16} className="mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointments.map((appointment, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Appointment {index + 1}</span>
                      <Button
                        onClick={() => removeAppointment(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Type (e.g., Vet visit)"
                        value={appointment.type}
                        onChange={(e) => updateAppointment(index, "type", e.target.value)}
                      />
                      <Input
                        type="datetime-local"
                        value={appointment.date}
                        onChange={(e) => updateAppointment(index, "date", e.target.value)}
                      />
                    </div>
                    <Input
                      placeholder="Location"
                      value={appointment.location}
                      onChange={(e) => updateAppointment(index, "location", e.target.value)}
                    />
                    <Input
                      placeholder="Notes (optional)"
                      value={appointment.notes || ""}
                      onChange={(e) => updateAppointment(index, "notes", e.target.value)}
                    />
                  </div>
                ))}
                {appointments.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No appointments scheduled
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Medications */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Medications & Reminders</CardTitle>
                  <Button onClick={addMedication} size="sm">
                    <Plus size={16} className="mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {medications.map((medication, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Medication {index + 1}</span>
                      <Button
                        onClick={() => removeMedication(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Medication name"
                        value={medication.name}
                        onChange={(e) => updateMedication(index, "name", e.target.value)}
                      />
                      <Input
                        placeholder="Frequency (e.g., Daily)"
                        value={medication.frequency}
                        onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                      />
                    </div>
                    <Input
                      type="date"
                      placeholder="Next due date"
                      value={medication.nextDue}
                      onChange={(e) => updateMedication(index, "nextDue", e.target.value)}
                    />
                    <Input
                      placeholder="Notes (optional)"
                      value={medication.notes || ""}
                      onChange={(e) => updateMedication(index, "notes", e.target.value)}
                    />
                  </div>
                ))}
                {medications.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No medications or reminders set
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={savePetMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {savePetMutation.isPending ? "Saving..." : pet ? "Update Pet" : "Add Pet"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}