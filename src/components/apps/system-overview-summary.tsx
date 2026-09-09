import type React from "react";
import { Users, Activity, Package, ShieldCheck, AlertTriangle, Layers, Building } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { Badge } from "#/components/ui/badge";
import type { User, Incident, EmergencyResource, Depot } from "#/types";

interface SystemOverviewSummaryProps {
	users: User[];
	incidents: Incident[];
	resources: EmergencyResource[];
	depots: Depot[];
}

export const SystemOverviewSummary: React.FC<SystemOverviewSummaryProps> = ({
	users,
	incidents,
	resources,
	depots,
}) => {
	const activeIncidents = incidents.filter(
		(i) => i.status !== "resolved" && i.status !== "contained",
	);
	const criticalIncidents = activeIncidents.filter(
		(i) => i.severity === "critical",
	);

	const totalStockUnits = resources.reduce(
		(sum, r) => sum + r.availableQuantity,
		0,
	);
	const totalCapacity = resources.reduce((sum, r) => sum + r.totalQuantity, 0);

	const verifiedUsersCount = users.filter((u) => u.isVerified).length;
	const respondersCount = users.filter(
		(u) => u.role === "admin" || u.role === "responder" || u.role === "verified_citizen",
	).length;

	return (
		<Card className="border border-border bg-card shadow-sm overflow-hidden relative">
			<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-amber-500 to-emerald-500" />
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-base font-extrabold flex items-center space-x-2">
							<Layers className="size-5 text-primary" />
							<span>System Overview & Key Operational Metrics</span>
						</CardTitle>
						<CardDescription className="text-xs">
							Real-time synthesized status of user accounts, active crisis reports, and emergency resource inventories.
						</CardDescription>
					</div>
					<Badge variant="verified" className="text-xs font-bold">
						System Operational
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* 3 Main Metric Pillars */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Pillar 1: Users */}
					<div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
								<Users className="size-4 text-primary" />
								<span>User Accounts</span>
							</span>
							<Badge variant="secondary" className="text-[10px] font-bold">
								{users.length} Total
							</Badge>
						</div>
						<div className="flex items-baseline justify-between">
							<div className="text-3xl font-extrabold text-foreground">
								{users.length}
							</div>
							<div className="text-[11px] text-muted-foreground text-right">
								<span className="font-bold text-emerald-500">{verifiedUsersCount}</span> verified / <span className="font-bold text-primary">{respondersCount}</span> responders
							</div>
						</div>
						<div className="w-full bg-background h-2 rounded-full overflow-hidden border border-border">
							<div
								className="bg-primary h-full rounded-full transition-all"
								style={{
									width: `${users.length > 0 ? (verifiedUsersCount / users.length) * 100 : 0}%`,
								}}
							/>
						</div>
					</div>

					{/* Pillar 2: Active Incidents */}
					<div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
								<Activity className="size-4 text-destructive" />
								<span>Disaster Reports</span>
							</span>
							<Badge variant="destructive" className="text-[10px] font-bold">
								{activeIncidents.length} Active
							</Badge>
						</div>
						<div className="flex items-baseline justify-between">
							<div className="text-3xl font-extrabold text-foreground">
								{incidents.length}
							</div>
							<div className="text-[11px] text-muted-foreground text-right">
								<span className="font-bold text-destructive">{criticalIncidents.length}</span> critical / <span className="font-bold text-foreground">{incidents.filter(i => i.status === "resolved").length}</span> resolved
							</div>
						</div>
						<div className="w-full bg-background h-2 rounded-full overflow-hidden border border-border">
							<div
								className="bg-destructive h-full rounded-full transition-all"
								style={{
									width: `${incidents.length > 0 ? (activeIncidents.length / incidents.length) * 100 : 0}%`,
								}}
							/>
						</div>
					</div>

					{/* Pillar 3: Resource Inventory */}
					<div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
								<Package className="size-4 text-amber-500" />
								<span>Resource Inventory</span>
							</span>
							<Badge variant="amber" className="text-[10px] font-bold">
								{resources.length} Stockpiles
							</Badge>
						</div>
						<div className="flex items-baseline justify-between">
							<div className="text-3xl font-extrabold text-foreground">
								{totalStockUnits.toLocaleString()}
							</div>
							<div className="text-[11px] text-muted-foreground text-right">
								Across <span className="font-bold text-foreground">{depots.length}</span> regional depots
							</div>
						</div>
						<div className="w-full bg-background h-2 rounded-full overflow-hidden border border-border">
							<div
								className="bg-amber-500 h-full rounded-full transition-all"
								style={{
									width: `${totalCapacity > 0 ? (totalStockUnits / totalCapacity) * 100 : 75}%`,
								}}
							/>
						</div>
					</div>
				</div>

				{/* Quick Health Summary Grid */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
					<div className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-background/50">
						<div className="p-2 rounded-md bg-emerald-500/10 text-emerald-500">
							<ShieldCheck className="size-4" />
						</div>
						<div>
							<div className="text-[10px] text-muted-foreground uppercase font-bold">Security</div>
							<div className="text-xs font-extrabold text-foreground">RBAC Enforced</div>
						</div>
					</div>

					<div className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 bg-background/50">
						<div className="p-2 rounded-md bg-primary/10 text-primary">
							<Users className="size-4" />
						</div>
						<div>
							<div className="text-[10px] text-muted-foreground uppercase font-bold">Responders</div>
							<div className="text-xs font-extrabold text-foreground">{users.filter(u => u.role === "responder" || u.role === "admin").length} Active Leaders</div>
						</div>
					</div>

					<div className="flex items-center space-x-3 p-3 rounded-lg border border-destructive/20 bg-background/50">
						<div className="p-2 rounded-md bg-destructive/10 text-destructive">
							<AlertTriangle className="size-4" />
						</div>
						<div>
							<div className="text-[10px] text-muted-foreground uppercase font-bold">Critical Alerts</div>
							<div className="text-xs font-extrabold text-foreground">{criticalIncidents.length} Pending Dispatch</div>
						</div>
					</div>

					<div className="flex items-center space-x-3 p-3 rounded-lg border border-amber-500/20 bg-background/50">
						<div className="p-2 rounded-md bg-amber-500/10 text-amber-500">
							<Building className="size-4" />
						</div>
						<div>
							<div className="text-[10px] text-muted-foreground uppercase font-bold">Logistics Hubs</div>
							<div className="text-xs font-extrabold text-foreground">{depots.length} Depots Online</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
