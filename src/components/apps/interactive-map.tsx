import L from "leaflet";
import {
  Home,
  Info,
  Layers,
  MapPin,
  Navigation,
  Radio,
  Truck,
  UserCheck,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import { useDisaster } from "#/components/provider/DisasterProvider";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import type { Depot, Incident } from "#/types";

interface InteractiveMapProps {
  onOpenAllocateModal: (incident: Incident) => void;
  onOpenReportModal: () => void;
  onOpenAddDepotModal?: () => void;
}

// Helper to center or pan map
function MapFlyTo({
  lat,
  lng,
  zoom,
}: {
  lat: number;
  lng: number;
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom || 13, { duration: 1.2 });
  }, [lat, lng, zoom, map]);
  return null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  onOpenAllocateModal,
  onOpenAddDepotModal,
}) => {
  const {
    incidents,
    depots,
    selectedIncidentId,
    setSelectedIncidentId,
    currentUser,
    reportIncident,
  } = useDisaster();

  // Layers toggle state
  const [showIncidents, setShowIncidents] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showDepots, setShowDepots] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [tileMode, setTileMode] = useState<"streets" | "satellite">("streets");
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null,
  );
  const [selectedDepot, setSelectedDepot] = useState<Depot | null>(null);
  const [activeEvacuationRoute, setActiveEvacuationRoute] = useState<{
    from: [number, number];
    to: [number, number];
    shelterName: string;
    distanceKm: string;
  } | null>(null);

  // Sync selectedIncidentId from context
  useEffect(() => {
    if (selectedIncidentId) {
      const match = incidents.find((i) => i.id === selectedIncidentId);
      if (match) {
        setSelectedIncident(match);
      }
    }
  }, [selectedIncidentId, incidents]);

  // Tile layer URLs
  const getTileUrl = () => {
    switch (tileMode) {
      case "satellite":
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      default:
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    }
  };

  // Create custom marker icons
  const createIncidentIcon = (incident: Incident) => {
    const isCritical = incident.severity === "critical";
    const isHigh = incident.severity === "high";
    const bgColor = isCritical ? "#dc2626" : isHigh ? "#ea580c" : "#eab308";

    let emoji = "🔥";
    if (incident.type === "flood") emoji = "🌊";
    if (incident.type === "earthquake") emoji = "⚡";
    if (incident.type === "hazmat") emoji = "☣️";
    if (incident.type === "power_outage") emoji = "💡";
    if (incident.type === "landslide") emoji = "⛰️";

    return L.divIcon({
      className: "custom-incident-marker",
      html: `
        <div class="relative flex items-center justify-center">
          ${isCritical ? '<div class="absolute -inset-2 rounded-full bg-destructive/40 animate-ping"></div>' : ""}
          <div style="background-color: ${bgColor};" class="relative z-10 h-9 w-9 rounded-full border-2 border-border flex items-center justify-center text-sm font-bold text-white transition-transform hover:scale-110">
            <span>${emoji}</span>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style="background-color: ${bgColor};"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  };

  const createShelterIcon = (depot: Depot) => {
    const isFull = depot.operatingStatus === "at_capacity";
    const isStrained = depot.operatingStatus === "strained";
    const color = isFull ? "#ef4444" : isStrained ? "#f59e0b" : "#10b981";

    return L.divIcon({
      className: "custom-shelter-marker",
      html: `
        <div class="relative flex items-center justify-center">
          <div style="background-color: ${color};" class="h-8 w-8 rounded-lg border-2 border-border flex items-center justify-center text-white text-xs font-bold transition-transform hover:scale-110">
            🏥
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  const createDepotIcon = () => {
    return L.divIcon({
      className: "custom-depot-marker",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="h-8 w-8 rounded-lg bg-blue-600 border-2 border-border shadow-md flex items-center justify-center text-white text-xs font-bold transition-transform hover:scale-110">
            📦
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  // Find nearest shelter and draw evacuation route
  const handleCalculateEvacuationRoute = (incident: Incident) => {
    const shelters = depots.filter(
      (d) => d.type === "shelter" || d.type === "central_hub",
    );
    if (shelters.length === 0) return;

    let nearest = shelters[0];
    let minDistance = 999999;

    shelters.forEach((shelter) => {
      const dLat = (shelter.lat - incident.location.lat) * 111;
      const dLng = (shelter.lng - incident.location.lng) * 85;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = shelter;
      }
    });

    setActiveEvacuationRoute({
      from: [incident.location.lat, incident.location.lng],
      to: [nearest.lat, nearest.lng],
      shelterName: nearest.name,
      distanceKm: minDistance.toFixed(1),
    });
  };

  useEffect(() => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setIsLocating(false);
        },
        () => {
          // fallback to Bangladesh center
          const randLat = 23.8103 + (Math.random() - 0.5) * 0.05;
          const randLng = 90.4125 + (Math.random() - 0.5) * 0.05;
          setLat(randLat);
          setLng(randLng);
          setIsLocating(false);
        },
        { timeout: 2000 },
      );
    } else {
      alert("Your Browser doesn't support geolocation");
      setIsLocating(false);
    }
  }, []);

  // Trigger rapid SOS incident
  const handleTriggerSOS = () => {
    if (!isLocating) {
      const newId =
        lat &&
        lng &&
        reportIncident({
          title: "🚨 RAPID SOS CITIZEN DISTRESS SIGNAL",
          type: "earthquake",
          severity: "critical",
          status: "reported",
          description:
            "Emergency beacon activated by stranded resident. Immediate life-safety boat extraction requested at location coordinates.",
          location: {
            lat: lat,
            lng: lng,
            address: `SOS Beacon Coordinates: Lat ${lat}, Lng ${lng}`,
            city: "Emergency Response Sector",
            landmark: "Civilian Distress Beacon",
          },
          reportedBy: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
            isVerified: currentUser.isVerified,
            trustScore: currentUser.trustScore,
            organization: currentUser.organization,
          },
          affectedCount: 6,
          casualties: { injured: 1, missing: 0, fatalities: 0 },
          needs: ["First Aid Kit"],
          evacuationRadiusKm: 2.0,
        });
      lat && lng && setSelectedIncidentId(newId);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (severityFilter !== "all" && inc.severity !== severityFilter)
      return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="rounded-md border border-border bg-card p-3 sm:p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Layer Toggles */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
            <span className="text-muted-foreground font-bold capitalize tracking-wider mr-1 flex items-center gap-1 tactical-tag">
              <Layers className="h-3.5 w-3.5" />
              Layers:
            </span>
            <button
              type="button"
              onClick={() => setShowIncidents(!showIncidents)}
              className={`px-2.5 py-1 rounded-sm text-xs font-bold capitalize tracking-wider border cursor-pointer transition-colors tactical-tag ${
                showIncidents
                  ? "bg-destructive/15 border-destructive/40 text-destructive font-bold"
                  : "bg-background border-border text-muted-foreground"
              }`}
            >
              Hotspots ({incidents.length})
            </button>
            <button
              type="button"
              onClick={() => setShowShelters(!showShelters)}
              className={`px-2.5 py-1 rounded-sm text-xs font-bold capitalize tracking-wider border cursor-pointer transition-colors tactical-tag ${
                showShelters
                  ? "bg-primary/15 border-primary/40 text-primary font-bold"
                  : "bg-background border-border text-muted-foreground"
              }`}
            >
              Shelters ({depots.filter((d) => d.type === "shelter").length})
            </button>
            <button
              type="button"
              onClick={() => setShowDepots(!showDepots)}
              className={`px-2.5 py-1 rounded-sm text-xs font-bold capitalize tracking-wider border cursor-pointer transition-colors tactical-tag ${
                showDepots
                  ? "bg-primary/20 border-primary/40 text-primary font-bold"
                  : "bg-background border-border text-muted-foreground"
              }`}
            >
              Logistics Depots (
              {depots.filter((d) => d.type !== "shelter").length})
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={tileMode}
              onChange={(e) => setTileMode(e.target.value as typeof tileMode)}
              className="h-8 rounded-sm border border-border bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:border-ring cursor-pointer"
            >
              <option value="streets">Standard Map</option>
              <option value="satellite">Satellite Grid</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="h-8 rounded-sm border border-border bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:border-ring cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Severity</option>
            </select>

            {onOpenAddDepotModal &&
              (currentUser.role === "admin" ||
                currentUser.role === "responder") && (
                <Button
                  size="sm"
                  onClick={onOpenAddDepotModal}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold capitalize tracking-wider h-8 text-xs px-2.5 rounded-sm shadow-sm border border-primary/50 cursor-pointer"
                  title="Commission a new shelter, depot or base"
                >
                  <Home className="h-3.5 w-3.5 mr-1" />
                  <span>+ Shelter/Base</span>
                </Button>
              )}

            <Button
              size="sm"
              onClick={handleTriggerSOS}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold capitalize tracking-wider h-8 text-xs px-2.5 rounded-sm shadow-sm border border-destructive/50 animate-pulse"
              title="Broadcast instant SOS distress pin"
            >
              <Radio className="h-3.5 w-3.5 mr-1" />
              <span>SOS Beacon</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 rounded-md border border-border overflow-hidden bg-card h-150 relative shadow-sm">
          <MapContainer
            center={[23.685, 90.3563]}
            zoom={7}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer url={getTileUrl()} />

            {/* Fly to selected incident */}
            {selectedIncident && (
              <MapFlyTo
                lat={selectedIncident.location.lat}
                lng={selectedIncident.location.lng}
                zoom={16}
              />
            )}

            {/* Render Incident Pins */}
            {showIncidents &&
              filteredIncidents.map((incident) => (
                <Marker
                  key={incident.id}
                  position={[incident.location.lat, incident.location.lng]}
                  icon={createIncidentIcon(incident)}
                  eventHandlers={{
                    click: () => {
                      setSelectedIncident(incident);
                      setSelectedDepot(null);
                    },
                  }}
                >
                  <Popup>
                    <div className="p-3 text-xs max-w-sm">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant={
                            incident.severity === "critical"
                              ? "critical"
                              : "high"
                          }
                          className="text-[10px]"
                        >
                          {incident.severity.toUpperCase()}
                        </Badge>
                        <span className="text-muted-foreground text-[10px]">
                          {incident.createdAt}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-foreground mt-1">
                        {incident.title}
                      </h4>
                      <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                        {incident.description}
                      </p>
                      <div className="mt-1 text-[11px] flex items-center justify-between text-muted-foreground">
                        <span>Affected: {incident.affectedCount}</span>
                        <span>Injured: {incident.casualties.injured}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          onClick={() =>
                            handleCalculateEvacuationRoute(incident)
                          }
                        >
                          Safe Evac Route
                        </Button>
                        {(currentUser.role === "admin" ||
                          currentUser.role === "responder") && (
                          <Button
                            onClick={() => onOpenAllocateModal(incident)}
                            variant={"default"}
                          >
                            Dispatch Supplies
                          </Button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

            {/* Render Shelters */}
            {showShelters &&
              depots
                .filter((d) => d.type === "shelter" || d.type === "hospital")
                .map((shelter) => (
                  <Marker
                    key={shelter.id}
                    position={[shelter.lat, shelter.lng]}
                    icon={createShelterIcon(shelter)}
                    eventHandlers={{
                      click: () => {
                        setSelectedDepot(shelter);
                        setSelectedIncident(null);
                      },
                    }}
                  >
                    <Popup>
                      <div className="p-2.5 text-xs max-w-xs">
                        <Badge variant="success" className="text-[10px]">
                          Emergency Shelter
                        </Badge>
                        <h4 className="font-bold text-sm text-foreground mt-1">
                          {shelter.name}
                        </h4>
                        <p className="text-muted-foreground text-xs">
                          {shelter.address}
                        </p>
                        <div className="p-1 rounded bg-muted text-[11px] space-y-0.5">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Capacity:
                            </span>
                            <span className="font-bold text-foreground">
                              {shelter.capacity} beds
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Available:
                            </span>
                            <span className="font-bold text-primary">
                              {shelter.availableBeds ||
                                shelter.capacity -
                                  shelter.currentOccupancy}{" "}
                              beds
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Status:
                            </span>
                            <span className="font-semibold text-primary capitalize">
                              {shelter.operatingStatus.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

            {/* Render Logistics Depots */}
            {showDepots &&
              depots
                .filter(
                  (d) => d.type === "central_hub" || d.type === "field_station",
                )
                .map((depot) => (
                  <Marker
                    key={depot.id}
                    position={[depot.lat, depot.lng]}
                    icon={createDepotIcon()}
                    eventHandlers={{
                      click: () => {
                        setSelectedDepot(depot);
                        setSelectedIncident(null);
                      },
                    }}
                  >
                    <Popup>
                      <div className="text-xs p-3">
                        <Badge variant="verified" className="text-[10px]">
                          Logistics Depot
                        </Badge>
                        <h4 className="font-bold text-sm text-foreground mt-2">
                          {depot.name}
                        </h4>
                        <p className="text-muted-foreground text-xs">
                          {depot.address}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {depot.amenities.map((a, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded border border-border"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

            {/* Active Evacuation Route Polyline */}
            {activeEvacuationRoute && (
              <Polyline
                positions={[
                  activeEvacuationRoute.from,
                  activeEvacuationRoute.to,
                ]}
                pathOptions={{
                  color: "oklch(0.704 0.191 22.216)",
                  weight: 4,
                  dashArray: "8, 8",
                }}
              />
            )}
          </MapContainer>

          {/* Active Evacuation Route Floating Banner */}
          {activeEvacuationRoute && (
            <div className="absolute top-4 left-4 z-500 bg-background/80 backdrop-blur-sm text-card-foreground p-3 rounded-md border border-border shadow-xl max-w-sm animate-in slide-in-from-top-2 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-primary flex items-center gap-1">
                  <Navigation className="h-3.5 w-3.5" />
                  Designated Evacuation Corridor
                </span>
                <button
                  type="button"
                  onClick={() => setActiveEvacuationRoute(null)}
                  className="text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
              <p className="text-xs text-foreground">
                To: <strong>{activeEvacuationRoute.shelterName}</strong>
              </p>
              <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                <span>Distance: ~{activeEvacuationRoute.distanceKm} km</span>
                <span className="text-primary font-semibold">
                  Corridor Cleared & Open
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Inspection & Action Panel */}
        <div className="space-y-4">
          {selectedIncident && (
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      selectedIncident.severity === "critical"
                        ? "critical"
                        : "high"
                    }
                  >
                    {selectedIncident.severity.toUpperCase()} PRIORITY
                  </Badge>
                  <button
                    type="button"
                    onClick={() => setSelectedIncident(null)}
                    className="text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-4 bg-secondary/60 border border-border rounded-md p-2.5 text-xs shrink-0 self-start w-full sm:w-auto shadow-inner">
                  <div className="flex items-center space-x-2.5">
                    <div className="flex-1">
                      <div className="flex items-center space-x-1">
                        <span className="font-bold text-foreground text-xs">
                          {selectedIncident.reportedBy.name}
                        </span>
                        {selectedIncident.reportedBy.isVerified ? (
                          <span title="Verified Reporter">
                            <UserCheck className="h-3.5 w-3.5 text-primary" />
                          </span>
                        ) : (
                          <span className="text-[9px] bg-secondary px-1 py-0.2 rounded-xs text-muted-foreground border border-border">
                            COMMUNITY
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate max-w-40">
                        {selectedIncident.reportedBy.organization ||
                          selectedIncident.reportedBy.role
                            .replace("_", " ")
                            .toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right pl-2.5 border-l border-border">
                      <span className="text-[9px]  font-bold text-muted-foreground block tactical-tag">
                        Trust
                      </span>
                      <span className="font-bold text-primary text-xs">
                        {selectedIncident.reportedBy.trustScore}%
                      </span>
                    </div>
                  </div>
                </div>

                <CardTitle className="text-base font-bold mt-2">
                  {selectedIncident.title}
                </CardTitle>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5 text-destructive mr-1 shrink-0" />
                  <span>{selectedIncident.location.address}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                <p className="text-foreground leading-relaxed">
                  {selectedIncident.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 p-2 rounded bg-muted/60 text-[11px]">
                  <div className="border-r border-border">
                    <span className="text-muted-foreground block">
                      Affected:
                    </span>
                    <span className="font-bold text-foreground">
                      {selectedIncident.affectedCount} persons
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">
                      Casualties:
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {selectedIncident.casualties.injured} Injured
                    </span>
                  </div>
                </div>

                {/* Urgent needs */}
                <div>
                  <span className="font-semibold text-muted-foreground block mb-1">
                    Resource Requests:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedIncident.needs.map((n, i) => (
                      <span
                        key={i}
                        className="bg-destructive/15 text-destructive border border-destructive/30 px-1.5 py-0.5 rounded text-[10px]"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <Button
                    onClick={() =>
                      handleCalculateEvacuationRoute(selectedIncident)
                    }
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 font-semibold"
                  >
                    <Navigation className="h-3.5 w-3.5 mr-1.5" />
                    Plot Safe Evacuation Route
                  </Button>

                  {(currentUser.role === "admin" ||
                    currentUser.role === "responder") && (
                    <Button
                      variant="outline"
                      onClick={() => onOpenAllocateModal(selectedIncident)}
                      className="w-full border-primary/40 text-primary hover:bg-accent text-xs h-8 font-semibold"
                    >
                      <Truck className="h-3.5 w-3.5 mr-1.5" />
                      Dispatch Emergency Supplies
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedDepot && (
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="verified">
                    {selectedDepot.type.toUpperCase().replace("_", " ")}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => setSelectedDepot(null)}
                    className="text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <CardTitle className="text-base font-bold mt-2">
                  {selectedDepot.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {selectedDepot.address}
                </p>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                <div className="p-2.5 rounded bg-muted/60 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Capacity:
                    </span>
                    <span className="font-bold text-foreground">
                      {selectedDepot.capacity} persons
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Current Occupancy:
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {selectedDepot.currentOccupancy}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Available Beds:
                    </span>
                    <span className="font-bold text-primary">
                      {selectedDepot.availableBeds ||
                        selectedDepot.capacity - selectedDepot.currentOccupancy}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-muted-foreground block mb-1">
                    On-Site Amenities & Logistics:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedDepot.amenities.map((a, i) => (
                      <span
                        key={i}
                        className="bg-card border border-border px-1.5 py-0.5 rounded text-[10px] text-foreground"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-muted-foreground">
                  <span>Emergency Hotline: </span>
                  <strong className="text-foreground">
                    {selectedDepot.contactPhone}
                  </strong>
                </div>
              </CardContent>
            </Card>
          )}

          {/* map overview */}
          <Card className="border-border shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Info className="h-4 w-4 text-primary" />
                Tactical Map Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p>
                Click any marker on the map to inspect live casualties, dispatch
                emergency supplies, or calculate designated safe evacuation
                corridors.
              </p>
              <div className="space-y-1.5 pt-2 border-t border-border/50 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-destructive shrink-0"></span>
                  <span className="text-foreground font-medium">
                    Critical Incident
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="text-foreground font-medium">
                    High Severity Incident
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-lg bg-primary shrink-0"></span>
                  <span className="text-foreground font-medium">
                    Safe Evacuation Shelter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-lg bg-primary/70 shrink-0"></span>
                  <span className="text-foreground font-medium">
                    Central Logistics Depot
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
