import { useState } from "react";
import Section from "../components/Section.jsx";
import DoDontList from "../components/DoDontList.jsx";
import { CHECKLIST } from "../data/checklist.js";

const ICONS = {
  chestPain: "❤️‍🩹",
  dengue: "🦟",
  heatstroke: "🌡️",
  burns: "🔥",
  bites: "🐍",
  fractures: "🦴",
  bleeding: "🩸",
  choking: "😮‍💨",
};

export default function DirectoryPage() {
  const keys = Object.keys(CHECKLIST);
  const [openKey, setOpenKey] = useState(null);

  return (
    <Section
      first
      index="01"
      eyebrow="Know Before Help Arrives"
      title="Common Conditions & Health Directory"
      urduTitle="ہنگامی گائیڈ"
      subtitle="Tap a card for instant first-aid do's and don'ts on common emergencies."
      urduSubtitle="فوری رہنمائی کے لیے کارڈ پر ٹیپ کریں"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {keys.map((key) => {
          const condition = CHECKLIST[key];
          const isOpen = openKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setOpenKey(isOpen ? null : key)}
              aria-expanded={isOpen}
              className={`flex flex-col items-start gap-2 rounded-xl border-2 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                isOpen ? "border-clay bg-clay/10 shadow-md" : "border-clay/30 bg-white hover:border-clay"
              }`}
            >
              <span className="text-3xl" aria-hidden="true">
                {ICONS[key] || "🩹"}
              </span>
              <span className="font-display text-lg font-semibold text-ink">{condition.en}</span>
              <span className="urdu text-sm text-ink-soft">{condition.ur}</span>
              <span className="mt-1 text-xs leading-snug text-ink-soft">Quick tip: {condition.do[0].en}</span>
            </button>
          );
        })}
      </div>

      {openKey && (
        <div className="mt-8 rounded-2xl border-2 border-clay/30 bg-surface p-6 shadow-lg md:p-8">
          <h3 className="mb-5 font-display text-2xl font-semibold text-ink">
            {CHECKLIST[openKey].en}
            <span className="urdu ml-2 text-xl text-ink-soft">{CHECKLIST[openKey].ur}</span>
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <DoDontList items={CHECKLIST[openKey].do} tone="do" heading="Do's" urduHeading="یہ کریں" />
            <DoDontList items={CHECKLIST[openKey].dont} tone="dont" heading="Don'ts" urduHeading="یہ نہ کریں" />
          </div>
        </div>
      )}
    </Section>
  );
}
