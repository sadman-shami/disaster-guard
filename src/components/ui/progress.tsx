import type * as React from "react";

import { cn } from "#/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
	value?: number;
	max?: number;
	className?: string;
	indicatorColor?: string;
}

export function Progress({
	className,
	value = 0,
	max = 100,
	indicatorColor,
	...props
}: ProgressProps) {
	const percentage = Math.min(100, Math.max(0, (value / max) * 100));

	return (
		<div
			className={cn(
				"relative h-2 w-full overflow-hidden rounded-full bg-secondary/80",
				className,
			)}
			{...props}
		>
			<div
				className={cn(
					"h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out",
					indicatorColor,
				)}
				style={{ transform: `translateX(-${100 - percentage}%)` }}
			/>
		</div>
	);
}

export interface SwitchProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	label?: string;
	className?: string;
	id?: string;
	disabled?: boolean;
}

export function Switch({
	checked,
	onCheckedChange,
	className,
	label,
	id,
	disabled,
	...props
}: SwitchProps) {
	return (
		<label
			htmlFor={id}
			className={cn(
				"inline-flex items-center space-x-2 cursor-pointer select-none",
				disabled && "opacity-50 cursor-not-allowed",
				className,
			)}
		>
			<div className="relative inline-block w-9 h-5">
				<input
					type="checkbox"
					id={id}
					checked={checked}
					disabled={disabled}
					onChange={(e) => onCheckedChange(e.target.checked)}
					className="sr-only peer"
					{...props}
				/>
				<div className="w-9 h-5 bg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-border after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-primary-foreground after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary transition-colors"></div>
			</div>
			{label && (
				<span className="text-sm font-medium text-foreground">{label}</span>
			)}
		</label>
	);
}
