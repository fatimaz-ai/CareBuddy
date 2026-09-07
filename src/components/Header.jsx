const TABS = [
  { key: "profile", label: "Patient Profile", urdu: "پروفائل" },
  { key: "triage", label: "Emergency Triage", urdu: "ٹریاج" },
  { key: "directory", label: "Health Directory", urdu: "ڈائریکٹری" },
];

export default function Header({ page, onNavigate }) {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-clay/40 bg-paper/95 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto w-full px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-clay font-display text-lg font-bold text-clay-ink shadow-sm transition-transform duration-300 hover:rotate-3"
              aria-hidden="true"
            >
              +
            </span>
            <div className="leading-tight">
              <h1 className="font-display text-xl font-semibold text-ink">
                CareBuddy <span className="urdu text-base text-ink-soft">| آسان صحت</span>
              </h1>
              <p className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft md:block">
                Offline Health Companion
              </p>
            </div>
          </div>

          <span className="hidden items-center gap-2 rounded-full border-2 border-moss/40 bg-moss-bg px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-moss sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-moss" aria-hidden="true" />
            Works Offline
          </span>
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Main navigation">
          {TABS.map((tab) => {
            const active = page === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onNavigate(tab.key)}
                aria-current={active ? "page" : undefined}
                className={`inline-flex flex-shrink-0 items-center gap-2 rounded-full border-2 px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors duration-200 ${
                  active
                    ? "border-clay bg-clay text-clay-ink font-bold shadow-sm"
                    : "border-clay/30 bg-white text-ink hover:border-clay hover:text-clay"
                }`}
              >
                <span>{tab.label}</span>
                <span className="urdu tracking-normal">{tab.urdu}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
