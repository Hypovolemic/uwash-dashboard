type SectionKey = "washer" | "dryer" | "analytics";

type Props = {
  activeSection: SectionKey;
  onChange: (section: SectionKey) => void;
};

const ITEMS: Array<{ key: SectionKey; label: string; icon: string }> = [
  { key: "washer", label: "Washer", icon: "🧺" },
  { key: "dryer", label: "Dryer", icon: "🌬️" },
  { key: "analytics", label: "Analytics", icon: "📈" },
];

export function SectionSwitchBar({ activeSection, onChange }: Props) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md lg:max-w-xl">
      <div className="rounded-full border border-slate-200 bg-slate-100/85 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.12)] p-1.5 flex items-center gap-1">
        {ITEMS.map((item) => {
          const active = activeSection === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={`flex-1 min-h-[46px] rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                active
                  ? "bg-white text-slate-900 shadow-[0_3px_10px_rgba(15,23,42,0.12)]"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              aria-pressed={active}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
