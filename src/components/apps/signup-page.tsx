import type React from "react";
import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import {
	ShieldAlert,
	Lock,
	Mail,
	User,
	Building2,
	ArrowRight,
	AlertCircle,
	CheckCircle2,
} from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { useDisasterStore } from "#/store/useDisasterStore";
import type { UserRole } from "#/types";

export const SignUpPage: React.FC = () => {
	const navigate = useNavigate();
	const { signUpUser } = useDisasterStore();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [role, setRole] = useState<UserRole>("citizen");
	const [organization, setOrganization] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSignUp = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccessMessage(null);

		if (!name.trim() || !email.trim() || !password.trim()) {
			setError("Please fill in all required fields.");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters long.");
			return;
		}

		setIsLoading(true);

		setTimeout(() => {
			const result = signUpUser({
				name,
				email,
				password,
				role,
				organization: organization.trim() || undefined,
			});
			setIsLoading(false);

			if (result.success) {
				setSuccessMessage(
					"Account created successfully! Initializing command session...",
				);
				setTimeout(() => {
					navigate({ to: "/" });
				}, 1000);
			} else {
				setError(
					result.error ||
						"Failed to create account. Please try a different email.",
				);
			}
		}, 500);
	};

	return (
		<div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
			<div className="max-w-md w-full space-y-6 bg-card border border-border p-8 rounded-xl shadow-2xl relative overflow-hidden">
				{/* Top Accent Bar */}
				<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-primary to-sky-500" />

				<div className="text-center space-y-2">
					<div className="inline-flex items-center justify-center size-14 rounded-xl bg-primary/10 border border-primary/20 text-primary mb-2 shadow-inner">
						<ShieldAlert className="size-7" />
					</div>
					<h1 className="text-2xl font-bold tracking-tight text-foreground">
						Register for Disaster Guard
					</h1>
					<p className="text-sm text-muted-foreground">
						Create your responder or community account to report incidents and
						coordinate relief resources.
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

				<form onSubmit={handleSignUp} className="space-y-4">
					<div className="space-y-1.5">
						<label
							htmlFor="signup-name"
							className="text-xs font-bold text-muted-foreground uppercase tracking-wider tactical-tag block"
						>
							Full Name
						</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
								<User className="size-4" />
							</span>
							<Input
								id="signup-name"
								type="text"
								placeholder="Dr. John Doe"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="pl-9 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/50 h-10"
								required
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="signup-email"
							className="text-xs font-bold text-muted-foreground uppercase tracking-wider tactical-tag block"
						>
							Email Address
						</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
								<Mail className="size-4" />
							</span>
							<Input
								id="signup-email"
								type="email"
								placeholder="john.doe@agency.org"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="pl-9 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/50 h-10"
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<label
								htmlFor="signup-role"
								className="text-xs font-bold text-muted-foreground uppercase tracking-wider tactical-tag block"
							>
								Access Role
							</label>
							<select
								id="signup-role"
								value={role}
								onChange={(e) => setRole(e.target.value as UserRole)}
								className="w-full bg-secondary/50 border border-border rounded-md px-3 h-10 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
							>
								<option value="citizen">Community Citizen</option>
								<option value="verified_citizen">
									Verified First Responder
								</option>
								<option value="responder">Emergency Unit Lead</option>
								<option value="admin">Operations Admin</option>
							</select>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="signup-org"
								className="text-xs font-bold text-muted-foreground uppercase tracking-wider tactical-tag block"
							>
								Organization / Unit
							</label>
							<div className="relative">
								<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
									<Building2 className="size-3.5" />
								</span>
								<Input
									id="signup-org"
									type="text"
									placeholder="FSCD / Red Crescent"
									value={organization}
									onChange={(e) => setOrganization(e.target.value)}
									className="pl-8 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/50 h-10 text-xs"
								/>
							</div>
						</div>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="signup-password"
							className="text-xs font-bold text-muted-foreground uppercase tracking-wider tactical-tag block"
						>
							Password
						</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
								<Lock className="size-4" />
							</span>
							<Input
								id="signup-password"
								type={showPassword ? "text" : "password"}
								placeholder="At least 6 characters"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="pl-9 pr-16 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/50 h-10"
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

					<div className="space-y-1.5">
						<label
							htmlFor="signup-confirm-password"
							className="text-xs font-bold text-muted-foreground uppercase tracking-wider tactical-tag block"
						>
							Confirm Password
						</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
								<Lock className="size-4" />
							</span>
							<Input
								id="signup-confirm-password"
								type={showPassword ? "text" : "password"}
								placeholder="Confirm password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="pl-9 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/50 h-10"
								required
							/>
						</div>
					</div>

					<Button
						type="submit"
						disabled={isLoading}
						className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 shadow-lg cursor-pointer flex items-center justify-center space-x-2"
					>
						<span>
							{isLoading
								? "Creating Secure Account..."
								: "Create Account & Sign In"}
						</span>
						<ArrowRight className="size-4" />
					</Button>
				</form>

				<div className="text-center pt-2">
					<p className="text-xs text-muted-foreground">
						Already have an account?{" "}
						<Link
							to="/signin"
							className="text-primary font-bold hover:underline"
						>
							Sign in here
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};
