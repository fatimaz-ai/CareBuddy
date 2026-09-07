const TONE = {
  do: {
    card: "border-moss/40 bg-moss-bg",
    heading: "text-moss",
    badge: "bg-moss text-white",
  },
  dont: {
    card: "border-terracotta/40 bg-terracotta-bg",
    heading: "text-terracotta",
    badge: "bg-terracotta text-white",
  },
  medicine: {
    card: "border-clay/40 bg-clay/10",
    heading: "text-clay-deep",
    badge: "bg-clay text-white",
  },
};

export default function DoDontList({ items, tone, heading, urduHeading }) {
  const t = TONE[tone] ?? TONE.do;

  return (
    <div className={`rounded-xl border-2 p-6 ${t.card}`}>
      <h3 className={`mb-4 font-mono text-xs uppercase tracking-[0.15em] ${t.heading}`}>
        {heading} <span className="urdu ml-1 tracking-normal">{urduHeading}</span>
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 border-b border-black/5 pb-2 last:border-b-0 last:pb-0">
            <span
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-semibold ${t.badge}`}
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span className="flex flex-1 flex-wrap items-baseline gap-x-2 text-sm leading-snug text-ink-dark">
              <span>{item.en}</span>
              <span className="urdu text-ink-soft">{item.ur}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
