import type React from "react";
import {
	UserCheck,
	Shield,
	Building2,
	Phone,
	MapPin,
	Award,
	CheckCircle2,
} from "lucide-react";
import type { User } from "#/types";
import { Badge } from "#/components/ui/badge";

interface UserProfileViewProps {
	user: User;
	onClose?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
	user,
	onClose,
}) => {
	const getRoleBadgeVariant = (role: string) => {
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
		<div className="p-6 w-full mx-auto space-y-6">
			{/* Header / Avatar */}
			<div className="flex items-center space-x-4 pb-6 border-b border-border">
				<div className="relative">
					<img
						src={user.avatar}
						alt={user.name}
						className="h-16 w-16 rounded-lg object-cover border-2 border-border shadow-md"
					/>
					{user.isVerified && (
						<span className="absolute -bottom-1 -right-1 bg-sky-500 text-white rounded-full p-0.5 shadow">
							<CheckCircle2 className="h-4 w-4" />
						</span>
					)}
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center space-x-2">
						<h2 className="text-lg font-bold truncate text-foreground">
							{user.name}
						</h2>
						{user.isVerified && (
							<UserCheck className="h-4 w-4 text-sky-400 shrink-0" />
						)}
					</div>
					<p className="text-xs text-muted-foreground truncate">{user.email}</p>
					<div className="mt-2 flex items-center space-x-2">
						<Badge
							variant={getRoleBadgeVariant(user.role) as any}
							className="text-[10px] capitalize font-bold px-2 py-0.5"
						>
							{user.role.replace("_", " ")}
						</Badge>
						<span className="text-[10px] px-2 py-0.5 rounded-sm bg-secondary text-secondary-foreground font-medium border border-border">
							Trust: {user.trustScore}%
						</span>
					</div>
				</div>
			</div>

			{/* Detailed Attributes */}
			<div className="space-y-3.5 text-xs">
				<div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/60">
					<div className="flex items-center space-x-2.5 text-muted-foreground">
						<Award className="h-4 w-4 text-primary" />
						<span>Command Designation / Title</span>
					</div>
					<span className="font-bold text-foreground">{user.badgeTitle}</span>
				</div>

				<div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/60">
					<div className="flex items-center space-x-2.5 text-muted-foreground">
						<Building2 className="h-4 w-4 text-primary" />
						<span>Organization / Agency</span>
					</div>
					<span className="font-bold text-foreground">
						{user.organization || "Bangladesh Disaster Management Bureau"}
					</span>
				</div>

				<div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/60">
					<div className="flex items-center space-x-2.5 text-muted-foreground">
						<Shield className="h-4 w-4 text-primary" />
						<span>Security & Access Clearance</span>
					</div>
					<span className="font-bold text-foreground capitalize">
						{user.role === "admin"
							? "Full Operations Control"
							: user.role === "responder"
								? "Logistics & Tactical Lead"
								: "Standard Community Access"}
					</span>
				</div>

				{user.assignedJurisdiction && (
					<div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/60">
						<div className="flex items-center space-x-2.5 text-muted-foreground">
							<MapPin className="h-4 w-4 text-primary" />
							<span>Assigned Jurisdiction</span>
						</div>
						<span className="font-bold text-foreground">
							{user.assignedJurisdiction}
						</span>
					</div>
				)}

				{user.phone && (
					<div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/60">
						<div className="flex items-center space-x-2.5 text-muted-foreground">
							<Phone className="h-4 w-4 text-primary" />
							<span>Emergency Contact</span>
						</div>
						<span className="font-bold text-foreground">{user.phone}</span>
					</div>
				)}
			</div>

			{onClose && (
				<div className="pt-2">
					<button
						type="button"
						onClick={onClose}
						className="w-full bg-secondary hover:bg-accent text-foreground font-bold py-2 px-4 rounded-md border border-border transition-colors cursor-pointer text-xs"
					>
						Close Profile
					</button>
				</div>
			)}
		</div>
	);
};
