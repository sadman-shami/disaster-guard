import {
	AlertTriangle,
	Battery,
	Car,
	Droplets,
	HeartPulse,
	Home,
	MapPin,
	Package,
	Plus,
	Radio,
	Search,
	Truck,
	Wrench,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
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
import { Progress } from "#/components/ui/progress";
import { useDisasterStore } from "#/store/useDisasterStore";
import type {
	EmergencyResource,
	EmergencySupplyCategory,
	Incident,
} from "#/types";

interface ResourceManagementProps {
	onOpenAllocateModal: (
		incident?: Incident,
		preselectedResource?: EmergencyResource,
	) => void;
	onOpenAddResourceModal: () => void;
	onOpenAddDepotModal?: () => void;
}

export const ResourceManagement: React.FC<ResourceManagementProps> = ({
	onOpenAllocateModal,
	onOpenAddResourceModal,
	onOpenAddDepotModal,
}) => {
	const {
		resources,
		depots,
		dispatchLogs,
		addResourceStock,
		updateDepotOccupancy,
		currentUser,
		setActiveTab,
	} = useDisasterStore();

	useEffect(() => {
		if (!["admin", "responder"].includes(currentUser.role))
			setActiveTab("feed");
	}, [currentUser, setActiveTab]);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [selectedStatus, setSelectedStatus] = useState<string>("all");
	const [selectedDepotType, setSelectedDepotType] = useState<string>("all");
	const [depotSearchQuery, setDepotSearchQuery] = useState("");
	const [activeSubTab, setActiveSubTab] = useState<
		"inventory" | "depots" | "dispatches"
	>("inventory");

	// Restock quick counter state
	const [restockQty, setRestockQty] = useState<{ [id: string]: number }>({});

	const getCategoryIcon = (
		category: EmergencySupplyCategory,
		className = "h-4 w-4",
	) => {
		switch (category) {
			case "medical":
				return <HeartPulse className={`${className} text-red-500`} />;
			case "water_food":
				return <Droplets className={`${className} text-sky-400`} />;
			case "shelter_bedding":
				return <Home className={`${className} text-emerald-400`} />;
			case "rescue_gear":
				return <Wrench className={`${className} text-amber-500`} />;
			case "power_fuel":
				return <Battery className={`${className} text-yellow-400`} />;
			case "comms":
				return <Radio className={`${className} text-indigo-400`} />;
			case "vehicles":
				return <Car className={`${className} text-purple-400`} />;
		}
	};

	const getStockStatusBadge = (status: EmergencyResource["status"]) => {
		switch (status) {
			case "optimal":
				return (
					<Badge variant="success" className="text-[10px]">
						Optimal Stock
					</Badge>
				);
			case "low_stock":
				return (
					<Badge variant="high" className="text-[10px]">
						Low Stock Alert
					</Badge>
				);
			case "critical_shortage":
				return (
					<Badge variant="destructive" className="text-[10px]">
						Critical Shortage
					</Badge>
				);
			case "surplus":
				return (
					<Badge
						variant="secondary"
						className="text-[10px] bg-slate-800 text-slate-300"
					>
						Surplus
					</Badge>
				);
		}
	};

	// Filtered resources
	const filteredResources = useMemo(() => {
		return resources.filter((res) => {
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				const matchName = res.name.toLowerCase().includes(q);
				const matchDepot = res.depotName.toLowerCase().includes(q);
				if (!matchName && !matchDepot) return false;
			}
			if (selectedCategory !== "all" && res.category !== selectedCategory) {
				return false;
			}
			if (selectedStatus !== "all" && res.status !== selectedStatus) {
				return false;
			}
			return true;
		});
	}, [resources, searchQuery, selectedCategory, selectedStatus]);

	// Overall calculations
	const stats = useMemo(() => {
		const totalResourcesCount = resources.reduce(
			(sum, r) => sum + r.totalQuantity,
			0,
		);
		const allocatedCount = resources.reduce(
			(sum, r) => sum + r.allocatedQuantity,
			0,
		);
		const criticalShortages = resources.filter(
			(r) => r.status === "critical_shortage" || r.status === "low_stock",
		).length;
		const totalDepotCapacity = depots.reduce((sum, d) => sum + d.capacity, 0);
		const currentDepotOccupancy = depots.reduce(
			(sum, d) => sum + d.currentOccupancy,
			0,
		);
		return {
			totalResourcesCount,
			allocatedCount,
			criticalShortages,
			totalDepotCapacity,
			currentDepotOccupancy,
			fulfillmentRate: Math.round(
				(allocatedCount / (totalResourcesCount || 1)) * 100,
			),
		};
	}, [resources, depots]);

	const handleQuickRestock = (resId: string) => {
		const qty = restockQty[resId] || 50;
		addResourceStock(resId, qty);
		setRestockQty((prev) => ({ ...prev, [resId]: 0 }));
	};

	const categories: {
		id: string;
		label: string;
		cat?: EmergencySupplyCategory;
	}[] = [
		{ id: "all", label: "All Supplies" },
		{ id: "medical", label: "Medical", cat: "medical" },
		{ id: "water_food", label: "Food & Water", cat: "water_food" },
		{ id: "shelter_bedding", label: "Shelter", cat: "shelter_bedding" },
		{ id: "rescue_gear", label: "Rescue Gear", cat: "rescue_gear" },
		{ id: "power_fuel", label: "Power & Fuel", cat: "power_fuel" },
		{ id: "comms", label: "Comms", cat: "comms" },
		{ id: "vehicles", label: "Vehicles", cat: "vehicles" },
	];

	return (
		<div className="space-y-5">
			{/* Top Tactical Metrics Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
				<div className="rounded-md border border-border bg-card p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<span className="text-[11px] font-bold text-muted-foreground capitalize tracking-wider tactical-tag">
							Total Supply Inventory
						</span>
						<div className="p-1.5 rounded-sm bg-secondary text-primary border border-border">
							<Package className="h-4 w-4" />
						</div>
					</div>
					<p className="text-2xl font-bold text-foreground mt-2">
						{stats.totalResourcesCount.toLocaleString()}
					</p>
					<span className="text-[10px] text-muted-foreground">
						Catalogued across {depots.length} bases
					</span>
				</div>

				<div className="rounded-md border border-border bg-card p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<span className="text-[11px] font-bold text-muted-foreground capitalize tracking-wider tactical-tag">
							Active in Field
						</span>
						<div className="p-1.5 rounded-sm bg-secondary text-primary border border-border">
							<Truck className="h-4 w-4" />
						</div>
					</div>
					<p className="text-2xl font-bold text-primary mt-2">
						{stats.allocatedCount.toLocaleString()}
					</p>
					<span className="text-[10px] text-primary">
						{stats.fulfillmentRate}% deployed to sectors
					</span>
				</div>

				<div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<span className="text-[11px] font-bold text-destructive capitalize tracking-wider tactical-tag">
							Supply Deficits
						</span>
						<div className="p-1.5 rounded-sm bg-destructive/20 text-destructive border border-destructive/30 animate-pulse">
							<AlertTriangle className="h-4 w-4" />
						</div>
					</div>
					<p className="text-2xl font-bold text-destructive mt-2">
						{stats.criticalShortages}
					</p>
					<span className="text-[10px] text-destructive/90">
						Critical / Low Stock Items
					</span>
				</div>

				<div className="rounded-md border border-border bg-card p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<span className="text-[11px] font-bold text-muted-foreground capitalize tracking-wider tactical-tag">
							Shelter Occupancy
						</span>
						<div className="p-1.5 rounded-sm bg-secondary text-primary border border-border">
							<Home className="h-4 w-4" />
						</div>
					</div>
					<p className="text-2xl font-bold text-foreground mt-2">
						{stats.currentDepotOccupancy} / {stats.totalDepotCapacity}
					</p>
					<span className="text-[10px] text-muted-foreground">
						{Math.round(
							(stats.currentDepotOccupancy / (stats.totalDepotCapacity || 1)) *
								100,
						)}
						% total capacity utilized
					</span>
				</div>
			</div>

			{/* Sub-Navigation Tabs & Actions Header */}
			<div className="flex items-center justify-between border-b border-border pb-3 gap-3">
				<div className="flex items-center gap-1.5 overflow-x-auto p-2 scrollbar-none mt-2 border border-border rounded-md">
					<Button
						type="button"
						onClick={() => setActiveSubTab("inventory")}
						className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
							activeSubTab === "inventory"
								? "bg-card text-foreground border border-border shadow-sm"
								: "bg-secondary text-muted-foreground hover:text-foreground border border-border"
						}`}
					>
						Supply Catalog ({resources.length})
					</Button>
					<Button
						type="button"
						onClick={() => setActiveSubTab("depots")}
						className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
							activeSubTab === "depots"
								? "bg-card text-foreground border border-border shadow-sm"
								: "bg-secondary text-muted-foreground hover:text-foreground border border-border"
						}`}
					>
						Shelters & Bases ({depots.length})
					</Button>
					<Button
						type="button"
						onClick={() => setActiveSubTab("dispatches")}
						className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
							activeSubTab === "dispatches"
								? "bg-card text-foreground border border-border shadow-sm"
								: "bg-secondary text-muted-foreground hover:text-foreground border border-border"
						}`}
					>
						Active Convoys ({dispatchLogs.length})
					</Button>
				</div>
			</div>

			{/* Action button */}
			{(currentUser.role === "admin" || currentUser.role === "responder") && (
				<div className="flex gap-2 overflow-x-auto scrollbar-none">
					{activeSubTab === "depots" ? (
						<Button
							size="sm"
							variant={"outline"}
							onClick={onOpenAddDepotModal}
							className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold capitalize tracking-wider rounded-md shadow-sm cursor-pointer h-8"
						>
							<Plus className="h-3.5 w-3.5 mr-1" />
							Commission Shelter / Base
						</Button>
					) : (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={onOpenAddResourceModal}
								className="text-xs font-bold capitalize tracking-wider rounded-md border-border bg-card text-foreground hover:bg-accent cursor-pointer h-8"
							>
								<Plus className="h-3.5 w-3.5 mr-1" />
								Add Resource Line
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={onOpenAddDepotModal}
								className="text-xs font-bold capitalize tracking-wider rounded-md border-border bg-card text-primary hover:bg-accent cursor-pointer h-8"
							>
								<Home className="h-3.5 w-3.5 mr-1 text-primary" />
								Add Shelter/Base
							</Button>
							<Button
								size="sm"
								onClick={() => onOpenAllocateModal()}
								className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold capitalize tracking-wider rounded-md shadow-sm cursor-pointer h-8"
							>
								<Truck className="h-3.5 w-3.5 mr-1" />
								Dispatch Supplies
							</Button>
						</>
					)}
				</div>
			)}

			{/* Subtab 1: Inventory Catalog */}
			{activeSubTab === "inventory" && (
				<div className="space-y-4">
					{/* Filters Bar */}
					<div className="rounded-md border border-border bg-card p-4 space-y-3 shadow-sm">
						<div className="flex flex-col md:flex-row gap-3">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search resources by item name or logistics depot..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-9 pr-8 text-xs bg-background border-border text-foreground rounded-md focus:border-ring h-9"
								/>
								{searchQuery && (
									<button
										type="button"
										onClick={() => setSearchQuery("")}
										className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
									>
										<X className="h-4 w-4" />
									</button>
								)}
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<select
									value={selectedStatus}
									onChange={(e) => setSelectedStatus(e.target.value)}
									className="h-9 rounded-md border border-border bg-background px-3 py-1 text-xs font-medium text-foreground focus:outline-none focus:border-ring cursor-pointer"
								>
									<option value="all">All Stock Statuses</option>
									<option value="optimal">Optimal Stock</option>
									<option value="low_stock">Low Stock</option>
									<option value="critical_shortage">Critical Shortage</option>
									<option value="surplus">Surplus</option>
								</select>
							</div>
						</div>

						{/* Category Quick Chips */}
						<div className="flex items-center gap-1.5 overflow-x-auto p-2 scrollbar-none border-t border-border">
							<span className="text-[11px] font-bold text-muted-foreground capitalize tracking-wider tactical-tag shrink-0 mr-1">
								Category:
							</span>
							{categories.map((item) => {
								const isSelected = selectedCategory === item.id;
								const count =
									item.id === "all"
										? resources.length
										: resources.filter((r) => r.category === item.id).length;

								return (
									<button
										type="button"
										key={item.id}
										onClick={() => setSelectedCategory(item.id)}
										className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold capitalize tracking-wider shrink-0 transition-all cursor-pointer ${
											isSelected
												? "bg-primary text-primary-foreground border border-primary shadow-sm font-bold"
												: "bg-secondary text-muted-foreground border border-border hover:bg-accent hover:text-foreground"
										}`}
									>
										{item.cat && getCategoryIcon(item.cat, "h-3.5 w-3.5")}
										<span>{item.label}</span>
										<span
											className={`text-[10px] px-1.5 py-0.2 rounded-xs font-bold ${
												isSelected
													? "bg-primary-foreground/20 text-primary-foreground"
													: "bg-background text-muted-foreground"
											}`}
										>
											{count}
										</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Resources Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{filteredResources.map((resource) => {
							const percentage = Math.round(
								(resource.availableQuantity / (resource.totalQuantity || 1)) *
									100,
							);
							return (
								<Card
									key={resource.id}
									className="border border-border bg-card transition-all shadow-sm flex flex-col justify-between rounded-md overflow-hidden"
								>
									<CardHeader className="p-4 pb-2 border-b border-border">
										<div className="flex items-start justify-between gap-2">
											<div className="flex items-center space-x-2.5">
												<div className="p-2 rounded-md bg-secondary border border-border shrink-0">
													{getCategoryIcon(resource.category)}
												</div>
												<div>
													<CardTitle className="text-sm font-bold leading-tight text-foreground">
														{resource.name}
													</CardTitle>
													<span className="text-[10px] text-muted-foreground capitalize tracking-wider">
														{resource.category.replace("_", " ")}
													</span>
												</div>
											</div>
											{getStockStatusBadge(resource.status)}
										</div>
									</CardHeader>

									<CardContent className="p-4 pt-2 space-y-3 text-xs flex-1">
										<div className="flex items-center text-muted-foreground text-[11px]">
											<MapPin className="h-3.5 w-3.5 text-primary mr-1 shrink-0" />
											<span className="truncate">{resource.depotName}</span>
										</div>

										{/* Stock level bar */}
										<div className="space-y-1.5 bg-secondary/50 p-2.5 rounded-md border border-border">
											<div className="flex justify-between text-xs font-semibold">
												<span className="text-muted-foreground">
													Available Stock:
												</span>
												<span className="text-foreground font-bold">
													{resource.availableQuantity} /{" "}
													{resource.totalQuantity} {resource.unit}
												</span>
											</div>
											<Progress
												value={percentage}
												className="h-2 bg-muted rounded-xs"
												indicatorColor={
													percentage < 25
														? "bg-destructive"
														: percentage < 50
															? "bg-amber-500"
															: "bg-primary"
												}
											/>
											<div className="flex justify-between text-[10px] text-muted-foreground">
												<span>
													Threshold: {resource.minThreshold} {resource.unit}
												</span>
												<span className="text-primary font-medium">
													{resource.allocatedQuantity} deployed
												</span>
											</div>
										</div>

										<div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
											<span>Restocked: {resource.lastRestocked}</span>
											<span>Lead: {resource.contactOfficer}</span>
										</div>
									</CardContent>

									{/* Restock & Allocate footer */}
									<div className="p-3 border-t border-border flex items-center justify-between gap-2 text-xs">
										<div className="flex items-center space-x-1.5 flex-1">
											<Input
												type="number"
												placeholder="+Qty"
												value={restockQty[resource.id] || ""}
												onChange={(e) =>
													setRestockQty({
														...restockQty,
														[resource.id]: parseInt(e.target.value) || 0,
													})
												}
												className="h-7 w-16 text-xs px-1.5 bg-background border-border text-foreground rounded-md"
											/>
											<Button
												size="sm"
												variant="subtle"
												onClick={() => handleQuickRestock(resource.id)}
												className="h-7 text-[10px] px-2 font-bold capitalize tracking-wider rounded-md bg-secondary text-foreground hover:bg-accent cursor-pointer"
												title="Restock this supply line"
											>
												+Restock
											</Button>
										</div>

										<Button
											size="sm"
											onClick={() => onOpenAllocateModal(undefined, resource)}
											className="h-7 text-[10px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold capitalize tracking-wider rounded-md px-2.5 cursor-pointer"
										>
											Dispatch
										</Button>
									</div>
								</Card>
							);
						})}
					</div>
				</div>
			)}

			{/* Subtab 2: Depots & Shelters Map/Directory */}
			{activeSubTab === "depots" && (
				<div className="space-y-4">
					{/* Shelters Filter Bar */}
					<div className="rounded-md border border-border bg-card p-4 space-y-3 shadow-sm">
						<div className="flex flex-col md:flex-row gap-3">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search shelters & bases by name, address, or capabilities..."
									value={depotSearchQuery}
									onChange={(e) => setDepotSearchQuery(e.target.value)}
									className="pl-9 pr-8 text-xs bg-background border-border text-foreground rounded-md focus:border-ring h-9"
								/>
								{depotSearchQuery && (
									<button
										type="button"
										onClick={() => setDepotSearchQuery("")}
										className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
									>
										<X className="h-4 w-4" />
									</button>
								)}
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<select
									value={selectedDepotType}
									onChange={(e) => setSelectedDepotType(e.target.value)}
									className="h-9 rounded-md border border-border bg-background px-3 py-1 text-xs font-medium text-foreground focus:outline-none focus:border-ring cursor-pointer"
								>
									<option value="all">All Base Types</option>
									<option value="shelter">Civic Shelter</option>
									<option value="central_hub">Central HQ Base</option>
									<option value="regional_depot">Logistics Depot</option>
									<option value="hospital">Field Hospital</option>
									<option value="field_station">Tactical Outpost</option>
								</select>

								<Button
									size="sm"
									onClick={onOpenAddDepotModal}
									className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold capitalize tracking-wider rounded-md shadow-sm cursor-pointer"
								>
									<Plus className="h-3.5 w-3.5 mr-1" />
									Commission Base
								</Button>
							</div>
						</div>
					</div>

					{/* Shelters Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{depots
							.filter((depot) => {
								if (depotSearchQuery.trim()) {
									const q = depotSearchQuery.toLowerCase();
									const matchesName = depot.name.toLowerCase().includes(q);
									const matchesAddress = depot.address
										.toLowerCase()
										.includes(q);
									const matchesAmenity = depot.amenities.some((a) =>
										a.toLowerCase().includes(q),
									);
									if (!matchesName && !matchesAddress && !matchesAmenity)
										return false;
								}
								if (
									selectedDepotType !== "all" &&
									depot.type !== selectedDepotType
								)
									return false;
								return true;
							})
							.map((depot) => {
								const occPercentage = Math.round(
									(depot.currentOccupancy / depot.capacity) * 100,
								);
								return (
									<Card
										key={depot.id}
										className="border border-border bg-card shadow-sm rounded-md overflow-hidden"
									>
										<CardHeader className="p-4 pb-2 border-b border-border">
											<div className="flex items-center justify-between">
												<Badge
													variant={
														depot.type === "shelter" ? "success" : "verified"
													}
												>
													{depot.type.toUpperCase().replace("_", " ")}
												</Badge>
												<span
													className={`text-[10px] font-bold px-2 py-0.5 rounded-sm capitalize border ${
														depot.operatingStatus === "fully_operational"
															? "bg-primary/15 text-primary border-primary/30"
															: depot.operatingStatus === "strained"
																? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30"
																: "bg-destructive/15 text-destructive border-destructive/30"
													}`}
												>
													{depot.operatingStatus.replace("_", " ")}
												</span>
											</div>
											<CardTitle className="text-base font-bold mt-1.5 text-foreground">
												{depot.name}
											</CardTitle>
											<p className="text-xs text-muted-foreground flex items-center gap-1">
												<MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
												{depot.address}
											</p>
										</CardHeader>

										<CardContent className="p-4 pt-2 space-y-3 text-xs">
											{/* Occupancy meter */}
											<div className="bg-secondary/50 p-3 rounded-md border border-border space-y-2">
												<div className="flex justify-between font-semibold">
													<span className="text-muted-foreground">
														Shelter Capacity Usage:
													</span>
													<span className="text-foreground">
														{depot.currentOccupancy} / {depot.capacity} persons
														({occPercentage}%)
													</span>
												</div>
												<Progress
													value={occPercentage}
													className="h-2.5 bg-muted rounded-xs"
													indicatorColor={
														occPercentage > 90
															? "bg-destructive"
															: occPercentage > 70
																? "bg-amber-500"
																: "bg-primary"
													}
												/>
												<div className="flex justify-between text-[10px] text-muted-foreground">
													<span>
														Available Beds:{" "}
														{depot.availableBeds ||
															Math.max(
																0,
																depot.capacity - depot.currentOccupancy,
															)}
													</span>
													<span>Hotline: {depot.contactPhone}</span>
												</div>
											</div>

											{/* Live slider to simulate occupancy influx */}
											<div className="pt-1">
												<label
													htmlFor=""
													className="text-[10px] font-bold text-muted-foreground capitalize tracking-wider flex justify-between mb-1 tactical-tag"
												>
													<span>Simulate Intake / Occupancy Adjustment:</span>
													<span className="text-primary font-bold">
														{depot.currentOccupancy}
													</span>
												</label>
												<input
													type="range"
													min={0}
													max={depot.capacity}
													value={depot.currentOccupancy}
													onChange={(e) =>
														updateDepotOccupancy(
															depot.id,
															parseInt(e.target.value),
														)
													}
													className="w-full h-1.5 bg-muted rounded-sm appearance-none cursor-pointer accent-primary"
												/>
											</div>

											{/* Amenities */}
											<div>
												<span className="font-bold text-muted-foreground capitalize tracking-wider block mb-1 text-[10px] tactical-tag">
													Capabilities & Amenities:
												</span>
												<div className="flex flex-wrap gap-1">
													{depot.amenities.map((a, i) => (
														<span
															key={i}
															className="bg-secondary border border-border text-foreground px-2 py-0.5 rounded-xs text-[10px]"
														>
															{a}
														</span>
													))}
												</div>
											</div>
										</CardContent>
									</Card>
								);
							})}
					</div>
				</div>
			)}

			{/* Subtab 3: Dispatches & Convoys */}
			{activeSubTab === "dispatches" && (
				<Card className="border border-border bg-card shadow-sm overflow-hidden rounded-md">
					<CardHeader className="p-4 border-b border-border">
						<CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
							<Truck className="h-5 w-5 text-primary" />
							Active Emergency Supply Convoys & Dispatches
						</CardTitle>
						<CardDescription className="text-xs text-muted-foreground">
							Live tracking log of critical medical, food, rescue, and power
							supplies delivered to disaster sectors.
						</CardDescription>
					</CardHeader>

					<CardContent className="p-0">
						<div className="overflow-x-auto">
							<table className="w-full text-xs text-left">
								<thead className="bg-secondary/80 text-muted-foreground capitalize font-bold text-[10px] tracking-wider border-b border-border tactical-tag">
									<tr>
										<th className="p-3">Dispatch ID</th>
										<th className="p-3">Target Incident</th>
										<th className="p-3">Origin Depot</th>
										<th className="p-3">Items Manifest</th>
										<th className="p-3">Status / ETA</th>
										<th className="p-3">Authorized By</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{dispatchLogs.map((log) => (
										<tr
											key={log.id}
											className="hover:bg-accent/30 transition-colors"
										>
											<td className="p-3 font-bold text-primary">{log.id}</td>
											<td className="p-3">
												<span className="font-bold text-foreground block max-w-xs truncate">
													{log.incidentTitle}
												</span>
											</td>
											<td className="p-3 text-muted-foreground">
												{log.fromDepotName}
											</td>
											<td className="p-3">
												<div className="bg-secondary border border-border px-1.5 py-0.5 rounded-xs text-[11px] text-foreground mr-1 block sm:inline-block">
													{log.items.map((item, idx) => (
														<span key={idx}>
															{item.quantity} {item.unit} {item.resourceName}
														</span>
													))}
												</div>
											</td>
											<td className="p-3">
												<div className="flex items-center space-x-1.5">
													<Badge
														variant={
															log.status === "delivered" ? "success" : "high"
														}
														className="text-[10px]"
													>
														<span
															className={`h-2 w-2 rounded-full ${
																log.status === "delivered"
																	? "bg-teal-500"
																	: "bg-amber-500 animate-ping"
															}`}
														/>
														{log.status.toUpperCase().replace("_", " ")} (
														{log.eta})
													</Badge>
												</div>
											</td>
											<td className="p-3 text-muted-foreground">
												{log.dispatchedBy}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
