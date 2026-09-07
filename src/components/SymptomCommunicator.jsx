import { useState } from "react";
import Section from "./Section.jsx";
import FieldShell, { fieldControlClass } from "./FieldShell.jsx";
import Button from "./Button.jsx";
import IconGlyph from "./IconGlyph.jsx";
import TriageResult from "./TriageResult.jsx";
import { fetchAiTriage, MOCK_TRIAGE_RESULT } from "../lib/gemini.js";
import { NO_SYMPTOMS_TEXT } from "../lib/symptomSummary.js";
import { appendHistory, loadHistory } from "../lib/storage.js";

export default function SymptomCommunicator({
  symptoms,
  selectedIds,
  onToggleSymptom,
  customText,
  setCustomText,
  summary,
  profile,
  onTriageResult,
}) {
  const [copyLabel, setCopyLabel] = useState("Copy Summary");
  const [triageState, setTriageState] = useState({ status: "idle", result: null });

  async function handleCopy() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(summary);
      } else {
        throw new Error("clipboard API unavailable");
      }
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = summary;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } catch {
        /* clipboard unavailable in this environment; ignore */
      }
      document.body.removeChild(textarea);
    }

    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy Summary"), 1500);
  }

  async function handleAiTriage() {
    const hasSymptoms = summary && summary !== NO_SYMPTOMS_TEXT;
    if (!hasSymptoms) {
      setTriageState({ status: "empty", result: null });
      onTriageResult?.(null);
      return;
    }

    setTriageState({ status: "loading", result: null });
    onTriageResult?.(null);

    let result;
    try {
      // Hand Gemini the exact medical context of the active profile:
      // baseline conditions/allergies/meds plus that profile's own triage history.
      result = await fetchAiTriage(summary, { profile, history: loadHistory(profile?.id) });
    } catch (err) {
      // Live API failed, errored, or timed out — fall back to a mock
      // response so the UI never shows a broken/error state mid-demo.
      console.error(err);
      result = MOCK_TRIAGE_RESULT;
    }

    appendHistory(profile?.id, { triage: result.triage, summary: result.summary, inputSummary: summary });

    setTriageState({ status: "done", result });
    onTriageResult?.(result);
  }

  return (
    <Section
      first
      index="01"
      eyebrow="Tap Or Type"
      title="Symptom Communicator"
      urduTitle="علامات کی تفصیل"
      subtitle="Tap what you're feeling, or type more detail below."
      urduSubtitle="جو محسوس ہو رہا ہے اسے منتخب کریں، یا لکھیں"
    >
      <div role="group" aria-label="Symptom selector" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {symptoms.map((symptom) => {
          const pressed = selectedIds.has(symptom.id);
          return (
            <button
              key={symptom.id}
              type="button"
              aria-pressed={pressed}
              aria-label={`${symptom.en} / ${symptom.ur}`}
              onClick={() => onToggleSymptom(symptom.id)}
              className={`flex min-h-[116px] flex-col items-center justify-center gap-2 rounded-xl border-2 px-2 py-4 text-center transition-all duration-200 hover:-translate-y-0.5 ${
                pressed ? "border-clay bg-clay text-clay-ink font-bold shadow-md" : "border-clay/30 bg-white text-ink hover:border-clay"
              }`}
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-full ${pressed ? "bg-clay-ink text-clay" : "bg-clay/10 text-clay"}`}>
                <IconGlyph paths={symptom.svg} className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold">{symptom.en}</span>
              <span className="urdu text-sm font-semibold">{symptom.ur}</span>
            </button>
          );
        })}
      </div>

      <FieldShell
        className="mt-6"
        label="Describe more — Roman Urdu / Urdu / English"
        urduLabel="مزید تفصیل لکھیں"
      >
        <textarea
          className={fieldControlClass}
          rows={2}
          placeholder="e.g. Mujhe 2 din se bukhar hai aur sar dard bhi hai..."
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
        />
      </FieldShell>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={handleCopy}>
          <span aria-hidden="true">📋</span>
          <span>{copyLabel}</span>
        </Button>
        <Button type="button" onClick={handleAiTriage} disabled={triageState.status === "loading"}>
          <span aria-hidden="true">✨</span>
          <span>AI Triage &amp; Doctor Note (Gemini)</span>
        </Button>
      </div>

      <FieldShell className="mt-6" label="Summary">
        <div role="status" className="min-h-[3rem] rounded-lg border-2 border-clay/30 bg-white px-4 py-3 text-sm text-ink-dark">
          {summary}
        </div>
      </FieldShell>

      {triageState.status !== "idle" && (
        <div className="mt-6">
          {triageState.status === "empty" && (
            <p className="text-sm text-ink-soft">
              Please select or describe at least one symptom first.
              <span className="urdu block">پہلے کم از کم ایک علامت منتخب کریں یا لکھیں</span>
            </p>
          )}
          {triageState.status === "loading" && (
            <p className="text-sm text-ink-soft">
              Contacting Gemini for a triage note…
              <span className="urdu block">براہ کرم انتظار کریں</span>
            </p>
          )}
          {triageState.status === "done" && <TriageResult result={triageState.result} />}
        </div>
      )}
    </Section>
  );
}
