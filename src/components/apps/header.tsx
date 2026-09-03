import {
	BarChart3,
	Lock,
	LogOut,
	MapPin,
	Package,
	PlusCircle,
	Radio,
	RotateCcw,
	UserCheck,
	Users,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { useDisasterStore } from "#/store/useDisasterStore";
import { UserProfileView } from "#/components/apps/user-profile-view";

interface HeaderProps {
	onOpenReportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenReportModal }) => {
	const navigate = useNavigate();
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
	const {
		currentUser,
		incidents,
		volunteerTasks,
		resetAllData,
		setIsReportModalOpen,
	} = useDisasterStore();

	const handleOpenReport =
		onOpenReportModal || (() => setIsReportModalOpen(true));

	const handleLogout = () => {
		navigate({ to: "/signin" });
	};

	const criticalIncidentsCount = incidents.filter(
		(i) => i.severity === "critical" && i.status !== "resolved",
	).length;
	const activeTasksCount = volunteerTasks.filter(
		(t) => t.status === "in_progress" || t.status === "assigned",
	).length;

	const navItems: {
		to: string;
		label: string;
		icon: React.ReactNode;
		badge?: number;
		exact?: boolean;
	}[] = [
		{
			to: "/",
			label: "Incident Feed",
			icon: <Radio className="h-4 w-4" />,
			badge: incidents.filter((i) => i.status !== "resolved").length,
			exact: true,
		},
		{
			to: "/map",
			label: "Safety Map",
			icon: <MapPin className="h-4 w-4" />,
		},
		{
			to: "/resources",
			label: "Resource Management",
			icon: <Package className="h-4 w-4" />,
		},
		{
			to: "/volunteers",
			label: "Volunteer Portal",
			icon: <Users className="h-4 w-4" />,
			badge: activeTasksCount > 0 ? activeTasksCount : undefined,
		},
		{
			to: "/admin",
			label: "Admin Command",
			icon: <BarChart3 className="h-4 w-4" />,
			badge: criticalIncidentsCount > 0 ? criticalIncidentsCount : undefined,
		},
		{
			to: "/signin",
			label: "Sign In",
			icon: <Lock className="h-4 w-4" />,
		},
		{
			to: "/signup",
			label: "Sign Up",
			icon: <UserCheck className="h-4 w-4" />,
		},
	];

	return (
		<header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
			{/* Main Header Nav */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16 gap-4">
					{/* Logo & Brand Identity */}
					<Link
						to="/"
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
					</Link>

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
							onClick={handleOpenReport}
							className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-bold capitalize tracking-wider flex items-center space-x-1.5 text-xs px-3 sm:px-4 shadow-md border border-primary/50 cursor-pointer h-9"
						>
							<PlusCircle className="h-4 w-4" />
							<span className="hidden xs:inline">Report Incident</span>
							<span className="xs:hidden">Report</span>
						</Button>

						{/* Current User Profile & Logout */}
						<div className="flex items-center space-x-2">
							<button
								type="button"
								onClick={() => setIsProfileModalOpen(true)}
								title="View User Profile Details"
								className="flex items-center space-x-2.5 p-1.5 px-2.5 rounded-md border border-border bg-secondary/80 hover:bg-accent text-left transition-colors cursor-pointer"
							>
								<div className="relative">
									<img
										src={currentUser.avatar}
										alt={currentUser.name}
										className="h-7 w-7 rounded-sm object-cover border border-border"
									/>
									<span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-background"></span>
								</div>
								<div className="text-xs">
									<div className="font-bold text-foreground flex items-center space-x-1">
										<span className="truncate max-w-30">
											{currentUser.name}
										</span>
										{currentUser.isVerified && (
											<UserCheck className="h-3 w-3 text-sky-400 shrink-0" />
										)}
									</div>
									<div className="text-[10px] text-muted-foreground truncate max-w-32.5 capitalize">
										{currentUser.role.replace("_", " ")} • {currentUser.badgeTitle}
									</div>
								</div>
							</button>
							<Button
								onClick={handleLogout}
								variant="outline"
								size="icon"
								title="Sign Out / Log Out"
								className="h-9 w-9 border-border bg-secondary/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 cursor-pointer shrink-0"
							>
								<LogOut className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>

				{/* Dedicated Navigation Pages */}
				<nav
					className="flex overflow-x-auto py-2 border-t border-border gap-1 scrollbar-none"
					aria-label="Main Navigation"
				>
					{navItems.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							activeOptions={{ exact: item.exact }}
							className="flex items-center space-x-1.5 px-3 py-1.5 rounded-sm text-xs font-medium shrink-0 transition-colors border border-transparent bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
							activeProps={{
								className:
									"!bg-card !text-foreground !font-bold !border-border shadow-xs",
							}}
						>
							{item.icon}
							<span>{item.label}</span>
							{item.badge !== undefined && item.badge > 0 && (
								<span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-destructive text-destructive-foreground font-bold">
									{item.badge}
								</span>
							)}
						</Link>
					))}
				</nav>
			</div>

			{/* User Profile Read-Only Modal */}
			{isProfileModalOpen && (
				<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
					<div className="relative w-full max-w-md">
						<div className="absolute -top-3 -right-3 z-10">
							<button
								type="button"
								onClick={() => setIsProfileModalOpen(false)}
								className="size-8 rounded-full bg-card border border-border text-foreground hover:bg-accent flex items-center justify-center font-bold shadow-md cursor-pointer"
							>
								✕
							</button>
						</div>
						<UserProfileView
							user={currentUser}
							onClose={() => setIsProfileModalOpen(false)}
						/>
					</div>
				</div>
			)}
		</header>
	);
};
