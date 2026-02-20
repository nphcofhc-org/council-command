import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DIVINE_NINE_ORGANIZATIONS, type MemberProfile } from "../data/member-profile-api";

type Props = {
  open: boolean;
  email: string | null;
  initialValue: MemberProfile;
  saving: boolean;
  error: string | null;
  onSubmit: (profile: MemberProfile) => Promise<void>;
};

export function MemberProfileRequiredModal({ open, email, initialValue, saving, error, onSubmit }: Props) {
  const [firstName, setFirstName] = useState(initialValue.firstName || "");
  const [lastName, setLastName] = useState(initialValue.lastName || "");
  const [organization, setOrganization] = useState(initialValue.organization || "");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFirstName(initialValue.firstName || "");
    setLastName(initialValue.lastName || "");
    setOrganization(initialValue.organization || "");
    setSubmitError(null);
  }, [open, initialValue.firstName, initialValue.lastName, initialValue.organization]);

  if (!open) return null;

  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0 && organization.trim().length > 0 && !saving;

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/55 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-white/15 bg-black/65 p-6 text-white shadow-[0_40px_140px_rgba(0,0,0,0.55)] nphc-holo-surface">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-xl border border-white/20 bg-white/10 p-2">
            <UserRound className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/70">Member Verification</p>
            <h2 className="text-xl font-semibold text-white">Complete Your Portal Profile</h2>
            <p className="mt-1 text-sm text-white/75">
              First-time access requires your first name, last name, and Divine Nine organization.
            </p>
            {email ? <p className="mt-1 text-xs text-white/55">Signed in as {email}</p> : null}
          </div>
        </div>

        <div className="grid gap-3">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-white/70">First Name</label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="border-white/20 bg-black/35 text-white placeholder:text-white/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-white/70">Last Name</label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="border-white/20 bg-black/35 text-white placeholder:text-white/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-white/70">Organization</label>
            <select
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full rounded-md border border-white/20 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-primary/60"
            >
              <option value="" disabled>
                Select your organization
              </option>
              {DIVINE_NINE_ORGANIZATIONS.map((org) => (
                <option key={org} value={org} className="text-black">
                  {org}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error || submitError ? (
          <p className="mt-3 rounded-md border border-red-300/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {submitError || error}
          </p>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-xs text-white/65">
            <ShieldCheck className="size-4 text-primary" />
            Saved to secure council profile records
          </div>
          <Button
            type="button"
            disabled={!canSubmit}
            className="nphc-holo-btn gap-2 border border-white/20 bg-white/10 text-white hover:bg-white/15"
            onClick={async () => {
              setSubmitError(null);
              try {
                await onSubmit({
                  firstName: firstName.trim(),
                  lastName: lastName.trim(),
                  organization: organization.trim(),
                });
              } catch (e) {
                setSubmitError(e instanceof Error ? e.message : "Failed to save profile.");
              }
            }}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {saving ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
