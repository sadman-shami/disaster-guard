import { Package, Plus } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { useDisaster } from "#/components/provider/DisasterProvider";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import type { EmergencySupplyCategory } from "#/types";

interface AddResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { depots, createEmergencyResource, currentUser, usersList } =
    useDisaster();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<EmergencySupplyCategory>("medical");
  const [depotId, setDepotId] = useState<string>(depots[0]?.id || "");
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState("kits");
  const [minThreshold, setMinThreshold] = useState<number>(25);
  const [contactOfficer, setContactOfficer] = useState(currentUser.name);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter resource name");
      return;
    }

    const depot = depots.find((d) => d.id === depotId) || depots[0];

    createEmergencyResource({
      name: name.trim(),
      category,
      depotId: depot.id,
      depotName: depot.name,
      depotLocation: {
        lat: depot.lat,
        lng: depot.lng,
        address: depot.address,
      },
      totalQuantity: Number(quantity) || 10,
      unit: unit.trim() || "units",
      minThreshold: Number(minThreshold) || 5,
      contactOfficer: contactOfficer.trim() || currentUser.name,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="grid grid-cols-1 sm:flex items-center gap-2">
          <div className="size-10 flex items-center justify-center p-2 rounded-lg bg-primary text-primary-foreground shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div className="text-left">
            <DialogTitle>Register New Resource Type</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Add a new emergency supply line to the unified disaster logistics
              inventory.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label
            htmlFor=""
            className="font-semibold text-foreground block mb-1"
          >
            Resource Item Name:
          </label>
          <Input
            placeholder="e.g., Portable Water Desalination Kits"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor=""
              className="font-semibold text-foreground block mb-1"
            >
              Category:
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as EmergencySupplyCategory)
              }
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="medical">Medical Supplies</option>
              <option value="water_food">Food & Water</option>
              <option value="shelter_bedding">Shelter & Cots</option>
              <option value="rescue_gear">Rescue Equipment</option>
              <option value="power_fuel">Generators & Power</option>
              <option value="comms">Communications</option>
              <option value="vehicles">Rescue Vehicles</option>
            </select>
          </div>

          <div>
            <label
              htmlFor=""
              className="font-semibold text-foreground block mb-1"
            >
              Initial Storage Depot:
            </label>
            <select
              value={depotId}
              onChange={(e) => setDepotId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground cursor-pointer"
            >
              {depots.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div>
            <label
              htmlFor=""
              className="font-semibold text-muted-foreground block mb-1 text-[11px]"
            >
              Initial Stock:
            </label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="text-xs"
            />
          </div>
          <div>
            <label
              htmlFor=""
              className="font-semibold text-muted-foreground block mb-1 text-[11px]"
            >
              Unit (kits, boxes, etc.):
            </label>
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="text-xs"
            />
          </div>
          <div>
            <label
              htmlFor=""
              className="font-semibold text-muted-foreground block mb-1 text-[11px]"
            >
              Min Alert Level:
            </label>
            <Input
              type="number"
              min={1}
              value={minThreshold}
              onChange={(e) => setMinThreshold(parseInt(e.target.value) || 0)}
              className="text-xs"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor=""
            className="font-semibold text-foreground block mb-1"
          >
            Custody Contact Officer:
          </label>
          <select
            value={contactOfficer}
            onChange={(e) => setContactOfficer(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground cursor-pointer"
          >
            {usersList.map((user) => (
              <option key={user.id} value={user.name}>
                {user.name} • {user.badgeTitle}
              </option>
            ))}
          </select>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-primary font-bold text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add to Logistics Inventory
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
