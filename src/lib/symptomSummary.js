export const NO_SYMPTOMS_TEXT = "No symptoms selected.";

export function buildSymptomSummary(symptoms, selectedIds, customText) {
  const parts = symptoms.filter((s) => selectedIds.has(s.id)).map((s) => `${s.en} / ${s.ur}`);
  const trimmedCustom = customText.trim();

  if (parts.length === 0 && !trimmedCustom) {
    return NO_SYMPTOMS_TEXT;
  }

  let text = parts.length ? `Symptoms reported: ${parts.join(", ")}` : "";
  if (trimmedCustom) {
    text += (text ? "\n" : "") + `Additional details: ${trimmedCustom}`;
  }
  return text;
}
