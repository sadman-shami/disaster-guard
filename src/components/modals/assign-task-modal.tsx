import { ArrowRight, Check, Users } from "lucide-react";
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
import { SKILL_METADATA, SPECIALTY_METADATA } from "#/lib/volunteerUtils";
import type { VolunteerTask } from "#/types";

interface AssignTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: VolunteerTask;
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({
  open,
  onOpenChange,
  task,
}) => {
  const {
    volunteerTeams,
    volunteers,
    assignTaskToTeam,
    assignTaskToVolunteers,
  } = useDisaster();

  const [assignmentMode, setAssignmentMode] = useState<"team" | "individual">(
    "team",
  );
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedVolunteerIds, setSelectedVolunteerIds] = useState<string[]>(
    [],
  );

  if (!task) return null;

  const handleToggleVolunteer = (id: string) => {
    setSelectedVolunteerIds((prev) =>
      prev.includes(id) ? prev.filter((vId) => vId !== id) : [...prev, id],
    );
  };

  const handleAssign = () => {
    if (assignmentMode === "team") {
      if (!selectedTeamId) {
        alert("Please select a tactical squad to deploy.");
        return;
      }
      assignTaskToTeam(task.id, selectedTeamId);
    } else {
      if (selectedVolunteerIds.length === 0) {
        alert("Please select at least 1 volunteer for this mission.");
        return;
      }
      assignTaskToVolunteers(task.id, selectedVolunteerIds);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-2xl">
      <div className="space-y-4">
        <DialogHeader>
          <div className="grid grid-cols-1 sm:flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <Users className="h-4 w-4" />
            </div>
            <div className="text-left">
              <DialogTitle className="capitalize">
                {"ASSIGN MISSION TO SQUAD / VOLUNTEERS".toLowerCase()}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                Dispatch an assembled tactical response team or assign
                individual volunteers to this order.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Task Brief Header */}
        <div className="p-3 rounded-md border border-border bg-secondary/50 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-primary font-bold capitalize tracking-wider">
              MISSION #{task.id} • {task.priority.toUpperCase()} PRIORITY
            </span>
            <span className="text-[10px] text-muted-foreground">
              Target: {task.volunteersNeeded} volunteers
            </span>
          </div>
          <h4 className="text-sm font-bold text-foreground">{task.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[10px] text-muted-foreground capitalize mr-1">
              Required Skills:
            </span>
            {task.requiredSkills.map((sk) => {
              const meta = SKILL_METADATA[sk];
              return (
                <span
                  key={sk}
                  className={`text-[9px] px-1.5 py-0.2 rounded-xs border ${meta?.bg} ${meta?.color} ${meta?.border} font-medium`}
                >
                  {meta?.shortLabel}
                </span>
              );
            })}
          </div>
        </div>

        {/* Assignment Mode Tabs */}
        <div className="flex rounded-md bg-secondary p-1 border border-border">
          <button
            type="button"
            onClick={() => setAssignmentMode("team")}
            className={`flex-1 py-1.5 text-xs font-bold capitalize tracking-wider rounded-sm cursor-pointer transition-all ${
              assignmentMode === "team"
                ? "bg-card text-foreground border border-border shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tactical Squad / Team (Recommended)
          </button>
          <button
            type="button"
            onClick={() => setAssignmentMode("individual")}
            className={`flex-1 py-1.5 text-xs font-bold capitalize tracking-wider rounded-sm cursor-pointer transition-all ${
              assignmentMode === "individual"
                ? "bg-card text-foreground border border-border shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Individual Volunteer Pool
          </button>
        </div>

        {/* Team List Selection */}
        {assignmentMode === "team" ? (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {volunteerTeams.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-border rounded-md text-xs text-muted-foreground">
                No tactical squads created yet. Switch to Individual mode or
                build a squad first.
              </div>
            ) : (
              volunteerTeams.map((team) => {
                const isSelected = selectedTeamId === team.id;
                const specMeta = SPECIALTY_METADATA[team.specialty];
                return (
                  <button
                    type="button"
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`p-2.5 rounded-md border cursor-pointer transition-all flex items-center justify-between w-full ${
                      isSelected
                        ? "bg-primary/20 border-primary shadow-xs"
                        : "bg-card border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-left">
                      <div className="flex flex-col items-start gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {team.name}
                        </span>
                        <span className="text-[10px] text-primary font-bold px-1 py-0.2 bg-primary/15 border border-primary/30 rounded-xs">
                          {team.callsign}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-xs border ${specMeta?.bg} ${specMeta?.badgeColor} ${specMeta?.border}`}
                        >
                          {specMeta?.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1 flex items-center space-x-3">
                        <span>Lead: {team.leaderName}</span>
                        <span>•</span>
                        <span>{team.memberIds.length} Members</span>
                        <span>•</span>
                        <span className="text-primary capitalize text-[10px] font-bold">
                          {team.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`h-5 w-5 rounded-sm border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-secondary"
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        ) : (
          /* Individual Volunteers Picker */
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {volunteers.map((vol) => {
                const isSelected = selectedVolunteerIds.includes(vol.id);
                return (
                  <button
                    type="button"
                    key={vol.id}
                    onClick={() => handleToggleVolunteer(vol.id)}
                    className={`p-2 rounded-md border flex items-start space-x-2 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-primary/20 border-primary shadow-xs"
                        : "bg-card border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={vol.avatar}
                      alt={vol.name}
                      className="h-7 w-7 rounded-sm object-cover border border-border shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground truncate">
                          {vol.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold capitalize ${
                            vol.status === "ready"
                              ? "text-primary"
                              : vol.status === "deployed"
                                ? "text-sky-400"
                                : "text-amber-400"
                          }`}
                        >
                          {vol.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-left text-muted-foreground truncate">
                        {vol.certifications[0] || "CERT Volunteer"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
            type="button"
            onClick={handleAssign}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-bold capitalize tracking-wider text-xs border border-primary/50 flex items-center space-x-1.5"
          >
            <span>Confirm & Dispatch Assignment</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};
