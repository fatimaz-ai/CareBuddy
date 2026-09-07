/*
 * WARNING: this key lives in client-side code that ships to every visitor's
 * browser, so anyone can read it from view-source or devtools and reuse it.
 * Fine for a local demo; for a real deployment proxy this call through a
 * backend that holds the key server-side.
 */
const GEMINI_CONFIG = {
  apiKey: "AQ.Ab8RN6LdhgVRJVba7fphK3k2g5ItfeB1JGyIOGotMsCSZaO_Rw",
  // gemini-3.6-flash is a "thinking" model that reliably took 25-35s to
  // respond (even to a trivial prompt), which blew the request timeout
  // below and caused every call to silently fall back to MOCK_TRIAGE_RESULT.
  // gemini-3.1-flash-lite returns comparable structured output in ~5s.
  endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
};

export const TRIAGE_META = {
  "HIGH RISK": { emoji: "🔴", en: "High Risk", ur: "زیادہ خطرہ" },
  MODERATE: { emoji: "🟡", en: "Moderate", ur: "درمیانہ خطرہ" },
  LOW: { emoji: "🟢", en: "Low", ur: "کم خطرہ" },
};

const AI_TRIAGE_TIMEOUT_MS = 45000;

function summarizeProfile(profile) {
  if (!profile) return "none provided";
  const parts = [
    profile.age && `Age: ${profile.age}`,
    profile.gender && `Gender: ${profile.gender}`,
    profile.bloodGroup && `Blood Group: ${profile.bloodGroup}`,
    profile.chronicConditions && `Chronic Conditions: ${profile.chronicConditions}`,
    profile.allergies && `Known Allergies: ${profile.allergies}`,
    profile.medications && `Daily Medications: ${profile.medications}`,
  ].filter(Boolean);
  return parts.length ? parts.join("; ") : "none provided";
}

function summarizeHistory(history) {
  if (!Array.isArray(history) || history.length === 0) return "none recorded";
  return history
    .slice(0, 5)
    .map((entry) => {
      const date = typeof entry.at === "string" ? entry.at.slice(0, 10) : "unknown date";
      const detail = entry.inputSummary || entry.summary || "no details";
      return `[${date}] ${entry.triage || "UNKNOWN"} — ${detail}`;
    })
    .join(" | ");
}

function buildTriagePrompt(symptomText, context = {}) {
  const contextBlock = `Patient Baseline Profile: ${summarizeProfile(context.profile)}. Past Medical Incidents: ${summarizeHistory(
    context.history
  )}. Analyze the new input considering these underlying health factors.`;

  return `You are a cautious pre-hospital triage assistant inside a first-aid app used in Pakistan. ${contextBlock}

A user reports the following (possibly a mix of English, Urdu, and Roman Urdu): "${symptomText}"

Return your assessment via the provided JSON schema.
- "triage": use "HIGH RISK" only when symptoms suggest an immediate life-threatening emergency (e.g. severe chest pain, breathing distress, uncontrolled bleeding, unconsciousness). Use "MODERATE" for concerning but non-critical symptoms, and "LOW" for mild/minor complaints.
- "summary": a single <=3 sentence dual-language clinical summary for a doctor — write it in English first, then the same meaning again in Urdu script, so both languages appear in the one string.
- "dos": exactly 3 short, immediate first-aid actions specific to these reported symptoms that are safe and helpful to take right now, each given in both English and Urdu.
- "donts": exactly 3 short, specific things to avoid given these reported symptoms, each given in both English and Urdu.
- "medicines": if triage is "HIGH RISK", return an empty array (do not suggest self-medication for an emergency). Otherwise, up to 3 general over-the-counter medicine *categories* relevant to the reported symptoms (e.g. "Paracetamol for fever/pain", "ORS for dehydration", "an antihistamine for mild allergic reaction"). Generic category names only — no brand names, no dosages, no prescription-only or controlled drugs — each given in both English and Urdu.
Keep each "dos"/"donts"/"medicines" item to one short sentence.

This is a demo advisory tool, not a diagnosis. If symptoms are vague, keep guidance general and favor caution.`;
}

const TRIAGE_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    triage: { type: "STRING", enum: ["HIGH RISK", "MODERATE", "LOW"] },
    summary: { type: "STRING" },
    dos: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { en: { type: "STRING" }, ur: { type: "STRING" } },
        required: ["en", "ur"],
      },
    },
    donts: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { en: { type: "STRING" }, ur: { type: "STRING" } },
        required: ["en", "ur"],
      },
    },
    medicines: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { en: { type: "STRING" }, ur: { type: "STRING" } },
        required: ["en", "ur"],
      },
    },
  },
  required: ["triage", "summary", "dos", "donts", "medicines"],
};

export async function fetchAiTriage(symptomText, context) {
  const url = `${GEMINI_CONFIG.endpoint}?key=${GEMINI_CONFIG.apiKey}`;
  const body = {
    contents: [{ parts: [{ text: buildTriagePrompt(symptomText, context) }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: TRIAGE_RESPONSE_SCHEMA,
      temperature: 0.2,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TRIAGE_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      // Keep this call on the browser's normal referrer behavior regardless
      // of the page-wide no-referrer policy set for the Google TTS requests.
      referrerPolicy: "strict-origin-when-cross-origin",
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    throw new Error(`Gemini API error ${res.status}`);
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) {
    throw new Error("Empty response from Gemini API");
  }
  return JSON.parse(raw);
}

/* Static, always-available response used when the live Gemini call fails,
 * throws, or times out — so a demo never shows a raw error state. */
export const MOCK_TRIAGE_RESULT = {
  triage: "MODERATE",
  summary:
    "Reported symptoms suggest a moderate, non-critical condition — monitor closely and seek in-person care if things worsen. رپورٹ کردہ علامات درمیانے درجے کی، غیر تشویشناک حالت کی نشاندہی کرتی ہیں — قریب سے نگرانی کریں اور بگاڑ کی صورت میں طبی امداد حاصل کریں۔",
  dos: [
    { en: "Keep the person calm and in a comfortable resting position", ur: "شخص کو پرسکون اور آرام دہ حالت میں بٹھائیں" },
    { en: "Monitor breathing, pulse, and consciousness closely", ur: "سانس، نبض اور ہوش کی قریب سے نگرانی کریں" },
    { en: "Contact a doctor or emergency line if symptoms worsen", ur: "علامات بگڑنے پر ڈاکٹر یا ایمرجنسی لائن سے رابطہ کریں" },
  ],
  donts: [
    { en: "Do not leave the person unattended", ur: "شخص کو تنہا نہ چھوڑیں" },
    { en: "Do not give food, water, or medicine without medical advice", ur: "طبی مشورے کے بغیر کھانا، پانی یا دوا نہ دیں" },
    { en: "Do not delay seeking professional medical help if symptoms persist", ur: "علامات برقرار رہنے پر طبی امداد میں تاخیر نہ کریں" },
  ],
  medicines: [
    { en: "Paracetamol for mild fever or pain, as per package instructions", ur: "ہلکے بخار یا درد کے لیے پیناڈول، پیکٹ کی ہدایت کے مطابق" },
    { en: "ORS (Oral Rehydration Salts) if there are signs of dehydration", ur: "پانی کی کمی کی صورت میں او آر ایس" },
  ],
};
