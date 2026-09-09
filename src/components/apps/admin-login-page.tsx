import type React from "react";
import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import {
	Lock,
	Mail,
	ArrowRight,
	AlertCircle,
	CheckCircle2,
	UserCheck,
	Shield,
} from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { useDisasterStore } from "#/store/useDisasterStore";

export const AdminLoginPage: React.FC = () => {
	const navigate = useNavigate();
	const { signInWithEmail } = useDisasterStore();

	const [email, setEmail] = useState("admin@disasterguard.gov.bd");
	const [password, setPassword] = useState("securePass123!");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleAdminSignIn = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccessMessage(null);

		if (!email.trim() || !password.trim()) {
			setError("Please enter both administrator email and secure password.");
			return;
		}

		setIsLoading(true);

		setTimeout(() => {
			const result = signInWithEmail(email, password);
			setIsLoading(false);

			if (result.success) {
				// Verify if the signed in user is indeed an admin
				const currentUser = useDisasterStore.getState().currentUser;
				if (currentUser && currentUser.role === "admin") {
					setSuccessMessage(
						"Administrator credentials verified. Launching Command Panel...",
					);
					setTimeout(() => {
						navigate({ to: "/admin" });
					}, 800);
				} else {
					setError(
						"Access Denied: The specified account does not possess Operations Admin clearance.",
					);
				}
			} else {
				setError(
					result.error ||
						"Invalid administrator credentials. Please check your email.",
				);
			}
		}, 400);
	};

	const handleQuickAdminDemo = () => {
		setEmail("admin@disasterguard.gov.bd");
		setPassword("securePass123!");
		setError(null);
	};

	return (
		<div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-background">
			<div className="max-w-md w-full space-y-8 bg-card border border-border p-8 rounded-xl shadow-2xl relative overflow-hidden">
				{/* Top Command Accent Bar */}
				<div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-primary" />

				<div className="text-center space-y-2">
					<div className="inline-flex items-center justify-center size-14 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive mb-2 shadow-inner">
						<Shield className="size-7" />
					</div>
					<div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-destructive/20 text-destructive uppercase tracking-wider mb-1">
						Restricted Command Access
					</div>
					<h1 className="text-2xl font-bold tracking-tight text-foreground">
						Operations Admin Portal
					</h1>
					<p className="text-xs text-muted-foreground">
						Authenticate with Commander credentials to manage users, emergency
						resources, and disaster intelligence.
					</p>
				</div>

				{error && (
					<div className="flex items-center space-x-2 p-3 text-xs rounded-md bg-destructive/10 border border-destructive/30 text-destructive animate-in fade-in-50">
						<AlertCircle className="size-4 shrink-0" />
						<span>{error}</span>
					</div>
				)}

				{successMessage && (
					<div className="flex items-center space-x-2 p-3 text-xs rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-in fade-in-50">
						<CheckCircle2 className="size-4 shrink-0" />
						<span>{successMessage}</span>
					</div>
				)}

				<form onSubmit={handleAdminSignIn} className="space-y-4">
					<div className="space-y-1.5">
						<label
							htmlFor="admin-email"
							className="text-xs font-bold text-muted-foreground uppercase tracking-wider tactical-tag block"
						>
							Admin Email
						</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
								<Mail className="size-4" />
							</span>
							<Input
								id="admin-email"
								type="email"
								placeholder="admin@disasterguard.gov.bd"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="pl-9 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/50 h-10 text-xs"
								required
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="admin-password"
							className="text-xs font-bold text-muted-foreground uppercase tracking-wider tactical-tag block"
						>
							Secure Password
						</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
								<Lock className="size-4" />
							</span>
							<Input
								id="admin-password"
								type={showPassword ? "text" : "password"}
								placeholder="••••••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="pl-9 pr-16 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/50 h-10 text-xs"
								required
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute inset-y-0 right-0 px-3 flex items-center text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer uppercase tactical-tag"
							>
								{showPassword ? "Hide" : "Show"}
							</button>
						</div>
					</div>

					<Button
						type="submit"
						disabled={isLoading}
						className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold h-10 shadow-lg cursor-pointer flex items-center justify-center space-x-2 text-xs"
					>
						<span>
							{isLoading ? "Verifying Clearance..." : "Access Admin Command"}
						</span>
						<ArrowRight className="size-4" />
					</Button>
				</form>

				<div className="pt-4 border-t border-border space-y-2 text-center">
					<button
						type="button"
						onClick={handleQuickAdminDemo}
						className="w-full py-2 px-3 rounded-md bg-secondary/60 hover:bg-secondary border border-border text-xs font-bold text-foreground cursor-pointer flex items-center justify-center space-x-2 transition-colors"
					>
						<UserCheck className="size-4 text-emerald-400" />
						<span>Autofill Operations Commander Credentials</span>
					</button>
					<p className="text-[10px] text-muted-foreground">
						Emergency Ops Admin account has full authority over user clearance,
						resource depots, and crisis reports.
					</p>
				</div>

				<div className="text-center pt-2">
					<Link
						to="/"
						className="text-xs text-muted-foreground hover:text-foreground transition-colors"
					>
						← Return to Crisis Live Grid
					</Link>
				</div>
			</div>
		</div>
	);
};
