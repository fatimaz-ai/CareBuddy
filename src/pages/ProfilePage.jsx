import { useEffect, useRef, useState } from "react";
import Section from "../components/Section.jsx";
import FieldShell, { fieldControlClass } from "../components/FieldShell.jsx";
import Button from "../components/Button.jsx";
import { drawSosCard } from "../lib/sosCard.js";
import { saveProfile, setActiveProfile, deleteProfile, listProfiles, clearAllData } from "../lib/storage.js";
import { TRIAGE_META } from "../lib/gemini.js";

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

const NEW_PROFILE = "__new__";

const EMPTY_FORM = {
  name: "",
  age: "",
  gender: "",
  bloodGroup: "",
  chronicConditions: "",
  allergies: "",
  medications: "",
  emergencyContact: "",
};

function toForm(profile) {
  const base = { ...EMPTY_FORM };
  if (!profile) return base;
  for (const key of Object.keys(EMPTY_FORM)) {
    if (profile[key] != null) base[key] = profile[key];
  }
  return base;
}

function initialsOf(name) {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function splitTags(value) {
  return String(value || "")
    .split(/[,،;\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return typeof iso === "string" ? iso.slice(0, 10) : "—";
  }
}

/* ---------- View-mode building blocks ---------- */

const BADGE_TONES = {
  ochre: "border-ochre/50 bg-ochre-bg text-ochre",
  terracotta: "border-terracotta/50 bg-terracotta-bg text-terracotta",
  moss: "border-moss/50 bg-moss-bg text-moss",
};

function BadgeGroup({ label, urduLabel, icon, items, tone }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-soft">
          {icon} {label}
        </span>
        <span className="urdu text-xs text-ink-soft">{urduLabel}</span>
      </div>
      {items.length ? (
        <ul className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${BADGE_TONES[tone]}`}
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-ink-soft/70">None recorded · کوئی نہیں</p>
      )}
    </div>
  );
}

const SEVERITY_TONES = {
  "HIGH RISK": "border-terracotta bg-terracotta-bg text-terracotta",
  MODERATE: "border-ochre bg-ochre-bg text-ochre",
  LOW: "border-moss bg-moss-bg text-moss",
};

function Timeline({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        No past triage logs yet — they appear here after your first AI assessment.
        <span className="urdu mt-1 block">ابھی تک کوئی رپورٹ نہیں</span>
      </p>
    );
  }

  return (
    <ol className="space-y-0">
      {entries.map((entry, i) => {
        const meta = TRIAGE_META[entry.triage] || TRIAGE_META.MODERATE;
        const tone = SEVERITY_TONES[entry.triage] || SEVERITY_TONES.MODERATE;
        return (
          <li key={entry.at || i} className="relative border-l-2 border-clay/20 pb-5 pl-5 last:border-l-transparent last:pb-0">
            <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-clay" aria-hidden="true" />
            <div className="flex flex-wrap items-center gap-2">
              <time className="font-mono text-xs text-ink-soft">{formatDate(entry.at)}</time>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${tone}`}>
                <span aria-hidden="true">{meta.emoji}</span>
                {meta.en}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-line text-sm text-ink-dark">
              {entry.inputSummary || entry.summary || "No details recorded"}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

function ProfileSwitcher({ profiles, value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="profile-switcher" className="flex items-baseline gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-soft">Active Profile</span>
        <span className="urdu text-xs text-ink-soft">پروفائل منتخب کریں</span>
      </label>
      <select
        id="profile-switcher"
        className={`${fieldControlClass} text-base sm:w-auto sm:min-w-[14rem]`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
        <option value={NEW_PROFILE}>➕ Add New Profile</option>
      </select>
    </div>
  );
}

/* ---------- Page ---------- */

export default function ProfilePage({ profile, onProfileChange }) {
  const [profiles, setProfiles] = useState(() => listProfiles());
  const [creatingNew, setCreatingNew] = useState(!profile);
  const [editing, setEditing] = useState(!profile);
  const [form, setForm] = useState(() => toForm(profile));
  const [previewUrl, setPreviewUrl] = useState(null);
  const formRef = useRef(null);
  const canvasRef = useRef(null);

  // Re-sync whenever App swaps the active profile underneath us.
  useEffect(() => {
    setProfiles(listProfiles());
    setForm(toForm(profile));
    setCreatingNew(!profile);
    setEditing(!profile);
    setPreviewUrl(null);
  }, [profile]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSwitch(value) {
    if (value === NEW_PROFILE) {
      setForm({ ...EMPTY_FORM });
      setCreatingNew(true);
      setEditing(true);
      return;
    }
    if (value === profile?.id) return;
    const next = setActiveProfile(value);
    onProfileChange?.(next);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!formRef.current.reportValidity()) return;

    const trimmed = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
    );
    const payload = creatingNew ? trimmed : { ...trimmed, id: profile.id };
    const saved = saveProfile(payload);

    setProfiles(listProfiles());
    setCreatingNew(false);
    setEditing(false);
    onProfileChange?.(saved, { saved: true });
  }

  function handleCancelEdit() {
    setForm(toForm(profile));
    setCreatingNew(false);
    setEditing(false);
  }

  function handleDelete() {
    if (!profile) return;
    if (!window.confirm(`Delete the profile for ${profile.name || "this patient"}? This can't be undone.`)) return;
    const nextActive = deleteProfile(profile.id);
    setProfiles(listProfiles());
    onProfileChange?.(nextActive);
  }

  function handleDownloadCard() {
    if (!profile) return;
    drawSosCard(canvasRef.current, {
      name: profile.name,
      blood: profile.bloodGroup,
      allergies: profile.allergies,
      contact: profile.emergencyContact,
      meds: profile.medications,
    });
    const dataUrl = canvasRef.current.toDataURL("image/png");
    setPreviewUrl(dataUrl);

    const link = document.createElement("a");
    link.download = `CareBuddy_SOS_${(profile.name || "card").replace(/\s+/g, "_")}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleReset() {
    if (
      !window.confirm(
        "Clear ALL locally saved profiles and triage history from this browser? " +
          "The app will reload to a fresh onboarding screen. This can't be undone."
      )
    )
      return;
    clearAllData();
    window.location.reload();
  }

  const resetFooter = (
    <div className="mt-10 border-t-2 border-dashed border-clay/25 pt-6">
      <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-soft">
        Demo Controls <span className="urdu tracking-normal">ڈیمو کنٹرول</span>
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={handleReset}
        className="border-terracotta/60 text-terracotta hover:border-terracotta hover:bg-terracotta/5"
      >
        <span aria-hidden="true">🧹</span>
        <span>Clear All Local Data / Reset Demo</span>
      </Button>
    </div>
  );

  const switcherValue = creatingNew ? NEW_PROFILE : profile?.id ?? NEW_PROFILE;

  /* ---------- VIEW MODE: Instagram-style profile card ---------- */
  if (!editing && profile) {
    return (
      <Section
        first
        index="01"
        eyebrow="Saved Once, Used Everywhere"
        title="Patient Profile"
        urduTitle="مریض کی معلومات"
        subtitle="Saved on this device and reused automatically for every triage — no need to type it again."
        urduSubtitle="یہ معلومات اس ڈیوائس پر محفوظ ہیں اور ہر بار خودکار استعمال ہوں گی"
      >
        {profiles.length > 0 && (
          <div className="mb-6">
            <ProfileSwitcher profiles={profiles} value={switcherValue} onChange={handleSwitch} />
          </div>
        )}

        <article className="overflow-hidden rounded-2xl border-2 border-clay/25 bg-white shadow-sm">
          {/* Header band */}
          <div className="flex flex-col items-center gap-4 border-b-2 border-clay/15 px-6 py-8 text-center sm:flex-row sm:text-left">
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-[#3D104B] font-display text-4xl font-bold text-[#B3D47A] shadow-md">
              {initialsOf(profile.name)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-2xl font-semibold text-ink">{profile.name || "Unnamed patient"}</h3>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {profile.age && (
                  <span className="rounded-full border-2 border-clay/25 bg-white px-3 py-1 text-xs font-medium text-ink-dark">
                    {profile.age} yrs
                  </span>
                )}
                {profile.gender && (
                  <span className="rounded-full border-2 border-clay/25 bg-white px-3 py-1 text-xs font-medium text-ink-dark">
                    {profile.gender}
                  </span>
                )}
                {profile.bloodGroup && (
                  <span className="inline-flex items-center gap-1 rounded-full border-2 border-terracotta bg-terracotta-bg px-3 py-1 font-mono text-xs font-bold text-terracotta">
                    <span aria-hidden="true">🩸</span>
                    {profile.bloodGroup}
                  </span>
                )}
                {profile.emergencyContact && (
                  <span className="rounded-full border-2 border-clay/25 bg-white px-3 py-1 text-xs font-medium text-ink-dark">
                    ☎ {profile.emergencyContact}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Medical badges grid */}
          <div className="grid gap-5 px-6 py-6 sm:grid-cols-3">
            <BadgeGroup
              label="Chronic Conditions"
              urduLabel="دائمی امراض"
              icon="🩺"
              tone="ochre"
              items={splitTags(profile.chronicConditions)}
            />
            <BadgeGroup
              label="Allergies"
              urduLabel="الرجی"
              icon="⚠️"
              tone="terracotta"
              items={splitTags(profile.allergies)}
            />
            <BadgeGroup
              label="Current Meds"
              urduLabel="ادویات"
              icon="💊"
              tone="moss"
              items={splitTags(profile.medications)}
            />
          </div>

          {/* Past medical logs timeline */}
          <div className="border-t-2 border-clay/15 px-6 py-6">
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <h4 className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-soft">🕑 Past Medical Logs</h4>
              <span className="urdu text-xs text-ink-soft">پرانی رپورٹس</span>
            </div>
            <Timeline entries={profile.history} />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 border-t-2 border-clay/15 bg-paper/40 px-6 py-5">
            <Button type="button" onClick={() => setEditing(true)}>
              <span aria-hidden="true">✏️</span>
              <span>Edit Profile</span>
              <span className="urdu">تبدیلی کریں</span>
            </Button>
            <Button type="button" variant="outline" onClick={handleDownloadCard}>
              <span aria-hidden="true">⬇</span>
              <span>Lockscreen SOS Card</span>
            </Button>
            {profiles.length > 1 && (
              <Button type="button" variant="ghost" onClick={handleDelete}>
                <span aria-hidden="true">🗑</span>
                <span>Delete</span>
              </Button>
            )}
            <canvas ref={canvasRef} width={1080} height={1920} className="hidden" />
          </div>
        </article>

        {previewUrl && (
          <img
            src={previewUrl}
            alt="SOS card preview"
            className="mt-5 max-w-[140px] rounded-lg border-2 border-clay/40 shadow-md"
          />
        )}

        {resetFooter}
      </Section>
    );
  }

  /* ---------- EDIT MODE: form ---------- */
  return (
    <Section
      first
      index="01"
      eyebrow={creatingNew ? "New Profile" : "Edit Profile"}
      title="Patient Profile"
      urduTitle="مریض کی معلومات"
      subtitle={
        creatingNew
          ? "Fill this in once — it's saved on this device and reused for every triage."
          : "Update the details below, then save to return to the profile card."
      }
      urduSubtitle="ایک بار پُر کریں — یہ ہر بار خودکار استعمال ہوں گی"
    >
      {profiles.length > 0 && (
        <div className="mb-6">
          <ProfileSwitcher profiles={profiles} value={switcherValue} onChange={handleSwitch} />
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FieldShell label="Full Name" urduLabel="نام">
          <input
            className={fieldControlClass}
            type="text"
            required
            placeholder="e.g. Ahmed Khan"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </FieldShell>

        <FieldShell label="Age" urduLabel="عمر">
          <input
            className={fieldControlClass}
            type="number"
            min="0"
            max="130"
            required
            placeholder="e.g. 34"
            value={form.age}
            onChange={(e) => updateField("age", e.target.value)}
          />
        </FieldShell>

        <FieldShell label="Gender" urduLabel="جنس">
          <select
            className={fieldControlClass}
            required
            value={form.gender}
            onChange={(e) => updateField("gender", e.target.value)}
          >
            <option value="" disabled>
              Select…
            </option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </FieldShell>

        <FieldShell label="Blood Group" urduLabel="بلڈ گروپ">
          <select
            className={fieldControlClass}
            required
            value={form.bloodGroup}
            onChange={(e) => updateField("bloodGroup", e.target.value)}
          >
            <option value="" disabled>
              Select…
            </option>
            {BLOOD_GROUPS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </FieldShell>

        <FieldShell className="md:col-span-2" label="Chronic Conditions" urduLabel="دائمی امراض">
          <input
            className={fieldControlClass}
            type="text"
            placeholder="e.g. Diabetes, Asthma"
            value={form.chronicConditions}
            onChange={(e) => updateField("chronicConditions", e.target.value)}
          />
        </FieldShell>

        <FieldShell label="Known Allergies" urduLabel="الرجی">
          <input
            className={fieldControlClass}
            type="text"
            placeholder="e.g. Penicillin"
            value={form.allergies}
            onChange={(e) => updateField("allergies", e.target.value)}
          />
        </FieldShell>

        <FieldShell label="Daily Medications" urduLabel="روزمرہ ادویات">
          <input
            className={fieldControlClass}
            type="text"
            placeholder="e.g. Insulin, Aspirin"
            value={form.medications}
            onChange={(e) => updateField("medications", e.target.value)}
          />
        </FieldShell>

        <FieldShell className="md:col-span-2" label="Emergency Contact (optional)" urduLabel="ایمرجنسی نمبر">
          <input
            className={fieldControlClass}
            type="tel"
            placeholder="e.g. 0300-1234567"
            value={form.emergencyContact}
            onChange={(e) => updateField("emergencyContact", e.target.value)}
          />
        </FieldShell>

        <div className="mt-2 flex flex-wrap items-center gap-4 md:col-span-2">
          <Button type="submit">
            <span aria-hidden="true">💾</span>
            <span>Save Changes</span>
            <span className="urdu">محفوظ کریں</span>
          </Button>
          {profile && (
            <Button type="button" variant="ghost" onClick={handleCancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {resetFooter}
    </Section>
  );
}
