/*
 * Multi-profile persistence.
 *
 * Everything lives under one key, `carebuddy_profiles`, shaped as:
 *   { activeId: "<id>" | null, profiles: { "<id>": <profileRecord> } }
 *
 * A profile record is the form data plus a stable `id` and its own
 * `history` array (past AI-triage outcomes), so switching the active
 * profile switches the medical context handed to the Gemini triage call.
 */
const PROFILES_KEY = "carebuddy_profiles";

// Legacy single-profile keys — read once, migrated into the dictionary above.
const LEGACY_PROFILE_KEY = "carebuddy_profile";
const LEGACY_HISTORY_KEY = "carebuddy_history";

const HISTORY_LIMIT = 10;

const EMPTY_STORE = { activeId: null, profiles: {} };

function newId() {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function normalize(store) {
  const profiles = store && typeof store.profiles === "object" && store.profiles ? store.profiles : {};
  const ids = Object.keys(profiles);
  let activeId = store && store.activeId;
  if (!activeId || !profiles[activeId]) activeId = ids[0] || null;
  return { activeId, profiles };
}

function migrateLegacy() {
  try {
    const rawProfile = localStorage.getItem(LEGACY_PROFILE_KEY);
    if (!rawProfile) return null;

    const legacyProfile = JSON.parse(rawProfile);
    if (!legacyProfile || typeof legacyProfile !== "object") return null;

    let legacyHistory = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(LEGACY_HISTORY_KEY));
      if (Array.isArray(parsed)) legacyHistory = parsed;
    } catch {
      /* ignore malformed legacy history */
    }

    const id = newId();
    const store = {
      activeId: id,
      profiles: { [id]: { ...legacyProfile, id, history: legacyHistory.slice(0, HISTORY_LIMIT) } },
    };
    writeStore(store);
    localStorage.removeItem(LEGACY_PROFILE_KEY);
    localStorage.removeItem(LEGACY_HISTORY_KEY);
    return store;
  } catch {
    return null;
  }
}

function readStore() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch {
    /* fall through to migration / empty */
  }
  return migrateLegacy() || { ...EMPTY_STORE };
}

function writeStore(store) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(normalize(store)));
  } catch {
    /* localStorage unavailable (private mode / quota) — data just won't persist */
  }
}

/** The full store: `{ activeId, profiles }`. */
export function loadStore() {
  return readStore();
}

/** Lightweight list for the profile switcher dropdown. */
export function listProfiles() {
  const { profiles } = readStore();
  return Object.values(profiles)
    .map((p) => ({ id: p.id, name: p.name || "Unnamed" }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** The currently active profile record, or `null` if none saved yet. */
export function loadActiveProfile() {
  const { activeId, profiles } = readStore();
  return activeId ? profiles[activeId] || null : null;
}

/**
 * Upsert a profile and make it active. Pass `profile.id` to update an
 * existing record (its stored `history` is preserved); omit it to create
 * a new one. Returns the saved record.
 */
export function saveProfile(profile) {
  const store = readStore();
  const id = profile.id || newId();
  const existing = store.profiles[id] || {};
  const merged = {
    ...existing,
    ...profile,
    id,
    history: Array.isArray(existing.history)
      ? existing.history
      : Array.isArray(profile.history)
      ? profile.history
      : [],
  };
  store.profiles[id] = merged;
  store.activeId = id;
  writeStore(store);
  return merged;
}

/** Switch the active profile. Returns the newly active record (or `null`). */
export function setActiveProfile(id) {
  const store = readStore();
  if (store.profiles[id]) {
    store.activeId = id;
    writeStore(store);
  }
  return loadActiveProfile();
}

/** Delete a profile. Returns whatever profile is active afterwards (or `null`). */
export function deleteProfile(id) {
  const store = readStore();
  delete store.profiles[id];
  if (store.activeId === id) store.activeId = null;
  writeStore(store);
  return loadActiveProfile();
}

/**
 * Wipe every CareBuddy key from localStorage so the app returns to its
 * first-run onboarding state. Backs the "Clear All Local Data / Reset Demo"
 * button — the caller is expected to reload the app afterwards.
 */
export function clearAllData() {
  try {
    localStorage.removeItem(PROFILES_KEY);
    localStorage.removeItem(LEGACY_PROFILE_KEY);
    localStorage.removeItem(LEGACY_HISTORY_KEY);
  } catch {
    /* localStorage unavailable — nothing to clear */
  }
}

/** Past AI-triage outcomes for a given profile, newest first. */
export function loadHistory(profileId) {
  if (!profileId) return [];
  const { profiles } = readStore();
  const history = profiles[profileId]?.history;
  return Array.isArray(history) ? history : [];
}

/** Record a triage outcome against a profile's timeline. */
export function appendHistory(profileId, entry) {
  if (!profileId) return;
  const store = readStore();
  const profile = store.profiles[profileId];
  if (!profile) return;
  profile.history = [{ ...entry, at: new Date().toISOString() }, ...(profile.history || [])].slice(
    0,
    HISTORY_LIMIT
  );
  writeStore(store);
}
