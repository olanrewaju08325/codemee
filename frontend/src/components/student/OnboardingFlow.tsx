import { useState } from "react";
import { ChevronRight, CheckCircle, SkipForward } from "lucide-react";
import { supabase } from "../../supabaseClient";

interface Props {
  onComplete: () => void;
}

export const OnboardingFlow = ({ onComplete }: Props) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${(import.meta.env.VITE_API_BASE_URL || '')}/api/student/dashboard/onboarding/complete`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      onComplete();
    } catch (e) {
      console.error(e);
      onComplete(); // fallback complete
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] w-full max-w-2xl rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden">
        <div className="p-8">
          {step === 1 && (
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">Welcome to CodeMe Academy!</h2>
              <p className="text-[var(--muted)] text-lg">Your structured journey to becoming a professional developer starts right here.</p>
              <div className="bg-[var(--surface-dark)] p-6 rounded-xl text-left space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-green-500 mt-1" />
                  <div>
                    <h4 className="font-bold">Structured Learning</h4>
                    <p className="text-sm text-[var(--muted)]">Follow the curated path. No skipping ahead ensures solid foundations.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">Your AI Co-Pilot</h2>
              <p className="text-[var(--muted)] text-lg">Never get stuck again. Ask questions directly inside your lessons.</p>
              <div className="bg-[var(--surface-dark)] p-6 rounded-xl text-left space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-green-500 mt-1" />
                  <div>
                    <h4 className="font-bold">Context-Aware</h4>
                    <p className="text-sm text-[var(--muted)]">The AI reads your current lesson and provides hyper-relevant explanations without spoiling the solution.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">Stay Consistent</h2>
              <p className="text-[var(--muted)] text-lg">Consistency is key to mastering code. We track your daily streaks.</p>
              <div className="bg-[var(--surface-dark)] p-6 rounded-xl text-left space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-green-500 mt-1" />
                  <div>
                    <h4 className="font-bold">Daily Milestones</h4>
                    <p className="text-sm text-[var(--muted)]">Log in every day, complete a lesson, and build an unbreakable streak.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[var(--surface-dark)] border-t border-[var(--border)] p-4 flex justify-between items-center">
          <button 
            onClick={completeOnboarding}
            className="flex items-center gap-2 text-[var(--muted)] hover:text-white transition-colors text-sm font-bold"
          >
            <SkipForward size={16} /> Skip Tour
          </button>
          
          <div className="flex gap-2">
            <div className={`h-2 w-2 rounded-full ${step >= 1 ? "bg-primary" : "bg-gray-600"}`} />
            <div className={`h-2 w-2 rounded-full ${step >= 2 ? "bg-primary" : "bg-gray-600"}`} />
            <div className={`h-2 w-2 rounded-full ${step >= 3 ? "bg-primary" : "bg-gray-600"}`} />
          </div>

          <button 
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else completeOnboarding();
            }}
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-black px-6 py-2 rounded-lg font-bold hover:bg-primary-hover transition-colors"
          >
            {step < 3 ? "Next" : "Let's Go"} <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

