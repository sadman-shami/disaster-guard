import { Check, Users } from "lucide-react";
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
import { Textarea } from "#/components/ui/textarea";
import { SKILL_METADATA, SPECIALTY_METADATA } from "#/lib/volunteerUtils";
import type { TeamSpecialty } from "#/types";

interface CreateTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedIncidentId?: string;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  open,
  onOpenChange,
  preselectedIncidentId,
}) => {
  const { volunteers, incidents, depots, createVolunteerTeam } = useDisaster();

  const [teamName, setTeamName] = useState("");
  const [callsign, setCallsign] = useState("");
  const [specialty, setSpecialty] = useState<TeamSpecialty>("search_rescue");
  const [leaderId, setLeaderId] = useState<string>("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [maxCapacity, setMaxCapacity] = useState<number>(8);
  const [assignedIncidentId, setAssignedIncidentId] = useState<string>(
    preselectedIncidentId || "",
  );
  const [stagingDepotId, setStagingDepotId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [volunteerFilterSkill, setVolunteerFilterSkill] =
    useState<string>("all");

  const activeIncidents = incidents.filter((i) => i.status !== "resolved");

  // Auto-generate callsign when typing team name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTeamName(val);
    if (!callsign || callsign.startsWith("SQUAD-") || callsign.length <= 8) {
      const acronym = val
        .split(" ")
        .filter((w) => w.length > 0)
        .map((w) => w[0].toUpperCase())
        .join("");
      if (acronym.length >= 2) {
        setCallsign(`${acronym}-${Math.floor(10 + Math.random() * 90)}`);
      }
    }
  };

  const handleToggleMember = (volId: string) => {
    if (selectedMemberIds.includes(volId)) {
      setSelectedMemberIds((prev) => prev.filter((id) => id !== volId));
      if (leaderId === volId) {
        setLeaderId("");
      }
    } else {
      if (selectedMemberIds.length >= maxCapacity) {
        alert(`Maximum squad capacity (${maxCapacity}) reached.`);
        return;
      }
      setSelectedMemberIds((prev) => [...prev, volId]);
      if (!leaderId) {
        setLeaderId(volId);
      }
    }
  };

  const handleSpecialtyChange = (spec: TeamSpecialty) => {
    setSpecialty(spec);
    setMaxCapacity(SPECIALTY_METADATA[spec]?.defaultCapacity || 8);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      alert("Please provide a squad or team name.");
      return;
    }
    if (selectedMemberIds.length === 0) {
      alert("Please assign at least 1 volunteer to the squad.");
      return;
    }

    const effectiveLeaderId = leaderId || selectedMemberIds[0];
    const leaderVol = volunteers.find((v) => v.id === effectiveLeaderId);
    const chosenIncident = incidents.find((i) => i.id === assignedIncidentId);
    const chosenDepot = depots.find((d) => d.id === stagingDepotId);

    createVolunteerTeam({
      name: teamName.trim(),
      callsign:
        callsign.trim() || `TAC-${Math.floor(100 + Math.random() * 900)}`,
      specialty,
      leaderId: effectiveLeaderId,
      leaderName: leaderVol ? leaderVol.name : "Tactical Squad Lead",
      memberIds: selectedMemberIds,
      maxCapacity: Number(maxCapacity),
      status: chosenIncident ? "active_mission" : "standby",
      assignedIncidentId: assignedIncidentId || undefined,
      assignedIncidentTitle: chosenIncident?.title || undefined,
      stagingDepotId: stagingDepotId || undefined,
      stagingDepotName: chosenDepot?.name || undefined,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setTeamName("");
    setCallsign("");
    setSelectedMemberIds([]);
    setLeaderId("");
    setNotes("");
    onOpenChange(false);
  };

  // Filter volunteers for assignment
  const filteredVolunteers = volunteers.filter((v) => {
    if (volunteerFilterSkill === "all") return true;
    return v.skills.includes(volunteerFilterSkill as any);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <DialogHeader>
          <div className="grid grid-cols-1 sm:flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <Users className="h-4 w-4" />
            </div>
            <div className="text-left">
              <DialogTitle className="capitalize">
                {"BUILD VOLUNTEER SQUAD / TEAM".toLowerCase()}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                Assemble a specialized tactical volunteer corps, assign
                leadership, and deploy to staging.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pr-1">
          {/* Team Specialty Selector */}
          <div>
            <label
              htmlFor=""
              className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1.5"
            >
              Squad Mission Specialty{" "}
              <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(SPECIALTY_METADATA) as TeamSpecialty[]).map(
                (spec) => {
                  const isSelected = specialty === spec;
                  const meta = SPECIALTY_METADATA[spec];
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => handleSpecialtyChange(spec)}
                      className={`p-2 rounded-md border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-primary/20 border-primary text-primary font-bold shadow-xs"
                          : "bg-card border-border hover:border-primary/50 text-foreground"
                      }`}
                    >
                      <div
                        className={`text-xs font-bold ${isSelected ? "text-primary" : "text-foreground"}`}
                      >
                        {meta.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Rec. Cap: {meta.defaultCapacity} pax
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* Name & Callsign */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label
                htmlFor=""
                className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
              >
                Squad Name <span className="text-destructive">*</span>
              </label>
              <Input
                required
                value={teamName}
                onChange={handleNameChange}
                placeholder="e.g., Strike Team Echo / CERT Alpha"
                className="text-xs"
              />
            </div>
            <div>
              <label
                htmlFor=""
                className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
              >
                Radio Callsign
              </label>
              <Input
                value={callsign}
                onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                placeholder="ECHO-4"
                className="text-xs font-bold"
              />
            </div>
          </div>

          {/* Target Incident & Staging Depot Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor=""
                className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
              >
                Deploy to Active Incident (Optional)
              </label>
              <select
                value={assignedIncidentId}
                onChange={(e) => setAssignedIncidentId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:border-ring focus:outline-none"
              >
                <option value="">
                  -- No Direct Incident Link (Standby Squad) --
                </option>
                {activeIncidents.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    [{inc.severity.toUpperCase()}] {inc.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor=""
                className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
              >
                Staging Depot / Base
              </label>
              <select
                value={stagingDepotId}
                onChange={(e) => setStagingDepotId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:border-ring focus:outline-none"
              >
                <option value="">-- Select Staging Depot --</option>
                {depots.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.name} ({dep.operatingStatus.replace("_", " ")})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Member Roster Builder */}
          <div className="border border-border bg-secondary/50 p-3 rounded-md space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-foreground capitalize tracking-wider tactical-tag">
                  Select Squad Roster
                </span>
                <span className="text-[11px] px-1.5 py-0.2 bg-primary/20 text-primary border border-primary/40 rounded-xs font-bold">
                  {selectedMemberIds.length} / {maxCapacity} Assigned
                </span>
              </div>

              {/* Filter by skill */}
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-muted-foreground text-[10px] capitalize">
                  Filter Skill:
                </span>
                <select
                  value={volunteerFilterSkill}
                  onChange={(e) => setVolunteerFilterSkill(e.target.value)}
                  className="h-6 rounded-xs border border-input bg-background px-1.5 text-[10px] text-foreground"
                >
                  <option value="all">All Skills</option>
                  {Object.entries(SKILL_METADATA).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.shortLabel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Volunteer Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredVolunteers.map((vol) => {
                const isSelected = selectedMemberIds.includes(vol.id);
                const isLeader = leaderId === vol.id;
                return (
                  <button
                    type="button"
                    key={vol.id}
                    onClick={() => handleToggleMember(vol.id)}
                    className={`p-2 rounded-md border flex items-start space-x-2 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-primary/20 border-primary shadow-xs"
                        : "bg-card border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <div
                        className={`h-4 w-4 rounded-xs border flex items-center justify-center ${
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border bg-secondary"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                    <img
                      src={vol.avatar}
                      alt={vol.name}
                      className="h-7 w-7 rounded-sm object-cover border border-border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground truncate">
                          {vol.name}
                        </span>
                        {isSelected && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLeaderId(vol.id);
                            }}
                            className={`text-[9px] px-1 py-0.2 rounded-xs font-bold uppercase cursor-pointer border ${
                              isLeader
                                ? "bg-amber-500/20 text-amber-300 border-amber-500"
                                : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                            }`}
                            title="Make Squad Leader"
                          >
                            {isLeader ? "Leader ★" : "Set Lead"}
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {vol.skills.slice(0, 2).map((sk) => {
                          const meta = SKILL_METADATA[sk];
                          return (
                            <span
                              key={sk}
                              className={`text-[9px] px-1 py-0.2 rounded-xs border ${meta?.bg} ${meta?.color} ${meta?.border}`}
                            >
                              {meta?.shortLabel}
                            </span>
                          );
                        })}
                        {vol.skills.length > 2 && (
                          <span className="text-[9px] text-muted-foreground">
                            +{vol.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operational Directives */}
          <div>
            <label
              htmlFor=""
              className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
            >
              Squad Operational Directives & Equipment Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Equipped with 2 thermal drone units and portable medical oxygen concentrators."
              className="text-xs"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-bold capitalize tracking-wider text-xs border border-primary/50"
          >
            Commission Squad & Register
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
