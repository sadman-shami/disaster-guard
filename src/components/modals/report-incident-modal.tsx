import { AlertTriangle, Compass, MapPin, UserCheck } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { useDisaster } from "#/components/provider/DisasterProvider";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import type { DisasterType, IncidentSeverity } from "#/types";

interface ReportIncidentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { currentUser, reportIncident, focusMapOnIncident } = useDisaster();

  const [type, setType] = useState<DisasterType>("flood");
  const [severity, setSeverity] = useState<IncidentSeverity>("critical");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dhaka Division");
  const [landmark, setLandmark] = useState("");
  const [lat, setLat] = useState<number>(23.8103);
  const [lng, setLng] = useState<number>(90.4125);
  const [affectedCount, setAffectedCount] = useState<number>(50);
  const [injured, setInjured] = useState<number>(0);
  const [missing, setMissing] = useState<number>(0);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([
    "Water Purification Tablets (Aquatabs)",
    "Motorized Rescue Boats & Life Jackets",
  ]);
  const [common_needs, setCommonNeeds] = useState<string[]>([
    "Water Purification Tablets (Aquatabs)",
    "Motorized Rescue Boats & Life Jackets",
    "Oral Rehydration Saline (ORS) & IV Fluids",
    "Dry Food Family Relief Packs (Chira/Gur)",
    "Emergency Tarpaulins & Waterproof Tents",
    "Heavy-Duty Diesel De-Watering Pumps",
    "Geotextile Embankment Sandbags",
    "High-Frequency Mesh Radios & Comms",
  ]);
  const [customNeedInput, setCustomNeedInput] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const toggleNeed = (need: string) => {
    if (selectedNeeds.includes(need)) {
      setSelectedNeeds(selectedNeeds.filter((n) => n !== need));
    } else {
      setSelectedNeeds([...selectedNeeds, need]);
    }
  };

  const handleAddCustomNeed = () => {
    if (
      customNeedInput.trim() &&
      !selectedNeeds.includes(customNeedInput.trim())
    ) {
      setSelectedNeeds([...selectedNeeds, customNeedInput.trim()]);
      setCommonNeeds([...common_needs, customNeedInput.trim()]);
      setCustomNeedInput("");
    }
  };

  const handleUseCurrentGPS = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setAddress(
            `GPS Fix: Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`,
          );
          setIsLocating(false);
        },
        () => {
          // fallback to Bangladesh center
          const randLat = 23.8103 + (Math.random() - 0.5) * 0.05;
          const randLng = 90.4125 + (Math.random() - 0.5) * 0.05;
          setLat(randLat);
          setLng(randLng);
          setAddress("Dhaka Central Command Grid (Simulated GPS)");
          setIsLocating(false);
        },
        { timeout: 4000 },
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !address.trim()) {
      alert(
        "Please fill out incident title, description, and location address.",
      );
      return;
    }

    const newId = reportIncident({
      title: title.trim(),
      type,
      severity,
      status: "reported",
      description: description.trim(),
      location: {
        lat: lat || 23.8103,
        lng: lng || 90.4125,
        address: address.trim(),
        city: city.trim(),
        landmark: landmark.trim() || undefined,
      },
      reportedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        isVerified: currentUser.isVerified,
        trustScore: currentUser.trustScore,
        organization: currentUser.organization,
      },
      affectedCount: Number(affectedCount) || 1,
      casualties: {
        injured: Number(injured) || 0,
        missing: Number(missing) || 0,
        fatalities: 0,
      },
      needs: selectedNeeds,
      evacuationRadiusKm: severity === "critical" ? 5.0 : 2.5,
    });

    onOpenChange(false);
    focusMapOnIncident(newId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-2xl">
      <DialogHeader>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-destructive text-destructive-foreground shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="text-left">
            <DialogTitle>Emergency Incident Report</DialogTitle>
            <DialogDescription>
              Submit an urgent field disaster report. Official responders, FSCD,
              and BDRCS will receive immediate broadcast.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Reporter Trust Preview */}
        <div className="bg-secondary/60 p-3 rounded-lg border border-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-8 w-8 rounded-md object-cover border border-border"
            />
            <div>
              <div className="font-semibold text-foreground flex items-center space-x-1">
                <span>Reporting as: {currentUser.name}</span>
                {currentUser.isVerified && (
                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Role: {currentUser.badgeTitle} • Trust Rating:{" "}
                {currentUser.trustScore}%
              </p>
            </div>
          </div>
          <Badge
            variant={currentUser.isVerified ? "verified" : "secondary"}
            className="text-[10px]"
          >
            {currentUser.isVerified
              ? "✓ Official Auto-Verified"
              : "Community Corroborated"}
          </Badge>
        </div>

        {/* Disaster Type & Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor=""
              className="font-semibold text-foreground block mb-1"
            >
              Disaster Hazard Category:
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DisasterType)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="flood">
                🌊 Flash Flood / River Embankment Breach
              </option>
              <option value="hurricane">
                🌀 Severe Cyclone / Coastal Storm Surge
              </option>
              <option value="landslide">
                ⛰️ Riverbank Erosion / Hillside Landslide
              </option>
              <option value="power_outage">
                💡 Urban Waterlogging & Power Substation Hazard
              </option>
              <option value="hazmat">
                ☣️ Chemical / Toxic Industrial Hazmat
              </option>
              <option value="earthquake">
                ⚡ Seismic Tremor / Structural Collapse
              </option>
              <option value="wildfire">🔥 Structural / Commercial Fire</option>
            </select>
          </div>

          <div>
            <label
              htmlFor=""
              className="font-semibold text-foreground block mb-1"
            >
              Threat Severity Level:
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="critical">
                🚨 Critical / Catastrophic (Life Safety Threat)
              </option>
              <option value="high">⚠️ High Priority (Immediate Action)</option>
              <option value="moderate">🟡 Moderate (Local Threat)</option>
              <option value="low">🟢 Low / Monitored Advisory</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor=""
            className="font-semibold text-foreground block mb-1"
          >
            Incident Headline / Summary:
          </label>
          <Input
            placeholder="e.g., Surma River embankment breach inundating 15 villages in Tahirpur"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="text-xs"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor=""
            className="font-semibold text-foreground block mb-1"
          >
            Detailed Ground Description:
          </label>
          <Textarea
            placeholder="Describe what is occurring, water depth, stranded families, road blockages, medical casualties, and urgent extraction priorities..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="text-xs"
          />
        </div>

        {/* Location & GPS */}
        <div className="space-y-2 p-3 rounded-lg bg-secondary/40 border border-border">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Incident Location & Coordinates
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUseCurrentGPS}
              disabled={isLocating}
              className="h-7 text-[11px]"
            >
              <Compass className="h-3 w-3 mr-1 text-primary" />
              {isLocating ? "Acquiring GPS..." : "Use Device Location"}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              placeholder="Village / Union / Road / Upazila (e.g., Tahirpur Sadar)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="text-xs"
            />
            <Input
              placeholder="Landmark (e.g., Near Tahirpur High School Ghat)"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="text-xs"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <Input
              placeholder="District / City (e.g. Sunamganj, Sylhet)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="text-xs"
            />
            <Input
              placeholder="Latitude"
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(parseFloat(e.target.value) || 23.8103)}
              className="text-xs"
            />
            <Input
              placeholder="Longitude"
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(parseFloat(e.target.value) || 90.4125)}
              className="text-xs"
            />
          </div>
        </div>

        {/* Casualties & Affected */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label
              htmlFor=""
              className="font-semibold text-muted-foreground block mb-1 text-[11px]"
            >
              Estimated Affected:
            </label>
            <Input
              type="number"
              min={1}
              value={affectedCount}
              onChange={(e) => setAffectedCount(parseInt(e.target.value) || 0)}
              className="text-xs"
            />
          </div>
          <div>
            <label
              htmlFor=""
              className="font-semibold text-muted-foreground block mb-1 text-[11px]"
            >
              Injuries:
            </label>
            <Input
              type="number"
              min={0}
              value={injured}
              onChange={(e) => setInjured(parseInt(e.target.value) || 0)}
              className="text-xs text-orange-400 font-bold"
            />
          </div>
          <div>
            <label
              htmlFor=""
              className="font-semibold text-muted-foreground block mb-1 text-[11px]"
            >
              Missing Persons:
            </label>
            <Input
              type="number"
              min={0}
              value={missing}
              onChange={(e) => setMissing(parseInt(e.target.value) || 0)}
              className="text-xs text-destructive font-bold"
            />
          </div>
        </div>

        {/* Urgent Needs Checklist */}
        <div>
          <label
            htmlFor=""
            className="font-semibold text-foreground block mb-1"
          >
            Urgent Supplies & Tactical Needs:
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {common_needs.map((need) => {
              const isSelected = selectedNeeds.includes(need);
              return (
                <button
                  type="button"
                  key={need}
                  onClick={() => toggleNeed(need)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-primary/20 border-primary text-primary font-bold"
                      : "bg-card border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {isSelected ? "✓ " : "+ "}
                  {need}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-1.5">
            <Input
              placeholder="Add other custom emergency need..."
              value={customNeedInput}
              onChange={(e) => setCustomNeedInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomNeed();
                }
              }}
              className="text-xs h-8"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomNeed}
              className="h-8 text-xs"
            >
              Add
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-xs"
          >
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            Broadcast Report to Command
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
