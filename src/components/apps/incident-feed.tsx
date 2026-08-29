import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Droplets,
  Flame,
  LayoutGrid,
  List,
  MapPin,
  MessageSquare,
  Mountain,
  Package,
  Plus,
  Search,
  Send,
  ShieldCheck,
  ThumbsUp,
  Trash,
  Truck,
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { useDisasterStore } from "#/store/useDisasterStore";
import type {
  DisasterType,
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from "#/types";

interface IncidentFeedProps {
  onOpenAllocateModal: (incident: Incident) => void;
  onOpenReportModal: () => void;
}

export const IncidentFeed: React.FC<IncidentFeedProps> = ({
  onOpenAllocateModal,
  onOpenReportModal,
}) => {
  const {
    incidents,
    currentUser,
    corroborateIncident,
    verifyIncident,
    updateIncidentStatus,
    addIncidentUpdate,
    focusMapOnIncident,
  } = useDisasterStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("active");
  const [sortBy, setSortBy] = useState<
    "newest" | "severity" | "corroborations"
  >("newest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [expandedUpdatesId, setExpandedUpdatesId] = useState<string | null>(
    null,
  );
  const [updateInputText, setUpdateInputText] = useState<{
    [incidentId: string]: string;
  }>({});

  const getDisasterIcon = (type: DisasterType, className = "h-4 w-4") => {
    switch (type) {
      case "wildfire":
        return <Flame className={`${className} text-destructive`} />;
      case "flood":
        return <Droplets className={`${className} text-sky-500`} />;
      case "earthquake":
        return <Activity className={`${className} text-amber-500`} />;
      case "power_outage":
        return <Zap className={`${className} text-yellow-500`} />;
      case "hazmat":
        return <AlertTriangle className={`${className} text-orange-500`} />;
      case "landslide":
        return <Mountain className={`${className} text-amber-600`} />;
      default:
        return <AlertCircle className={`${className} text-muted-foreground`} />;
    }
  };

  const getSeverityBadgeVariant = (severity: IncidentSeverity) => {
    switch (severity) {
      case "critical":
        return "critical";
      case "high":
        return "high";
      case "moderate":
        return "moderate";
      case "low":
        return "low";
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case "reported":
        return (
          <Badge
            variant="secondary"
            className="bg-secondary text-secondary-foreground border border-border text-[10px]"
          >
            Reported
          </Badge>
        );
      case "investigating":
        return (
          <Badge
            variant="outline"
            className="border-amber-500/80 bg-amber-500/10 text-amber-600 dark:text-amber-300 text-[10px]"
          >
            Investigating
          </Badge>
        );
      case "verified":
        return (
          <Badge variant="verified" className="text-[10px]">
            Verified Official
          </Badge>
        );
      case "dispatched":
        return (
          <Badge variant="high" className="text-[10px]">
            Units Dispatched
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-primary/20 border border-primary/40 text-primary text-[10px]">
            In Progress
          </Badge>
        );
      case "contained":
        return (
          <Badge className="bg-primary/15 border border-primary/30 text-primary text-[10px]">
            Contained
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="success" className="text-[10px]">
            Resolved
          </Badge>
        );
    }
  };

  // Filter and sort incidents
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = inc.title.toLowerCase().includes(q);
          const matchAddress = inc.location.address.toLowerCase().includes(q);
          const matchCity = inc.location.city.toLowerCase().includes(q);
          const matchDesc = inc.description.toLowerCase().includes(q);
          const matchReporter = inc.reportedBy.name.toLowerCase().includes(q);
          const matchNeeds = inc.needs.some((n) => n.toLowerCase().includes(q));
          if (
            !matchTitle &&
            !matchAddress &&
            !matchCity &&
            !matchDesc &&
            !matchReporter &&
            !matchNeeds
          ) {
            return false;
          }
        }

        // Severity filter
        if (selectedSeverity !== "all" && inc.severity !== selectedSeverity) {
          return false;
        }

        // Type filter
        if (selectedType !== "all" && inc.type !== selectedType) {
          return false;
        }

        // Status filter
        if (selectedStatus === "active" && inc.status === "resolved") {
          return false;
        }
        if (selectedStatus === "resolved" && inc.status !== "resolved") {
          return false;
        }
        if (
          selectedStatus === "verified" &&
          !inc.reportedBy.isVerified &&
          inc.status !== "verified"
        ) {
          return false;
        }
        if (selectedStatus === "critical" && inc.severity !== "critical") {
          return false;
        }
        if (
          selectedStatus === "needing_supplies" &&
          (inc.allocatedResources.length > 0 || inc.needs.length === 0)
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "corroborations") {
          return b.corroborations - a.corroborations;
        }
        if (sortBy === "severity") {
          const score = { critical: 4, high: 3, moderate: 2, low: 1 };
          return score[b.severity] - score[a.severity];
        }
        return 0; // Default order is newest first as in array
      });
  }, [
    incidents,
    searchQuery,
    selectedSeverity,
    selectedType,
    selectedStatus,
    sortBy,
  ]);

  const stats = useMemo(() => {
    const total = incidents.length;
    const active = incidents.filter((i) => i.status !== "resolved").length;
    const critical = incidents.filter(
      (i) => i.severity === "critical" && i.status !== "resolved",
    ).length;
    const verified = incidents.filter(
      (i) => i.reportedBy.isVerified || i.status === "verified",
    ).length;
    const needingSupplies = incidents.filter(
      (i) =>
        i.status !== "resolved" &&
        i.allocatedResources.length === 0 &&
        i.needs.length > 0,
    ).length;
    return { total, active, critical, verified, needingSupplies };
  }, [incidents]);

  const handleSendUpdate = (incidentId: string) => {
    const text = updateInputText[incidentId];
    if (!text || !text.trim()) return;
    addIncidentUpdate(incidentId, text.trim());
    setUpdateInputText((prev) => ({ ...prev, [incidentId]: "" }));
  };

  const disasterTypes: { id: string; label: string; type?: DisasterType }[] = [
    { id: "all", label: "All Types" },
    { id: "wildfire", label: "Wildfire", type: "wildfire" },
    { id: "flood", label: "Flash Flood", type: "flood" },
    { id: "earthquake", label: "Earthquake", type: "earthquake" },
    { id: "hazmat", label: "Hazmat", type: "hazmat" },
    { id: "power_outage", label: "Power Grid", type: "power_outage" },
    { id: "landslide", label: "Landslide", type: "landslide" },
  ];

  return (
    <div className="space-y-5">
      {/* Top Situational Summary & Interactive Triage HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Active Hotspots */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus("active");
            setSelectedSeverity("all");
          }}
          className={`p-4 rounded-md border text-left transition-all cursor-pointer ${
            selectedStatus === "active" && selectedSeverity === "all"
              ? "border-primary bg-card shadow-md ring-1 ring-primary"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground  tracking-wider tactical-tag">
              Active Hotspots
            </span>
            <div className="p-1.5 rounded-sm bg-primary/10 text-primary border border-primary/20">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">
            {stats.active}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">
              Total {stats.total} logged
            </span>
            <span className="text-[10px] text-primary  font-bold">
              Filter Active →
            </span>
          </div>
        </button>

        {/* Critical Life-Safety Hotspots */}
        <button
          type="button"
          onClick={() => {
            setSelectedSeverity(
              selectedSeverity === "critical" ? "all" : "critical",
            );
          }}
          className={`p-4 rounded-md border text-left transition-all cursor-pointer ${
            selectedSeverity === "critical"
              ? "border-destructive bg-destructive/15 shadow-md ring-1 ring-destructive"
              : "border-destructive/30 bg-destructive/10 hover:border-destructive/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-destructive  tracking-wider tactical-tag">
              Critical Life-Safety
            </span>
            <div className="p-1.5 rounded-sm bg-destructive/20 text-destructive border border-destructive/30 animate-pulse">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-destructive mt-2">
            {stats.critical}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-destructive">
              Immediate Triage
            </span>
            <span className="text-[10px] text-destructive  font-bold">
              {selectedSeverity === "critical"
                ? "Filtered ✓"
                : "Filter Critical →"}
            </span>
          </div>
        </button>

        {/* Verified Official */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus(
              selectedStatus === "verified" ? "active" : "verified",
            );
          }}
          className={`p-4 rounded-md border text-left transition-all cursor-pointer ${
            selectedStatus === "verified"
              ? "border-primary bg-card shadow-md ring-1 ring-primary"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground  tracking-wider tactical-tag">
              Verified Incidents
            </span>
            <div className="p-1.5 rounded-sm bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-primary mt-2">
            {stats.verified}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">
              Official Authority
            </span>
            <span className="text-[10px] text-primary  font-bold">
              {selectedStatus === "verified"
                ? "Filtered ✓"
                : "Filter Verified →"}
            </span>
          </div>
        </button>

        {/* Needing Supplies */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus(
              selectedStatus === "needing_supplies"
                ? "active"
                : "needing_supplies",
            );
          }}
          className={`p-4 rounded-md border text-left transition-all cursor-pointer ${
            selectedStatus === "needing_supplies"
              ? "border-amber-500 bg-amber-500/15 shadow-md ring-1 ring-amber-500"
              : "border-amber-500/30 bg-amber-500/10 hover:border-amber-500/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-300  tracking-wider tactical-tag">
              Pending Supplies
            </span>
            <div className="p-1.5 rounded-sm bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-300 mt-2">
            {stats.needingSupplies}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-amber-600 dark:text-amber-300">
              Needs Logistics
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-300  font-bold">
              {selectedStatus === "needing_supplies"
                ? "Filtered ✓"
                : "Filter Supplies →"}
            </span>
          </div>
        </button>
      </div>

      {/* Control Console: Search & Filters */}
      <div className="rounded-md border border-border bg-card p-4 space-y-3.5 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search incidents by address, sector, reporter, keyword, or supplies needed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 text-xs bg-background border-border text-foreground rounded-md focus:border-ring h-9"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Severity & Sort Dropdowns & View Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-3 py-1 text-xs font-medium text-foreground focus:outline-none focus:border-ring cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Priority</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low Priority</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 rounded-md border border-border bg-background px-3 py-1 text-xs font-medium text-foreground focus:outline-none focus:border-ring cursor-pointer"
            >
              <option value="newest">Sort: Most Recent</option>
              <option value="severity">Sort: Highest Severity</option>
              <option value="corroborations">Sort: Most Confirmed</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-secondary p-0.5 rounded-md border border-border">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Card View"
                className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Operations Table View"
                className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Disaster Type Quick-Filter Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-4 border-t border-border">
          <span className="text-[11px] font-bold text-muted-foreground tracking-wider tactical-tag shrink-0 mr-1">
            Category:
          </span>
          {disasterTypes.map((item) => {
            const isSelected = selectedType === item.id;
            const count =
              item.id === "all"
                ? incidents.length
                : incidents.filter((i) => i.type === item.id).length;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setSelectedType(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold tracking-wider shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground border border-primary shadow-sm font-bold"
                    : "bg-secondary text-muted-foreground border border-border hover:bg-accent hover:text-foreground"
                }`}
              >
                {item.type && getDisasterIcon(item.type, "h-3.5 w-3.5")}
                <span>{item.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-xs font-bold ${
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedSeverity("all");
              setSelectedType("all");
              setSelectedStatus("active");
              setSortBy("newest");
            }}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold  tracking-wider shrink-0 transition-all cursor-pointer bg-destructive/20 text-muted-foreground border border-destructive/50 hover:bg-destructive/30 hover:text-foreground"
          >
            <Trash className="h-3.5 w-3.5 text-orange-400" />
            <span>Clear All Filters</span>
          </button>
        </div>
      </div>

      {/* Incident List / Table View */}
      {filteredIncidents.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-md border border-dashed border-border">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground  tracking-wide tactical-tag">
            No Matching Incidents
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            No reported disaster incidents match your active filters or search
            criteria.
          </p>
          <Button
            onClick={onOpenReportModal}
            className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-bold  tracking-wider text-xs cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Report New Incident
          </Button>
        </div>
      ) : viewMode === "table" ? (
        /* High-Density Command Table View */
        <div className="rounded-md border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary text-[11px] font-bold text-muted-foreground  tracking-wider tactical-tag">
                  <th className="py-3 px-4">Severity / Type</th>
                  <th className="py-3 px-4">Incident Title & Sector</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Impact / Casualties</th>
                  <th className="py-3 px-4">Needs & Resources</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredIncidents.map((incident) => {
                  const canManage =
                    currentUser.role === "admin" ||
                    currentUser.role === "responder";

                  return (
                    <tr
                      key={incident.id}
                      className="hover:bg-accent/50 transition-colors group"
                    >
                      <td className="py-3 px-4 align-top">
                        <div className="flex items-center space-x-2">
                          <div className="p-1 rounded-sm bg-secondary border border-border shrink-0">
                            {getDisasterIcon(incident.type, "h-3.5 w-3.5")}
                          </div>
                          <Badge
                            variant={getSeverityBadgeVariant(incident.severity)}
                            className="text-[9px]"
                          >
                            {incident.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground block mt-1">
                          {incident.createdAt}
                        </span>
                      </td>

                      <td className="py-3 px-4 align-top">
                        <div className="font-bold text-muted-foreground text-sm group-hover:text-foreground transition-colors">
                          {incident.title}
                        </div>
                        <div className="flex items-center space-x-1 text-muted-foreground text-[11px] mt-0.5">
                          <MapPin className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate max-w-55">
                            {incident.location.address},{" "}
                            {incident.location.city}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 align-top">
                        {getStatusBadge(incident.status)}
                      </td>

                      <td className="py-3 px-4 align-top">
                        <div className="text-foreground">
                          <strong>
                            {incident.affectedCount.toLocaleString()}
                          </strong>{" "}
                          affected
                        </div>
                        <div className="text-[10px] text-amber-600 dark:text-amber-400">
                          {incident.casualties.injured} inj •{" "}
                          {incident.casualties.missing} miss
                        </div>
                      </td>

                      <td className="py-3 px-4 align-top">
                        <div className="flex flex-wrap gap-1 max-w-45">
                          {incident.needs.slice(0, 2).map((n, i) => (
                            <span
                              key={i}
                              className="text-[9px] bg-destructive/15 text-destructive border border-destructive/30 px-1.5 py-0.2 rounded-xs"
                            >
                              {n}
                            </span>
                          ))}
                          {incident.allocatedResources.length > 0 && (
                            <span className="text-[9px] bg-primary/15 text-primary border border-primary/30 px-1.5 py-0.2 rounded-xs">
                              ✓ {incident.allocatedResources.length} Allocated
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 align-top">
                        <div className="text-foreground font-semibold">
                          {incident.reportedBy.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {incident.reportedBy.trustScore}% Trust
                        </div>
                      </td>

                      <td className="py-3 px-4 align-top text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => focusMapOnIncident(incident.id)}
                          className="h-7 px-2 text-[11px] text-primary hover:bg-accent rounded-sm font-bold"
                          title="Locate on Map"
                        >
                          <Compass className="h-3 w-3 mr-1" />
                          Map
                        </Button>

                        {canManage && incident.status !== "resolved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onOpenAllocateModal(incident)}
                            className="h-7 px-2 text-[11px] border-primary/40 text-primary bg-primary/10 hover:bg-primary/20 rounded-sm font-bold"
                          >
                            <Package className="h-3 w-3 mr-1" />
                            Dispatch
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Rich Card Grid / Stream View */
        <div className="space-y-4">
          {filteredIncidents.map((incident) => {
            const isCorroboratedByMe = incident.corroboratedByUserIds.includes(
              currentUser.id,
            );
            const isUpdatesOpen = expandedUpdatesId === incident.id;
            const canVerify =
              (currentUser.role === "admin" ||
                currentUser.role === "responder") &&
              !incident.reportedBy.isVerified &&
              incident.status !== "verified";
            const canManage =
              currentUser.role === "admin" || currentUser.role === "responder";

            return (
              <Card
                key={incident.id}
                className="overflow-hidden border border-border bg-card transition-all shadow-sm rounded-md"
              >
                {/* Header ribbon */}
                <div className="p-4 pb-3.5">
                  <div className="border-b border-border pb-4">
                    {/* Reporter Trust Card */}
                    <div className="bg-secondary/60 border border-border rounded-md p-2.5 text-xs shrink-0 self-start w-full sm:w-auto shadow-inner">
                      <div className="flex items-center space-x-2.5">
                        <div className="flex-1">
                          <div className="flex items-center space-x-1">
                            <span className="font-bold text-foreground text-xs">
                              {incident.reportedBy.name}
                            </span>
                            {incident.reportedBy.isVerified ? (
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
                            {incident.reportedBy.organization ||
                              incident.reportedBy.role
                                .replace("_", " ")
                                .toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right pl-2.5 border-l border-border">
                          <span className="text-[9px]  font-bold text-muted-foreground block tactical-tag">
                            Trust
                          </span>
                          <span className="font-bold text-primary text-xs">
                            {incident.reportedBy.trustScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-foreground tracking-tight pt-1 mt-4">
                    {incident.title}
                  </h3>

                  <div className="space-y-1.5 my-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="p-1.5 rounded-sm bg-secondary border border-border flex items-center justify-center shrink-0">
                        {getDisasterIcon(incident.type)}
                      </div>
                      <Badge
                        variant={getSeverityBadgeVariant(incident.severity)}
                      >
                        {incident.severity.toUpperCase()}
                      </Badge>
                      {getStatusBadge(incident.status)}
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 ml-1">
                        <Clock className="h-3 w-3" />
                        {incident.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-y-2 text-xs text-muted-foreground">
                    <div className="flex gap-2 items-center">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-semibold text-foreground">
                        {incident.location.address}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span>•</span>
                      <span>{incident.location.city}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      {incident.location.landmark && (
                        <>
                          <span>•</span>
                          <span className="text-muted-foreground text-[11px]">
                            {incident.location.landmark}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-foreground mt-3 leading-relaxed">
                    {incident.description}
                  </p>

                  {/* Casualties & Affected strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3.5 p-2.5 rounded-sm bg-secondary/50 border border-border text-xs">
                    <div className="border-r border-border">
                      <span className="text-[10px] text-muted-foreground  tracking-wider font-bold block tactical-tag">
                        Estimated Impact
                      </span>
                      <span className="font-bold text-foreground">
                        {incident.affectedCount.toLocaleString()} persons
                      </span>
                    </div>
                    <div className="border-r border-border">
                      <span className="text-[10px] text-amber-600 dark:text-amber-400  tracking-wider font-bold block tactical-tag">
                        Injured
                      </span>
                      <span className="font-bold text-amber-600 dark:text-amber-300">
                        {incident.casualties.injured} reported
                      </span>
                    </div>
                    <div className="border-r border-border">
                      <span className="text-[10px] text-destructive  tracking-wider font-bold block tactical-tag">
                        Missing
                      </span>
                      <span className="font-bold text-destructive">
                        {incident.casualties.missing} persons
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground  tracking-wider font-bold block tactical-tag">
                        Fatalities
                      </span>
                      <span className="font-bold text-foreground">
                        {incident.casualties.fatalities}
                      </span>
                    </div>
                  </div>

                  {/* Urgent Needs & Allocated Supplies */}
                  <div className="mt-3 space-y-2 text-xs">
                    {incident.needs.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-destructive  tracking-wider text-[10px] tactical-tag">
                          Urgent Needs:
                        </span>
                        {incident.needs.map((need, idx) => (
                          <span
                            key={idx}
                            className="bg-destructive/15 text-destructive border border-destructive/30 px-2 py-0.5 rounded-xs text-[11px] font-medium"
                          >
                            {need}
                          </span>
                        ))}
                      </div>
                    )}

                    {incident.allocatedResources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="font-bold text-primary  tracking-wider text-[10px] flex items-center gap-1 tactical-tag">
                          <Truck className="h-3 w-3 text-primary" />
                          Allocated Supplies:
                        </span>
                        {incident.allocatedResources.map((res, idx) => (
                          <span
                            key={idx}
                            className="bg-primary/30 text-muted-foreground border border-primary/50 px-2 py-0.5 rounded-xs text-[11px] font-medium"
                          >
                            {res.quantity} {res.unit} of {res.resourceName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="bg-secondary/40 px-5 py-3 border-t border-border flex items-center justify-between gap-3 text-xs">
                  <div className="flex gap-2 items-center overflow-x-auto scrollbar-none">
                    {/* Corroboration / Upvote Button */}
                    <Button
                      size="sm"
                      variant={isCorroboratedByMe ? "default" : "outline"}
                      onClick={() => corroborateIncident(incident.id)}
                      className={`h-8 text-xs font-bold  tracking-wider rounded-md cursor-pointer ${
                        isCorroboratedByMe
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground border border-primary"
                          : "border-border bg-card text-foreground hover:bg-accent"
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                      <span>{incident.corroborations} Confirmed</span>
                    </Button>

                    {/* Official Field Updates toggle */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setExpandedUpdatesId(isUpdatesOpen ? null : incident.id)
                      }
                      className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md  tracking-wider font-semibold cursor-pointer"
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <span>Updates ({incident.updates.length})</span>
                      {isUpdatesOpen ? (
                        <ChevronUp className="h-3 w-3 ml-1" />
                      ) : (
                        <ChevronDown className="h-3 w-3 ml-1" />
                      )}
                    </Button>

                    {/* View on Map */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => focusMapOnIncident(incident.id)}
                      className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md  tracking-wider font-bold cursor-pointer"
                    >
                      <Compass className="h-3.5 w-3.5 mr-1" />
                      <span>View on Map</span>
                    </Button>

                    {/* Operational Management controls for Responders & Admins */}
                    {canVerify && (
                      <Button
                        size="sm"
                        onClick={() => verifyIncident(incident.id)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs font-bold  tracking-wider rounded-md cursor-pointer"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                        <span>Verify Authenticity</span>
                      </Button>
                    )}

                    {canManage && incident.status !== "resolved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenAllocateModal(incident)}
                        className="border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 h-8 text-xs font-bold  tracking-wider rounded-md cursor-pointer"
                      >
                        <Package className="h-3.5 w-3.5 mr-1" />
                        <span>Dispatch Supplies</span>
                      </Button>
                    )}

                    {canManage && (
                      <select
                        value={incident.status}
                        onChange={(e) =>
                          updateIncidentStatus(
                            incident.id,
                            e.target.value as IncidentStatus,
                          )
                        }
                        className="h-8 rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground focus:outline-none focus:border-ring cursor-pointer"
                      >
                        <option value="reported">Status: Reported</option>
                        <option value="investigating">
                          Status: Investigating
                        </option>
                        <option value="verified">Status: Verified</option>
                        <option value="dispatched">Status: Dispatched</option>
                        <option value="in_progress">Status: In Progress</option>
                        <option value="contained">Status: Contained</option>
                        <option value="resolved">Status: Resolved</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Expanded Updates Timeline & Comment box */}
                {isUpdatesOpen && (
                  <div className="p-4 bg-secondary/30 border-t border-border space-y-3 animate-in fade-in-50 text-xs">
                    <h5 className="font-bold text-foreground text-xs  tracking-widest tactical-tag">
                      Live Incident Dispatch & Field Log
                    </h5>

                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {incident.updates.map((upd) => (
                        <div
                          key={upd.id}
                          className={`p-2.5 rounded-md border text-xs ${
                            upd.isOfficial
                              ? "bg-primary/10 border-primary/30 text-foreground"
                              : "bg-card border-border text-foreground"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold flex items-center gap-1.5">
                              {upd.authorName}
                              {upd.isOfficial && (
                                <Badge
                                  variant="verified"
                                  className="text-[9px] py-0 px-1"
                                >
                                  Official
                                </Badge>
                              )}
                            </span>
                            <span className="text-muted-foreground">
                              {upd.timestamp}
                            </span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {upd.message}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Add Update Box */}
                    <div className="flex items-center space-x-2 pt-2 border-t border-border">
                      <Input
                        placeholder={`Post field update as ${currentUser.name}...`}
                        value={updateInputText[incident.id] || ""}
                        onChange={(e) =>
                          setUpdateInputText({
                            ...updateInputText,
                            [incident.id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendUpdate(incident.id);
                        }}
                        className="text-xs h-8 bg-background border-border text-foreground rounded-md"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSendUpdate(incident.id)}
                        className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-md  tracking-wider font-bold cursor-pointer"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        <span>Post</span>
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
