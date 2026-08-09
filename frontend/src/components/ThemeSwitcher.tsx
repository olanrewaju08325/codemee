import { Moon, Sun, Monitor } from "lucide-react";
import type { CSSProperties } from "react";
import { useTheme } from "../contexts/ThemeContext";

type Mode = "light" | "system" | "dark";

const OPTIONS: { mode: Mode; label: string; Icon: typeof Sun }[] = [
  { mode: "light", label: "Light", Icon: Sun },
  { mode: "system", label: "System", Icon: Monitor },
  { mode: "dark", label: "Dark", Icon: Moon },
];

// Compact segmented control. Written in the project's inline-style + design-token
// idiom (the app has no Tailwind, so the old utility classes never applied), so
// it renders correctly in both themes and sits neatly in the landing nav and the
// sidebar footer. Pass fullWidth to show labels and stretch across its container.
export const ThemeSwitcher = ({ fullWidth = false }: { fullWidth?: boolean }) => {
  const { theme, setTheme } = useTheme();

  const wrap: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "2px",
    padding: "3px",
    borderRadius: "var(--radius-full)",
    background: "var(--bg-surface-hover)",
    border: "1px solid var(--border-default)",
    width: fullWidth ? "100%" : "auto",
  };

  return (
    <div style={wrap} role="radiogroup" aria-label="Color theme">
      {OPTIONS.map(({ mode, label, Icon }) => {
        const active = theme === mode;
        const btn: CSSProperties = {
          flex: fullWidth ? 1 : "0 0 auto",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          minWidth: "36px",
          height: "30px",
          padding: fullWidth ? "0 8px" : "0 10px",
          border: "none",
          cursor: "pointer",
          borderRadius: "var(--radius-full)",
          fontFamily: "var(--font-main)",
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          background: active ? "var(--bg-surface)" : "transparent",
          color: active ? "var(--primary)" : "var(--text-tertiary)",
          boxShadow: active ? "var(--shadow-sm)" : "none",
          transition: "color var(--transition-fast), background var(--transition-fast)",
        };
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(mode)}
            style={btn}
            title={`${label} mode`}
          >
            <Icon size={15} strokeWidth={2.25} />
            {fullWidth && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
};
