import {
  Bed,
  Building2,
  Check,
  HeartPulse,
  Home,
  MapPin,
  Plus,
  Shield,
  Tent,
  Users,
  Warehouse,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

import { useDisaster } from "#/components/provider/DisasterProvider";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import type { Depot } from "#/types";

interface AddDepotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_COORDINATES = [
  { name: "Dhaka Central Hub (Tejgaon / Mirpur)", lat: 23.7785, lng: 90.3842 },
  { name: "Sylhet Haor Medical Base (Kajalshah)", lat: 24.8998, lng: 91.8546 },
  {
    name: "Chattogram Port & Naval Base (Agrabad)",
    lat: 22.3275,
    lng: 91.8023,
  },
  {
    name: "Sunamganj Multi-Purpose Cyclone Shelter",
    lat: 25.0688,
    lng: 91.4022,
  },
  {
    name: "Feni Flood Evacuation Center (Grand Trunk)",
    lat: 23.0182,
    lng: 91.398,
  },
  { name: "Cox's Bazar Cyclone Shelter (Kolatoli)", lat: 21.4285, lng: 91.979 },
  {
    name: "Kurigram Jamuna Relief Depot (Chilmari)",
    lat: 25.5562,
    lng: 89.674,
  },
];

export const AddDepotModal: React.FC<AddDepotModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { createDepot } = useDisaster();

  const [name, setName] = useState("");
  const [type, setType] = useState<Depot["type"]>("shelter");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<string>("23.7785");
  const [lng, setLng] = useState<string>("90.3842");
  const [capacity, setCapacity] = useState<number>(500);
  const [currentOccupancy, setCurrentOccupancy] = useState<number>(0);
  const [availableBeds, setAvailableBeds] = useState<number>(500);
  const [contactPhone, setContactPhone] = useState("+880 1711-000000");
  const [operatingStatus, setOperatingStatus] =
    useState<Depot["operatingStatus"]>("fully_operational");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Emergency Generators (Backup Power)",
    "Potable Water Reservoir & Filtration",
    "First Aid & Triage Station",
    "Clean Bedding & Cots",
  ]);
  const [default_amenities, setDefaultAmenities] = useState<string[]>([
    "Emergency Generators (Backup Power)",
    "Potable Water Reservoir & Filtration",
    "First Aid & Triage Station",
    "Hot Meals & Commercial Kitchen",
    "Clean Bedding & Cots",
    "Satellite Radio & Mesh Comms",
    "Child-Friendly Safe Space",
    "24/7 Civil Defense Security Patrol",
    "Wheelchair / ADA Accessible",
    "Pet Shelter Accommodations",
    "Mobile Device Solar Charging",
    "Helipad / Air Extraction Zone",
  ]);
  const [customAmenityInput, setCustomAmenityInput] = useState("");

  const handleCapacityChange = (newCap: number) => {
    setCapacity(newCap);
    setAvailableBeds(Math.max(0, newCap - currentOccupancy));
  };

  const handleOccupancyChange = (newOcc: number) => {
    setCurrentOccupancy(newOcc);
    setAvailableBeds(Math.max(0, capacity - newOcc));
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleAddCustomAmenity = () => {
    if (!customAmenityInput.trim()) return;
    if (!selectedAmenities.includes(customAmenityInput.trim())) {
      setDefaultAmenities([...default_amenities, customAmenityInput.trim()]);
      setSelectedAmenities([...selectedAmenities, customAmenityInput.trim()]);
    }
    setCustomAmenityInput("");
  };

  const handleSelectPreset = (preset: (typeof PRESET_COORDINATES)[0]) => {
    // Add small random offset so markers don't overlap completely
    const offsetLat = Number(
      (preset.lat + (Math.random() - 0.5) * 0.02).toFixed(4),
    );
    const offsetLng = Number(
      (preset.lng + (Math.random() - 0.5) * 0.02).toFixed(4),
    );
    setLat(offsetLat.toString());
    setLng(offsetLng.toString());
    setAddress(`${preset.name}, Bangladesh`);
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter the shelter or base name");
      return;
    }
    if (!address.trim()) {
      alert("Please enter the street address or location details");
      return;
    }

    const parsedLat = parseFloat(lat) || 23.7785;
    const parsedLng = parseFloat(lng) || 90.3842;
    const parsedCap = Number(capacity) || 100;
    const parsedOcc = Number(currentOccupancy) || 0;

    createDepot({
      name: name.trim(),
      type,
      address: address.trim(),
      lat: parsedLat,
      lng: parsedLng,
      capacity: parsedCap,
      currentOccupancy: parsedOcc,
      availableBeds:
        Number(availableBeds) || Math.max(0, parsedCap - parsedOcc),
      contactPhone: contactPhone.trim() || "+880 2-9555555",
      operatingStatus,
      amenities:
        selectedAmenities.length > 0
          ? selectedAmenities
          : ["Emergency Staging Area"],
    });

    // Reset Form
    setName("");
    setAddress("");
    onOpenChange(false);
  };

  const getTypeIcon = (t: Depot["type"]) => {
    switch (t) {
      case "shelter":
        return <Home className="h-4 w-4 text-emerald-400" />;
      case "central_hub":
        return <Building2 className="h-4 w-4 text-sky-400" />;
      case "regional_depot":
        return <Warehouse className="h-4 w-4 text-amber-400" />;
      case "hospital":
        return <HeartPulse className="h-4 w-4 text-red-400" />;
      case "field_station":
        return <Tent className="h-4 w-4 text-purple-400" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-800 shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>Register Shelter / Strategic Base</DialogTitle>
            <DialogDescription>
              Commission a new emergency civilian shelter, logistics depot, or
              forward operating base.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Facility Classification Type */}
        <div>
          <label
            htmlFor=""
            className="block font-semibold text-foreground mb-1.5 uppercase tracking-wider text-[11px]"
          >
            Facility Classification <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              {
                id: "shelter",
                label: "Civic Shelter",
                desc: "Evacuees & Housing",
              },
              {
                id: "central_hub",
                label: "Central HQ Base",
                desc: "Strategic Command",
              },
              {
                id: "regional_depot",
                label: "Logistics Depot",
                desc: "Supply Warehousing",
              },
              {
                id: "hospital",
                label: "Field Hospital",
                desc: "Emergency Triage",
              },
              {
                id: "field_station",
                label: "Tactical Outpost",
                desc: "Forward Ops Unit",
              },
            ].map((item) => {
              const isSelected = type === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id as Depot["type"])}
                  className={`p-2.5 rounded-md border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary/20 border-primary text-primary font-bold shadow-sm"
                      : "bg-secondary/60 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(item.id as Depot["type"])}
                    <span className="font-bold text-xs text-foreground">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Facility Name & Contact Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="fn-cp"
              className="block font-semibold text-foreground mb-1"
            >
              Facility / Base Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="fn-cp"
              placeholder="e.g., East Sector Evacuation Center #3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="text-xs"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block font-semibold text-foreground mb-1"
            >
              Emergency Dispatch Hotline / Phone
            </label>
            <Input
              id="phone"
              placeholder="+1 (555) 019-4820"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        {/* Location & Address */}
        <div>
          <label
            htmlFor="la"
            className="block font-semibold text-foreground mb-1"
          >
            Street Address / Staging Location{" "}
            <span className="text-destructive">*</span>
          </label>
          <Input
            id="la"
            placeholder="e.g., 450 Commonwealth Avenue, District 2"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="text-xs"
          />
        </div>

        {/* Coordinates with Quick Sector Presets */}
        <div className="p-3 bg-secondary/50 rounded-md border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Geographic GPS Coordinates
            </span>
            <span className="text-[10px] text-muted-foreground">
              Presets auto-position on Tactical Map
            </span>
          </div>

          {/* Quick sector buttons */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESET_COORDINATES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="px-2 py-1 bg-background hover:bg-accent border border-border rounded-sm text-[10px] text-foreground transition-colors cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label
                htmlFor="lat"
                className="block text-[10px] text-muted-foreground mb-0.5"
              >
                Latitude
              </label>
              <Input
                id="lat"
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label
                htmlFor="long"
                className="block text-[10px] text-muted-foreground mb-0.5"
              >
                Longitude
              </label>
              <Input
                id="long"
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Capacity, Initial Occupancy & Beds */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="res"
              className="font-semibold text-foreground mb-1 flex items-center gap-1"
            >
              <Users className="h-3.5 w-3.5 text-primary" />
              Total Max Capacity
            </label>
            <Input
              id="res"
              type="number"
              min={10}
              max={50000}
              value={capacity}
              onChange={(e) =>
                handleCapacityChange(parseInt(e.target.value) || 0)
              }
              required
              className="text-xs"
            />
          </div>

          <div>
            <label
              htmlFor="occu"
              className="block font-semibold text-foreground mb-1"
            >
              Current Occupancy
            </label>
            <Input
              id="occu"
              type="number"
              min={0}
              max={capacity}
              value={currentOccupancy}
              onChange={(e) =>
                handleOccupancyChange(parseInt(e.target.value) || 0)
              }
              className="text-xs"
            />
          </div>

          <div>
            <label
              htmlFor="bed"
              className="block font-semibold text-foreground mb-1 flex items-center gap-1"
            >
              <Bed className="h-3.5 w-3.5 text-primary" />
              Available Beds / Cots
            </label>
            <Input
              id="bed"
              type="number"
              min={0}
              value={availableBeds}
              onChange={(e) => setAvailableBeds(parseInt(e.target.value) || 0)}
              className="text-xs"
            />
          </div>
        </div>

        {/* Operational Status */}
        <div>
          <label
            htmlFor="st"
            className="block font-semibold text-foreground mb-1"
          >
            Operational Readiness Status
          </label>
          <select
            id="st"
            value={operatingStatus}
            onChange={(e) =>
              setOperatingStatus(e.target.value as Depot["operatingStatus"])
            }
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground cursor-pointer focus:border-ring"
          >
            <option value="fully_operational">
              Fully Operational (Ready for Intake & Staging)
            </option>
            <option value="strained">
              Strained / Limited Resources Available
            </option>
            <option value="at_capacity">
              At Max Capacity (No Incoming Intake)
            </option>
            <option value="evacuating">Evacuating / Standby Relocation</option>
          </select>
        </div>

        {/* Amenities & Capabilities */}
        <div>
          <label
            htmlFor=""
            className="block font-semibold text-foreground mb-1.5"
          >
            Capabilities & On-Site Amenities ({selectedAmenities.length}{" "}
            selected)
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-secondary/50 rounded-md border border-border">
            {default_amenities.map((amenity) => {
              const isChecked = selectedAmenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-2 py-1 rounded-sm text-[10px] font-medium transition-all flex items-center space-x-1 cursor-pointer border ${
                    isChecked
                      ? "bg-primary/20 text-primary border-primary/40 font-bold"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {isChecked && (
                    <Check className="h-3 w-3 mr-0.5 text-primary" />
                  )}
                  <span>{amenity}</span>
                </button>
              );
            })}
          </div>

          {/* Add custom amenity */}
          <div className="flex items-center space-x-2 mt-2">
            <Input
              placeholder="Add specialized capability (e.g., Trauma Bay #2)..."
              value={customAmenityInput}
              onChange={(e) => setCustomAmenityInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomAmenity();
                }
              }}
              className="text-xs h-8"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomAmenity}
              className="h-8 cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Commission Base / Shelter
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
