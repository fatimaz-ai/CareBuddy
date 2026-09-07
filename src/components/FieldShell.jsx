export const fieldControlClass =
  "w-full rounded-lg border-2 border-clay bg-white px-4 py-2.5 text-lg text-ink-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition-shadow duration-200";

export default function FieldShell({ label, urduLabel, htmlFor, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-soft">{label}</span>
        {urduLabel && <span className="urdu text-xs text-ink-soft">{urduLabel}</span>}
      </label>
      {children}
    </div>
  );
}
