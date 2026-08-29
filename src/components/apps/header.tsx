import {
	BarChart3,
	Check,
	ChevronDown,
	MapPin,
	Package,
	PlusCircle,
	Radio,
	RotateCcw,
	UserCheck,
	Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { useDisasterStore } from "#/store/useDisasterStore";
import type { ActiveTab, UserRole } from "#/types";

interface HeaderProps {
	onOpenReportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenReportModal }) => {
	const {
		currentUser,
		usersList,
		switchUserRole,
		activeTab,
		setActiveTab,
		incidents,
		safetyAlerts,
		volunteerTasks,
		resetAllData,
	} = useDisasterStore();

	const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

	const activeAlertsCount = safetyAlerts.filter((a) => a.active).length;
	const criticalIncidentsCount = incidents.filter(
		(i) => i.severity === "critical" && i.status !== "resolved",
	).length;
	const activeTasksCount = volunteerTasks.filter(
		(t) => t.status === "in_progress" || t.status === "assigned",
	).length;

	const navItems: {
		id: ActiveTab;
		label: string;
		icon: React.ReactNode;
		badge?: number;
	}[] = [
		{
			id: "feed",
			label: "Incident Feed",
			icon: <Radio className="h-4 w-4" />,
			badge: incidents.filter((i) => i.status !== "resolved").length,
		},
		{
			id: "map",
			label: "Safety Map",
			icon: <MapPin className="h-4 w-4" />,
			badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
		},
		{
			id: "resources",
			label: "Resource Management",
			icon: <Package className="h-4 w-4" />,
		},
		{
			id: "volunteers",
			label: "Volunteer Portal",
			icon: <Users className="h-4 w-4" />,
			badge: activeTasksCount > 0 ? activeTasksCount : undefined,
		},
		{
			id: "admin",
			label: "Admin Command",
			icon: <BarChart3 className="h-4 w-4" />,
			badge: criticalIncidentsCount > 0 ? criticalIncidentsCount : undefined,
		},
	];

	const getRoleBadgeVariant = (role: UserRole) => {
		switch (role) {
			case "admin":
				return "destructive";
			case "responder":
				return "high";
			case "verified_citizen":
				return "verified";
			default:
				return "secondary";
		}
	};

	return (
		<header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
			{/* Main Header Nav */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16 gap-4">
					{/* Logo & Brand Identity */}
					<button
						type="button"
						onClick={() => setActiveTab("feed")}
						className="flex items-center space-x-3 cursor-pointer group select-none shrink-0"
					>
						<img src="/favicon.svg" alt="logo" className="size-7 rounded-md" />
						<div>
							<div className="flex items-center space-x-2">
								<span className="font-bold text-sm hidden sm:block sm:text-base tracking-wide text-foreground tactical-tag">
									DISASTER GUARD
								</span>
								<span className="font-bold text-sm sm:text-base block sm:hidden tracking-wide text-foreground tactical-tag">
									DG
								</span>
							</div>
						</div>
					</button>

					{/* Utility Controls & Action CTAs & Role Switcher */}
					<div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
						{/* Reset Data Button */}
						<button
							type="button"
							onClick={() => {
								if (
									window.confirm(
										"Reset all disaster incidents, volunteer squads, and logistics data to defaults?",
									)
								) {
									resetAllData();
								}
							}}
							title="Reset state to initial defaults"
							className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-[11px] border border-border bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border transition-colors cursor-pointer"
						>
							<RotateCcw className="h-3.5 w-3.5" />
							<span className="hidden xl:inline capitalize font-bold text-[10px]">
								Reset
							</span>
						</button>

						{/* Quick Report CTA */}
						<Button
							onClick={onOpenReportModal}
							className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-bold capitalize tracking-wider flex items-center space-x-1.5 text-xs px-3 sm:px-4 shadow-md border border-primary/50 cursor-pointer h-9"
						>
							<PlusCircle className="h-4 w-4" />
							<span className="hidden xs:inline">Report Incident</span>
							<span className="xs:hidden">Report</span>
						</Button>

						{/* Role Switcher Pill & Dropdown */}
						<div className="relative">
							<button
								onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
								className="flex items-center space-x-2.5 p-1.5 px-2 rounded-md border border-border bg-secondary hover:bg-accent hover:border-border transition-all cursor-pointer text-left"
								type="button"
							>
								<div className="relative">
									<img
										src={currentUser.avatar}
										alt={currentUser.name}
										className="h-7 w-7 rounded-sm object-cover border border-border"
									/>
									<span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-background"></span>
								</div>
								<div className="hidden xl:block text-xs">
									<div className="font-bold text-foreground flex items-center space-x-1">
										<span className="truncate max-w-30">
											{currentUser.name}
										</span>
										{currentUser.isVerified && (
											<UserCheck className="h-3 w-3 text-sky-400 shrink-0" />
										)}
									</div>
									<div className="text-[10px] text-muted-foreground truncate max-w-32.5">
										{currentUser.badgeTitle}
									</div>
								</div>
								<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
							</button>

							{/* Role Dropdown Menu */}
							{roleDropdownOpen && (
								<div className="absolute right-0 mt-2 w-80 rounded-md border border-border bg-card/98 backdrop-blur-md p-2 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95">
									<div className="px-3 py-2 border-b border-border mb-1.5 flex items-center justify-between">
										<p className="text-[11px] font-bold text-muted-foreground capitalize tracking-widest tactical-tag">
											Command Role Switcher
										</p>
										<span className="text-[10px] text-muted-foreground">
											Live Persona
										</span>
									</div>
									<div className="space-y-1.5">
										{usersList.map((user) => {
											const isSelected = user.id === currentUser.id;
											return (
												<button
													type="button"
													key={user.id}
													onClick={() => {
														switchUserRole(user.role);
														setRoleDropdownOpen(false);
													}}
													className={`w-full flex items-start space-x-2.5 p-2.5 rounded-sm text-left transition-all cursor-pointer ${
														isSelected
															? "bg-accent border border-border shadow-sm"
															: "hover:bg-accent/50 border border-transparent"
													}`}
												>
													<img
														src={user.avatar}
														alt={user.name}
														className="h-8 w-8 rounded-sm object-cover mt-0.5 border border-border"
													/>
													<div className="flex-1 min-w-0">
														<div className="flex items-center justify-between">
															<span className="text-xs font-bold text-foreground truncate">
																{user.name}
															</span>
															<div className="flex items-center space-x-1">
																<Badge
																	variant={
																		getRoleBadgeVariant(user.role) as any
																	}
																	className="text-[9px] py-0 px-1.5 capitalize font-bold"
																>
																	{user.role.replace("_", " ")}
																</Badge>
																{isSelected && (
																	<Check className="h-3.5 w-3.5 text-primary ml-1" />
																)}
															</div>
														</div>
														<p className="text-[11px] text-muted-foreground truncate mt-0.5">
															{user.badgeTitle}
														</p>
														<div className="flex items-center space-x-2 mt-1 text-[10px] text-muted-foreground">
															<span>
																Trust:{" "}
																<strong className="text-primary">
																	{user.trustScore}%
																</strong>
															</span>
															<span>•</span>
															<span>
																{user.isVerified ? "Verified" : "Community"}
															</span>
														</div>
													</div>
												</button>
											);
										})}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Mobile Navigation Tabs */}
				<div className="flex overflow-x-auto py-2 border-t border-border gap-1 scrollbar-none">
					{navItems.map((item) => {
						const isActive = activeTab === item.id;
						return (
							<button
								key={item.id}
								type="button"
								onClick={() => setActiveTab(item.id)}
								className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-sm text-xs font-medium shrink-0 transition-colors ${
									isActive
										? "bg-card text-foreground font-bold border border-border"
										: "bg-secondary text-muted-foreground"
								}`}
							>
								{item.icon}
								<span>{item.label}</span>
								{item.badge !== undefined && item.badge > 0 && (
									<span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-destructive text-destructive-foreground font-bold">
										{item.badge}
									</span>
								)}
							</button>
						);
					})}
				</div>
			</div>
		</header>
	);
};
