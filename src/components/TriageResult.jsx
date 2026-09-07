import { useEffect, useRef, useState } from "react";
import DoDontList from "./DoDontList.jsx";
import { TRIAGE_META } from "../lib/gemini.js";

const BADGE_TONE = {
  "HIGH RISK": "border-terracotta bg-terracotta-bg text-terracotta",
  MODERATE: "border-ochre bg-ochre-bg text-ochre",
  LOW: "border-moss bg-moss-bg text-moss",
};

const URDU_SCRIPT_RE = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;

// Google's translate_tts endpoint rejects/truncates long queries, so long
// summaries are split into sentence-ish chunks and played back to back.
const GOOGLE_TTS_CHUNK_LIMIT = 200;
const GOOGLE_TTS_LOAD_TIMEOUT_MS = 3000;

// The AI summary is one string with the English sentence first, then the
// same meaning again in Urdu script — pull out just the Urdu half so the
// "Read Aloud in Urdu" button doesn't hand a mixed-language string to a
// single voice (which tends to stop as soon as it hits the script it can't
// read, cutting playback off after the English part).
function extractUrduText(text) {
  const match = text.match(URDU_SCRIPT_RE);
  if (!match) return text;
  return text.slice(match.index);
}

// Prefer a dedicated Urdu voice, then a Pakistan-flagged voice, then Hindi
// (closest mutually-intelligible spoken language) — otherwise fall back to
// whatever default voice the system provides.
function pickPreferredVoice(voices) {
  const lang = (v) => (v.lang || "").toLowerCase();
  const name = (v) => (v.name || "").toLowerCase();
  return (
    voices.find((v) => lang(v) === "ur-pk") ||
    voices.find((v) => lang(v).startsWith("ur") || name(v).includes("urdu")) ||
    voices.find((v) => name(v).includes("pakistan")) ||
    voices.find((v) => lang(v).startsWith("hi") || name(v).includes("hindi")) ||
    null
  );
}

function splitIntoTtsChunks(text) {
  const chunks = [];
  let remaining = text.trim();
  while (remaining.length > 0) {
    if (remaining.length <= GOOGLE_TTS_CHUNK_LIMIT) {
      chunks.push(remaining);
      break;
    }
    let cut = remaining.lastIndexOf(" ", GOOGLE_TTS_CHUNK_LIMIT);
    if (cut <= 0) cut = GOOGLE_TTS_CHUNK_LIMIT;
    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut).trim();
  }
  return chunks;
}

function loadGoogleTtsAudio(text, lang) {
  return new Promise((resolve) => {
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
      const audio = new Audio();
      // The page sets <meta name="referrer" content="no-referrer">, which
      // strips the Referer header from this request too. Google's
      // translate_tts endpoint rejects referrer-less requests, so override
      // it here the same way the Gemini fetch() call already does.
      audio.referrerPolicy = "no-referrer-when-downgrade";
      audio.src = url;
      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        resolve(ok ? audio : null);
      };
      audio.addEventListener("error", () => finish(false), { once: true });
      audio.addEventListener("canplay", () => finish(true), { once: true });
      // The endpoint can hang without ever firing an error event; give up
      // and let the caller fall back rather than stalling the button.
      setTimeout(() => finish(false), GOOGLE_TTS_LOAD_TIMEOUT_MS);
    } catch {
      resolve(null);
    }
  });
}

// Plays each chunk in sequence through Google's TTS stream. Returns false as
// soon as one chunk fails to load/play, so the caller can fall back to
// speechSynthesis instead of leaving playback half-finished.
async function playGoogleTts(text, lang, audioRef, cancelledRef) {
  for (const chunk of splitIntoTtsChunks(text)) {
    if (cancelledRef.current) return true;
    const audio = await loadGoogleTtsAudio(chunk, lang);
    if (cancelledRef.current) return true;
    if (!audio) return false;

    audioRef.current = audio;
    const finished = await new Promise((resolve) => {
      audio.addEventListener("ended", () => resolve(true), { once: true });
      audio.addEventListener("error", () => resolve(false), { once: true });
      audio.play().catch(() => resolve(false));
    });
    audioRef.current = null;
    if (!finished) return false;
  }
  return true;
}

export default function TriageResult({ result }) {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef(null);
  // Chrome/Edge on Windows garbage-collects the utterance mid-speech if
  // nothing outside speechSynthesis's internal (weak) state holds a
  // reference to it, which silently cuts playback short or stops it from
  // starting at all — keeping it in a ref keeps it alive for the duration.
  const utteranceRef = useRef(null);
  const cancelledRef = useRef(false);

  const meta = TRIAGE_META[result.triage] || TRIAGE_META.MODERATE;
  const badgeTone = BADGE_TONE[result.triage] || BADGE_TONE.MODERATE;
  const dos = Array.isArray(result.dos) ? result.dos : [];
  const donts = Array.isArray(result.donts) ? result.donts : [];
  const medicines = Array.isArray(result.medicines) ? result.medicines : [];

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (audioRef.current) audioRef.current.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function stopSpeaking() {
    cancelledRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setSpeaking(false);
  }

  function speakWithSystemVoice(text) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeaking(false);
      return;
    }

    const say = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = pickPreferredVoice(voices);
      // Always set a lang the engine understands — leaving it unset for an
      // unsupported tag makes some engines silently reject the utterance
      // (a start/end pair a few ms apart with no audio, no error event).
      utterance.lang = preferredVoice ? preferredVoice.lang : "en-US";
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onend = () => {
        utteranceRef.current = null;
        setSpeaking(false);
      };
      utterance.onerror = () => {
        utteranceRef.current = null;
        setSpeaking(false);
      };

      try {
        utteranceRef.current = utterance;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        setSpeaking(true);
      } catch {
        utteranceRef.current = null;
        setSpeaking(false);
      }
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        window.speechSynthesis.onvoiceschanged = null;
        say();
      };
      window.speechSynthesis.onvoiceschanged = start;
      // Some browsers never fire voiceschanged; fall back after a short wait.
      setTimeout(start, 300);
    } else {
      say();
    }
  }

  async function handleReadAloud() {
    if (speaking) {
      stopSpeaking();
      return;
    }

    const text = extractUrduText(result.summary);
    cancelledRef.current = false;
    setSpeaking(true);

    const playedViaGoogleTts = await playGoogleTts(text, "ur", audioRef, cancelledRef);
    if (cancelledRef.current) return;

    if (playedViaGoogleTts) {
      setSpeaking(false);
    } else {
      speakWithSystemVoice(text);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.15em] ${badgeTone}`}>
          <span aria-hidden="true">{meta.emoji}</span>
          {meta.en}
          <span className="urdu tracking-normal">{meta.ur}</span>
        </div>

        <button
          type="button"
          onClick={handleReadAloud}
          className={`inline-flex items-center gap-2 rounded-full border-2 border-clay px-4 py-1.5 font-mono text-xs uppercase tracking-[0.15em] text-clay transition-colors duration-200 hover:bg-clay hover:text-clay-ink ${
            speaking ? "bg-clay text-clay-ink font-bold" : "bg-white"
          }`}
        >
          <span aria-hidden="true">{speaking ? "⏹" : "🔊"}</span>
          <span>{speaking ? "Stop" : "Read Aloud in Urdu"}</span>
        </button>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink-dark">{result.summary}</p>

      {(dos.length > 0 || donts.length > 0) && (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {dos.length > 0 && <DoDontList items={dos} tone="do" heading="Do's" urduHeading="یہ کریں" />}
          {donts.length > 0 && <DoDontList items={donts} tone="dont" heading="Don'ts" urduHeading="یہ نہ کریں" />}
        </div>
      )}

      {result.triage === "HIGH RISK" ? (
        <p className="mt-4 rounded-xl border-2 border-terracotta/40 bg-terracotta-bg px-5 py-3 text-sm text-terracotta">
          Do not self-medicate — call 1122 or get emergency care immediately.
          <span className="urdu mt-1 block">خود دوا نہ لیں — فوری طور پر 1122 کو کال کریں یا ہنگامی طبی امداد حاصل کریں</span>
        </p>
      ) : (
        medicines.length > 0 && (
          <div className="mt-4">
            <DoDontList items={medicines} tone="medicine" heading="Basic OTC Medicine" urduHeading="ابتدائی ادویات" />
            <p className="mt-2 text-xs text-ink-soft">
              ⚠ Not a prescription — confirm with a pharmacist or doctor, especially for children, pregnancy, or existing
              conditions.
              <span className="urdu mt-1 block">
                یہ نسخہ نہیں ہے — بچوں، حمل یا دیگر امراض کی صورت میں فارماسسٹ یا ڈاکٹر سے تصدیق کریں
              </span>
            </p>
          </div>
        )
      )}
    </div>
  );
}
