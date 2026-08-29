import {
	Activity,
	AlertTriangle,
	Award,
	Check,
	CheckCircle2,
	ClipboardList,
	Clock,
	MapPin,
	Plus,
	Radio,
	Search,
	Shield,
	UserPlus,
	Users,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { AssignTaskModal } from "#/components/modals/assign-task-modal";
import { CreateTaskModal } from "#/components/modals/create-task-modal";
import { CreateTeamModal } from "#/components/modals/create-team-modal";
import { TaskDetailModal } from "#/components/modals/task-detail-modal";
import { VolunteerRegisterModal } from "#/components/modals/volunteer-register-modal";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
	getStatusBadge,
	getTaskPriorityBadge,
	getTaskStatusBadge,
	getTeamStatusBadge,
	SKILL_METADATA,
	SPECIALTY_METADATA,
	TASK_CATEGORY_METADATA,
} from "#/lib/volunteerUtils";
import { useDisasterStore } from "#/store/useDisasterStore";
import type { VolunteerStatus, VolunteerTask, VolunteerTeam } from "#/types";

type SubView = "squads" | "tasks" | "directory" | "my_missions";

export const VolunteerPortal: React.FC = () => {
	const {
		volunteers,
		volunteerTeams,
		volunteerTasks,
		currentUser,
		deleteVolunteerTeam,
		updateVolunteerStatus,
		completeTask,
		setActiveTab,
	} = useDisasterStore();

	const [activeSubView, setActiveSubView] = useState<SubView>("squads");

	// Modals state
	const [createTeamOpen, setCreateTeamOpen] = useState(false);
	const [createTaskOpen, setCreateTaskOpen] = useState(false);
	const [assignTaskOpen, setAssignTaskOpen] = useState(false);
	const [taskDetailOpen, setTaskDetailOpen] = useState(false);
	const [registerVolOpen, setRegisterVolOpen] = useState(false);

	const [selectedTask, setSelectedTask] = useState<VolunteerTask | undefined>(
		undefined,
	);
	const [selectedTeam, setSelectedTeam] = useState<VolunteerTeam | undefined>(
		undefined,
	);

	// Search and Filters
	const [searchQuery, setSearchQuery] = useState("");
	const [taskFilterStatus, setTaskFilterStatus] = useState<string>("all");
	const [taskFilterPriority, setTaskFilterPriority] = useState<string>("all");
	const [volFilterStatus, setVolFilterStatus] = useState<string>("all");
	const [volFilterSkill, setVolFilterSkill] = useState<string>("all");

	useEffect(() => {
		if (!["admin", "responder"].includes(currentUser.role))
			setActiveTab("feed");
	}, [currentUser, setActiveTab]);

	// Metrics
	const totalVolunteers = volunteers.length;
	const readyVolunteers = volunteers.filter((v) => v.status === "ready").length;
	const deployedVolunteers = volunteers.filter(
		(v) => v.status === "deployed",
	).length;
	const totalSquads = volunteerTeams.length;
	const activeMissionsSquads = volunteerTeams.filter(
		(t) => t.status === "active_mission",
	).length;
	const activeTasks = volunteerTasks.filter(
		(t) => t.status !== "completed" && t.status !== "cancelled",
	).length;
	const unassignedTasks = volunteerTasks.filter(
		(t) => t.status === "unassigned",
	).length;

	// Handlers for modal triggers
	const handleOpenTaskDetail = (task: VolunteerTask) => {
		setSelectedTask(task);
		setTaskDetailOpen(true);
	};

	const handleOpenAssignModal = (task: VolunteerTask) => {
		setSelectedTask(task);
		setAssignTaskOpen(true);
	};

	// Find user's assigned team & tasks
	const myVolunteerProfile =
		volunteers.find((v) => v.id === currentUser.id) || volunteers[0];
	const myTeam = volunteerTeams.find((t) =>
		t.memberIds.includes(myVolunteerProfile?.id),
	);
	const myAssignedTasks = volunteerTasks.filter(
		(t) =>
			(myTeam && t.assignedTeamId === myTeam.id) ||
			(myVolunteerProfile &&
				t.assignedVolunteerIds.includes(myVolunteerProfile.id)),
	);

	return (
		<div className="space-y-4">
			{/* Top Banner / Metrics Overview */}
			<div className="border border-border bg-card rounded-md p-4 shadow-xs">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<div className="flex items-center space-x-2">
							<span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
							<span className="text-[10px] capitalize tracking-widest text-primary font-bold">
								{"CIVIL DEFENSE & VOLUNTEER CORPS".toLowerCase()}
							</span>
						</div>
						<h2 className="text-xl font-black text-foreground capitalize tracking-tight mt-1 flex items-center space-x-2">
							<span>{"VOLUNTEER COMMAND & SQUAD DISPATCH".toLowerCase()}</span>
						</h2>
						<p className="text-xs text-muted-foreground max-w-2xl mt-0.5">
							Assemble specialized tactical response squads, mobilize community
							volunteers, and dispatch coordinated field mission orders across
							crisis sectors.
						</p>
					</div>

					{/* Action Triggers */}
					<div className="flex overflow-x-auto scrollbar-none items-center gap-2">
						<Button
							size="sm"
							onClick={() => setCreateTeamOpen(true)}
							className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-bold capitalize tracking-wider text-xs border border-primary/50"
						>
							<Users className="h-3.5 w-3.5 mr-1.5" />
							Build Tactical Squad
						</Button>
						<Button
							size="sm"
							onClick={() => setCreateTaskOpen(true)}
							className="h-8 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md font-bold capitalize tracking-wider text-xs border border-border"
						>
							<ClipboardList className="h-3.5 w-3.5 mr-1.5 text-primary" />
							Dispatch Task
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={() => setRegisterVolOpen(true)}
							className="h-8 text-xs rounded-md"
						>
							<UserPlus className="h-3.5 w-3.5 mr-1.5" />
							Enlist Volunteer
						</Button>
					</div>
				</div>

				{/* 4-Stat Metric Row */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-border">
					<div className="bg-secondary/50 border border-border p-2.5 rounded-md">
						<div className="text-[10px] text-muted-foreground capitalize">
							Enlisted Volunteers
						</div>
						<div className="flex items-baseline space-x-2 mt-1">
							<span className="text-xl font-bold text-foreground">
								{totalVolunteers}
							</span>
							<span className="text-[11px] text-primary font-semibold">
								{readyVolunteers} Ready
							</span>
						</div>
					</div>

					<div className="bg-secondary/50 border border-border p-2.5 rounded-md">
						<div className="text-[10px] text-muted-foreground capitalize">
							Tactical Squads
						</div>
						<div className="flex items-baseline space-x-2 mt-1">
							<span className="text-xl font-bold text-foreground">
								{totalSquads}
							</span>
							<span className="text-[11px] text-amber-500 dark:text-amber-400 font-semibold">
								{activeMissionsSquads} On Mission
							</span>
						</div>
					</div>

					<div className="bg-secondary/50 border border-border p-2.5 rounded-md">
						<div className="text-[10px] text-muted-foreground capitalize">
							Active Mission Orders
						</div>
						<div className="flex items-baseline space-x-2 mt-1">
							<span className="text-xl font-bold text-foreground">
								{activeTasks}
							</span>
							<span className="text-[11px] text-destructive font-semibold">
								{unassignedTasks} Unassigned
							</span>
						</div>
					</div>

					<div className="bg-secondary/50 border border-border p-2.5 rounded-md">
						<div className="text-[10px] text-muted-foreground capitalize">
							Active Field Deployed
						</div>
						<div className="flex items-baseline space-x-2 mt-1">
							<span className="text-xl font-bold text-primary">
								{deployedVolunteers}
							</span>
							<span className="text-[11px] text-muted-foreground">
								/ {totalVolunteers} Active
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Sub-Navigation Tabs */}
			<div className="flex items-center justify-between gap-2 border-b border-border pb-2 overflow-x-auto scrollbar-none">
				<div className="flex items-center space-x-1">
					<Button
						onClick={() => setActiveSubView("squads")}
						className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 ${
							activeSubView === "squads"
								? "bg-primary text-primary-foreground shadow-xs"
								: "text-muted-foreground hover:text-foreground hover:bg-secondary"
						}`}
					>
						<Users className="h-3.5 w-3.5" />
						<span>Squad Builder & Roster ({volunteerTeams.length})</span>
					</Button>

					<Button
						onClick={() => setActiveSubView("tasks")}
						className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 ${
							activeSubView === "tasks"
								? "bg-primary text-primary-foreground shadow-xs"
								: "text-muted-foreground hover:text-foreground hover:bg-secondary"
						}`}
					>
						<ClipboardList className="h-3.5 w-3.5" />
						<span>Mission Orders & Tasks ({volunteerTasks.length})</span>
						{unassignedTasks > 0 && (
							<span className="h-4 px-1 rounded-full bg-destructive text-white text-[9px] flex items-center justify-center font-bold">
								{unassignedTasks}
							</span>
						)}
					</Button>

					<Button
						onClick={() => setActiveSubView("directory")}
						className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 ${
							activeSubView === "directory"
								? "bg-primary text-primary-foreground shadow-xs"
								: "text-muted-foreground hover:text-foreground hover:bg-secondary"
						}`}
					>
						<Shield className="h-3.5 w-3.5" />
						<span>Volunteer Directory ({volunteers.length})</span>
					</Button>

					<Button
						onClick={() => setActiveSubView("my_missions")}
						className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 ${
							activeSubView === "my_missions"
								? "bg-primary text-primary-foreground shadow-xs"
								: "text-muted-foreground hover:text-foreground hover:bg-secondary"
						}`}
					>
						<Radio className="h-3.5 w-3.5" />
						<span>My Deployment Portal</span>
					</Button>
				</div>
			</div>

			{activeSubView === "squads" && (
				<div className="space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
						<div className="text-xs text-muted-foreground">
							Showing{" "}
							<span className="text-foreground font-bold">
								{volunteerTeams.length}
							</span>{" "}
							tactical response teams. Assemble squads by grouping certified
							volunteers to fulfill high-priority crisis missions.
						</div>
						<Button
							size="sm"
							onClick={() => setCreateTeamOpen(true)}
							className="h-7 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs font-bold self-start"
						>
							<Plus className="h-3 w-3 mr-1" />
							Build New Squad
						</Button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
						{volunteerTeams.map((team) => {
							const specMeta = SPECIALTY_METADATA[team.specialty];
							const teamStatus = getTeamStatusBadge(team.status);
							const leaderVol = volunteers.find((v) => v.id === team.leaderId);
							const memberVolunteers = volunteers.filter((v) =>
								team.memberIds.includes(v.id),
							);

							// Active task assigned to team
							const activeTask = volunteerTasks.find(
								(t) => t.id === team.activeTaskId,
							);

							return (
								<div
									key={team.id}
									className="bg-card border border-border rounded-md p-3.5 space-y-3 flex flex-col justify-between shadow-xs"
								>
									<div className="space-y-2">
										{/* Header: Name, Callsign, Status */}
										<div className="spacey-2 mb-2">
											<div className="flex flex-col gap-2">
												<div>
													<span className="text-sm font-bold text-foreground">
														{team.name}
													</span>
												</div>
												<div className="flex flex-wrap items-center gap-2">
													<Badge className="text-[10px] text-primary font-bold px-1.5 py-0.2 bg-primary/15 border border-primary/30 rounded-xs capitalize">
														{team.callsign.toLocaleLowerCase()}
													</Badge>
													<Badge
														className={`text-[9px] px-1.5 py-0.2 rounded-xs border font-medium ${specMeta?.bg} ${specMeta?.badgeColor} ${specMeta?.border} capitalize`}
													>
														{specMeta?.label.toLowerCase()}
													</Badge>
													<Badge
														className={`text-[9px] px-2 py-0.5 rounded-xs font-bold border ${teamStatus.color} capitalize`}
													>
														{teamStatus.label.toLocaleLowerCase()}
													</Badge>
												</div>
											</div>
										</div>

										{/* Operational Details */}
										<div className="text-xs space-y-1 bg-secondary/50 p-2.5 rounded-md border border-border">
											<div className="flex items-center justify-between text-[11px]">
												<span className="text-muted-foreground">
													Squad Commander:
												</span>
												<span className="font-bold text-foreground flex items-center space-x-1">
													{leaderVol && (
														<img
															src={leaderVol.avatar}
															alt=""
															className="h-3.5 w-3.5 rounded-full object-cover"
														/>
													)}
													<span>{team.leaderName}</span>
												</span>
											</div>

											<div className="flex items-center justify-between text-[11px]">
												<span className="text-muted-foreground">
													Roster Capacity:
												</span>
												<span className="text-foreground font-bold">
													{team.memberIds.length} / {team.maxCapacity} Members
												</span>
											</div>

											{team.assignedIncidentTitle && (
												<div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-border">
													<span className="text-muted-foreground">
														Staging Sector:
													</span>
													<span
														className="font-bold text-primary truncate max-w-40"
														title={team.assignedIncidentTitle}
													>
														{team.assignedIncidentTitle}
													</span>
												</div>
											)}

											{team.stagingDepotName && (
												<div className="flex items-center justify-between text-[11px]">
													<span className="text-muted-foreground">
														Base Depot:
													</span>
													<span className="text-foreground truncate max-w-40">
														{team.stagingDepotName}
													</span>
												</div>
											)}
										</div>

										{/* Active Mission Banner (if assigned) */}
										{activeTask ? (
											<button
												type="button"
												onClick={() => handleOpenTaskDetail(activeTask)}
												className="w-full p-2 bg-primary/10 border border-primary/30 rounded-md cursor-pointer hover:bg-primary/20 transition-all text-xs space-y-1"
											>
												<div className="flex items-center justify-between text-[10px] text-primary font-bold">
													<span className="flex items-center space-x-1">
														<Activity className="h-3 w-3 animate-pulse" />
														<span>ACTIVE MISSION ORDER</span>
													</span>
													<span className="capitalize">
														{activeTask.priority} PRIORITY
													</span>
												</div>
												<div className="text-left font-bold text-foreground truncate">
													{activeTask.title}
												</div>
											</button>
										) : (
											<div className="p-2 bg-secondary/30 border border-dashed border-border rounded-md text-[11px] text-muted-foreground flex items-center justify-between">
												<span>No active task assigned.</span>
												<Button
													size="sm"
													variant="ghost"
													onClick={() => {
														setSelectedTeam(team);
														setCreateTaskOpen(true);
													}}
													className="h-5 px-1.5 text-[10px] text-primary hover:text-primary/80"
												>
													+ Assign Task
												</Button>
											</div>
										)}

										{/* Squad Members Avatars Row */}
										<div>
											<div className="text-[10px] font-bold text-muted-foreground capitalize tracking-wider mb-1">
												Squad Roster:
											</div>
											<div className="flex flex-wrap gap-1">
												{memberVolunteers.map((vol) => (
													<div
														key={vol.id}
														className="group relative"
														title={`${vol.name} (${vol.skills.map((s) => SKILL_METADATA[s]?.shortLabel).join(", ")})`}
													>
														<img
															src={vol.avatar}
															alt={vol.name}
															className="h-6 w-6 rounded-sm object-cover border border-border hover:border-primary transition-all"
														/>
														{team.leaderId === vol.id && (
															<span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 border border-card" />
														)}
													</div>
												))}
											</div>
										</div>
									</div>

									{/* Card Actions */}
									<div className="flex items-center justify-between pt-2 border-t border-border">
										<Button
											size="sm"
											variant="ghost"
											onClick={() => {
												if (
													confirm(
														`Disband tactical squad "${team.name}"? All volunteers will return to standby pool.`,
													)
												) {
													deleteVolunteerTeam(team.id);
												}
											}}
											className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-destructive"
										>
											Disband Squad
										</Button>

										<Button
											size="sm"
											onClick={() => {
												setSelectedTeam(team);
												setCreateTaskOpen(true);
											}}
											className="h-6 px-2 text-[10px] bg-secondary hover:bg-secondary/80 text-foreground border border-border font-bold"
										>
											Dispatch Mission
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{activeSubView === "tasks" && (
				<div className="space-y-4">
					{/* Filters Bar */}
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card p-3 rounded-md border border-border">
						<div className="flex flex-wrap items-center gap-2 flex-1">
							<div className="relative flex-1 min-w-50 max-w-sm">
								<Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
								<Input
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search mission orders or locations..."
									className="pl-8 text-xs h-8"
								/>
							</div>

							{/* Status Filter */}
							<select
								value={taskFilterStatus}
								onChange={(e) => setTaskFilterStatus(e.target.value)}
								className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground"
							>
								<option value="all">All Statuses</option>
								<option value="unassigned">Unassigned (Action Required)</option>
								<option value="assigned">Assigned to Squad</option>
								<option value="in_progress">In Progress</option>
								<option value="completed">Completed</option>
							</select>

							{/* Priority Filter */}
							<select
								value={taskFilterPriority}
								onChange={(e) => setTaskFilterPriority(e.target.value)}
								className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground"
							>
								<option value="all">All Priorities</option>
								<option value="critical">Critical</option>
								<option value="high">High</option>
								<option value="medium">Medium</option>
								<option value="low">Low</option>
							</select>
						</div>

						<Button
							size="sm"
							onClick={() => setCreateTaskOpen(true)}
							className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs font-bold self-start"
						>
							<Plus className="h-3 w-3 mr-1" />
							Dispatch New Task
						</Button>
					</div>

					{/* Tasks Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{volunteerTasks
							.filter((t) => {
								if (taskFilterStatus !== "all" && t.status !== taskFilterStatus)
									return false;
								if (
									taskFilterPriority !== "all" &&
									t.priority !== taskFilterPriority
								)
									return false;
								if (searchQuery.trim()) {
									const q = searchQuery.toLowerCase();
									return (
										t.title.toLowerCase().includes(q) ||
										t.description.toLowerCase().includes(q) ||
										t.location.address.toLowerCase().includes(q) ||
										t.assignedTeamName?.toLowerCase().includes(q)
									);
								}
								return true;
							})
							.map((task) => {
								const priorityBadge = getTaskPriorityBadge(task.priority);
								const statusBadge = getTaskStatusBadge(task.status);
								const catMeta = TASK_CATEGORY_METADATA[task.category];

								return (
									<div
										key={task.id}
										className={`bg-card border border-dashed rounded-md p-3.5 space-y-3 flex flex-col justify-between shadow-xs ${
											task.status === "unassigned"
												? "border-destructive/50 bg-destructive/10"
												: "border-border"
										}`}
									>
										<div className="space-y-2">
											{/* Top Badges */}
											<div className="flex items-center justify-between gap-2">
												<div className="flex items-center space-x-1.5">
													<span
														className={`text-[9px] px-1.5 py-0.2 rounded-xs font-bold border ${priorityBadge.color}`}
													>
														{priorityBadge.label}
													</span>
													<span
														className={`text-[9px] px-1.5 py-0.2 rounded-xs font-bold border ${statusBadge.color}`}
													>
														{statusBadge.label}
													</span>
													<span
														className={`text-[9px] px-1.5 py-0.2 rounded-xs border ${catMeta?.bg} ${catMeta?.color} ${catMeta?.border}`}
													>
														{catMeta?.label}
													</span>
												</div>

												<span className="text-[10px] text-muted-foreground">
													#{task.id}
												</span>
											</div>

											{/* Title & Description */}
											<div>
												<button
													type="button"
													onClick={() => handleOpenTaskDetail(task)}
													className="text-sm font-bold text-foreground hover:text-muted-foreground cursor-pointer transition-colors"
												>
													{task.title}
												</button>
												<p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
													{task.description}
												</p>
											</div>

											{/* Location & Time Window */}
											<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground pt-1">
												<span className="flex items-center space-x-1 text-foreground">
													<MapPin className="h-3 w-3 text-primary" />
													<span className="truncate max-w-45">
														{task.location.address}
													</span>
												</span>
												<span className="flex items-center space-x-1">
													<Clock className="h-3 w-3 text-primary" />
													<span>{task.deadline}</span>
												</span>
											</div>

											{/* Assigned Squad or Unassigned Alert */}
											<div className="pt-2 border-t border-border">
												{task.assignedTeamName ? (
													<div className="flex items-center justify-between text-xs bg-secondary/60 p-2 rounded-md border border-border">
														<span className="text-muted-foreground flex items-center space-x-1">
															<Shield className="h-3.5 w-3.5 text-primary" />
															<span className="font-bold text-foreground">
																{task.assignedTeamName}
															</span>
														</span>
														<span className="text-[10px] text-primary font-medium">
															{task.checkIns.length} field check-ins
														</span>
													</div>
												) : (
													<div className="flex items-center justify-between text-xs bg-amber-500/10 p-2 rounded-md border border-amber-500/30">
														<span className="text-amber-500 dark:text-amber-400 text-[11px] font-medium flex items-center space-x-1">
															<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
															<span>Requires Squad Assignment</span>
														</span>
														<Button
															size="sm"
															onClick={() => handleOpenAssignModal(task)}
															className="h-6 px-2 text-[10px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
														>
															Assign Squad
														</Button>
													</div>
												)}
											</div>
										</div>

										{/* Bottom Actions */}
										<div className="flex items-center justify-between pt-2 border-t border-border">
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleOpenTaskDetail(task)}
												className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
											>
												Inspect Briefing & SIT-REPs &rarr;
											</Button>

											{task.status !== "completed" ? (
												<Button
													size="sm"
													onClick={() => completeTask(task.id)}
													className="h-6 px-2 text-[10px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
												>
													<Check className="h-3 w-3 mr-1" />
													Complete
												</Button>
											) : (
												<span className="text-[10px] text-primary font-bold flex items-center space-x-1">
													<CheckCircle2 className="h-3 w-3" />
													<span>Accomplished</span>
												</span>
											)}
										</div>
									</div>
								);
							})}
					</div>
				</div>
			)}

			{activeSubView === "directory" && (
				<div className="space-y-4">
					{/* Filter Bar */}
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card p-3 rounded-md border border-border">
						<div className="flex flex-wrap items-center gap-2 flex-1">
							<div className="relative flex-1 min-w-50 max-w-sm">
								<Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
								<Input
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search by volunteer name or city..."
									className="pl-8 text-xs h-8"
								/>
							</div>

							{/* Status Filter */}
							<select
								value={volFilterStatus}
								onChange={(e) => setVolFilterStatus(e.target.value)}
								className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground"
							>
								<option value="all">All Deployment Statuses</option>
								<option value="ready">Ready for Dispatch</option>
								<option value="deployed">Active on Mission</option>
								<option value="on_break">On Break</option>
								<option value="offline">Off-Duty</option>
							</select>

							{/* Skill Filter */}
							<select
								value={volFilterSkill}
								onChange={(e) => setVolFilterSkill(e.target.value)}
								className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground"
							>
								<option value="all">All Skillsets</option>
								{Object.entries(SKILL_METADATA).map(([k, v]) => (
									<option key={k} value={k}>
										{v.shortLabel}
									</option>
								))}
							</select>
						</div>

						<Button
							size="sm"
							onClick={() => setRegisterVolOpen(true)}
							className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs font-bold self-start"
						>
							<UserPlus className="h-3.5 w-3.5 mr-1" />
							Register Volunteer
						</Button>
					</div>

					{/* Directory Cards Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
						{volunteers
							.filter((v) => {
								if (volFilterStatus !== "all" && v.status !== volFilterStatus)
									return false;
								if (
									volFilterSkill !== "all" &&
									!v.skills.includes(volFilterSkill as any)
								)
									return false;
								if (searchQuery.trim()) {
									const q = searchQuery.toLowerCase();
									return (
										v.name.toLowerCase().includes(q) ||
										(v.location.city || v.location.address)
											.toLowerCase()
											.includes(q) ||
										v.certifications.some((c) => c.toLowerCase().includes(q))
									);
								}
								return true;
							})
							.map((vol) => {
								const statusBadge = getStatusBadge(vol.status);
								return (
									<div
										key={vol.id}
										className="bg-card border border-border rounded-md p-3 space-y-2.5 flex flex-col justify-between shadow-xs"
									>
										<div className="space-y-2">
											<div className="flex items-start justify-between gap-2">
												<div className="flex items-center space-x-2.5">
													<img
														src={vol.avatar}
														alt={vol.name}
														className="h-10 w-10 rounded-md object-cover border border-border shrink-0"
													/>
													<div>
														<h4 className="text-xs font-bold text-foreground">
															{vol.name}
														</h4>
														<span className="text-[10px] text-muted-foreground block">
															{vol.location.city || vol.location.address} •
															Enlisted {vol.joinedDate}
														</span>
													</div>
												</div>

												<span
													className={`text-[9px] px-1.5 py-0.2 rounded-xs font-bold border ${statusBadge.color}`}
												>
													{statusBadge.label}
												</span>
											</div>

											{/* Team & Task Status */}
											<div className="bg-secondary/50 p-2 rounded-md border border-border text-xs space-y-1">
												<div className="flex items-center justify-between text-[11px]">
													<span className="text-muted-foreground">
														Assigned Squad:
													</span>
													<span className="font-bold text-foreground">
														{vol.teamName || (
															<span className="text-muted-foreground italic">
																Unattached
															</span>
														)}
													</span>
												</div>
												{vol.currentTaskTitle && (
													<div className="flex items-center justify-between text-[11px]">
														<span className="text-muted-foreground">
															Current Task:
														</span>
														<span
															className="font-bold text-primary truncate max-w-35"
															title={vol.currentTaskTitle}
														>
															{vol.currentTaskTitle}
														</span>
													</div>
												)}
												<div className="flex items-center justify-between text-[11px]">
													<span className="text-muted-foreground">
														Logged Hours:
													</span>
													<span className="text-foreground">
														{vol.experienceHours} hrs
													</span>
												</div>
											</div>

											{/* Verified Skills */}
											<div>
												<span className="text-[9px] font-bold text-muted-foreground capitalize tracking-wider block mb-1">
													Skills & Specializations:
												</span>
												<div className="flex flex-wrap gap-2">
													{vol.skills.map((sk) => {
														const meta = SKILL_METADATA[sk];
														return (
															<Badge
																key={sk}
																className={`text-[9px] px-1.5 py-0.2 rounded-xs border ${meta?.bg} ${meta?.color} ${meta?.border} font-medium`}
															>
																{meta?.shortLabel}
															</Badge>
														);
													})}
												</div>
											</div>

											{/* Certifications */}
											{vol.certifications.length > 0 && (
												<div className="text-[10px] text-muted-foreground pt-2 border-t border-border flex items-center space-x-1">
													<Award className="h-3 w-3 text-primary shrink-0" />
													<span className="truncate">
														{vol.certifications.join(" • ")}
													</span>
												</div>
											)}
										</div>

										{/* Quick Status Selector */}
										<div className="pt-2 border-t border-border flex items-center justify-between">
											<span className="text-[10px] text-muted-foreground">
												Contact: {vol.phone}
											</span>
											<select
												value={vol.status}
												onChange={(e) =>
													updateVolunteerStatus(
														vol.id,
														e.target.value as VolunteerStatus,
													)
												}
												className="h-6 rounded-md border border-input bg-background px-1.5 text-[10px] text-foreground"
											>
												<option value="ready">Ready</option>
												<option value="deployed">Deployed</option>
												<option value="on_break">On Break</option>
												<option value="offline">Off-Duty</option>
											</select>
										</div>
									</div>
								);
							})}
					</div>
				</div>
			)}

			{activeSubView === "my_missions" && (
				<div className="space-y-4">
					{/* Responder Profile Banner */}
					<div className="bg-card border border-border rounded-md p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-xs">
						<div className="flex items-center space-x-3">
							<img
								src={myVolunteerProfile?.avatar || currentUser.avatar}
								alt=""
								className="h-12 w-12 rounded-md object-cover border-2 border-border shrink-0"
							/>
							<div>
								<div className="flex flex-wrap items-center gap-2">
									<h3 className="text-sm font-bold text-foreground">
										{myVolunteerProfile?.name || currentUser.name}
									</h3>
									<Badge className="text-[10px] px-1.5 py-0.2 bg-primary/15 text-primary border border-primary/30 rounded-xs font-bold">
										{currentUser.badgeTitle}
									</Badge>
								</div>
								<div className="flex flex-col text-xs text-muted-foreground mt-0.5 items-start space-x-3">
									<span>
										Assigned Squad:{" "}
										<strong className="text-foreground">
											{myTeam ? myTeam.name : "Standby Pool"}
										</strong>
									</span>
									<span className="flex gap-2">
										<span>•</span>
										<span>
											{myVolunteerProfile?.experienceHours || 42} Field Hours
										</span>
									</span>
								</div>
							</div>
						</div>

						{/* Quick Readiness Toggler */}
						<div className="flex items-center space-x-2 self-start sm:self-auto">
							<span className="text-xs font-bold text-foreground capitalize">
								My Duty Status:
							</span>
							<div className="flex rounded-md bg-secondary border border-border p-0.5">
								{(["ready", "on_break", "offline"] as VolunteerStatus[]).map(
									(st) => (
										<button
											type="button"
											key={st}
											onClick={() => {
												if (myVolunteerProfile)
													updateVolunteerStatus(myVolunteerProfile.id, st);
											}}
											className={`px-2.5 py-1 text-[10px] font-bold capitalize rounded-md cursor-pointer transition-all ${
												myVolunteerProfile?.status === st
													? "bg-primary text-primary-foreground shadow-xs"
													: "text-muted-foreground hover:text-foreground"
											}`}
										>
											{st.replace("_", " ")}
										</button>
									),
								)}
							</div>
						</div>
					</div>

					{/* Assigned Mission Orders */}
					<div>
						<h3 className="text-xs font-bold text-foreground capitalize tracking-wider mb-2 flex items-center space-x-1.5">
							<ClipboardList className="h-4 w-4 text-primary" />
							<span>Active Field Mission Orders Dispatched to You</span>
						</h3>

						{myAssignedTasks.length === 0 ? (
							<div className="p-8 text-center border border-dashed border-border bg-card/50 rounded-md space-y-2">
								<Shield className="h-8 w-8 text-muted-foreground mx-auto" />
								<div className="text-sm font-bold text-foreground">
									No active mission orders assigned to your squad.
								</div>
								<p className="text-xs text-muted-foreground max-w-md mx-auto">
									Maintain duty status as "Ready". Emergency Command will
									dispatch mission assignments as priority sectors require
									volunteer support.
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{myAssignedTasks.map((task) => (
									<div
										key={task.id}
										className="bg-card border border-border rounded-md p-4 space-y-3 shadow-xs"
									>
										<div className="border-b border-border pb-2">
											<div className="flex items-center space-x-2">
												<span className="text-[10px] font-bold text-primary px-1.5 py-0.2 bg-primary/15 border border-primary/30 rounded-xs capitalize">
													{task.priority} Priority
												</span>
												<span className="text-xs text-muted-foreground">
													Order #{task.id}
												</span>
											</div>
											<h4 className="text-sm font-bold text-foreground mt-1">
												{task.title}
											</h4>
											<p className="text-xs text-muted-foreground mt-1">
												{task.description}
											</p>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-secondary/50 p-2.5 rounded-md border border-border text-xs">
											<div>
												<span className="text-[10px] text-muted-foreground block">
													Target Location:
												</span>
												<span className="font-bold text-foreground truncate block">
													{task.location.address}
												</span>
											</div>
											<div>
												<span className="text-[10px] text-muted-foreground block">
													Deadline Target:
												</span>
												<span className="font-bold text-foreground">
													{task.deadline}
												</span>
											</div>
											<div>
												<span className="text-[10px] text-muted-foreground block">
													Safety Directive:
												</span>
												<span className="text-primary truncate block">
													{task.safetyNotes || "Standard PPE & Hydration"}
												</span>
											</div>
										</div>
										<Button
											size="sm"
											onClick={() => handleOpenTaskDetail(task)}
											className="h-8 bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-bold"
										>
											Log Field SIT-REP / Check-In
										</Button>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			<CreateTeamModal open={createTeamOpen} onOpenChange={setCreateTeamOpen} />
			<CreateTaskModal open={createTaskOpen} onOpenChange={setCreateTaskOpen} />
			<AssignTaskModal
				open={assignTaskOpen}
				onOpenChange={setAssignTaskOpen}
				task={selectedTask}
			/>
			<TaskDetailModal
				open={taskDetailOpen}
				onOpenChange={setTaskDetailOpen}
				task={selectedTask}
				onOpenAssignModal={handleOpenAssignModal}
			/>
			<VolunteerRegisterModal
				open={registerVolOpen}
				onOpenChange={setRegisterVolOpen}
			/>
		</div>
	);
};
