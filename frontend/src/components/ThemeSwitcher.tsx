import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex bg-[var(--surface-dark)] border border-[var(--border)] rounded-lg p-1">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-md flex items-center justify-center transition-colors ${
          theme === "light"
            ? "bg-[var(--surface)] shadow-sm text-yellow-500"
            : "text-[var(--muted)] hover:text-[var(--text-primary)]"
        }`}
        title="Light Mode"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-md flex items-center justify-center transition-colors ${
          theme === "system"
            ? "bg-[var(--surface)] shadow-sm text-[var(--color-primary-500)]"
            : "text-[var(--muted)] hover:text-[var(--text-primary)]"
        }`}
        title="System Theme"
      >
        <Monitor size={16} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-md flex items-center justify-center transition-colors ${
          theme === "dark"
            ? "bg-[var(--surface)] shadow-sm text-indigo-400"
            : "text-[var(--muted)] hover:text-[var(--text-primary)]"
        }`}
        title="Dark Mode"
      >
        <Moon size={16} />
      </button>
    </div>
  );
};
