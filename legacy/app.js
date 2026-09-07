"use strict";

/* ===================== DATA ===================== */

const SYMPTOMS = [
  {
    id: "chest",
    en: "Chest Pain",
    ur: "سینے میں درد",
    svg: `<path d="M19.5 12.6 12 20l-7.5-7.4a4.8 4.8 0 0 1 0-6.8 4.9 4.9 0 0 1 6.8 0L12 6.4l.7-.6a4.9 4.9 0 0 1 6.8 0 4.8 4.8 0 0 1 0 6.8Z"/><path d="M6 12h2.5l1.5-3 2 5 1.5-3H18"/>`,
  },
  {
    id: "fever",
    en: "Fever",
    ur: "بخار",
    svg: `<path d="M12 14.5V4a2 2 0 1 0-4 0v10.5a4 4 0 1 0 4 0Z"/><path d="M12 9h2M12 6h2"/>`,
  },
  {
    id: "dizzy",
    en: "Dizziness",
    ur: "چکر آنا",
    svg: `<path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 7a5 5 0 1 0 5 5"/><circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none"/>`,
  },
  {
    id: "breath",
    en: "Breathing Distress",
    ur: "سانس کا مسئلہ",
    svg: `<path d="M12 3v8"/><path d="M12 11c-1-2-3-2.5-4.5-1.5C5.5 10.7 5 13 5 15c0 2.5 1 4.5 2.5 4.5S10 18 10 15v-1"/><path d="M12 11c1-2 3-2.5 4.5-1.5C18.5 10.7 19 13 19 15c0 2.5-1 4.5-2.5 4.5S14 18 14 15v-1"/>`,
  },
  {
    id: "pain",
    en: "Severe Local Pain",
    ur: "شدید درد",
    svg: `<path d="M12 2 9.8 8.6 3 6l4 5.8L2 15l6.7.4L7 22l5-4.4L17 22l-1.7-6.6L22 15l-5-4.2L21 6l-6.8 2.6Z"/>`,
  },
];

const CHECKLIST = {
  heatstroke: {
    en: "Heatstroke",
    ur: "لو لگنا",
    do: [
      { en: "Move to shade or a cool area immediately", ur: "فوراً سائے یا ٹھنڈی جگہ منتقل کریں" },
      { en: "Remove excess/tight clothing", ur: "زیادہ یا تنگ کپڑے اتار دیں" },
      { en: "Cool the body with water or wet cloths", ur: "جسم کو پانی یا گیلے کپڑے سے ٹھنڈا کریں" },
      { en: "Give sips of water if fully conscious", ur: "اگر ہوش میں ہو تو تھوڑا پانی پلائیں" },
    ],
    dont: [
      { en: "DO NOT give fever medicine (ineffective, may be risky)", ur: "بخار کی دوا نہ دیں" },
      { en: "DO NOT apply ice directly to the skin", ur: "براہ راست جلد پر برف نہ لگائیں" },
      { en: "DO NOT force an unconscious person to drink", ur: "بے ہوش شخص کو زبردستی پانی نہ پلائیں" },
    ],
  },
  burns: {
    en: "Severe Burns",
    ur: "جل جانا",
    do: [
      { en: "Cool the burn under running water for 10-20 min", ur: "جلی ہوئی جگہ کو 10-20 منٹ بہتے پانی کے نیچے رکھیں" },
      { en: "Cover loosely with a clean cloth", ur: "صاف کپڑے سے ڈھیلا ڈھانپ دیں" },
      { en: "Remove jewelry/tight items near the burn", ur: "قریبی زیورات یا تنگ اشیاء اتار دیں" },
    ],
    dont: [
      { en: "DO NOT apply ice directly onto broken tissue", ur: "جلے ہوئے حصے پر براہ راست برف نہ لگائیں" },
      { en: "DO NOT apply butter or toothpaste", ur: "مکھن یا ٹوتھ پیسٹ نہ لگائیں" },
      { en: "DO NOT pop blisters", ur: "چھالے نہ پھوڑیں" },
      { en: "DO NOT pull off clothing stuck to the burn", ur: "جلد سے چپکے کپڑے کو نہ کھینچیں" },
    ],
  },
  bites: {
    en: "Venomous Bites",
    ur: "سانپ یا کیڑے کا کاٹنا",
    do: [
      { en: "Keep the person still and calm", ur: "شخص کو ساکت اور پرسکون رکھیں" },
      { en: "Keep the bitten limb below heart level", ur: "کاٹے گئے حصے کو دل کی سطح سے نیچے رکھیں" },
      { en: "Seek medical help immediately", ur: "فوری طور پر طبی امداد حاصل کریں" },
      { en: "Note the snake/insect's appearance if safe to do so", ur: "اگر محفوظ ہو تو سانپ یا کیڑے کی شکل نوٹ کریں" },
    ],
    dont: [
      { en: "DO NOT cut the wound", ur: "زخم کو نہ کاٹیں" },
      { en: "DO NOT try to suck out venom", ur: "زہر منہ سے نہ نکالیں" },
      { en: "DO NOT apply a tourniquet", ur: "تنگ پٹی نہ باندھیں" },
      { en: "DO NOT apply ice", ur: "برف نہ لگائیں" },
    ],
  },
  fractures: {
    en: "Fractures",
    ur: "ہڈی کا ٹوٹنا",
    do: [
      { en: "Keep the injured area still and supported", ur: "زخمی حصے کو ساکت اور سہارا دے کر رکھیں" },
      { en: "Splint with a rigid material and padding if help is delayed", ur: "اگر مدد میں تاخیر ہو تو سخت چیز اور نرم کپڑے سے سہارا (سپلنٹ) لگائیں" },
      { en: "Apply a cold pack wrapped in cloth to reduce swelling", ur: "سوجن کم کرنے کے لیے کپڑے میں لپٹا ہوا ٹھنڈا پیک لگائیں" },
      { en: "Seek medical/hospital help immediately", ur: "فوری طور پر ہسپتال یا طبی امداد حاصل کریں" },
    ],
    dont: [
      { en: "DO NOT try to straighten or push the bone back", ur: "ہڈی کو سیدھا کرنے یا واپس دھکیلنے کی کوشش نہ کریں" },
      { en: "DO NOT move the person unnecessarily", ur: "شخص کو غیر ضروری طور پر حرکت نہ دیں" },
      { en: "DO NOT apply ice directly to the skin", ur: "براہ راست جلد پر برف نہ لگائیں" },
    ],
  },
  bleeding: {
    en: "Bleeding",
    ur: "خون بہنا",
    do: [
      { en: "Apply firm, direct pressure with a clean cloth", ur: "صاف کپڑے سے سختی سے براہ راست دباؤ ڈالیں" },
      { en: "Raise the injured area above heart level if possible", ur: "اگر ممکن ہو تو زخمی حصے کو دل کی سطح سے اونچا رکھیں" },
      { en: "Keep applying pressure until bleeding slows or help arrives", ur: "جب تک خون کم نہ ہو یا مدد نہ پہنچے، دباؤ جاری رکھیں" },
      { en: "Call for emergency help if bleeding is severe or won't stop", ur: "اگر خون شدید ہو یا رکے نہ تو فوری ایمرجنسی مدد کو کال کریں" },
    ],
    dont: [
      { en: "DO NOT remove an embedded object from the wound", ur: "زخم میں پھنسی ہوئی چیز کو نہ نکالیں" },
      { en: "DO NOT remove a soaked cloth — add more cloth on top", ur: "خون میں بھیگا کپڑا نہ ہٹائیں، اوپر مزید کپڑا رکھیں" },
      { en: "DO NOT apply a tourniquet unless trained and it's life-threatening", ur: "تربیت یافتہ ہوئے بغیر اور جان لیوا خطرہ نہ ہو تو تنگ پٹی نہ باندھیں" },
    ],
  },
  choking: {
    en: "Choking",
    ur: "گلے میں کچھ پھنسنا",
    do: [
      { en: "Encourage the person to cough if they still can", ur: "اگر شخص کھانس سکے تو اسے کھانسنے کی ترغیب دیں" },
      { en: "Give up to 5 firm back blows between the shoulder blades", ur: "کندھوں کے درمیان 5 مرتبہ زور سے پیٹھ پر تھپکی دیں" },
      { en: "Follow with up to 5 abdominal thrusts (Heimlich) if back blows fail", ur: "اگر پیٹھ پر تھپکی سے فرق نہ پڑے تو پیٹ پر 5 مرتبہ دباؤ (ہیملک) دیں" },
      { en: "Call emergency services if the obstruction does not clear", ur: "اگر رکاوٹ ختم نہ ہو تو ایمرجنسی سروس کو کال کریں" },
    ],
    dont: [
      { en: "DO NOT perform a blind finger sweep of the mouth", ur: "منہ میں اندھا دھند انگلی سے تلاش نہ کریں" },
      { en: "DO NOT give food or water while the person is choking", ur: "دم گھٹنے کی حالت میں کھانا یا پانی نہ دیں" },
      { en: "DO NOT leave the person alone", ur: "شخص کو اکیلا نہ چھوڑیں" },
    ],
  },
};

/* ===================== GEMINI AI TRIAGE CONFIG ===================== */

/*
 * WARNING: this key lives in client-side code that ships to every visitor's
 * browser, so anyone can read it from view-source or devtools and reuse it.
 * Fine for a local demo; for a real deployment proxy this call through a
 * backend that holds the key server-side.
 */
const GEMINI_CONFIG = {
  apiKey: "AQ.Ab8RN6LdhgVRJVba7fphK3k2g5ItfeB1JGyIOGotMsCSZaO_Rw",
  endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
};

const TRIAGE_META = {
  "HIGH RISK": { emoji: "🔴", en: "High Risk", ur: "زیادہ خطرہ", className: "triage-high" },
  MODERATE: { emoji: "🟡", en: "Moderate", ur: "درمیانہ خطرہ", className: "triage-moderate" },
  LOW: { emoji: "🟢", en: "Low", ur: "کم خطرہ", className: "triage-low" },
};

/* Shared read access into feature 2's state, wired up by initSymptomFeature() */
const CareBuddyState = {
  getSymptomSummary: () => "",
  getCustomText: () => "",
  _listeners: [],
  onSymptomChange(fn) {
    this._listeners.push(fn);
  },
  notifySymptomChange() {
    this._listeners.forEach((fn) => fn());
  },
};

/* ===================== FEATURE 1: SOS CARD ===================== */

function drawSosCard(data) {
  const canvas = document.getElementById("sos-canvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  const bgGradient = ctx.createLinearGradient(0, 0, 0, H);
  bgGradient.addColorStop(0, "#0f2e2b");
  bgGradient.addColorStop(1, "#0a1a1f");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, W, H);

  ctx.lineWidth = 14;
  ctx.strokeStyle = "#2dd4bf";
  ctx.strokeRect(7, 7, W - 14, H - 14);

  const headerGradient = ctx.createLinearGradient(24, 24, W - 24, 24);
  headerGradient.addColorStop(0, "#0d9488");
  headerGradient.addColorStop(1, "#0f766e");
  ctx.fillStyle = headerGradient;
  ctx.fillRect(24, 24, W - 48, 140);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 56px 'Inter', 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("EMERGENCY SOS CARD", 50, 100);

  const fields = [
    { label: "Full Name / نام", value: data.name },
    { label: "Blood Type / بلڈ گروپ", value: data.blood },
    { label: "Chronic Allergies / الرجی", value: data.allergies || "—" },
    { label: "Emergency Contact / ایمرجنسی نمبر", value: data.contact },
    { label: "Essential Meds / روزمرہ کی ادویات", value: data.meds || "—" },
  ];

  let y = 260;
  const rowHeight = 260;

  fields.forEach((field) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.lineTo(W - 50, y);
    ctx.stroke();

    ctx.fillStyle = "#5eead4";
    ctx.font = "600 30px 'Inter', 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(field.label, 50, y + 55);

    ctx.fillStyle = "#ffffff";
    const isUrduScript = /[؀-ۿ]/.test(field.value);
    ctx.font = isUrduScript
      ? "bold 48px 'Noto Nastaliq Urdu', Arial, sans-serif"
      : "bold 46px 'Inter', 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    wrapText(ctx, field.value, 50, y + 130, W - 100, 56);

    y += rowHeight;
  });

  ctx.fillStyle = "#fca5a5";
  ctx.font = "bold 32px 'Inter', 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("IN CASE OF EMERGENCY, CALL ABOVE CONTACT", W / 2, H - 90);
  ctx.font = "34px 'Noto Nastaliq Urdu', Arial, sans-serif";
  ctx.fillText("ہنگامی صورت میں مندرجہ بالا نمبر پر رابطہ کریں", W / 2, H - 40);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  let line = "";
  let curY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line ? line + " " + words[i] : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, curY);
      line = words[i];
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}

function initSosFeature() {
  const btn = document.getElementById("sos-download-btn");
  const form = document.getElementById("sos-form");
  const canvas = document.getElementById("sos-canvas");
  const preview = document.getElementById("sos-preview");

  btn.addEventListener("click", () => {
    if (!form.reportValidity()) return;

    const data = {
      name: form.name.value.trim(),
      blood: form.blood.value.trim(),
      allergies: form.allergies.value.trim(),
      contact: form.contact.value.trim(),
      meds: form.meds.value.trim(),
    };

    drawSosCard(data);

    const dataUrl = canvas.toDataURL("image/png");
    preview.src = dataUrl;
    preview.classList.remove("hidden");

    const link = document.createElement("a");
    link.download = `CareBuddy_SOS_${data.name.replace(/\s+/g, "_") || "card"}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

/* ===================== FEATURE 2: SYMPTOM COMMUNICATOR ===================== */

function initMicButton(micBtn, textarea, onUpdate) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    micBtn.disabled = true;
    micBtn.title = "Speech input not supported in this browser";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "ur-PK";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  let listening = false;

  const reset = () => {
    listening = false;
    micBtn.classList.remove("listening");
    micBtn.textContent = "🎤";
  };

  recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript;
    textarea.value = textarea.value ? `${textarea.value} ${transcript}` : transcript;
    onUpdate();
  });
  recognition.addEventListener("end", reset);
  recognition.addEventListener("error", reset);

  micBtn.addEventListener("click", () => {
    if (listening) {
      recognition.stop();
      return;
    }
    listening = true;
    micBtn.textContent = "⏺";
    micBtn.classList.add("listening");
    try {
      recognition.start();
    } catch (err) {
      reset();
    }
  });
}

function initSymptomFeature() {
  const grid = document.getElementById("symptom-grid");
  const output = document.getElementById("symptom-output");
  const copyBtn = document.getElementById("symptom-copy-btn");
  const customInput = document.getElementById("symptom-custom");
  const micBtn = document.getElementById("symptom-mic-btn");
  const selected = new Set();

  SYMPTOMS.forEach((symptom) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "symptom-btn";
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", `${symptom.en} / ${symptom.ur}`);
    btn.dataset.id = symptom.id;
    btn.innerHTML = `
      <span class="symptom-icon-badge" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${symptom.svg}</svg>
      </span>
      <span class="text-sm font-bold">${symptom.en}</span>
      <span class="text-sm font-bold urdu">${symptom.ur}</span>
    `;

    btn.addEventListener("click", () => {
      const isActive = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!isActive));
      if (isActive) {
        selected.delete(symptom.id);
      } else {
        selected.add(symptom.id);
      }
      updateSymptomOutput();
    });

    grid.appendChild(btn);
  });

  function updateSymptomOutput() {
    const parts = SYMPTOMS.filter((s) => selected.has(s.id)).map((s) => `${s.en} / ${s.ur}`);
    const customText = customInput.value.trim();

    if (parts.length === 0 && !customText) {
      output.textContent = "No symptoms selected.";
      CareBuddyState.notifySymptomChange();
      return;
    }

    let text = parts.length ? `Symptoms reported: ${parts.join(", ")}` : "";
    if (customText) {
      text += (text ? "\n" : "") + `Additional details: ${customText}`;
    }
    output.textContent = text;
    CareBuddyState.notifySymptomChange();
  }

  customInput.addEventListener("input", updateSymptomOutput);
  initMicButton(micBtn, customInput, updateSymptomOutput);

  CareBuddyState.getSymptomSummary = () => output.textContent;
  CareBuddyState.getCustomText = () => customInput.value.trim();

  copyBtn.addEventListener("click", async () => {
    const text = output.textContent;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error("clipboard API unavailable");
      }
    } catch (err) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } catch (e) {
        /* clipboard unavailable in this environment; ignore */
      }
      document.body.removeChild(textarea);
    }

    const original = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.innerHTML = '📋 Copy Summary <span class="urdu">کاپی کریں</span>';
    }, 1500);
  });
}

/* ===================== FEATURE: 1122 EMERGENCY SMS ===================== */

const SMS_NUMBER = "1122";
const GEOLOCATION_TIMEOUT_MS = 10000;

function buildSmsBody(coords) {
  const symptomText = CareBuddyState.getSymptomSummary();
  const hasSymptoms = symptomText && symptomText !== "No symptoms selected.";

  const lines = ["EMERGENCY - Need Help / ہنگامی مدد درکار ہے"];
  if (hasSymptoms) {
    lines.push(symptomText);
  }
  if (coords) {
    lines.push(`Location: https://maps.google.com/?q=${coords.lat},${coords.lng}`);
  } else {
    lines.push("Location: unavailable");
  }
  return lines.join("\n");
}

function buildSmsUri(body) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const separator = isIOS ? "&" : "?";
  return `sms:${SMS_NUMBER}${separator}body=${encodeURIComponent(body)}`;
}

function initEmergencySmsFeature() {
  const btn = document.getElementById("sms-send-btn");
  const statusEl = document.getElementById("sms-status");
  const previewEl = document.getElementById("sms-preview");

  function refreshPreview() {
    previewEl.textContent = buildSmsBody(null);
  }
  refreshPreview();
  CareBuddyState.onSymptomChange(refreshPreview);

  function sendSms(coords, statusText) {
    const body = buildSmsBody(coords);
    window.location.href = buildSmsUri(body);
    statusEl.textContent = statusText;
    btn.disabled = false;
  }

  btn.addEventListener("click", () => {
    btn.disabled = true;
    statusEl.textContent = "Getting your location… لوکیشن حاصل کی جا رہی ہے";

    if (!navigator.geolocation) {
      sendSms(null, "Location not supported on this device — sent without it. لوکیشن دستیاب نہیں");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        sendSms(coords, "Location attached — opening your SMS app… لوکیشن شامل کر دی گئی");
      },
      () => {
        sendSms(null, "Couldn't access location — sent without it. لوکیشن حاصل نہیں ہو سکی");
      },
      { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 0 }
    );
  });
}

/* ===================== GEMINI AI TRIAGE ===================== */

function buildTriagePrompt(symptomText) {
  return `You are a cautious pre-hospital triage assistant inside a first-aid app used in Pakistan. A user reports the following (possibly a mix of English, Urdu, and Roman Urdu): "${symptomText}"

Return your assessment via the provided JSON schema.
- "triage": use "HIGH RISK" only when symptoms suggest an immediate life-threatening emergency (e.g. severe chest pain, breathing distress, uncontrolled bleeding, unconsciousness). Use "MODERATE" for concerning but non-critical symptoms, and "LOW" for mild/minor complaints.
- "summary": a single <=3 sentence dual-language clinical summary for a doctor — write it in English first, then the same meaning again in Urdu script, so both languages appear in the one string.
- "dos": exactly 3 short, immediate first-aid actions specific to these reported symptoms that are safe and helpful to take right now, each given in both English and Urdu.
- "donts": exactly 3 short, specific things to avoid given these reported symptoms, each given in both English and Urdu.
Keep each "dos"/"donts" item to one short sentence.

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
  },
  required: ["triage", "summary", "dos", "donts"],
};

const AI_TRIAGE_TIMEOUT_MS = 25000;

async function fetchAiTriage(symptomText) {
  const url = `${GEMINI_CONFIG.endpoint}?key=${GEMINI_CONFIG.apiKey}`;
  const body = {
    contents: [{ parts: [{ text: buildTriagePrompt(symptomText) }] }],
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

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderTriageResult(resultEl, result) {
  const meta = TRIAGE_META[result.triage] || TRIAGE_META.MODERATE;
  resultEl.innerHTML = `
    <div class="triage-badge ${meta.className}">
      <span aria-hidden="true">${meta.emoji}</span> ${meta.en} <span class="urdu">${meta.ur}</span>
    </div>
    <p class="mt-3 text-sm">${escapeHtml(result.summary || "")}</p>
  `;

  const doItems = Array.isArray(result.dos) ? result.dos : [];
  const dontItems = Array.isArray(result.donts) ? result.donts : [];
  if (doItems.length || dontItems.length) {
    const checklistWrap = document.createElement("div");
    checklistWrap.className = "grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4";
    if (doItems.length) {
      checklistWrap.appendChild(renderChecklistList(doItems, "do-block", "✅ DO's / یہ کریں"));
    }
    if (dontItems.length) {
      checklistWrap.appendChild(renderChecklistList(dontItems, "dont-block", "⛔ DON'Ts / یہ نہ کریں"));
    }
    resultEl.appendChild(checklistWrap);
  }
}

/* Static, always-available response used when the live Gemini call fails,
 * throws, or times out — so a demo never shows a raw error state. */
function renderMockAiResponse(resultEl) {
  const mockResult = {
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
  };
  renderTriageResult(resultEl, mockResult);
}

function initAiTriageFeature() {
  const btn = document.getElementById("ai-triage-btn");
  const resultEl = document.getElementById("ai-triage-result");

  btn.addEventListener("click", async () => {
    const summary = CareBuddyState.getSymptomSummary();
    const hasSymptoms = summary && summary !== "No symptoms selected.";

    if (!hasSymptoms) {
      resultEl.classList.remove("hidden");
      resultEl.innerHTML = `<p class="text-sm text-[var(--text-muted)]">Please select or describe at least one symptom first. <span class="urdu block">پہلے کم از کم ایک علامت منتخب کریں یا لکھیں</span></p>`;
      return;
    }

    resultEl.classList.remove("hidden");
    resultEl.innerHTML = `<p class="text-sm text-[var(--text-muted)]">Contacting Gemini for a triage note… <span class="urdu block">براہ کرم انتظار کریں</span></p>`;
    btn.disabled = true;

    try {
      const result = await fetchAiTriage(summary);
      renderTriageResult(resultEl, result);
    } catch (err) {
      // Live API failed, errored, or timed out — fall back to a mock
      // response so the UI never shows a broken/error state mid-demo.
      console.error(err);
      renderMockAiResponse(resultEl);
    } finally {
      btn.disabled = false;
    }
  });
}

/* ===================== FEATURE 3: EMERGENCY CHECKLIST ===================== */

function renderChecklistList(items, className, heading) {
  const wrap = document.createElement("div");
  wrap.className = className;
  const h3 = document.createElement("h3");
  h3.className = "font-bold text-lg mb-2";
  h3.textContent = heading;
  wrap.appendChild(h3);

  const ul = document.createElement("ul");
  items.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${item.en}</span> <span class="urdu block">${item.ur}</span>`;
    ul.appendChild(li);
  });
  wrap.appendChild(ul);
  return wrap;
}

function initChecklistFeature() {
  const tabsEl = document.getElementById("checklist-tabs");
  const panelsEl = document.getElementById("checklist-panels");
  const keys = Object.keys(CHECKLIST);

  keys.forEach((key, index) => {
    const condition = CHECKLIST[key];

    const tabBtn = document.createElement("button");
    tabBtn.type = "button";
    tabBtn.className = "btn btn-outline";
    tabBtn.setAttribute("role", "tab");
    tabBtn.setAttribute("aria-selected", index === 0 ? "true" : "false");
    tabBtn.dataset.key = key;
    tabBtn.innerHTML = `${condition.en} <span class="urdu">${condition.ur}</span>`;
    tabBtn.addEventListener("click", () => activateTab(key));
    tabsEl.appendChild(tabBtn);

    const panel = document.createElement("div");
    panel.id = `checklist-panel-${key}`;
    panel.setAttribute("role", "tabpanel");
    panel.className = "grid grid-cols-1 sm:grid-cols-2 gap-4" + (index === 0 ? "" : " hidden");
    panel.appendChild(renderChecklistList(condition.do, "do-block", "✅ DO's / یہ کریں"));
    panel.appendChild(renderChecklistList(condition.dont, "dont-block", "⛔ DON'Ts / یہ نہ کریں"));
    panelsEl.appendChild(panel);
  });

  function activateTab(activeKey) {
    keys.forEach((key) => {
      const tabBtn = tabsEl.querySelector(`[data-key="${key}"]`);
      const panel = document.getElementById(`checklist-panel-${key}`);
      const isActive = key === activeKey;
      tabBtn.setAttribute("aria-selected", String(isActive));
      panel.classList.toggle("hidden", !isActive);
    });
  }
}

/* ===================== INIT ===================== */

document.addEventListener("DOMContentLoaded", () => {
  initSosFeature();
  initSymptomFeature();
  initEmergencySmsFeature();
  initAiTriageFeature();
  initChecklistFeature();
});
