import { Check, UserPlus } from "lucide-react";
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
import { Textarea } from "#/components/ui/textarea";
import { SKILL_METADATA } from "#/lib/volunteerUtils";
import type { VolunteerSkill, VolunteerStatus } from "#/types";

interface VolunteerRegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VolunteerRegisterModal: React.FC<VolunteerRegisterModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { registerVolunteer, currentUser } = useDisaster();

  const [name, setName] = useState(
    currentUser.role === "verified_citizen" ? currentUser.name : "",
  );
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+1 (555) ");
  const [city, setCity] = useState("San Francisco, CA");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [skills, setSkills] = useState<VolunteerSkill[]>(["first_aid_cpr"]);
  const [certificationsText, setCertificationsText] = useState(
    "FEMA IS-100 / Red Cross CPR",
  );
  const [status, setStatus] = useState<VolunteerStatus>("ready");

  const handleToggleSkill = (sk: VolunteerSkill) => {
    setSkills((prev) =>
      prev.includes(sk) ? prev.filter((s) => s !== sk) : [...prev, sk],
    );
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert("Please provide your name and contact phone number.");
      return;
    }

    const certs = certificationsText
      .split(/[,;\n]/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    registerVolunteer({
      name: name.trim(),
      email:
        email.trim() ||
        `${name.toLowerCase().replace(/\s+/g, ".")}@volunteers.emergency.gov`,
      phone: phone.trim(),
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      skills,
      certifications:
        certs.length > 0 ? certs : ["Standard Disaster Volunteer"],
      status,
      location: {
        address: city.trim() || "Bay Area, CA",
        city: city.trim() || "Bay Area, CA",
        lat: 37.7749,
        lng: -122.4194,
      },
      emergencyContact:
        emergencyContact.trim() || "Emergency Services / Next of Kin",
      experienceHours: 0,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <DialogHeader>
          <div className="grid grid-cols-1 sm:flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <UserPlus className="h-4 w-4" />
            </div>
            <div className="text-left">
              <DialogTitle className="capitalize">
                {"REGISTER FIELD VOLUNTEER".toLowerCase()}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                Enlist in the disaster responder network, certify your skills,
                and join emergency task squads.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 max-h-[68vh] overflow-y-auto pr-1">
          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor=""
                className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
              >
                Full Name <span className="text-destructive">*</span>
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="text-xs"
              />
            </div>
            <div>
              <label
                htmlFor=""
                className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
              >
                Emergency Phone <span className="text-destructive">*</span>
              </label>
              <Input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="text-xs"
              />
            </div>
          </div>

          {/* Email & Home City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor=""
                className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
              >
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="volunteer@example.com"
                className="text-xs"
              />
            </div>
            <div>
              <label
                htmlFor=""
                className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
              >
                Home Base / Sector City
              </label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="text-xs"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <label
              htmlFor=""
              className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
            >
              Next-of-Kin Emergency Contact (Name & Phone)
            </label>
            <Input
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="e.g. Sarah Jenkins (Spouse) - +1 (555) 234-5678"
              className="text-xs"
            />
          </div>

          {/* Skill Checkboxes */}
          <div>
            <label
              htmlFor=""
              className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1.5"
            >
              Select Verified Skills & Capabilities{" "}
              <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(SKILL_METADATA) as VolunteerSkill[]).map((sk) => {
                const isSelected = skills.includes(sk);
                const meta = SKILL_METADATA[sk];
                return (
                  <button
                    type="button"
                    key={sk}
                    onClick={() => handleToggleSkill(sk)}
                    className={`p-2 rounded-md border cursor-pointer transition-all flex items-start space-x-2 text-left ${
                      isSelected
                        ? `bg-primary/15 border-primary shadow-xs`
                        : "bg-card border-border hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 mt-0.5 rounded-xs border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-secondary"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <div>
                      <div
                        className={`text-xs font-bold ${isSelected ? "text-primary" : "text-foreground"}`}
                      >
                        {meta.label}
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">
                        {meta.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Certifications & Licensures */}
          <div>
            <label
              htmlFor=""
              className="block text-[11px] font-bold text-foreground capitalize tracking-wider mb-1"
            >
              Certifications & Professional Licenses (Comma-separated)
            </label>
            <Textarea
              value={certificationsText}
              onChange={(e) => setCertificationsText(e.target.value)}
              rows={2}
              placeholder="e.g. CERT Graduate, BLS Provider, FAA Part 107, Wilderness EMT, HAM Technician"
              className="text-xs"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-bold uppercase tracking-wider text-xs border border-primary/50"
          >
            Complete Volunteer Enlistment
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
