const VARIANTS = {
  primary: "bg-clay text-clay-ink border-clay hover:bg-clay-deep hover:border-clay-deep font-bold shadow-md",
  outline: "bg-white text-clay border-clay/60 hover:border-clay hover:bg-clay/5",
  alert: "bg-terracotta text-white border-terracotta hover:bg-terracotta-deep hover:border-terracotta-deep shadow-sm",
  ghost: "bg-transparent text-ink-soft border-transparent hover:text-clay",
};

export default function Button({ variant = "primary", className = "", children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg border-2 px-5 py-3 font-medium text-sm transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:-translate-y-0 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
