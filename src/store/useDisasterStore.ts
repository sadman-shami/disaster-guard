import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
	INITIAL_DEPOTS,
	INITIAL_DISPATCH_LOGS,
	INITIAL_INCIDENTS,
	INITIAL_RESOURCES,
	INITIAL_VOLUNTEER_TASKS,
	INITIAL_VOLUNTEER_TEAMS,
	INITIAL_VOLUNTEERS,
	PREDEFINED_USERS,
} from "#/mockdata";
import type {
	ActiveTab,
	AllocatedResourceItem,
	Depot,
	EmergencyResource,
	Incident,
	IncidentStatus,
	ResourceDispatchLog,
	TaskStatus,
	User,
	UserRole,
	Volunteer,
	VolunteerSkill,
	VolunteerStatus,
	VolunteerTask,
	VolunteerTeam,
} from "#/types";

export interface DisasterStoreState {
	currentUser: User;
	usersList: User[];
	incidents: Incident[];
	activeTab: ActiveTab;
	selectedIncidentId: string | null;
	resources: EmergencyResource[];
	depots: Depot[];
	dispatchLogs: ResourceDispatchLog[];

	// Volunteer & Squad Management
	volunteers: Volunteer[];
	volunteerTeams: VolunteerTeam[];
	volunteerTasks: VolunteerTask[];

	// Actions
	setCurrentUser: (user: User) => void;
	switchUserRole: (role: UserRole) => void;
	setActiveTab: (tab: ActiveTab) => void;
	setSelectedIncidentId: (id: string | null) => void;
	focusMapOnIncident: (id: string) => void;

	// Incident Actions
	reportIncident: (
		incidentData: Omit<
			Incident,
			| "id"
			| "createdAt"
			| "updatedAt"
			| "corroborations"
			| "corroboratedByUserIds"
			| "assignedTeams"
			| "allocatedResources"
			| "updates"
		>,
	) => string;
	verifyIncident: (incidentId: string) => void;
	updateIncidentStatus: (incidentId: string, status: IncidentStatus) => void;
	corroborateIncident: (incidentId: string) => void;
	addIncidentUpdate: (incidentId: string, message: string) => void;
	allocateResourceToIncident: (
		incidentId: string,
		resourceId: string,
		quantity: number,
		depotId: string,
		notes?: string,
	) => void;

	// Resource & Depot Actions
	addResourceStock: (resourceId: string, additionalQty: number) => void;
	createEmergencyResource: (
		resource: Omit<
			EmergencyResource,
			| "id"
			| "status"
			| "lastRestocked"
			| "allocatedQuantity"
			| "availableQuantity"
		>,
	) => void;
	createDepot: (depotData: Omit<Depot, "id">) => string;
	updateDepotOccupancy: (depotId: string, newOccupancy: number) => void;

	// Volunteer Squad Actions
	createVolunteerTeam: (
		teamData: Omit<VolunteerTeam, "id" | "createdAt">,
	) => string;
	updateVolunteerTeam: (
		teamId: string,
		updates: Partial<VolunteerTeam>,
	) => void;
	deleteVolunteerTeam: (teamId: string) => void;
	addVolunteerToTeam: (volunteerId: string, teamId: string) => void;
	removeVolunteerFromTeam: (volunteerId: string, teamId: string) => void;

	// Task & Mission Actions
	createVolunteerTask: (
		taskData: Omit<VolunteerTask, "id" | "createdAt" | "checkIns">,
	) => string;
	assignTaskToTeam: (taskId: string, teamId: string) => void;
	assignTaskToVolunteers: (taskId: string, volunteerIds: string[]) => void;
	updateTaskStatus: (taskId: string, status: TaskStatus) => void;
	checkInToTask: (taskId: string, volunteerId: string, note: string) => void;
	completeTask: (taskId: string) => void;

	// Volunteer Profile Actions
	registerVolunteer: (
		volunteerData: Omit<Volunteer, "id" | "joinedDate">,
	) => string;
	updateVolunteerStatus: (volunteerId: string, status: VolunteerStatus) => void;
	updateVolunteerSkills: (
		volunteerId: string,
		skills: VolunteerSkill[],
	) => void;

	// Reset Actions
	resetAllData: () => void;
}

export const useDisasterStore = create<DisasterStoreState>()(
	persist(
		(set, get) => ({
			currentUser: PREDEFINED_USERS[0],
			usersList: PREDEFINED_USERS,
			incidents: INITIAL_INCIDENTS,
			activeTab: "feed",
			selectedIncidentId: null,
			resources: INITIAL_RESOURCES,
			depots: INITIAL_DEPOTS,
			dispatchLogs: INITIAL_DISPATCH_LOGS,
			volunteers: INITIAL_VOLUNTEERS,
			volunteerTeams: INITIAL_VOLUNTEER_TEAMS,
			volunteerTasks: INITIAL_VOLUNTEER_TASKS,

			setCurrentUser: (user) => set({ currentUser: user }),

			switchUserRole: (role) => {
				const matched = PREDEFINED_USERS.find((u) => u.role === role);
				if (matched) {
					set({ currentUser: matched });
				}
			},

			setActiveTab: (tab) => set({ activeTab: tab }),

			setSelectedIncidentId: (id) => set({ selectedIncidentId: id }),

			focusMapOnIncident: (id) => {
				set({ selectedIncidentId: id, activeTab: "map" });
			},

			reportIncident: (incidentData) => {
				const { currentUser, incidents } = get();
				const newId = `inc-${Date.now().toString().slice(-4)}`;
				const isAutoVerified =
					currentUser.role === "admin" ||
					currentUser.role === "responder" ||
					currentUser.isVerified;
				const initialStatus: IncidentStatus = isAutoVerified
					? "verified"
					: "reported";

				const newIncident: Incident = {
					...incidentData,
					id: newId,
					status: initialStatus,
					createdAt: "Just now",
					updatedAt: "Just now",
					corroborations: 1,
					corroboratedByUserIds: [currentUser.id],
					assignedTeams: isAutoVerified ? ["Local Rapid Response Team"] : [],
					allocatedResources: [],
					updates: [
						{
							id: `upd-${Date.now()}`,
							authorName: currentUser.name,
							authorRole: currentUser.badgeTitle,
							message: `Initial report logged: "${incidentData.title}" (${incidentData.severity.toUpperCase()} Priority).`,
							timestamp: "Just now",
							isOfficial:
								currentUser.role === "admin" ||
								currentUser.role === "responder",
						},
					],
				};

				set({ incidents: [newIncident, ...incidents] });
				return newId;
			},

			verifyIncident: (incidentId) => {
				const { currentUser, incidents } = get();
				set({
					incidents: incidents.map((inc) => {
						if (inc.id === incidentId) {
							return {
								...inc,
								status:
									inc.status === "reported" || inc.status === "investigating"
										? "verified"
										: inc.status,
								reportedBy: {
									...inc.reportedBy,
									isVerified: true,
								},
								updates: [
									...inc.updates,
									{
										id: `upd-${Date.now()}`,
										authorName: currentUser.name,
										authorRole: currentUser.badgeTitle,
										message: `Incident authenticity officially verified by ${currentUser.name} (${currentUser.organization || "Incident Command"}).`,
										timestamp: "Just now",
										isOfficial: true,
									},
								],
								updatedAt: "Just now",
							};
						}
						return inc;
					}),
				});
			},

			updateIncidentStatus: (incidentId, status) => {
				const { currentUser, incidents } = get();
				set({
					incidents: incidents.map((inc) => {
						if (inc.id === incidentId) {
							return {
								...inc,
								status,
								updatedAt: "Just now",
								updates: [
									...inc.updates,
									{
										id: `upd-${Date.now()}`,
										authorName: currentUser.name,
										authorRole: currentUser.badgeTitle,
										message: `Operational status updated to: [${status.toUpperCase().replace("_", " ")}].`,
										timestamp: "Just now",
										isOfficial:
											currentUser.role === "admin" ||
											currentUser.role === "responder",
									},
								],
							};
						}
						return inc;
					}),
				});
			},

			corroborateIncident: (incidentId) => {
				const { currentUser, incidents } = get();
				set({
					incidents: incidents.map((inc) => {
						if (inc.id === incidentId) {
							const hasVoted = inc.corroboratedByUserIds.includes(
								currentUser.id,
							);
							const updatedUserIds = hasVoted
								? inc.corroboratedByUserIds.filter(
										(uid) => uid !== currentUser.id,
									)
								: [...inc.corroboratedByUserIds, currentUser.id];

							return {
								...inc,
								corroborations: updatedUserIds.length,
								corroboratedByUserIds: updatedUserIds,
							};
						}
						return inc;
					}),
				});
			},

			addIncidentUpdate: (incidentId, message) => {
				const { currentUser, incidents } = get();
				set({
					incidents: incidents.map((inc) => {
						if (inc.id === incidentId) {
							return {
								...inc,
								updatedAt: "Just now",
								updates: [
									...inc.updates,
									{
										id: `upd-${Date.now()}`,
										authorName: currentUser.name,
										authorRole: currentUser.badgeTitle,
										message,
										timestamp: "Just now",
										isOfficial:
											currentUser.role === "admin" ||
											currentUser.role === "responder",
									},
								],
							};
						}
						return inc;
					}),
				});
			},

			allocateResourceToIncident: (
				incidentId,
				resourceId,
				quantity,
				depotId,
				notes,
			) => {
				const { resources, incidents, depots, dispatchLogs, currentUser } =
					get();
				const targetResource = resources.find((r) => r.id === resourceId);
				const targetIncident = incidents.find((i) => i.id === incidentId);
				const targetDepot = depots.find((d) => d.id === depotId);

				if (!targetResource || !targetIncident || !targetDepot) return;

				const qty = Math.min(quantity, targetResource.availableQuantity);
				if (qty <= 0) return;

				// Deduct available, increment allocated
				const updatedResources = resources.map((r) => {
					if (r.id === resourceId) {
						const newAlloc = r.allocatedQuantity + qty;
						const newAvail = r.totalQuantity - newAlloc;
						let newStatus: EmergencyResource["status"] = "optimal";
						if (newAvail <= 0) newStatus = "critical_shortage";
						else if (newAvail <= r.minThreshold) newStatus = "low_stock";
						return {
							...r,
							allocatedQuantity: newAlloc,
							availableQuantity: newAvail,
							status: newStatus,
							lastRestocked: "Just now (Allocation)",
						};
					}
					return r;
				});

				// Add to incident
				const updatedIncidents = incidents.map((inc) => {
					if (inc.id === incidentId) {
						const existingAlloc = inc.allocatedResources.find(
							(ar) => ar.resourceId === resourceId,
						);
						let newAllocatedList: AllocatedResourceItem[];
						if (existingAlloc) {
							newAllocatedList = inc.allocatedResources.map((ar) =>
								ar.resourceId === resourceId
									? { ...ar, quantity: ar.quantity + qty }
									: ar,
							);
						} else {
							newAllocatedList = [
								...inc.allocatedResources,
								{
									resourceId,
									resourceName: targetResource.name,
									quantity: qty,
									unit: targetResource.unit,
								},
							];
						}

						return {
							...inc,
							allocatedResources: newAllocatedList,
							status:
								inc.status === "reported" || inc.status === "verified"
									? "dispatched"
									: inc.status,
							updates: [
								...inc.updates,
								{
									id: `upd-${Date.now()}`,
									authorName: currentUser.name,
									authorRole: currentUser.badgeTitle,
									message: `Dispatched ${qty} ${targetResource.unit} of "${targetResource.name}" from ${targetDepot.name}.`,
									timestamp: "Just now",
									isOfficial: true,
								},
							],
						};
					}
					return inc;
				});

				// Add to Dispatch Log
				const newLog: ResourceDispatchLog = {
					id: `disp-${Date.now().toString().slice(-4)}`,
					incidentId,
					incidentTitle: targetIncident.title,
					fromDepotId: depotId,
					fromDepotName: targetDepot.name,
					items: [
						{
							resourceName: targetResource.name,
							quantity: qty,
							unit: targetResource.unit,
						},
					],
					dispatchedAt: "Just now",
					eta: "10 mins",
					status: "dispatched",
					dispatchedBy: currentUser.name,
					notes:
						notes ||
						`Direct emergency consignment approved by ${currentUser.badgeTitle}`,
				};

				set({
					resources: updatedResources,
					incidents: updatedIncidents,
					dispatchLogs: [newLog, ...dispatchLogs],
				});
			},

			addResourceStock: (resourceId, additionalQty) => {
				const { resources } = get();
				set({
					resources: resources.map((r) => {
						if (r.id === resourceId) {
							const newTotal = r.totalQuantity + additionalQty;
							const newAvail = newTotal - r.allocatedQuantity;
							let newStatus: EmergencyResource["status"] = "optimal";
							if (newAvail <= r.minThreshold) newStatus = "low_stock";
							if (newAvail > r.minThreshold * 2) newStatus = "surplus";
							return {
								...r,
								totalQuantity: newTotal,
								availableQuantity: newAvail,
								status: newStatus,
								lastRestocked: "Just now",
							};
						}
						return r;
					}),
				});
			},

			createEmergencyResource: (resourceData) => {
				const { resources } = get();
				const newRes: EmergencyResource = {
					...resourceData,
					id: `res-${Date.now().toString().slice(-4)}`,
					allocatedQuantity: 0,
					availableQuantity: resourceData.totalQuantity,
					status: "optimal",
					lastRestocked: "Just now",
				};
				set({ resources: [newRes, ...resources] });
			},

			createDepot: (depotData) => {
				const { depots } = get();
				const newId = `depot-${Date.now().toString().slice(-4)}`;
				const capacity = Number(depotData.capacity) || 100;
				const currentOccupancy = Number(depotData.currentOccupancy) || 0;
				const availableBeds =
					depotData.availableBeds !== undefined
						? Number(depotData.availableBeds)
						: Math.max(0, capacity - currentOccupancy);

				const newDepot: Depot = {
					...depotData,
					id: newId,
					capacity,
					currentOccupancy,
					availableBeds,
				};

				set({ depots: [newDepot, ...depots] });
				return newId;
			},

			updateDepotOccupancy: (depotId, newOccupancy) => {
				const { depots } = get();
				set({
					depots: depots.map((d) => {
						if (d.id === depotId) {
							const occ = Math.max(0, Math.min(d.capacity, newOccupancy));
							let status: Depot["operatingStatus"] = "fully_operational";
							if (occ >= d.capacity) status = "at_capacity";
							else if (occ >= d.capacity * 0.8) status = "strained";
							return {
								...d,
								currentOccupancy: occ,
								availableBeds: Math.max(0, d.capacity - occ),
								operatingStatus: status,
							};
						}
						return d;
					}),
				});
			},

			createVolunteerTeam: (teamData) => {
				const { volunteerTeams, volunteers, incidents, currentUser } = get();
				const newTeamId = `team-${Date.now().toString().slice(-4)}`;
				const newTeam: VolunteerTeam = {
					...teamData,
					id: newTeamId,
					createdAt: "Just now",
				};

				const updatedVolunteers =
					teamData.memberIds && teamData.memberIds.length > 0
						? volunteers.map((v) =>
								teamData.memberIds.includes(v.id)
									? { ...v, teamId: newTeamId, teamName: teamData.name }
									: v,
							)
						: volunteers;

				let updatedIncidents = incidents;
				if (teamData.assignedIncidentId) {
					updatedIncidents = incidents.map((inc) => {
						if (inc.id === teamData.assignedIncidentId) {
							const hasTeam = inc.assignedTeams.includes(teamData.name);
							return {
								...inc,
								assignedTeams: hasTeam
									? inc.assignedTeams
									: [...inc.assignedTeams, teamData.name],
								updates: [
									...inc.updates,
									{
										id: `upd-${Date.now()}`,
										authorName: currentUser.name,
										authorRole: currentUser.badgeTitle,
										message: `Tactical Volunteer Squad "${teamData.name}" (${teamData.callsign}) assigned to incident response.`,
										timestamp: "Just now",
										isOfficial: true,
									},
								],
							};
						}
						return inc;
					});
				}

				set({
					volunteerTeams: [newTeam, ...volunteerTeams],
					volunteers: updatedVolunteers,
					incidents: updatedIncidents,
				});

				return newTeamId;
			},

			updateVolunteerTeam: (teamId, updates) => {
				const { volunteerTeams, volunteers } = get();
				const updatedTeams = volunteerTeams.map((team) => {
					if (team.id === teamId) {
						return { ...team, ...updates };
					}
					return team;
				});

				let updatedVolunteers = volunteers;
				if (updates.memberIds) {
					updatedVolunteers = volunteers.map((v) => {
						if (updates.memberIds?.includes(v.id)) {
							const team = updatedTeams.find((t) => t.id === teamId);
							return { ...v, teamId, teamName: updates.name || team?.name };
						}
						if (v.teamId === teamId && !updates.memberIds?.includes(v.id)) {
							return { ...v, teamId: undefined, teamName: undefined };
						}
						return v;
					});
				}

				set({
					volunteerTeams: updatedTeams,
					volunteers: updatedVolunteers,
				});
			},

			deleteVolunteerTeam: (teamId) => {
				const { volunteerTeams, volunteers } = get();
				set({
					volunteerTeams: volunteerTeams.filter((t) => t.id !== teamId),
					volunteers: volunteers.map((v) =>
						v.teamId === teamId
							? { ...v, teamId: undefined, teamName: undefined }
							: v,
					),
				});
			},

			addVolunteerToTeam: (volunteerId, teamId) => {
				const { volunteerTeams, volunteers } = get();
				const targetTeam = volunteerTeams.find((t) => t.id === teamId);
				if (!targetTeam) return;

				const updatedTeams = volunteerTeams.map((t) =>
					t.id === teamId && !t.memberIds.includes(volunteerId)
						? { ...t, memberIds: [...t.memberIds, volunteerId] }
						: t,
				);

				const updatedVolunteers = volunteers.map((v) =>
					v.id === volunteerId
						? { ...v, teamId, teamName: targetTeam.name }
						: v,
				);

				set({
					volunteerTeams: updatedTeams,
					volunteers: updatedVolunteers,
				});
			},

			removeVolunteerFromTeam: (volunteerId, teamId) => {
				const { volunteerTeams, volunteers } = get();
				set({
					volunteerTeams: volunteerTeams.map((t) =>
						t.id === teamId
							? {
									...t,
									memberIds: t.memberIds.filter((id) => id !== volunteerId),
								}
							: t,
					),
					volunteers: volunteers.map((v) =>
						v.id === volunteerId && v.teamId === teamId
							? { ...v, teamId: undefined, teamName: undefined }
							: v,
					),
				});
			},

			createVolunteerTask: (taskData) => {
				const {
					volunteerTasks,
					volunteerTeams,
					volunteers,
					incidents,
					currentUser,
				} = get();
				const newTaskId = `task-${Date.now().toString().slice(-4)}`;
				const newTask: VolunteerTask = {
					...taskData,
					id: newTaskId,
					createdAt: "Just now",
					checkIns: [],
				};

				let updatedTeams = volunteerTeams;
				let updatedVolunteers = volunteers;

				if (taskData.assignedTeamId) {
					updatedTeams = volunteerTeams.map((t) =>
						t.id === taskData.assignedTeamId
							? {
									...t,
									activeTaskId: newTaskId,
									activeTaskTitle: taskData.title,
									status: "active_mission",
								}
							: t,
					);

					const team = volunteerTeams.find(
						(t) => t.id === taskData.assignedTeamId,
					);
					if (team) {
						updatedVolunteers = volunteers.map((v) =>
							team.memberIds.includes(v.id)
								? { ...v, status: "deployed", currentTaskTitle: taskData.title }
								: v,
						);
					}
				}

				if (
					taskData.assignedVolunteerIds &&
					taskData.assignedVolunteerIds.length > 0
				) {
					updatedVolunteers = updatedVolunteers.map((v) =>
						taskData.assignedVolunteerIds.includes(v.id)
							? { ...v, status: "deployed", currentTaskTitle: taskData.title }
							: v,
					);
				}

				let updatedIncidents = incidents;
				if (taskData.incidentId) {
					updatedIncidents = incidents.map((inc) => {
						if (inc.id === taskData.incidentId) {
							return {
								...inc,
								updates: [
									...inc.updates,
									{
										id: `upd-${Date.now()}`,
										authorName: currentUser.name,
										authorRole: currentUser.badgeTitle,
										message: `New volunteer mission order dispatched: "${taskData.title}" (${taskData.priority.toUpperCase()} Priority).`,
										timestamp: "Just now",
										isOfficial: true,
									},
								],
							};
						}
						return inc;
					});
				}

				set({
					volunteerTasks: [newTask, ...volunteerTasks],
					volunteerTeams: updatedTeams,
					volunteers: updatedVolunteers,
					incidents: updatedIncidents,
				});

				return newTaskId;
			},

			assignTaskToTeam: (taskId, teamId) => {
				const { volunteerTeams, volunteerTasks, volunteers } = get();
				const targetTeam = volunteerTeams.find((t) => t.id === teamId);
				const targetTask = volunteerTasks.find((t) => t.id === taskId);
				if (!targetTeam || !targetTask) return;

				set({
					volunteerTasks: volunteerTasks.map((t) =>
						t.id === taskId
							? {
									...t,
									assignedTeamId: teamId,
									assignedTeamName: targetTeam.name,
									assignedVolunteerIds: Array.from(
										new Set([
											...t.assignedVolunteerIds,
											...targetTeam.memberIds,
										]),
									),
									status: t.status === "unassigned" ? "assigned" : t.status,
								}
							: t,
					),
					volunteerTeams: volunteerTeams.map((team) =>
						team.id === teamId
							? {
									...team,
									activeTaskId: taskId,
									activeTaskTitle: targetTask.title,
									status: "active_mission",
								}
							: team,
					),
					volunteers: volunteers.map((v) =>
						targetTeam.memberIds.includes(v.id)
							? { ...v, status: "deployed", currentTaskTitle: targetTask.title }
							: v,
					),
				});
			},

			assignTaskToVolunteers: (taskId, volunteerIds) => {
				const { volunteerTasks, volunteers } = get();
				const targetTask = volunteerTasks.find((t) => t.id === taskId);
				if (!targetTask) return;

				set({
					volunteerTasks: volunteerTasks.map((t) =>
						t.id === taskId
							? {
									...t,
									assignedVolunteerIds: Array.from(
										new Set([...t.assignedVolunteerIds, ...volunteerIds]),
									),
									status: t.status === "unassigned" ? "assigned" : t.status,
								}
							: t,
					),
					volunteers: volunteers.map((v) =>
						volunteerIds.includes(v.id)
							? { ...v, status: "deployed", currentTaskTitle: targetTask.title }
							: v,
					),
				});
			},

			updateTaskStatus: (taskId, status) => {
				const { volunteerTasks, volunteerTeams, volunteers } = get();
				const isNowCompleted = status === "completed";

				const updatedTasks = volunteerTasks.map((t) => {
					if (t.id === taskId) {
						return {
							...t,
							status,
							completedAt: isNowCompleted ? "Just now" : t.completedAt,
						};
					}
					return t;
				});

				let updatedTeams = volunteerTeams;
				let updatedVolunteers = volunteers;

				if (isNowCompleted || status === "cancelled") {
					const task = volunteerTasks.find((t) => t.id === taskId);
					if (task?.assignedTeamId) {
						updatedTeams = volunteerTeams.map((team) =>
							team.id === task.assignedTeamId
								? {
										...team,
										activeTaskId: undefined,
										activeTaskTitle: undefined,
										status: "standby",
									}
								: team,
						);
					}
					if (task?.assignedVolunteerIds) {
						updatedVolunteers = volunteers.map((v) =>
							task.assignedVolunteerIds.includes(v.id)
								? { ...v, status: "ready", currentTaskTitle: undefined }
								: v,
						);
					}
				}

				set({
					volunteerTasks: updatedTasks,
					volunteerTeams: updatedTeams,
					volunteers: updatedVolunteers,
				});
			},

			checkInToTask: (taskId, volunteerId, note) => {
				const { volunteers, currentUser, volunteerTasks } = get();
				const vol = volunteers.find((v) => v.id === volunteerId);
				const volunteerName = vol ? vol.name : currentUser.name;

				const newCheckIn = {
					id: `chk-${Date.now()}`,
					volunteerId,
					volunteerName,
					timestamp: "Just now",
					note,
				};

				set({
					volunteerTasks: volunteerTasks.map((t) =>
						t.id === taskId
							? {
									...t,
									status:
										t.status === "assigned" || t.status === "unassigned"
											? "in_progress"
											: t.status,
									checkIns: [newCheckIn, ...t.checkIns],
								}
							: t,
					),
				});
			},

			completeTask: (taskId) => {
				get().updateTaskStatus(taskId, "completed");
			},

			registerVolunteer: (volunteerData) => {
				const { volunteers } = get();
				const newVolId = `vol-${Date.now().toString().slice(-4)}`;
				const newVol: Volunteer = {
					...volunteerData,
					id: newVolId,
					joinedDate: "Today",
				};
				set({ volunteers: [newVol, ...volunteers] });
				return newVolId;
			},

			updateVolunteerStatus: (volunteerId, status) => {
				const { volunteers } = get();
				set({
					volunteers: volunteers.map((v) =>
						v.id === volunteerId ? { ...v, status } : v,
					),
				});
			},

			updateVolunteerSkills: (volunteerId, skills) => {
				const { volunteers } = get();
				set({
					volunteers: volunteers.map((v) =>
						v.id === volunteerId ? { ...v, skills } : v,
					),
				});
			},

			resetAllData: () => {
				set({
					currentUser: PREDEFINED_USERS[0],
					incidents: INITIAL_INCIDENTS,
					resources: INITIAL_RESOURCES,
					depots: INITIAL_DEPOTS,
					dispatchLogs: INITIAL_DISPATCH_LOGS,
					volunteers: INITIAL_VOLUNTEERS,
					volunteerTeams: INITIAL_VOLUNTEER_TEAMS,
					volunteerTasks: INITIAL_VOLUNTEER_TASKS,
					activeTab: "feed",
					selectedIncidentId: null,
				});
			},
		}),
		{
			name: "disaster_guard_bangladesh_state_v1",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				currentUser: state.currentUser,
				incidents: state.incidents,
				resources: state.resources,
				depots: state.depots,
				dispatchLogs: state.dispatchLogs,
				volunteers: state.volunteers,
				volunteerTeams: state.volunteerTeams,
				volunteerTasks: state.volunteerTasks,
				activeTab: state.activeTab,
			}),
		},
	),
);
