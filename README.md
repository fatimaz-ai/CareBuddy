# CareBuddy — آسان صحت

**Emergency AI Triage & Personal Health Companion**

CareBuddy is a bilingual, mobile-first first-aid companion built for high-stress
emergency moments in Pakistan. It keeps a person's baseline medical profile on
their own device, uses that context to produce a personalized AI triage note,
and packages everything a first responder needs into a single shareable card.

> ⚕️ **This is a demo advisory tool, not a medical device.** It does not diagnose
> and is not a substitute for professional care. In an emergency, call **1122**.

---

## 📌 Problem Statement

In emergency scenarios, critical delays occur due to literacy barriers, language
constraints, and panic. First responders (like 1122) are often dispatched
without any baseline medical context — allergies, chronic conditions, blood
group, or daily medications — that would let them act faster and more safely on
arrival.

---

## ✨ Key Features

- **Persistent Patient Profiles** — An Instagram-style profile card storing
  baseline medical data (blood group, chronic conditions, allergies, daily
  medications, age, gender, emergency contact) locally via `localStorage`.
  Multiple profiles are supported, each with its own encounter history.
- **Context-Aware Gemini AI Triage** — Every triage request injects the active
  profile *and* that profile's past encounters into the Gemini prompt, so the
  assessment, do / don't guidance, and OTC medicine categories are personalized
  to the patient's real history. Output is returned as a strict JSON schema and
  rendered as a dual-language (English + Urdu) doctor's note.
- **Emergency SOS Card** — Generates a downloadable, lock-screen-ready SOS card
  (name, blood type, allergies, essential meds, emergency contact) in English
  and Urdu, plus clear "call 1122" prompts on any high-risk result.
- **Bilingual Accessibility** — Roman Urdu, Urdu, and English throughout, with
  Web Speech **voice input** for describing symptoms and **text-to-speech**
  playback of the triage note in both languages.
- **Offline Health Directory** — Instant, no-network first-aid guidance for
  common conditions (heatstroke, chest pain, burns, and more).
- **Nearby Clinic Locator** — Uses device geolocation to open hospitals and
  clinics near the user's current position, with a graceful fallback.
- **Resilient by design** — If the AI call fails, errors, or times out, the UI
  falls back to a safe static triage response so a demo never breaks.

---

## 🛠️ Tech Stack

| Layer          | Choice                                                        |
| -------------- | ------------------------------------------------------------- |
| Frontend       | React 18 + Vite 5                                             |
| Styling        | Tailwind CSS 4 (Matcha & Basic Plum theme)                    |
| AI integration | Google Gemini API (`gemini-3.1-flash-lite`, structured JSON)  |
| Persistence    | Browser `localStorage` (profiles + per-profile history)      |
| Accessibility  | Web Speech Synthesis & Recognition APIs                       |
| SOS card       | HTML Canvas rendering → PNG download                          |

No backend — everything runs in the browser.

---

## 🚀 Quick Start

**Prerequisites:** Node.js 18+ and npm.

```bash
# 1. Clone the repository
git clone https://github.com/fatimaz-ai/CareBuddy.git
cd CareBuddy

# 2. Install dependencies
npm install

# 3. Configure your Gemini API key
cp .env.example .env
#   then edit .env and set:
#   VITE_GEMINI_API_KEY=your_api_key_here
#   (get a key at https://aistudio.google.com/apikey)

# 4. Run the dev server
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

Without a key the app still runs — AI triage simply falls back to the built-in
offline response.

### Other scripts

| Command           | Purpose                             |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start the Vite dev server           |
| `npm run build`   | Production build to `dist/`         |
| `npm run preview` | Serve the production build locally  |

---

## 📁 Project Structure

```
src/
├── App.jsx                 # Page shell + routing between Profile / Triage / Directory
├── pages/
│   ├── ProfilePage.jsx     # Medical profile editor + SOS card generator
│   ├── TriagePage.jsx      # Symptom entry + AI triage
│   └── DirectoryPage.jsx   # Offline first-aid directory
├── components/
│   ├── SymptomCommunicator.jsx  # Symptom picker, voice input, triage trigger
│   ├── TriageResult.jsx         # Dual-language result + TTS playback
│   ├── ClinicLocator.jsx        # Geolocation → nearby clinics
│   └── ...
├── lib/
│   ├── gemini.js           # Gemini prompt construction, schema, API call, fallback
│   ├── storage.js          # localStorage profiles + encounter history
│   └── sosCard.js          # Canvas SOS card rendering
└── data/
    ├── checklist.js        # Offline condition guidance
    └── symptoms.js         # Symptom catalog

legacy/                     # Earlier vanilla-JS prototype (kept for reference)
```

---

## 🔒 Privacy & Security Notes

- Patient profiles and history never leave the device — they live only in
  `localStorage`.
- Symptom text *is* sent to Google's Gemini API when AI triage is used.
- Vite inlines `VITE_*` variables into the client bundle, so `VITE_GEMINI_API_KEY`
  is visible to anyone who opens the deployed site. For a real deployment,
  proxy the Gemini call through a backend that holds the key server-side and
  restrict the key by referrer/IP in Google Cloud Console.
- `.env` is gitignored. Never commit real keys.

---

## 🧾 License

Built for a hackathon submission. No license granted yet — add one before reuse.
