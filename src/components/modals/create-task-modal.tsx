import { Check, ClipboardList } from "lucide-react";
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
import { SKILL_METADATA, TASK_CATEGORY_METADATA } from "#/lib/volunteerUtils";
import type { TaskCategory, TaskPriority, VolunteerSkill } from "#/types";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedIncidentId?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  open,
  onOpenChange,
  preselectedIncidentId,
}) => {
  const { incidents, volunteerTeams, createVolunteerTask, currentUser } =
    useDisaster();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("search_rescue");
  const [priority, setPriority] = useState<TaskPriority>("high");
  const [incidentId, setIncidentId] = useState<string>(
    preselectedIncidentId || "",
  );
  const [address, setAddress] = useState("");
  const [volunteersNeeded, setVolunteersNeeded] = useState<number>(4);
  const [estimatedDurationHours, setEstimatedDurationHours] =
    useState<number>(4);
  const [deadline, setDeadline] = useState("Today (ASAP)");
  const [requiredSkills, setRequiredSkills] = useState<VolunteerSkill[]>([
    "first_aid_cpr",
  ]);
  const [assignedTeamId, setAssignedTeamId] = useState<string>("");
  const [assignedVolunteerIds, setAssignedVolunteerIds] = useState<string[]>(
    [],
  );
  const [safetyNotes, setSafetyNotes] = useState("");

  const activeIncidents = incidents.filter((i) => i.status !== "resolved");

  // When incident selected, autofill address
  const handleIncidentSelect = (incId: string) => {
    setIncidentId(incId);
    const inc = incidents.find((i) => i.id === incId);
    if (inc) {
      setAddress(inc.location.address || `${inc.location.city}`);
      if (!title) {
        setTitle(`Mission Support: ${inc.title}`);
      }
    }
  };

  const handleToggleSkill = (skill: VolunteerSkill) => {
    if (requiredSkills.includes(skill)) {
      setRequiredSkills((prev) => prev.filter((s) => s !== skill));
    } else {
      setRequiredSkills((prev) => [...prev, skill]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Please fill out the task title and operational description.");
      return;
    }

    const chosenIncident = incidents.find((i) => i.id === incidentId);
    const chosenTeam = volunteerTeams.find((t) => t.id === assignedTeamId);

    const initialStatus =
      assignedTeamId || assignedVolunteerIds.length > 0
        ? "assigned"
        : "unassigned";

    createVolunteerTask({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status: initialStatus,
      incidentId: incidentId || undefined,
      incidentTitle: chosenIncident?.title || undefined,
      assignedTeamId: assignedTeamId || undefined,
      assignedTeamName: chosenTeam?.name || undefined,
      assignedVolunteerIds: assignedVolunteerIds,
      location: {
        address:
          address.trim() ||
          chosenIncident?.location.address ||
          "Operational Response Zone",
        lat: chosenIncident?.location.lat || 23.8103,
        lng: chosenIncident?.location.lng || 90.4125,
      },
      requiredSkills,
      volunteersNeeded: Number(volunteersNeeded),
      estimatedDurationHours: Number(estimatedDurationHours),
      deadline: deadline.trim() || "ASAP",
      createdBy: `${currentUser.name} (${currentUser.badgeTitle})`,
      safetyNotes: safetyNotes.trim() || undefined,
    });

    // Reset and close
    setTitle("");
    setDescription("");
    setAssignedTeamId("");
    setAssignedVolunteerIds([]);
    setSafetyNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <DialogHeader>
          <div className="grid grid-cols-1 sm:flex items-center gap-2">
            <div className="h-8 w-8 rounded-sm bg-red-950 border border-red-800 flex items-center justify-center text-red-400">
              <ClipboardList className="h-4 w-4" />
            </div>
            <div className="text-left">
              <DialogTitle className="capitalize">
                {"DISPATCH VOLUNTEER MISSION / TASK".toLowerCase()}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                Issue a tactical mission order, define required skillsets, and
                assign to a squad.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pr-1">
          {/* Category & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor=""
                className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
              >
                Mission Category <span className="text-destructive">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:border-ring focus:outline-none font-medium"
              >
                {Object.entries(TASK_CATEGORY_METADATA).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor=""
                className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
              >
                Priority Level <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2 overflow-x-auto scrollbar-none p-2 border border-border rounded-md">
                {(["critical", "high", "medium", "low"] as TaskPriority[]).map(
                  (p) => {
                    const isSelected = priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`h-9 rounded-sm border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          isSelected
                            ? p === "critical"
                              ? "bg-destructive/20 text-destructive border-destructive font-bold"
                              : p === "high"
                                ? "bg-orange-500/20 text-orange-400 border-orange-500 font-bold"
                                : p === "medium"
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500 font-bold"
                                  : "bg-primary/20 text-primary border-primary font-bold"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <label
              htmlFor=""
              className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
            >
              Mission Title <span className="text-destructive">*</span>
            </label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Construct Sandbag Defense Wall / Mass Intake Food Distribution"
              className="text-xs"
            />
          </div>

          <div>
            <label
              htmlFor=""
              className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
            >
              Mission Briefing & Operational Objectives{" "}
              <span className="text-destructive">*</span>
            </label>
            <Textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detail specific tasks, staging requirements, civilian care protocols, and objective criteria..."
              className="text-xs"
            />
          </div>

          {/* Incident Link & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor=""
                className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
              >
                Link to Incident (Optional)
              </label>
              <select
                value={incidentId}
                onChange={(e) => handleIncidentSelect(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:border-ring focus:outline-none"
              >
                <option value="">
                  -- General Response (No Specific Incident) --
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
                Mission Location Address
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address / Mile Marker / Depot"
                className="text-xs"
              />
            </div>
          </div>

          {/* Duration, Quota, Deadline */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor=""
                className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
              >
                Volunteers Needed
              </label>
              <Input
                type="number"
                min={1}
                max={50}
                value={volunteersNeeded}
                onChange={(e) => setVolunteersNeeded(Number(e.target.value))}
                className="text-xs"
              />
            </div>
            <div>
              <label
                htmlFor=""
                className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
              >
                Est. Duration (Hrs)
              </label>
              <Input
                type="number"
                min={1}
                max={72}
                value={estimatedDurationHours}
                onChange={(e) =>
                  setEstimatedDurationHours(Number(e.target.value))
                }
                className="text-xs"
              />
            </div>
            <div>
              <label
                htmlFor=""
                className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
              >
                Deadline / Target
              </label>
              <Input
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. Today at 18:00"
                className="text-xs"
              />
            </div>
          </div>

          {/* Required Skills Picker */}
          <div>
            <label
              htmlFor=""
              className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1.5"
            >
              Required Certifications & Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SKILL_METADATA) as VolunteerSkill[]).map((sk) => {
                const isSelected = requiredSkills.includes(sk);
                const meta = SKILL_METADATA[sk];
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => handleToggleSkill(sk)}
                    className={`px-2.5 py-1 rounded-sm border text-[11px] font-medium transition-all cursor-pointer flex items-center space-x-1 ${
                      isSelected
                        ? `bg-primary/20 text-primary border-primary font-bold shadow-xs`
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    <span>{meta.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Squad Assignment */}
          <div className="border border-border bg-secondary/50 p-3 rounded-md space-y-2">
            <label
              htmlFor=""
              className="block text-[11px] font-bold text-foreground capitalize tracking-wider tactical-tag"
            >
              Directly Assign to Assembled Tactical Squad (Recommended)
            </label>
            <select
              value={assignedTeamId}
              onChange={(e) => setAssignedTeamId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:border-ring focus:outline-none"
            >
              <option value="">
                -- Keep Unassigned (Broadcast to All Ready Volunteers) --
              </option>
              {volunteerTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.callsign}) • {team.memberIds.length}{" "}
                  members • Status: {team.status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Safety Directives */}
          <div>
            <label
              htmlFor=""
              className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
            >
              Safety Directives & Mandatory PPE
            </label>
            <Textarea
              value={safetyNotes}
              onChange={(e) => setSafetyNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Mandatory P100 respirators and safety goggles. Hydrate every 30 minutes."
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
            Dispatch Mission Order
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
