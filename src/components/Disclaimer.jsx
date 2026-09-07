export default function Disclaimer() {
  return (
    <div className="max-w-4xl mx-auto w-full px-4 pt-10">
      <div className="flex items-start gap-3 rounded-lg border-2 border-terracotta/40 bg-terracotta-bg px-4 py-3">
        <p className="text-sm leading-relaxed text-ink">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-terracotta">Advisory —</span>{" "}
          Demo advisory content only, not a substitute for professional medical care.
          <span className="urdu mt-1 block">یہ صرف رہنمائی کے لیے ہے، طبی ماہر سے رجوع کریں</span>
        </p>
      </div>
    </div>
  );
}
