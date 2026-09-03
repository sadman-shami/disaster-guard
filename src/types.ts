export type UserRole = "admin" | "responder" | "verified_citizen" | "citizen";

export interface User {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	badgeTitle: string;
	avatar: string;
	organization?: string;
	trustScore: number;
	isVerified: boolean;
	phone?: string;
	assignedJurisdiction?: string;
}

export type IncidentSeverity = "critical" | "high" | "moderate" | "low";

export type IncidentStatus =
	| "reported"
	| "investigating"
	| "verified"
	| "dispatched"
	| "in_progress"
	| "contained"
	| "resolved";

export type DisasterType =
	| "wildfire"
	| "flood"
	| "earthquake"
	| "hurricane"
	| "landslide"
	| "hazmat"
	| "collapse"
	| "tsunami"
	| "blizzard"
	| "power_outage";

export interface IncidentUpdate {
	id: string;
	authorName: string;
	authorRole: string;
	message: string;
	timestamp: string;
	isOfficial: boolean;
}

export interface AllocatedResourceItem {
	resourceId: string;
	resourceName: string;
	quantity: number;
	unit: string;
}

export interface Incident {
	id: string;
	title: string;
	type: DisasterType;
	severity: IncidentSeverity;
	status: IncidentStatus;
	description: string;
	location: {
		lat: number;
		lng: number;
		address: string;
		city: string;
		landmark?: string;
	};
	reportedBy: {
		id: string;
		name: string;
		role: UserRole;
		isVerified: boolean;
		trustScore: number;
		organization?: string;
	};
	createdAt: string;
	updatedAt: string;
	affectedCount: number;
	casualties: {
		injured: number;
		missing: number;
		fatalities: number;
	};
	needs: string[];
	corroborations: number;
	corroboratedByUserIds: string[];
	assignedTeams: string[];
	allocatedResources: AllocatedResourceItem[];
	updates: IncidentUpdate[];
	evacuationRadiusKm: number;
}

export type EmergencySupplyCategory =
	| "medical"
	| "water_food"
	| "shelter_bedding"
	| "rescue_gear"
	| "power_fuel"
	| "comms"
	| "vehicles";

export interface EmergencyResource {
	id: string;
	name: string;
	category: EmergencySupplyCategory;
	depotId: string;
	depotName: string;
	depotLocation: {
		lat: number;
		lng: number;
		address: string;
	};
	totalQuantity: number;
	allocatedQuantity: number;
	availableQuantity: number;
	unit: string;
	minThreshold: number;
	status: "optimal" | "low_stock" | "critical_shortage" | "surplus";
	lastRestocked: string;
	contactOfficer: string;
}

export interface Depot {
	id: string;
	name: string;
	type:
		| "central_hub"
		| "regional_depot"
		| "hospital"
		| "field_station"
		| "shelter";
	address: string;
	lat: number;
	lng: number;
	capacity: number;
	currentOccupancy: number;
	availableBeds?: number;
	contactPhone: string;
	operatingStatus:
		| "fully_operational"
		| "strained"
		| "at_capacity"
		| "evacuating";
	amenities: string[];
}

export interface EvacuationZone {
	id: string;
	name: string;
	lat: number;
	lng: number;
	radiusKm: number;
	level:
		| "mandatory_evacuation"
		| "prepare_to_evacuate"
		| "shelter_in_place"
		| "safe_corridor";
	color: string;
	description: string;
}

export interface ResourceDispatchLog {
	id: string;
	incidentId: string;
	incidentTitle: string;
	fromDepotId: string;
	fromDepotName: string;
	items: {
		resourceName: string;
		quantity: number;
		unit: string;
	}[];
	dispatchedAt: string;
	eta: string;
	status: "dispatched" | "in_transit" | "delivered" | "cancelled";
	dispatchedBy: string;
	notes?: string;
}

export type VolunteerSkill =
	| "first_aid_cpr"
	| "search_rescue"
	| "heavy_machinery"
	| "evac_transport"
	| "shelter_management"
	| "food_water_dist"
	| "bilingual_translation"
	| "comms_radio"
	| "psych_first_aid"
	| "drone_recon";

export type VolunteerStatus = "ready" | "deployed" | "on_break" | "offline";

export interface Volunteer {
	id: string;
	name: string;
	email: string;
	phone: string;
	avatar: string;
	skills: VolunteerSkill[];
	status: VolunteerStatus;
	teamId?: string;
	teamName?: string;
	certifications: string[];
	experienceHours: number;
	joinedDate: string;
	location: {
		address: string;
		city?: string;
		lat: number;
		lng: number;
	};
	emergencyContact: string;
	currentTaskTitle?: string;
}

export type TeamSpecialty =
	| "search_rescue"
	| "medical_triage"
	| "evacuation_logistics"
	| "shelter_ops"
	| "flood_sandbagging"
	| "general_response";

export type TeamStatus =
	| "standby"
	| "dispatched"
	| "active_mission"
	| "demobilized";

export interface VolunteerTeam {
	id: string;
	name: string;
	callsign: string;
	specialty: TeamSpecialty;
	leaderId: string;
	leaderName: string;
	memberIds: string[];
	maxCapacity: number;
	status: TeamStatus;
	assignedIncidentId?: string;
	assignedIncidentTitle?: string;
	stagingDepotId?: string;
	stagingDepotName?: string;
	activeTaskId?: string;
	activeTaskTitle?: string;
	createdAt: string;
	notes?: string;
}

export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskCategory =
	| "search_rescue"
	| "medical_aid"
	| "food_distribution"
	| "sandbagging"
	| "shelter_support"
	| "traffic_control"
	| "debris_clearing"
	| "recon";

export type TaskStatus =
	| "unassigned"
	| "assigned"
	| "in_progress"
	| "completed"
	| "cancelled";

export interface TaskCheckIn {
	id: string;
	volunteerId: string;
	volunteerName: string;
	timestamp: string;
	note: string;
}

export interface VolunteerTask {
	id: string;
	title: string;
	description: string;
	category: TaskCategory;
	priority: TaskPriority;
	status: TaskStatus;
	incidentId?: string;
	incidentTitle?: string;
	assignedTeamId?: string;
	assignedTeamName?: string;
	assignedVolunteerIds: string[];
	location: {
		address: string;
		lat: number;
		lng: number;
	};
	requiredSkills: VolunteerSkill[];
	volunteersNeeded: number;
	estimatedDurationHours: number;
	deadline?: string;
	createdBy: string;
	createdAt: string;
	completedAt?: string;
	checkIns: TaskCheckIn[];
	safetyNotes?: string;
}
