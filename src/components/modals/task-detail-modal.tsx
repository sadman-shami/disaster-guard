import {
	AlertTriangle,
	CheckCircle2,
	Clock,
	FileText,
	MapPin,
	Radio,
	Send,
	Shield,
	Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import {
	getTaskPriorityBadge,
	getTaskStatusBadge,
	SKILL_METADATA,
	TASK_CATEGORY_METADATA,
} from "#/lib/volunteerUtils";
import { useDisasterStore } from "#/store/useDisasterStore";
import type { TaskStatus, VolunteerTask } from "#/types";

interface TaskDetailModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	task?: VolunteerTask;
	onOpenAssignModal?: (task: VolunteerTask) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
	open,
	onOpenChange,
	task,
	onOpenAssignModal,
}) => {
	const {
		volunteers,
		volunteerTeams,
		currentUser,
		checkInToTask,
		updateTaskStatus,
		completeTask,
		focusMapOnIncident,
		setActiveTab,
	} = useDisasterStore();

	const [checkInNote, setCheckInNote] = useState("");

	if (!task) return null;

	const priorityBadge = getTaskPriorityBadge(task.priority);
	const statusBadge = getTaskStatusBadge(task.status);
	const categoryMeta = TASK_CATEGORY_METADATA[task.category];

	const assignedTeam = volunteerTeams.find((t) => t.id === task.assignedTeamId);
	const assignedVolunteersList = volunteers.filter((v) =>
		task.assignedVolunteerIds?.includes(v.id),
	);

	const handleSendCheckIn = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!checkInNote.trim()) return;

		checkInToTask(task.id, currentUser.id, checkInNote.trim());
		setCheckInNote("");
	};

	const handleStatusChange = (newStatus: TaskStatus) => {
		updateTaskStatus(task.id, newStatus);
	};

	const handleViewIncident = () => {
		if (task.incidentId) {
			focusMapOnIncident(task.incidentId);
			setActiveTab("map");
			onOpenChange(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange} className="max-w-2xl">
			<div className="space-y-4 pr-1">
				<DialogHeader>
					<div className="flex items-start justify-between gap-2">
						<div className="text-left">
							<div className="flex flex-wrap items-center gap-2">
								<span
									className={`text-[10px] px-2 py-0.5 rounded-xs font-bold border ${priorityBadge.color}`}
								>
									{priorityBadge.label}
								</span>
								<span
									className={`text-[10px] px-2 py-0.5 rounded-xs font-bold border ${statusBadge.color}`}
								>
									{statusBadge.label}
								</span>
								<span
									className={`text-[10px] px-2 py-0.5 rounded-xs border ${categoryMeta?.bg} ${categoryMeta?.color} ${categoryMeta?.border}`}
								>
									{categoryMeta?.label}
								</span>
							</div>
							<DialogTitle className="text-base font-bold text-foreground mt-2">
								{task.title}
							</DialogTitle>
							<DialogDescription className="text-xs text-muted-foreground">
								Mission Order #{task.id} • Dispatched by {task.createdBy}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				{/* Objectives / Description */}
				<div className="p-3 bg-secondary/50 border border-border rounded-md space-y-2">
					<div className="text-[11px] font-bold text-foreground capitalize tracking-wider flex items-center space-x-1.5">
						<FileText className="h-3.5 w-3.5 text-primary" />
						<span>Operational Objective</span>
					</div>
					<p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
						{task.description}
					</p>

					{task.safetyNotes && (
						<div className="p-2 bg-amber-500/15 border border-amber-500/30 rounded-sm mt-2 text-xs text-amber-300 flex items-start space-x-2">
							<AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
							<div>
								<span className="font-bold">Safety Directive: </span>
								{task.safetyNotes}
							</div>
						</div>
					)}
				</div>

				{/* Mission Metadata Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
					<div className="p-2 bg-secondary/60 border border-border rounded-md">
						<span className="text-[10px] text-muted-foreground capitalize block">
							Target Quota
						</span>
						<span className="font-bold text-foreground flex items-center space-x-1 mt-0.5">
							<Users className="h-3.5 w-3.5 text-primary" />
							<span>{task.volunteersNeeded} Responders</span>
						</span>
					</div>

					<div className="p-2 bg-secondary/60 border border-border rounded-md">
						<span className="text-[10px] text-muted-foreground capitalize block">
							Est. Duration
						</span>
						<span className="font-bold text-foreground flex items-center space-x-1 mt-0.5">
							<Clock className="h-3.5 w-3.5 text-primary" />
							<span>{task.estimatedDurationHours} Hours</span>
						</span>
					</div>

					<div className="p-2 bg-secondary/60 border border-border rounded-md">
						<span className="text-[10px] text-muted-foreground capitalize block">
							Target Window
						</span>
						<span className="font-bold text-foreground mt-0.5 block truncate">
							{task.deadline}
						</span>
					</div>

					<div className="p-2 bg-secondary/60 border border-border rounded-md">
						<span className="text-[10px] text-muted-foreground capitalize block">
							Location
						</span>
						<span
							className="font-bold text-foreground mt-0.5 block truncate text-[11px]"
							title={task.location.address}
						>
							{task.location.address}
						</span>
					</div>
				</div>

				{/* Required Skills */}
				<div>
					<span className="text-[10px] font-bold text-muted-foreground capitalize tracking-wider block mb-1.5">
						Required Certifications & Skills:
					</span>
					<div className="flex flex-wrap gap-2">
						{task.requiredSkills.map((sk) => {
							const meta = SKILL_METADATA[sk];
							return (
								<span
									key={sk}
									className={`text-[10px] px-2 py-0.5 rounded-sm border font-medium ${meta?.bg} ${meta?.color} ${meta?.border}`}
								>
									{meta?.label}
								</span>
							);
						})}
					</div>
				</div>

				{/* Assigned Team & Roster */}
				<div className="p-3 bg-secondary/50 border border-border rounded-md space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-[11px] font-bold text-foreground capitalize tracking-wider flex items-center space-x-1.5">
							<Shield className="h-3.5 w-3.5 text-primary" />
							<span>Assigned Deployment Roster</span>
						</span>
						{!task.assignedTeamId && task.assignedVolunteerIds.length === 0 ? (
							<Button
								type="button"
								size="sm"
								variant="default"
								onClick={() => {
									if (onOpenAssignModal) onOpenAssignModal(task);
								}}
								className="h-7 text-xs border-primary/50 hover:bg-primary/10"
							>
								+ Assign Tactical Squad
							</Button>
						) : null}
					</div>

					{assignedTeam ? (
						<div className="p-2 bg-background border border-border rounded-md flex items-center justify-between">
							<div>
								<div className="flex flex-col items-start gap-2">
									<span className="text-xs font-bold text-foreground">
										{assignedTeam.name}
									</span>
									<span className="text-[10px] text-primary px-1 py-0.2 bg-primary/20 border border-primary/40 rounded-xs font-bold">
										{assignedTeam.callsign}
									</span>
									<span className="text-[10px] text-primary uppercase font-bold">
										• {assignedTeam.status.replace("_", " ")}
									</span>
								</div>
								<span className="text-[11px] text-muted-foreground">
									Lead: {assignedTeam.leaderName} •{" "}
									{assignedTeam.memberIds.length} Responders
								</span>
							</div>
						</div>
					) : assignedVolunteersList.length > 0 ? (
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
							{assignedVolunteersList.map((v) => (
								<div
									key={v.id}
									className="p-1.5 bg-background border border-border rounded-sm flex items-center space-x-2"
								>
									<img
										src={v.avatar}
										alt={v.name}
										className="h-6 w-6 rounded-sm object-cover border border-border"
									/>
									<span className="text-xs font-bold text-foreground truncate">
										{v.name}
									</span>
								</div>
							))}
						</div>
					) : (
						<div className="text-xs text-amber-400/90 py-1">
							⚠️ No team or volunteer assigned yet. Ready for dispatch.
						</div>
					)}
				</div>

				{/* Live Field Check-In Logs */}
				<div className="p-3 bg-secondary/50 border border-border rounded-md space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center space-x-1.5">
							<Radio className="h-3.5 w-3.5 text-primary" />
							<span>Field Sit-Reps & Check-In Log</span>
						</span>
						<span className="text-[10px] text-muted-foreground">
							{task.checkIns.length} Logged
						</span>
					</div>

					<div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
						{task.checkIns.length === 0 ? (
							<div className="text-xs text-muted-foreground italic py-2 text-center">
								No on-site check-ins logged yet.
							</div>
						) : (
							task.checkIns.map((chk) => (
								<div
									key={chk.id}
									className="p-2 bg-background border border-border rounded-sm text-xs space-y-0.5"
								>
									<div className="flex items-center justify-between text-[10px] text-muted-foreground">
										<span className="font-bold text-foreground">
											{chk.volunteerName}
										</span>
										<span>{chk.timestamp}</span>
									</div>
									<p className="text-muted-foreground">{chk.note}</p>
								</div>
							))
						)}
					</div>

					{/* New Check-In Input */}
					<form
						onSubmit={handleSendCheckIn}
						className="flex items-center space-x-2 pt-1"
					>
						<Input
							value={checkInNote}
							onChange={(e) => setCheckInNote(e.target.value)}
							placeholder="Log tactical field update / SIT-REP..."
							className="text-xs h-8"
						/>
						<Button
							type="submit"
							size="sm"
							className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground text-xs shrink-0"
						>
							<Send className="h-3.5 w-3.5" />
						</Button>
					</form>
				</div>

				{/* Quick Action Progression Buttons */}
				<div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
					<div className="flex items-center space-x-1.5">
						<span className="text-[10px] font-bold text-muted-foreground uppercase">
							Set Status:
						</span>
						{task.status !== "in_progress" && (
							<Button
								type="button"
								size="sm"
								variant="outline"
								onClick={() => handleStatusChange("in_progress")}
								className="h-7 text-xs border-primary/50 hover:bg-primary/10"
							>
								Mark In Progress
							</Button>
						)}
						{task.status !== "completed" && (
							<Button
								type="button"
								size="sm"
								onClick={() => completeTask(task.id)}
								className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
							>
								<CheckCircle2 className="h-3.5 w-3.5 mr-1" />
								Complete Mission
							</Button>
						)}
					</div>

					{task.incidentId && (
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={handleViewIncident}
							className="h-7 text-xs text-primary hover:text-primary/80"
						>
							<MapPin className="h-3 w-3 mr-1" />
							View on Map
						</Button>
					)}
				</div>
			</div>
		</Dialog>
	);
};
