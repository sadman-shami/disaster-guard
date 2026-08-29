import { Truck } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { useDisaster } from "#/components/provider/DisasterProvider";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import type { EmergencyResource, Incident } from "#/types";

interface AllocateResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetIncident?: Incident;
  preselectedResource?: EmergencyResource;
}

export const AllocateResourceModal: React.FC<AllocateResourceModalProps> = ({
  open,
  onOpenChange,
  targetIncident,
  preselectedResource,
}) => {
  const { incidents, resources, depots, allocateResourceToIncident } =
    useDisaster();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    targetIncident?.id || incidents[0]?.id || "",
  );
  const [selectedResourceId, setSelectedResourceId] = useState<string>(
    preselectedResource?.id || resources[0]?.id || "",
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (targetIncident) {
      setSelectedIncidentId(targetIncident.id);
    }
  }, [targetIncident]);

  useEffect(() => {
    if (preselectedResource) {
      setSelectedResourceId(preselectedResource.id);
    }
  }, [preselectedResource]);

  const activeIncidents = incidents.filter((i) => i.status !== "resolved");
  const chosenIncident = incidents.find((i) => i.id === selectedIncidentId);
  const chosenResource = resources.find((r) => r.id === selectedResourceId);
  const chosenDepot = depots.find((d) => d.id === chosenResource?.depotId);

  const maxAvailable = chosenResource?.availableQuantity || 0;

  const handleDispatch = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chosenIncident || !chosenResource || !chosenDepot) return;
    if (quantity <= 0 || quantity > maxAvailable) {
      alert(`Please choose a quantity between 1 and ${maxAvailable}`);
      return;
    }

    allocateResourceToIncident(
      chosenIncident.id,
      chosenResource.id,
      quantity,
      chosenDepot.id,
      notes.trim() || undefined,
    );
    setQuantity(1);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-2xl">
      <DialogHeader>
        <div className="grid grid-cols-1 items-center gap-2">
          <div className="size-10 flex items-center justify-center p-2 rounded-lg bg-primary text-primary-foreground shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div className="text-left">
            <DialogTitle>Dispatch Emergency Supplies</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Authorize logistical convoy dispatch from storage depots to
              incident hotzones.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleDispatch} className="space-y-4 text-xs">
        {/* Incident Selection */}
        <div>
          <label
            htmlFor="inc-sec"
            className="font-semibold text-foreground block mb-1"
          >
            Destination Incident:
          </label>
          <select
            id="inc-sec"
            value={selectedIncidentId}
            onChange={(e) => setSelectedIncidentId(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground cursor-pointer"
          >
            {activeIncidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                [{inc.severity.toUpperCase()}] {inc.title} - {inc.location.city}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Incident Urgent Needs Preview */}
        {chosenIncident && chosenIncident.needs.length > 0 && (
          <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-xs">
            <span className="font-semibold text-destructive block mb-1">
              Field Requested Supplies for this Incident:
            </span>
            <div className="flex flex-wrap gap-1">
              {chosenIncident.needs.map((need: any, idx: number) => (
                <span
                  key={idx}
                  className="bg-card text-foreground px-2 py-0.5 rounded border border-border text-[10px]"
                >
                  {need}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resource Selection */}
        <div>
          <label
            htmlFor="res-sec"
            className="font-semibold text-foreground block mb-1"
          >
            Select Supply Asset to Dispatch:
          </label>
          <select
            id="res-sec"
            value={selectedResourceId}
            onChange={(e) => {
              setSelectedResourceId(e.target.value);
              const r = resources.find((res) => res.id === e.target.value);
              if (r) setQuantity(Math.min(10, r.availableQuantity));
            }}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground cursor-pointer"
          >
            {resources
              .filter((res) => res.availableQuantity > 0)
              .map((res) => (
                <option
                  key={res.id}
                  value={res.id}
                  disabled={res.availableQuantity <= 0}
                >
                  {res.name} (Avail: {res.availableQuantity} {res.unit} at{" "}
                  {res.depotName})
                </option>
              ))}
          </select>
        </div>

        {/* Resource Details & Quantity Slider */}
        {chosenResource && (
          <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">
                {chosenResource.name}
              </span>
              <Badge variant="outline">
                Stock: {chosenResource.availableQuantity} {chosenResource.unit}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Depot: {chosenResource.depotName} • Officer:{" "}
              {chosenResource.contactOfficer}
            </p>

            <div className="pt-2">
              <div className="flex justify-between font-semibold text-xs mb-1">
                <span>Dispatch Quantity:</span>
                <span className="text-primary font-bold">
                  {quantity} {chosenResource.unit}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={Math.max(1, maxAvailable)}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>1 {chosenResource.unit}</span>
                <span>
                  Max Available: {maxAvailable} {chosenResource.unit}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Operational Dispatch Notes */}
        <div>
          <label
            htmlFor="note"
            className="font-semibold text-foreground block mb-1"
          >
            Convoy Route & Operational Notes:
          </label>
          <Input
            id="note"
            placeholder="e.g., Highway Patrol escort via West access gate, priority ETA 15 mins"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-xs"
          />
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
          <Button
            type="submit"
            disabled={maxAvailable <= 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs"
          >
            <Truck className="h-3.5 w-3.5 mr-1.5" />
            Authorize Supply Dispatch
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
