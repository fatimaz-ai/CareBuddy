# CareBuddy — Hackathon Submission Draft

## 1. Hackathon Project Write-Up

**CareBuddy — a bilingual AI first-aid companion for emergencies in Pakistan**

In Pakistan, medical emergencies are made worse by two compounding barriers. Low literacy
and limited English fluency mean many people cannot read standard health guidance or
clearly describe what is wrong to a responder. At the same time, triage is delayed:
callers struggle to convey urgency, first responders arrive with no medical background on
the patient, and critical facts — blood group, allergies, chronic conditions, daily
medications — are lost in the panic of the moment. Every minute of that delay costs lives.

CareBuddy closes those gaps. A user taps icons or types symptoms in Urdu, Roman Urdu, or
English, and an AI triage engine returns a risk level (High / Moderate / Low), a
dual-language doctor's note, and specific do's and don'ts — which can be read aloud in
Urdu for non-readers. Every assessment is enriched with the patient's persistent profile
and their past triage history, so the guidance is personalised rather than generic. For
true emergencies, CareBuddy produces an offline lockscreen SOS card — a downloadable image
carrying the patient's essential medical data that any first responder can read without
unlocking the phone — and prepares a pre-filled 1122 dispatch message bundling the symptom
summary and GPS location.

The app is built with **React** and **Vite**, uses the **Gemini 1.5 Flash API** for
structured triage output, persists profiles and history in the browser via
**LocalStorage** for offline-first use, and taps the **Web Speech APIs** for Urdu voice
output and voice symptom entry. The SOS card is rendered client-side with the Canvas API.

*(~250 words)*

---

## 2. Slide Deck Content (5 Slides)

### Slide 1 — Problem & Vision

**Title:** When every minute counts, language shouldn't be the barrier

- **~58% adult literacy** and low English fluency — millions cannot read standard
  first-aid material or fill in English medical forms.
- In an emergency, callers can't convey urgency clearly, so **triage and dispatch are
  delayed**.
- First responders arrive **blind** — no blood group, allergies, or chronic-condition
  history for the patient in front of them.
- **Vision:** a phone-first, bilingual companion that triages symptoms, speaks back in
  Urdu, and puts life-saving patient data in a responder's hands in seconds — online or
  offline.

---

### Slide 2 — Core Architecture & Features

**Title:** One profile, instant triage, one-tap dispatch

- **Persistent patient profile** — name, age, blood group, allergies, medications,
  chronic conditions, and emergency contact; multiple profiles per device (family use).
- **Gemini AI triage** — symptoms in Urdu / Roman Urdu / English → structured JSON:
  risk level, bilingual doctor's summary, 3 do's, 3 don'ts, and safe OTC categories
  (suppressed for High-Risk cases).
- **Offline lockscreen SOS card** — Canvas-rendered PNG with critical medical data +
  emergency contact, saved to the phone lockscreen for first-responder access.
- **1122 dispatch payload** — pre-filled emergency SMS bundling the symptom summary and a
  Google Maps GPS link, opened straight into the native SMS app.
- **Nearby clinic locator** and a **common-conditions first-aid directory**.

---

### Slide 3 — Technical Implementation

**Title:** Lightweight React, context-aware AI, graceful offline fallback

- **React state flow:** `App` loads the active profile from LocalStorage on boot and
  routes between Profile / Triage / Directory; symptom selection state lives in
  `TriagePage` and is composed into a single summary string.
- **Dynamic context injection:** each Gemini call is built from the active profile's
  baseline (conditions, allergies, meds) *plus* that profile's last 5 triage outcomes, so
  the model reasons over the patient's real history — switching profile switches the
  medical context.
- **Structured output:** `responseSchema` + `responseMimeType: application/json` force a
  predictable triage object; `temperature 0.2` for consistency.
- **Offline / failure fallback:** an `AbortController` timeout and a static
  `MOCK_TRIAGE_RESULT` mean a failed or slow API call never shows a broken state.
- **Persistence:** single LocalStorage key, legacy-key migration, capped history,
  try/catch around every read/write for private-mode safety.
- **Stack:** React 18, Vite 5, Tailwind CSS 4 — zero backend, deployable as static files.

---

### Slide 4 — Real-World Accessibility & Impact

**Title:** Built for the person who can't read the screen

- **Urdu voice UI** — "Read Aloud in Urdu" speaks the triage summary via Google TTS with
  a `SpeechSynthesis` fallback; voice symptom entry via `SpeechRecognition` (`ur-PK`).
- **Tap-first symptom input** — icon grid means no typing required to get a triage.
- **Every label bilingual** — English and Urdu script side by side throughout the UI.
- **First-responder access** — the lockscreen SOS card needs no app, no unlock, no
  internet: blood group and allergies are readable in the first 5 seconds on scene.
- **Impact:** faster, better-informed dispatch; fewer medication/allergy errors during
  first aid; health guidance that reaches low-literacy users who standard apps exclude.

---

### Slide 5 — Roadmap & Future Scale

**Title:** From a device-local demo to national infrastructure

- **Cloud sync** — optional account-based backup so a profile follows the patient across
  devices and is retrievable if the phone is lost or destroyed.
- **Backend API proxy** — move the Gemini key server-side, add rate limiting, logging, and
  a fine-tuned triage model validated against Pakistani epidemiology (dengue, heatstroke,
  snakebite).
- **Hospital & 1122 APIs** — real dispatch integration: push the structured triage packet
  directly into responder systems instead of a manual SMS; pre-notify the receiving ER.
- **Offline PWA + SMS-only mode** — full service-worker install and a USSD/SMS fallback
  for feature phones and no-data areas.
- **Provincial health-department partnerships** for distribution, local-language
  expansion (Pashto, Sindhi, Punjabi, Balochi), and CHW (community health worker)
  dashboards.

---

## Notes for the submitter (remove before submitting)

A few details in the requested copy don't match the current code — confirm which is
authoritative:

- **AI model:** `src/lib/gemini.js` calls `gemini-3.1-flash-lite` (via the
  `generativelanguage.googleapis.com/v1beta` endpoint), not Gemini 1.5 Flash. Update the
  write-up/slides or the code so they agree.
- **1122 SMS dispatch:** the pre-filled `sms:1122` payload with geolocation currently
  lives in `legacy/app.js`, not in the active React app (`src/`). The React version has
  the clinic locator but not the 1122 SMS feature yet — either port it in or describe it
  as "in the vanilla-JS prototype".
- **Voice symptom input** (`SpeechRecognition`, `ur-PK`) is also only in `legacy/app.js`;
  the React app currently ships Urdu read-aloud output (`SpeechSynthesis` + Google TTS)
  but not voice input.
- **API key** is hard-coded in client code (`src/lib/gemini.js`) — fine for a demo, but
  rotate it and proxy through a backend before any public deployment.
