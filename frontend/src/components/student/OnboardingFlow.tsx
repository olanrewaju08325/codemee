import { useState } from "react";
import { ChevronRight, CheckCircle, SkipForward, GraduationCap, Sparkles, Flame } from "lucide-react";
import apiClient from "../../apiClient";

interface Props {
  onComplete: () => void;
}

// Key used to remember the tour was dismissed even if the backend call to
// persist completion fails — this is what stops the tour from reappearing in a
// loop after the user finishes it.
const TOUR_DONE_KEY = "codeme_onboarding_tour_done";

const STEPS = [
  {
    Icon: GraduationCap,
    title: "Welcome to CodeMe Academy!",
    lead: "Your structured journey to becoming a professional developer starts right here.",
    point: "Structured Learning",
    detail: "Follow the curated path. No skipping ahead ensures solid foundations.",
  },
  {
    Icon: Sparkles,
    title: "Your AI Co-Pilot",
    lead: "Never get stuck again. Ask questions directly inside your lessons.",
    point: "Context-Aware",
    detail: "The AI reads your current lesson and gives relevant help without spoiling the solution.",
  },
  {
    Icon: Flame,
    title: "Stay Consistent",
    lead: "Consistency is key to mastering code. We track your daily streaks.",
    point: "Daily Milestones",
    detail: "Log in every day, complete a lesson, and build an unbreakable streak.",
  },
];

export const OnboardingFlow = ({ onComplete }: Props) => {
  const [step, setStep] = useState(0); // 0-indexed
  const [loading, setLoading] = useState(false);

  const finish = async () => {
    setLoading(true);
    // Remember locally first so the tour never loops, even if the API is down.
    try { localStorage.setItem(TOUR_DONE_KEY, "1"); } catch { /* ignore */ }
    try {
      await apiClient.student.completeOnboarding();
    } catch (e) {
      console.error("completeOnboarding failed (dismissing locally):", e);
    } finally {
      setLoading(false);
      onComplete();
    }
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed", inset: 0, zIndex: "var(--z-modal)" as any,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", padding: "var(--space-4)",
      }}
    >
      <div style={{
        background: "var(--bg-surface)", width: "100%", maxWidth: 560,
        borderRadius: "var(--radius-2xl)", boxShadow: "var(--shadow-xl)",
        border: "1px solid var(--border-default)", overflow: "hidden",
      }}>
        <div style={{ padding: "var(--space-8)", textAlign: "center", display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "var(--radius-full)", margin: "0 auto",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--brand-gradient)", color: "#fff",
          }}>
            <current.Icon size={30} />
          </div>

          <div>
            <h2 style={{ margin: "0 0 var(--space-2)", fontSize: "var(--text-2xl)" }}>{current.title}</h2>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>{current.lead}</p>
          </div>

          <div style={{
            background: "var(--bg-surface-hover)", border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)", padding: "var(--space-4)",
            display: "flex", gap: "var(--space-3)", alignItems: "flex-start", textAlign: "left",
          }}>
            <CheckCircle size={22} style={{ color: "var(--color-success)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 style={{ margin: "0 0 2px" }}>{current.point}</h4>
              <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{current.detail}</p>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: "1px solid var(--border-default)", padding: "var(--space-4) var(--space-6)",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-3)",
        }}>
          <button
            onClick={finish}
            disabled={loading}
            style={{
              display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--text-secondary)", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-sm)", fontFamily: "inherit",
            }}
          >
            <SkipForward size={16} /> Skip
          </button>

          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            {STEPS.map((_, i) => (
              <span key={i} style={{
                width: 8, height: 8, borderRadius: "var(--radius-full)",
                background: i <= step ? "var(--primary)" : "var(--border-default)",
                transition: "background var(--transition-fast)",
              }} />
            ))}
          </div>

          <button
            onClick={() => (isLast ? finish() : setStep(step + 1))}
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: "var(--space-2) var(--space-5)" }}
          >
            {isLast ? "Let's Go" : "Next"} <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Exported so the dashboard can suppress the tour if it was already dismissed
// locally, avoiding a reappearance when the backend flag didn't persist.
export const isTourDoneLocally = (): boolean => {
  try { return localStorage.getItem(TOUR_DONE_KEY) === "1"; } catch { return false; }
};
