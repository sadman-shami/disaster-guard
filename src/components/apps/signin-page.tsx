import type React from "react";
import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { ShieldAlert, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, UserCheck } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { useDisasterStore } from "#/store/useDisasterStore";

export const SignInPage: React.FC = () => {
	const navigate = useNavigate();
	const { signInWithEmail, usersList } = useDisasterStore();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSignIn = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccessMessage(null);

		if (!email.trim() || !password.trim()) {
			setError("Please enter both email and password.");
			return;
		}

		setIsLoading(true);

		setTimeout(() => {
			const result = signInWithEmail(email, password);
			setIsLoading(false);

			if (result.success) {
				setSuccessMessage("Authentication verified. Redirecting to tactical command feed...");
				setTimeout(() => {
					navigate({ to: "/" });
				}, 1000);
			} else {
				setError(result.error || "Invalid credentials. Please verify your email or sign up.");
			}
		}, 400);
	};

	const handleDemoLogin = (demoEmail: string) => {
		setEmail(demoEmail);
		setPassword("securePass123!");
		setError(null);
	};

	return (
		<div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
			<div className="max-w-md w-full space-y-8 bg-card border border-border p-8 rounded-xl shadow-2xl relative overflow-hidden">
				{/* Top Accent Bar */}
				<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-500 to-sky-500" />

				<div className="text-center space-y-2">
					<div className="inline-flex items-center justify-center size-14 rounded-xl bg-primary/10 border border-primary/20 text-primary mb-2 shadow-inner">
						<ShieldAlert className="size-7" />
					</div>
					<h1 className="text-2xl font-bold tracking-tight text-foreground">
						Disaster Guard Sign In
					</h1>
					<p className="text-sm text-muted-foreground">
						Enter your authorized agency or community credentials to access the crisis grid.
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

				<form onSubmit={handleSignIn} className="space-y-4">
					<div className="space-y-1.5">
						<label htmlFor="signin-email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider tactical-tag block">
							Authorized Email
						</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
								<Mail className="size-4" />
							</span>
							<Input
								id="signin-email"
								type="email"
								placeholder="name@agency.gov.bd"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="pl-9 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/50 h-10"
								required
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<div className="flex items-center justify-between">
							<label htmlFor="signin-password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider tactical-tag block">
								Secure Password
							</label>
							<button
								type="button"
								onClick={() => {
									alert("Password reset instructions have been dispatched to your registered secure comms channel.");
								}}
								className="text-xs text-primary hover:underline cursor-pointer bg-transparent border-0 p-0"
							>
								Forgot password?
							</button>
						</div>
						<div className="relative">
							<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
								<Lock className="size-4" />
							</span>
							<Input
								id="signin-password"
								type={showPassword ? "text" : "password"}
								placeholder="••••••••••••"
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

					<Button
						type="submit"
						disabled={isLoading}
						className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 shadow-lg cursor-pointer flex items-center justify-center space-x-2"
					>
						<span>{isLoading ? "Authenticating Grid..." : "Sign In to Command"}</span>
						<ArrowRight className="size-4" />
					</Button>
				</form>

				{/* Quick Demo Login Pill Helpers */}
				<div className="pt-4 border-t border-border space-y-2">
					<p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider tactical-tag text-center">
						Quick Demo Access (Click to autofill)
					</p>
					<div className="grid grid-cols-2 gap-2">
						{usersList.slice(0, 4).map((usr) => (
							<button
								key={usr.id}
								type="button"
								onClick={() => handleDemoLogin(usr.email)}
								className="text-left p-2 rounded border border-border bg-secondary/30 hover:bg-secondary hover:border-primary/50 transition-colors text-xs cursor-pointer flex items-center space-x-2 truncate"
							>
								<UserCheck className="size-3.5 text-primary shrink-0" />
								<div className="truncate">
									<div className="font-bold text-foreground truncate text-[11px]">
										{usr.name.split(" ")[0]} {usr.name.split(" ")[1] || ""}
									</div>
									<div className="text-[9px] text-muted-foreground capitalize">
										{usr.role.replace("_", " ")}
									</div>
								</div>
							</button>
						))}
					</div>
				</div>

				<div className="text-center pt-2">
					<p className="text-xs text-muted-foreground">
						Don't have an emergency responder account?{" "}
						<Link to="/signup" className="text-primary font-bold hover:underline">
							Sign up now
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};
