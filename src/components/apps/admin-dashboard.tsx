import {
	Activity,
	Building,
	Clock,
	Flame,
	Search,
	ShieldCheck,
	TrendingUp,
	UserCheck,
	Users,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import type { Incident, IncidentStatus } from "#/types";
import { useDisasterStore } from "@/store/useDisasterStore";

interface AdminDashboardProps {
	onOpenAllocateModal: (incident: Incident) => void;
	onOpenAddDepotModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
	onOpenAllocateModal,
	onOpenAddDepotModal,
}) => {
	const {
		incidents,
		depots,
		currentUser,
		verifyIncident,
		updateIncidentStatus,
		setActiveTab,
	} = useDisasterStore();

	const [tableSearch, setTableSearch] = useState("");
	const [tableSeverityFilter, setTableSeverityFilter] = useState("all");
	const [tableStatusFilter, setTableStatusFilter] = useState("all");

	useEffect(() => {
		if (!["admin"].includes(currentUser.role)) {
			setActiveTab("feed");
		}
	}, [currentUser, setActiveTab]);

	const filteredIncidents = incidents.filter((inc) => {
		if (tableSearch.trim()) {
			const q = tableSearch.toLowerCase();
			if (
				!inc.title.toLowerCase().includes(q) &&
				!inc.location.address.toLowerCase().includes(q)
			) {
				return false;
			}
		}
		if (tableSeverityFilter !== "all" && inc.severity !== tableSeverityFilter)
			return false;
		if (tableStatusFilter !== "all" && inc.status !== tableStatusFilter)
			return false;
		return true;
	});

	const totalCasualties = incidents.reduce(
		(acc, i) => ({
			injured: acc.injured + i.casualties.injured,
			missing: acc.missing + i.casualties.missing,
			fatalities: acc.fatalities + i.casualties.fatalities,
		}),
		{ injured: 0, missing: 0, fatalities: 0 },
	);

	const totalAffected = incidents.reduce((sum, i) => sum + i.affectedCount, 0);

	return (
		<div className="space-y-6">
			{/* Command Operations Bar */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-card rounded-md border border-border">
				<div className="flex items-center space-x-2">
					<span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
					<span className="text-xs font-bold text-foreground capitalize tracking-wider tactical-tag">
						Strategic Command Grid Active
					</span>
					<span className="text-[11px] text-muted-foreground">
						• {depots.length} Bases & Shelters Online
					</span>
				</div>
				{onOpenAddDepotModal && (
					<Button
						size="sm"
						onClick={onOpenAddDepotModal}
						className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold capitalize tracking-wider text-xs h-8 rounded-sm shadow-sm cursor-pointer"
					>
						<Building className="h-3.5 w-3.5 mr-1.5" />
						Commission Shelter / Strategic Base
					</Button>
				)}
			</div>

			{/* Top Strategic KPIs */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
				<div className="rounded-md border border-border bg-card p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<span className="text-xs font-semibold text-muted-foreground capitalize tracking-wider tactical-tag">
							Total Impacted Citizens
						</span>
						<div className="p-1.5 rounded-sm bg-primary/10 text-primary border border-primary/20">
							<Users className="h-4 w-4" />
						</div>
					</div>
					<p className="text-2xl font-bold text-foreground mt-2">
						{totalAffected.toLocaleString()}
					</p>
					<div className="flex items-center space-x-1 text-[10px] text-primary mt-1">
						<TrendingUp className="h-3 w-3" />
						<span>96% EVACUATION COMPLIANCE</span>
					</div>
				</div>

				<div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<span className="text-xs font-bold text-destructive capitalize tracking-wider tactical-tag">
							Casualties / Injured
						</span>
						<div className="p-1.5 rounded-sm bg-destructive/20 text-destructive border border-destructive/30 animate-pulse">
							<Flame className="h-4 w-4" />
						</div>
					</div>
					<p className="text-2xl font-bold text-destructive mt-2">
						{totalCasualties.injured} Injured / {totalCasualties.missing}{" "}
						Missing
					</p>
					<span className="text-[10px] text-destructive/80 capitalize tracking-wide">
						All triage posts manned
					</span>
				</div>

				<div className="rounded-md border border-border bg-card p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<span className="text-xs font-semibold text-muted-foreground capitalize tracking-wider tactical-tag">
							Active Tactical Units
						</span>
						<div className="p-1.5 rounded-sm bg-secondary text-secondary-foreground border border-border">
							<Activity className="h-4 w-4" />
						</div>
					</div>
					<p className="text-2xl font-bold text-foreground mt-2">48 Teams</p>
					<span className="text-[10px] text-muted-foreground capitalize tracking-wide tactical-tag">
						USAR & Helitack Taskforces
					</span>
				</div>

				<div className="rounded-md border border-border bg-card p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<span className="text-xs font-semibold text-muted-foreground capitalize tracking-wider tactical-tag">
							Mean Dispatch Latency
						</span>
						<div className="p-1.5 rounded-sm bg-primary/10 text-primary border border-primary/20">
							<Clock className="h-4 w-4" />
						</div>
					</div>
					<p className="text-2xl font-bold text-primary mt-2">8.4 mins</p>
					<span className="text-[10px] text-primary/90 capitalize tracking-wide">
						FEMA Standard (&lt;10m)
					</span>
				</div>
			</div>

			{/* Master Incident Command Operations Table */}
			<Card className="border border-border bg-card shadow-sm overflow-hidden rounded-md">
				<CardHeader className="p-4 border-b border-border">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<div>
							<CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
								<ShieldCheck className="h-5 w-5 text-primary" />
								Master Incident Management & Verification Roster
							</CardTitle>
							<CardDescription className="text-xs text-muted-foreground">
								Real-time incident auditing, verification badges, triage
								escalation, and supply dispatch.
							</CardDescription>
						</div>
					</div>

					{/* Table Filters */}
					<div className="pt-3 flex flex-wrap gap-2 text-xs">
						<div className="relative flex-1 min-w-50">
							<Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
							<Input
								placeholder="Filter by title or address..."
								value={tableSearch}
								onChange={(e) => setTableSearch(e.target.value)}
								className="pl-8 text-xs h-8 bg-background border-border text-foreground rounded-sm"
							/>
						</div>
						<select
							value={tableSeverityFilter}
							onChange={(e) => setTableSeverityFilter(e.target.value)}
							className="h-8 rounded-sm border border-border bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:border-ring cursor-pointer"
						>
							<option value="all">All Severities</option>
							<option value="critical">Critical Only</option>
							<option value="high">High Severity</option>
							<option value="moderate">Moderate</option>
						</select>
						<select
							value={tableStatusFilter}
							onChange={(e) => setTableStatusFilter(e.target.value)}
							className="h-8 rounded-sm border border-border bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:border-ring cursor-pointer"
						>
							<option value="all">All Statuses</option>
							<option value="reported">Reported</option>
							<option value="verified">Verified</option>
							<option value="dispatched">Dispatched</option>
							<option value="in_progress">In Progress</option>
							<option value="contained">Contained</option>
							<option value="resolved">Resolved</option>
						</select>
					</div>
				</CardHeader>

				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<table className="w-full text-xs text-left">
							<thead className="bg-muted/60 text-muted-foreground capitalize font-bold text-[10px] tracking-wider border-b border-border tactical-tag">
								<tr>
									<th className="p-3">ID / Incident</th>
									<th className="p-3">Severity & Type</th>
									<th className="p-3">Reporter & Trust</th>
									<th className="p-3">Casualties / Affected</th>
									<th className="p-3">Status</th>
									<th className="p-3 text-right">Commander Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{filteredIncidents.map((incident) => {
									const isVerified =
										incident.reportedBy.isVerified ||
										incident.status === "verified";
									return (
										<tr
											key={incident.id}
											className="hover:bg-muted/40 transition-colors"
										>
											<td className="p-3">
												<div className="text-[10px] text-primary">
													{incident.id}
												</div>
												<div className="font-bold text-foreground text-xs line-clamp-1 max-w-xs">
													{incident.title}
												</div>
												<div className="text-[11px] text-muted-foreground truncate max-w-xs">
													{incident.location.address}
												</div>
											</td>

											<td className="p-3">
												<Badge
													variant={
														incident.severity === "critical"
															? "critical"
															: incident.severity === "high"
																? "high"
																: "moderate"
													}
													className="text-[10px]"
												>
													{incident.severity.toUpperCase()}
												</Badge>
												<div className="text-[10px] text-muted-foreground capitalize tracking-wider mt-0.5">
													{incident.type}
												</div>
											</td>

											<td className="p-3">
												<div className="flex items-center space-x-1 font-semibold text-foreground">
													<span>{incident.reportedBy.name}</span>
													{isVerified && (
														<UserCheck className="h-3.5 w-3.5 text-primary" />
													)}
												</div>
												<div className="text-[10px] text-muted-foreground">
													Trust: {incident.reportedBy.trustScore}% •{" "}
													{incident.corroborations} Confirms
												</div>
											</td>

											<td className="p-3">
												<div className="text-foreground font-semibold">
													{incident.affectedCount.toLocaleString()} impacted
												</div>
												<div className="text-[11px] text-amber-600 dark:text-amber-400">
													{incident.casualties.injured} Injured /{" "}
													{incident.casualties.missing} Missing
												</div>
											</td>

											<td className="p-3">
												<select
													value={incident.status}
													onChange={(e) =>
														updateIncidentStatus(
															incident.id,
															e.target.value as IncidentStatus,
														)
													}
													className="h-7 rounded-sm border border-border bg-background px-2 text-[11px] font-medium text-foreground cursor-pointer disabled:opacity-60 focus:outline-none focus:border-ring"
												>
													<option value="reported">Reported</option>
													<option value="investigating">Investigating</option>
													{!isVerified && (
														<option value="verified">Verified</option>
													)}
													<option value="dispatched">Dispatched</option>
													<option value="in_progress">In Progress</option>
													<option value="contained">Contained</option>
													<option value="resolved">Resolved</option>
												</select>
											</td>

											<td className="p-3 text-right">
												<div className="flex items-center justify-end space-x-1.5">
													{!isVerified && (
														<Button
															size="sm"
															variant="outline"
															onClick={() => verifyIncident(incident.id)}
															className="h-7 text-[10px] text-primary border-primary/40 bg-primary/10 hover:bg-primary/20 font-bold capitalize tracking-wider rounded-sm"
														>
															Verify
														</Button>
													)}
													<Button
														size="sm"
														onClick={() => onOpenAllocateModal(incident)}
														className="h-7 text-[10px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold capitalize tracking-wider rounded-sm"
													>
														Dispatch Supplies
													</Button>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
