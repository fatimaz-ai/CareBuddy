import { useMemo, useState } from "react";
import SymptomCommunicator from "../components/SymptomCommunicator.jsx";
import ClinicLocator from "../components/ClinicLocator.jsx";
import { SYMPTOMS } from "../data/symptoms.js";
import { buildSymptomSummary } from "../lib/symptomSummary.js";

export default function TriagePage({ profile }) {
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [customText, setCustomText] = useState("");

  const summary = useMemo(
    () => buildSymptomSummary(SYMPTOMS, selectedIds, customText),
    [selectedIds, customText]
  );

  function toggleSymptom(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <>
      <SymptomCommunicator
        symptoms={SYMPTOMS}
        selectedIds={selectedIds}
        onToggleSymptom={toggleSymptom}
        customText={customText}
        setCustomText={setCustomText}
        summary={summary}
        profile={profile}
      />
      <ClinicLocator />
    </>
  );
}
