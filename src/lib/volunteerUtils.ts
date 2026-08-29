import type {
	TaskCategory,
	TaskPriority,
	TaskStatus,
	TeamSpecialty,
	TeamStatus,
	VolunteerSkill,
	VolunteerStatus,
} from "#/types";

export const SKILL_METADATA: Record<
	VolunteerSkill,
	{
		label: string;
		shortLabel: string;
		color: string;
		bg: string;
		border: string;
		description: string;
	}
> = {
	first_aid_cpr: {
		label: "First Aid / CPR / AED",
		shortLabel: "First Aid",
		color: "text-rose-400",
		bg: "bg-rose-950/60",
		border: "border-rose-800/80",
		description:
			"Trained in emergency wound care, CPR, AED usage, and basic trauma life support.",
	},
	search_rescue: {
		label: "Urban Search & Rescue",
		shortLabel: "Search & Rescue",
		color: "text-amber-400",
		bg: "bg-amber-950/60",
		border: "border-amber-800/80",
		description:
			"Structural perimeter search, rubble navigation, shoring, and swift extraction.",
	},
	heavy_machinery: {
		label: "Heavy Machinery & Skid-Steer",
		shortLabel: "Heavy Equip",
		color: "text-yellow-400",
		bg: "bg-yellow-950/60",
		border: "border-yellow-800/80",
		description:
			"Licensed frontloader, excavator, skid-steer, and debris clearing equipment operator.",
	},
	evac_transport: {
		label: "Evacuation Transport & CDL",
		shortLabel: "Evac Transport",
		color: "text-sky-400",
		bg: "bg-sky-950/60",
		border: "border-sky-800/80",
		description:
			"High-axle 4WD transit, bus driving, vulnerable resident evacuation escort.",
	},
	shelter_management: {
		label: "Shelter Ops & Mass Care",
		shortLabel: "Shelter Ops",
		color: "text-purple-400",
		bg: "bg-purple-950/60",
		border: "border-purple-800/80",
		description:
			"Evacuee intake, bed & cot logistics, accessibility accommodations, and hygiene coordination.",
	},
	food_water_dist: {
		label: "Food & Water Supply Logistics",
		shortLabel: "Food/Water Dist",
		color: "text-emerald-400",
		bg: "bg-emerald-950/60",
		border: "border-emerald-800/80",
		description:
			"Bulk food handling, potable water station distribution, hydration logistics.",
	},
	bilingual_translation: {
		label: "Bilingual / Translation Aid",
		shortLabel: "Translation",
		color: "text-cyan-400",
		bg: "bg-cyan-950/60",
		border: "border-cyan-800/80",
		description:
			"Multi-lingual emergency translation (Spanish, Cantonese, Vietnamese, ASL, etc.).",
	},
	comms_radio: {
		label: "Emergency Radio Comms (HAM/HF)",
		shortLabel: "Radio Comms",
		color: "text-indigo-400",
		bg: "bg-indigo-950/60",
		border: "border-indigo-800/80",
		description:
			"FCC-licensed amateur radio operator, VHF/UHF tactical mesh network relay.",
	},
	psych_first_aid: {
		label: "Psychological First Aid & Crisis Care",
		shortLabel: "Crisis Care",
		color: "text-pink-400",
		bg: "bg-pink-950/60",
		border: "border-pink-800/80",
		description:
			"Trauma support, de-escalation, family reunification assistance, and grief counseling.",
	},
	drone_recon: {
		label: "UAV / Drone Aerial Recon (FAA 107)",
		shortLabel: "Drone Recon",
		color: "text-teal-400",
		bg: "bg-teal-950/60",
		border: "border-teal-800/80",
		description:
			"FAA Part 107 certified remote pilot with thermal IR imaging and aerial mapping capabilities.",
	},
};

export const SPECIALTY_METADATA: Record<
	TeamSpecialty,
	{
		label: string;
		badgeColor: string;
		bg: string;
		border: string;
		iconName: string;
		defaultCapacity: number;
	}
> = {
	medical_triage: {
		label: "Medical & Triage Corps",
		badgeColor: "text-rose-400",
		bg: "bg-rose-950/60",
		border: "border-rose-800/80",
		iconName: "HeartPulse",
		defaultCapacity: 6,
	},
	search_rescue: {
		label: "Urban Search & Rescue (USAR)",
		badgeColor: "text-amber-400",
		bg: "bg-amber-950/60",
		border: "border-amber-800/80",
		iconName: "Compass",
		defaultCapacity: 8,
	},
	evacuation_logistics: {
		label: "Evacuation & Transit Logistics",
		badgeColor: "text-sky-400",
		bg: "bg-sky-950/60",
		border: "border-sky-800/80",
		iconName: "Truck",
		defaultCapacity: 10,
	},
	shelter_ops: {
		label: "Shelter Operations & Mass Care",
		badgeColor: "text-purple-400",
		bg: "bg-purple-950/60",
		border: "border-purple-800/80",
		iconName: "Home",
		defaultCapacity: 12,
	},
	flood_sandbagging: {
		label: "Flood Mitigation & Sandbagging",
		badgeColor: "text-blue-400",
		bg: "bg-blue-950/60",
		border: "border-blue-800/80",
		iconName: "Waves",
		defaultCapacity: 12,
	},
	general_response: {
		label: "General Incident Strike Team",
		badgeColor: "text-slate-300",
		bg: "bg-slate-900",
		border: "border-slate-700",
		iconName: "Shield",
		defaultCapacity: 8,
	},
};

export const TASK_CATEGORY_METADATA: Record<
	TaskCategory,
	{ label: string; color: string; bg: string; border: string }
> = {
	search_rescue: {
		label: "Search & Rescue",
		color: "text-amber-400",
		bg: "bg-amber-950/50",
		border: "border-amber-800/60",
	},
	medical_aid: {
		label: "Medical & Triage",
		color: "text-rose-400",
		bg: "bg-rose-950/50",
		border: "border-rose-800/60",
	},
	food_distribution: {
		label: "Food & Water Dist",
		color: "text-emerald-400",
		bg: "bg-emerald-950/50",
		border: "border-emerald-800/60",
	},
	sandbagging: {
		label: "Sandbagging & Defense",
		color: "text-blue-400",
		bg: "bg-blue-950/50",
		border: "border-blue-800/60",
	},
	shelter_support: {
		label: "Shelter & Evac Care",
		color: "text-purple-400",
		bg: "bg-purple-950/50",
		border: "border-purple-800/60",
	},
	traffic_control: {
		label: "Traffic & Detour Aid",
		color: "text-yellow-400",
		bg: "bg-yellow-950/50",
		border: "border-yellow-800/60",
	},
	debris_clearing: {
		label: "Debris & Tree Removal",
		color: "text-orange-400",
		bg: "bg-orange-950/50",
		border: "border-orange-800/60",
	},
	recon: {
		label: "Aerial & Radio Recon",
		color: "text-teal-400",
		bg: "bg-teal-950/50",
		border: "border-teal-800/60",
	},
};

export const getStatusBadge = (status: VolunteerStatus) => {
	switch (status) {
		case "ready":
			return {
				label: "Ready for Dispatch",
				color: "text-emerald-400 bg-emerald-950/80 border-emerald-800",
			};
		case "deployed":
			return {
				label: "Active on Mission",
				color: "text-sky-400 bg-sky-950/80 border-sky-800",
			};
		case "on_break":
			return {
				label: "On Rest Break",
				color: "text-amber-400 bg-amber-950/80 border-amber-800",
			};
		case "offline":
			return {
				label: "Off-Duty",
				color: "text-slate-400 bg-slate-900 border-slate-700",
			};
	}
};

export const getTeamStatusBadge = (status: TeamStatus) => {
	switch (status) {
		case "standby":
			return {
				label: "Standby / Available",
				color: "text-emerald-400 bg-emerald-950/80 border-emerald-800",
			};
		case "dispatched":
			return {
				label: "Dispatched to Staging",
				color: "text-amber-400 bg-amber-950/80 border-amber-800",
			};
		case "active_mission":
			return {
				label: "Engaged in Mission",
				color: "text-rose-400 bg-rose-950/80 border-rose-800",
			};
		case "demobilized":
			return {
				label: "Demobilized",
				color: "text-slate-400 bg-slate-900 border-slate-700",
			};
	}
};

export const getTaskPriorityBadge = (priority: TaskPriority) => {
	switch (priority) {
		case "critical":
			return {
				label: "CRITICAL",
				color: "text-red-400 bg-red-950 border-red-800",
			};
		case "high":
			return {
				label: "HIGH",
				color: "text-orange-400 bg-orange-950 border-orange-800",
			};
		case "medium":
			return {
				label: "MEDIUM",
				color: "text-yellow-400 bg-yellow-950 border-yellow-800",
			};
		case "low":
			return {
				label: "LOW",
				color: "text-slate-400 bg-slate-900 border-slate-700",
			};
	}
};

export const getTaskStatusBadge = (status: TaskStatus) => {
	switch (status) {
		case "unassigned":
			return {
				label: "Unassigned",
				color: "text-amber-400 bg-amber-950/70 border-amber-800",
			};
		case "assigned":
			return {
				label: "Squad Assigned",
				color: "text-sky-400 bg-sky-950/70 border-sky-800",
			};
		case "in_progress":
			return {
				label: "In Progress",
				color: "text-purple-400 bg-purple-950/70 border-purple-800",
			};
		case "completed":
			return {
				label: "Mission Accomplished",
				color: "text-emerald-400 bg-emerald-950/70 border-emerald-800",
			};
		case "cancelled":
			return {
				label: "Cancelled",
				color: "text-slate-400 bg-slate-900 border-slate-700",
			};
	}
};
