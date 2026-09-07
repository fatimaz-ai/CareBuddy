export default function Section({ index, eyebrow, title, urduTitle, subtitle, urduSubtitle, tone = "default", first = false, children }) {
  return (
    <section
      className={`grid grid-cols-1 gap-6 py-10 md:grid-cols-[96px_1fr] md:gap-12 md:py-14 ${
        first ? "" : "border-t-2 border-clay/15"
      }`}
    >
      <div className="md:pt-1">
        <span className="block font-mono text-xs tracking-[0.2em] text-ink-soft/60">{index}</span>
      </div>

      <div>
        <header className="mb-7 max-w-2xl">
          <p className={`mb-2 font-mono text-xs uppercase tracking-[0.25em] ${tone === "alert" ? "text-terracotta" : "text-clay"}`}>
            {eyebrow}
          </p>
          <h2 className="font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">
            {title}
            {urduTitle && (
              <span className="urdu mt-1 block text-2xl text-ink-soft md:mt-0 md:inline md:ml-3 md:text-3xl">
                {urduTitle}
              </span>
            )}
          </h2>
          {subtitle && (
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {subtitle}
              {urduSubtitle && <span className="urdu mt-1 block">{urduSubtitle}</span>}
            </p>
          )}
        </header>

        <div
          className={`rounded-2xl border-2 bg-surface p-6 shadow-lg md:p-8 ${
            tone === "alert" ? "border-terracotta/40" : "border-clay/30"
          }`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
