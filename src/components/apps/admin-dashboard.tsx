import {
	Activity,
	Package,
	Search,
	ShieldCheck,
	UserCheck,
	Users,
	Trash2,
	Plus,
	FileText,
	Flame,
	TrendingUp
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import {
	Bar,
	CartesianGrid,
	ComposedChart,
	Line,
	XAxis,
	BarChart,
	Pie,
	PieChart
} from "recharts";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
		ChartLegend,
	ChartLegendContent,
} from "#/components/ui/chart";
import { Input } from "#/components/ui/input";
import { ANALYTICS_DATA } from "#/mockdata";
import { useDisasterStore } from "#/store/useDisasterStore";
import type { Incident, IncidentStatus, UserRole } from "#/types";
import { SystemOverviewSummary } from "./system-overview-summary";

interface AdminDashboardProps {
	onOpenAllocateModal: (incident: Incident) => void;
	onOpenAddDepotModal?: () => void;
}

const incidentTrendsConfig = {
	reports: {
		label: "Reports",
		color: "var(--chart-1)",
	},
	resolved: {
		label: "Resolved",
		color: "var(--chart-2)",
	},
	critical: {
		label: "Critical",
		color: "var(--destructive)",
	},
} satisfies ChartConfig;

const incidentTypeConfig = {
	active: {
		label: "Active",
		color: "var(--chart-1)",
	},
	resolved: {
		label: "Resolved",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

const liveSeverityConfig = {
	count: { label: "Count" },
	critical: {
		label: "Critical / Life Safety",
		color: "var(--destructive)",
	},
	priority: {
		label: "High Priority",
		color: "var(--chart-1)",
	},
	moderate: {
		label: "Moderate Advisory",
		color: "var(--chart-2)",
	},
	low: {
		label: "Low / Monitored",
		color: "var(--chart-4)",
	},
};

const resourceFulfillmentConfig = {
	requested: {
		label: "Requested Assets",
		color: "var(--chart-1)",
	},
	fulfilled: {
		label: "Fulfilled Assets",
		color: "var(--chart-2)",
	},
	rate: {
		label: "Fulfillment %",
		color: "var(--chart-3)",
	},
} as ChartConfig;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
	onOpenAllocateModal,
	onOpenAddDepotModal,
}) => {
	const {
		incidents,
		resources,
		depots,
		usersList,
		currentUser,
		verifyIncident,
		updateIncidentStatus,
		deleteIncident,
		updateUserRole,
		toggleUserVerification,
		deleteUser,
		deleteResource,
		addResourceStock,
		setIsAddResourceModalOpen,
	} = useDisasterStore();

	const [activeTab, setActiveTab] = useState<
		"overview" | "users" | "resources" | "incidents"
	>("overview");

	// Search & filters state
	const [incidentSearch, setIncidentSearch] = useState("");
	const [incidentSeverityFilter, setIncidentSeverityFilter] = useState("all");
	const [incidentStatusFilter, setIncidentStatusFilter] = useState("all");

	const [userSearch, setUserSearch] = useState("");
	const [userRoleFilter, setUserRoleFilter] = useState("all");

	const [resourceSearch, setResourceSearch] = useState("");
	const [resourceCategoryFilter, setResourceCategoryFilter] = useState("all");

	// Filtered incidents
	const filteredIncidents = incidents.filter((inc) => {
		if (incidentSearch.trim()) {
			const q = incidentSearch.toLowerCase();
			if (
				!inc.title.toLowerCase().includes(q) &&
				!inc.location.address.toLowerCase().includes(q) &&
				!inc.reportedBy.name.toLowerCase().includes(q)
			) {
				return false;
			}
		}
		if (
			incidentSeverityFilter !== "all" &&
			inc.severity !== incidentSeverityFilter
		)
			return false;
		if (incidentStatusFilter !== "all" && inc.status !== incidentStatusFilter)
			return false;
		return true;
	});

	// Filtered users
	const filteredUsers = usersList.filter((u) => {
		if (userSearch.trim()) {
			const q = userSearch.toLowerCase();
			if (
				!u.name.toLowerCase().includes(q) &&
				!u.email.toLowerCase().includes(q) &&
				!u.organization?.toLowerCase().includes(q)
			) {
				return false;
			}
		}
		if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
		return true;
	});

	// Filtered resources
	const filteredResources = resources.filter((res) => {
		if (resourceSearch.trim()) {
			const q = resourceSearch.toLowerCase();
			if (
				!res.name.toLowerCase().includes(q) &&
				!res.depotName.toLowerCase().includes(q)
			) {
				return false;
			}
		}
		if (
			resourceCategoryFilter !== "all" &&
			res.category !== resourceCategoryFilter
		)
			return false;
		return true;
	});

	const liveSeverityData = useMemo(() => {
		const counts = { critical: 0, high: 0, moderate: 0, low: 0 };
		incidents.forEach((i) => {
			if (counts[i.severity] !== undefined) counts[i.severity]++;
		});
		return [
			{
				name: "Critical / Life Safety",
				count: counts.critical,
				fill: "var(--destructive)",
				severity: "critical",
			},
			{
				name: "High Priority",
				count: counts.high,
				fill: "var(--chart-1)",
				severity: "priority",
			},
			{
				name: "Moderate Advisory",
				count: counts.moderate,
				fill: "var(--chart-2)",
				severity: "moderate",
			},
			{
				name: "Low / Monitored",
				count: counts.low,
				fill: "var(--chart-4)",
				severity: "low",
			},
		];
	}, [incidents]);

	return (
		<div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
			{/* Admin Header Banner */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-xl shadow-sm relative overflow-hidden">
				<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-primary" />
				<div className="space-y-1">
					<div className="flex items-center space-x-2">
						<div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive uppercase tracking-wider border border-destructive/20">
							Operations Command Center
						</div>
						<span className="text-xs text-muted-foreground">
							Commander: {currentUser?.name || "Authorized Admin"}
						</span>
					</div>
					<h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
						Master Administration Panel
					</h1>
					<p className="text-xs text-muted-foreground">
						Complete operational oversight and management for users, emergency
						stockpiles, and crowdsourced disaster reports.
					</p>
				</div>
				<div className="flex items-center space-x-2 shrink-0">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsAddResourceModalOpen(true)}
						className="text-xs font-bold border-border bg-secondary/50 hover:bg-secondary text-foreground"
					>
						<Plus className="size-3.5 mr-1.5" />
						Add Resource Supply
					</Button>
					{onOpenAddDepotModal && (
						<Button
							variant="outline"
							size="sm"
							onClick={onOpenAddDepotModal}
							className="text-xs font-bold border-border bg-secondary/50 hover:bg-secondary text-foreground"
						>
							<Package className="size-3.5 mr-1.5" />
							Register Depot
						</Button>
					)}
				</div>
			</div>

			{/* Navigation Tabs */}
			<div className="flex items-center space-x-2 border-b border-border pb-3 overflow-x-auto">
				<button
					type="button"
					onClick={() => setActiveTab("overview")}
					className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 cursor-pointer transition-colors ${
						activeTab === "overview"
							? "bg-primary text-primary-foreground shadow-sm"
							: "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
					}`}
				>
					<Activity className="size-4" />
					<span>Overview & Analytics</span>
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("incidents")}
					className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 cursor-pointer transition-colors ${
						activeTab === "incidents"
							? "bg-primary text-primary-foreground shadow-sm"
							: "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
					}`}
				>
					<FileText className="size-4" />
					<span>Disaster Reports ({incidents.length})</span>
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("resources")}
					className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 cursor-pointer transition-colors ${
						activeTab === "resources"
							? "bg-primary text-primary-foreground shadow-sm"
							: "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
					}`}
				>
					<Package className="size-4" />
					<span>Resources & Depots ({resources.length})</span>
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("users")}
					className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 cursor-pointer transition-colors ${
						activeTab === "users"
							? "bg-primary text-primary-foreground shadow-sm"
							: "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
					}`}
				>
					<Users className="size-4" />
					<span>User Accounts ({usersList.length})</span>
				</button>
			</div>

			{/* TAB 1: OVERVIEW & ANALYTICS */}
			{activeTab === "overview" && (
				<div className="space-y-6 animate-in fade-in-50">
					{/* Comprehensive System Overview Summary Component */}
					<SystemOverviewSummary
						users={usersList}
						incidents={incidents}
						resources={resources}
						depots={depots}
					/>

					{/* Quick Stats Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card className="border border-border bg-card">
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider tactical-tag">
									Total Incidents
								</CardTitle>
								<Activity className="h-4 w-4 text-destructive" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-extrabold text-foreground">
									{incidents.length}
								</div>
								<p className="text-[11px] text-muted-foreground mt-1">
									{
										incidents.filter(
											(i) => i.status !== "resolved" && i.status !== "contained",
										).length
									}{" "}
									active crisis feeds
								</p>
							</CardContent>
						</Card>

						<Card className="border border-border bg-card">
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider tactical-tag">
									Registered Users
								</CardTitle>
								<Users className="h-4 w-4 text-primary" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-extrabold text-foreground">
									{usersList.length}
								</div>
								<p className="text-[11px] text-muted-foreground mt-1">
									{usersList.filter((u) => u.isVerified).length} verified first
									responders & citizens
								</p>
							</CardContent>
						</Card>

						<Card className="border border-border bg-card">
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider tactical-tag">
									Emergency Stockpiles
								</CardTitle>
								<Package className="h-4 w-4 text-amber-500" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-extrabold text-foreground">
									{resources.length} item types
								</div>
								<p className="text-[11px] text-muted-foreground mt-1">
									Distributed across {depots.length} regional depots
								</p>
							</CardContent>
						</Card>

						<Card className="border border-border bg-card">
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider tactical-tag">
									System Integrity
								</CardTitle>
								<ShieldCheck className="h-4 w-4 text-emerald-500" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-extrabold text-emerald-500">
									Secure
								</div>
								<p className="text-[11px] text-muted-foreground mt-1">
									Role-Based Access Control active
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Charts Section */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card className="border border-border bg-card">
							<CardHeader>
								<CardTitle className="text-sm font-bold">
									Disaster Incident Trends (7-Day Simulation)
								</CardTitle>
								<CardDescription className="text-xs">
									Volume of incoming citizen reports vs resolved crisis incidents.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ChartContainer
									config={incidentTrendsConfig}
									className="h-[260px] w-full"
								>
									<ComposedChart data={ANALYTICS_DATA.incidentTrends}>
										<CartesianGrid
											strokeDasharray="3 3"
											stroke="var(--border)"
										/>
										<XAxis dataKey="day" stroke="var(--muted-foreground)" />
										<ChartTooltip content={<ChartTooltipContent />} />
										<Bar
											dataKey="reports"
											fill="var(--chart-1)"
											radius={[4, 4, 0, 0]}
										/>
										<Line
											type="monotone"
											dataKey="resolved"
											stroke="var(--chart-2)"
											strokeWidth={2}
										/>
									</ComposedChart>
								</ChartContainer>
							</CardContent>
						</Card>

						<Card className="border border-border bg-card">
							<CardHeader>
								<CardTitle className="text-sm font-bold">
									Active Incidents by Severity
								</CardTitle>
								<CardDescription className="text-xs">
									Proportional breakdown of current crisis severity levels.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3 pt-2">
									{liveSeverityData.map((item) => (
										<div key={item.name} className="space-y-1">
											<div className="flex justify-between text-xs">
												<span className="font-bold text-foreground">
													{item.name}
												</span>
												<span className="font-extrabold text-foreground">
													{item.count} incidents
												</span>
											</div>
											<div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
												<div
													className="h-full rounded-full transition-all duration-500"
													style={{
														width: `${incidents.length > 0 ? (item.count / incidents.length) * 100 : 0}%`,
														backgroundColor: item.fill,
													}}
												/>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Analytics Charts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
				{/* Chart 1: Incident Trends Over Time (Area Chart) */}
				<Card className="border border-border bg-card shadow-sm rounded-md">
					<CardHeader className="p-4 pb-2">
						<CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
							<TrendingUp className="h-4 w-4 text-primary" />
							Incident Velocity & Resolution Curve (Hourly)
						</CardTitle>
						<CardDescription className="text-xs text-muted-foreground">
							Live incoming emergency reports vs field containment & resolution
							rates
						</CardDescription>
					</CardHeader>
					<CardContent className="p-4">
						<div className="w-full">
							<ChartContainer config={incidentTrendsConfig}>
								<BarChart
									accessibilityLayer
									data={ANALYTICS_DATA.hourlyIncidentTrends}
								>
									<CartesianGrid vertical={false} />
									<XAxis
										dataKey="time"
										tickLine={false}
										axisLine={false}
										tickMargin={8}
									/>
									<ChartTooltip
										content={<ChartTooltipContent indicator="line" />}
									/>
									<Bar dataKey="reports" fill="var(--chart-1)" radius={4} />
									<Bar dataKey="resolved" fill="var(--chart-2)" radius={4} />
									<Bar
										dataKey="critical"
										fill="var(--destructive)"
										radius={4}
									/>
									<ChartLegend content={<ChartLegendContent />} />
								</BarChart>
							</ChartContainer>
						</div>
					</CardContent>
				</Card>

				{/* Chart 2: Incident Severity Distribution (Donut Chart) */}
				<Card className="border border-border bg-card shadow-sm rounded-md">
					<CardHeader className="p-4 pb-2">
						<CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
							<Flame className="h-4 w-4 text-destructive" />
							Incident Severity Breakdown
						</CardTitle>
						<CardDescription className="text-xs text-muted-foreground">
							Distribution of monitored hazards by threat tier and civilian
							life-safety
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="w-full">
							<ChartContainer
								config={liveSeverityConfig}
								className="mx-auto aspect-square h-80"
							>
								<PieChart>
									<Pie data={liveSeverityData} dataKey={"count"} />
									<ChartTooltip
										cursor={false}
										content={<ChartTooltipContent indicator="line" />}
									/>
									<ChartLegend
										content={<ChartLegendContent nameKey="severity" />}
										className="flex flex-wrap justify-center items-center"
									/>
								</PieChart>
							</ChartContainer>
						</div>
					</CardContent>
				</Card>

				{/* Chart 3: Disasters by Category (Bar Chart) */}
				<Card className="border border-border bg-card shadow-sm rounded-md">
					<CardHeader className="p-4 pb-2">
						<CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
							<Activity className="h-4 w-4 text-primary" />
							Hazard Incidents by Type
						</CardTitle>
						<CardDescription className="text-xs text-muted-foreground">
							Active response status vs contained across disaster
							classifications
						</CardDescription>
					</CardHeader>
					<CardContent className="p-4">
						<div className="w-full">
							<ChartContainer config={incidentTypeConfig}>
								<BarChart
									accessibilityLayer
									data={ANALYTICS_DATA.incidentByType}
								>
									<CartesianGrid vertical={false} />
									<XAxis
										dataKey={"type"}
										tickLine={false}
										tickMargin={10}
										axisLine={false}
									/>
									<ChartTooltip content={<ChartTooltipContent />} />
									<Bar dataKey="active" fill="var(--chart-1)" radius={4} />
									<Bar dataKey="resolved" fill="var(--chart-2)" radius={4} />
									<ChartLegend content={<ChartLegendContent />} />
								</BarChart>
							</ChartContainer>
						</div>
					</CardContent>
				</Card>

				{/* Chart 4: Resource Fulfillment by Response Sector (Composed Bar & Line) */}
				<Card className="border border-border bg-card shadow-sm rounded-md">
					<CardHeader className="p-4 pb-2">
						<CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
							<Package className="h-4 w-4 text-primary" />
							Emergency Resource Fulfillment by Sector
						</CardTitle>
						<CardDescription className="text-xs text-muted-foreground">
							Requested supplies vs dispatched & delivered across tactical
							sectors
						</CardDescription>
					</CardHeader>
					<CardContent className="p-4">
						<div className="w-full">
							<ChartContainer config={resourceFulfillmentConfig}>
								<ComposedChart
									data={ANALYTICS_DATA.resourceFulfillmentBySector}
								>
									<CartesianGrid vertical={false} />
									<XAxis
										dataKey="sector"
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										fontSize={11}
									/>
									<ChartTooltip content={<ChartTooltipContent />} />
									<ChartLegend content={<ChartLegendContent />} />
									<Bar
										yAxisId="left"
										dataKey="requested"
										name="Requested Assets"
										radius={4}
										fill="var(--chart-1)"
									/>
									<Bar
										yAxisId="left"
										dataKey="fulfilled"
										name="Fulfilled Assets"
										radius={4}
										fill="var(--chart-2)"
									/>
									<Line
										yAxisId="right"
										dataKey="rate"
										name="Fulfillment %"
										strokeWidth={3}
										stroke="var(--chart-3)"
									/>
								</ComposedChart>
							</ChartContainer>
						</div>
					</CardContent>
				</Card>
			</div>
				</div>
			)}

			{/* TAB 2: DISASTER REPORTS MANAGEMENT */}
			{activeTab === "incidents" && (
				<div className="space-y-4 animate-in fade-in-50">
					<Card className="border border-border bg-card">
						<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
							<div>
								<CardTitle className="text-base font-bold">
									Disaster Reports Management
								</CardTitle>
								<CardDescription className="text-xs">
									Review, verify, update status, or remove incident reports
									submitted by users.
								</CardDescription>
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<div className="relative">
									<Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
									<Input
										placeholder="Search reports or locations..."
										value={incidentSearch}
										onChange={(e) => setIncidentSearch(e.target.value)}
										className="pl-8 h-9 text-xs w-[220px] bg-secondary/50 border-border"
									/>
								</div>

								<select
									value={incidentSeverityFilter}
									onChange={(e) => setIncidentSeverityFilter(e.target.value)}
									className="h-9 rounded-md border border-border bg-secondary/50 px-2.5 text-xs text-foreground font-medium"
								>
									<option value="all">All Severities</option>
									<option value="critical">Critical</option>
									<option value="high">High</option>
									<option value="moderate">Moderate</option>
									<option value="low">Low</option>
								</select>

								<select
									value={incidentStatusFilter}
									onChange={(e) => setIncidentStatusFilter(e.target.value)}
									className="h-9 rounded-md border border-border bg-secondary/50 px-2.5 text-xs text-foreground font-medium"
								>
									<option value="all">All Statuses</option>
									<option value="reported">Reported</option>
									<option value="investigating">Investigating</option>
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
											<th className="p-3">ID / Title</th>
											<th className="p-3">Severity / Type</th>
											<th className="p-3">Submitted By</th>
											<th className="p-3">Impact</th>
											<th className="p-3">Status</th>
											<th className="p-3 text-right">Actions</th>
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
														<div className="text-[10px] text-primary font-mono">
															{incident.id}
														</div>
														<div className="font-bold text-foreground text-xs line-clamp-1">
															{incident.title}
														</div>
														<div className="text-[10px] text-muted-foreground truncate max-w-xs">
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
														<div className="text-[10px] text-muted-foreground capitalize mt-0.5">
															{incident.type}
														</div>
													</td>

													<td className="p-3">
														<div className="font-semibold text-foreground flex items-center space-x-1">
															<span>{incident.reportedBy.name}</span>
															{isVerified && (
																<UserCheck className="size-3.5 text-primary" />
															)}
														</div>
														<div className="text-[10px] text-muted-foreground">
															Trust: {incident.reportedBy.trustScore}%
														</div>
													</td>

													<td className="p-3">
														<div className="font-medium text-foreground">
															{incident.affectedCount.toLocaleString()} impacted
														</div>
														<div className="text-[10px] text-amber-500">
															{incident.casualties.injured} Injured /{" "}
															{incident.casualties.fatalities} Fatalities
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
															className="h-7 rounded border border-border bg-background px-2 text-[11px] font-medium text-foreground cursor-pointer"
														>
															<option value="reported">Reported</option>
															<option value="investigating">Investigating</option>
															<option value="verified">Verified</option>
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
																	className="h-7 text-[10px] text-primary border-primary/40 bg-primary/10 hover:bg-primary/20 font-bold"
																>
																	Verify
																</Button>
															)}
															<Button
																size="sm"
																onClick={() => onOpenAllocateModal(incident)}
																className="h-7 text-[10px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
															>
																Dispatch
															</Button>
															<Button
																size="sm"
																variant="destructive"
																onClick={() => {
																	if (
																		confirm(
																			`Are you sure you want to delete incident report ${incident.id}?`,
																		)
																	) {
																		deleteIncident(incident.id);
																	}
																}}
																className="h-7 w-7 p-0"
															>
																<Trash2 className="size-3.5" />
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
			)}

			{/* TAB 3: RESOURCE MANAGEMENT */}
			{activeTab === "resources" && (
				<div className="space-y-4 animate-in fade-in-50">
					<Card className="border border-border bg-card">
						<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
							<div>
								<CardTitle className="text-base font-bold">
									Emergency Resource Stockpiles & Depots
								</CardTitle>
								<CardDescription className="text-xs">
									Manage emergency stockpiles, restock quantities, or remove items.
								</CardDescription>
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<div className="relative">
									<Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
									<Input
										placeholder="Search resources or depots..."
										value={resourceSearch}
										onChange={(e) => setResourceSearch(e.target.value)}
										className="pl-8 h-9 text-xs w-[220px] bg-secondary/50 border-border"
									/>
								</div>

								<select
									value={resourceCategoryFilter}
									onChange={(e) => setResourceCategoryFilter(e.target.value)}
									className="h-9 rounded-md border border-border bg-secondary/50 px-2.5 text-xs text-foreground font-medium"
								>
									<option value="all">All Categories</option>
									<option value="medical">Medical & Trauma</option>
									<option value="water_food">Water & Food</option>
									<option value="shelter_bedding">Shelter & Bedding</option>
									<option value="rescue_gear">Rescue Gear</option>
									<option value="power_fuel">Power & Fuel</option>
								</select>
							</div>
						</CardHeader>

						<CardContent className="p-0">
							<div className="overflow-x-auto">
								<table className="w-full text-xs text-left">
									<thead className="bg-muted/60 text-muted-foreground capitalize font-bold text-[10px] tracking-wider border-b border-border tactical-tag">
										<tr>
											<th className="p-3">Resource Item</th>
											<th className="p-3">Category</th>
											<th className="p-3">Depot Location</th>
											<th className="p-3">Stock Quantities</th>
											<th className="p-3">Status</th>
											<th className="p-3 text-right">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{filteredResources.map((resource) => (
											<tr
												key={resource.id}
												className="hover:bg-muted/40 transition-colors"
											>
												<td className="p-3">
													<div className="font-bold text-foreground text-xs">
														{resource.name}
													</div>
													<div className="text-[10px] text-muted-foreground">
														Officer: {resource.contactOfficer}
													</div>
												</td>

												<td className="p-3">
													<Badge variant="secondary" className="capitalize text-[10px]">
														{resource.category.replace("_", " ")}
													</Badge>
												</td>

												<td className="p-3">
													<div className="font-semibold text-foreground">
														{resource.depotName}
													</div>
													<div className="text-[10px] text-muted-foreground truncate max-w-xs">
														{resource.depotLocation.address}
													</div>
												</td>

												<td className="p-3">
													<div className="font-bold text-foreground">
														{resource.availableQuantity.toLocaleString()} /{" "}
														{resource.totalQuantity.toLocaleString()} {resource.unit}
													</div>
													<div className="text-[10px] text-muted-foreground">
														Allocated: {resource.allocatedQuantity} {resource.unit}
													</div>
												</td>

												<td className="p-3">
													<Badge
														variant={
															resource.status === "optimal"
																? "verified"
																: resource.status === "low_stock"
																	? "high"
																	: "critical"
														}
														className="capitalize text-[10px]"
													>
														{resource.status.replace("_", " ")}
													</Badge>
												</td>

												<td className="p-3 text-right">
													<div className="flex items-center justify-end space-x-1.5">
														<Button
															size="sm"
															variant="outline"
															onClick={() => {
																const qty = prompt(
																	`Enter quantity to restock for ${resource.name}:`,
																	"500",
																);
																if (qty && !Number.isNaN(Number(qty))) {
																	addResourceStock(resource.id, Number(qty));
																}
															}}
															className="h-7 text-[10px] font-bold"
														>
															Restock
														</Button>
														<Button
															size="sm"
															variant="destructive"
															onClick={() => {
																if (
																	confirm(
																		`Are you sure you want to delete resource item "${resource.name}"?`,
																	)
																) {
																	deleteResource(resource.id);
																}
															}}
															className="h-7 w-7 p-0"
														>
															<Trash2 className="size-3.5" />
														</Button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* TAB 4: USER MANAGEMENT */}
			{activeTab === "users" && (
				<div className="space-y-4 animate-in fade-in-50">
					<Card className="border border-border bg-card">
						<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
							<div>
								<CardTitle className="text-base font-bold">
									User Account & Clearance Management
								</CardTitle>
								<CardDescription className="text-xs">
									Manage registered users, assign roles (Admin, Responder, Verified
									Citizen), verify accounts, or remove users.
								</CardDescription>
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<div className="relative">
									<Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
									<Input
										placeholder="Search users by name or email..."
										value={userSearch}
										onChange={(e) => setUserSearch(e.target.value)}
										className="pl-8 h-9 text-xs w-[220px] bg-secondary/50 border-border"
									/>
								</div>

								<select
									value={userRoleFilter}
									onChange={(e) => setUserRoleFilter(e.target.value)}
									className="h-9 rounded-md border border-border bg-secondary/50 px-2.5 text-xs text-foreground font-medium"
								>
									<option value="all">All Roles</option>
									<option value="admin">Admin</option>
									<option value="responder">Responder</option>
									<option value="verified_citizen">Verified Citizen</option>
									<option value="citizen">Citizen</option>
								</select>
							</div>
						</CardHeader>

						<CardContent className="p-0">
							<div className="overflow-x-auto">
								<table className="w-full text-xs text-left">
									<thead className="bg-muted/60 text-muted-foreground capitalize font-bold text-[10px] tracking-wider border-b border-border tactical-tag">
										<tr>
											<th className="p-3">User / Email</th>
											<th className="p-3">Badge & Organization</th>
											<th className="p-3">Access Role</th>
											<th className="p-3">Trust Score</th>
											<th className="p-3">Verification</th>
											<th className="p-3 text-right">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{filteredUsers.map((user) => (
											<tr
												key={user.id}
												className="hover:bg-muted/40 transition-colors"
											>
												<td className="p-3">
													<div className="flex items-center space-x-2">
														<img
															src={user.avatar}
															alt={user.name}
															className="size-7 rounded-full object-cover border border-border"
														/>
														<div>
															<div className="font-bold text-foreground text-xs">
																{user.name}
															</div>
															<div className="text-[10px] text-muted-foreground font-mono">
																{user.email}
															</div>
														</div>
													</div>
												</td>

												<td className="p-3">
													<div className="font-medium text-foreground">
														{user.badgeTitle}
													</div>
													<div className="text-[10px] text-muted-foreground">
														{user.organization || "Independent"}
													</div>
												</td>

												<td className="p-3">
													<select
														value={user.role}
														onChange={(e) =>
															updateUserRole(
																user.id,
																e.target.value as UserRole,
															)
														}
														className="h-7 rounded border border-border bg-background px-2 text-[11px] font-medium text-foreground cursor-pointer"
													>
														<option value="admin">Admin</option>
														<option value="responder">Responder</option>
														<option value="verified_citizen">
															Verified Citizen
														</option>
														<option value="citizen">Citizen</option>
													</select>
												</td>

												<td className="p-3">
													<div className="font-bold text-foreground">
														{user.trustScore}%
													</div>
												</td>

												<td className="p-3">
													<button
														type="button"
														onClick={() => toggleUserVerification(user.id)}
														className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
															user.isVerified
																? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
																: "bg-secondary text-muted-foreground border border-border"
														}`}
													>
														{user.isVerified ? "Verified" : "Unverified"}
													</button>
												</td>

												<td className="p-3 text-right">
													<div className="flex items-center justify-end space-x-1.5">
														<Button
															size="sm"
															variant="destructive"
															disabled={user.id === currentUser?.id}
															onClick={() => {
																if (
																	confirm(
																		`Are you sure you want to delete user account ${user.name}?`,
																	)
																) {
																	deleteUser(user.id);
																}
															}}
															className="h-7 w-7 p-0"
														>
															<Trash2 className="size-3.5" />
														</Button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
};
