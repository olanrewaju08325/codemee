import { useState } from "react";
import { Sparkles, Loader } from "lucide-react";
import apiClient from "../../apiClient";

interface Props {
  onSuggest: (text: string) => void;
  context: string;
}

export const AIAssistantWidget = ({ onSuggest, context }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleDraft = async (type: string) => {
    setLoading(true);
    try {
      const prompt = `Generate a ${type} based on: ${context}`;
      const data = await apiClient.teacher.getAIDraft(prompt, context);
      if (data && data.suggestion) {
        onSuggest(data.suggestion);
      }
    } catch (e) {
      console.error("AI Assistant error", e);
    }
    setLoading(false);
  };

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-purple-400" size={20} />
        <h4 className="font-bold">AI Teaching Assistant</h4>
      </div>
      
      <p className="text-sm text-[var(--muted)] mb-4">
        Need inspiration? Let the AI generate a draft. Always review the output before publishing.
      </p>
      
      <div className="flex flex-col gap-2">
        <button 
          onClick={() => handleDraft("lesson outline")}
          disabled={loading || !context.trim()}
          className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg py-2 text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader size={16} className="animate-spin" /> : "Draft Lesson Outline"}
        </button>
        
        <button 
          onClick={() => handleDraft("quiz question")}
          disabled={loading || !context.trim()}
          className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg py-2 text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader size={16} className="animate-spin" /> : "Suggest Quiz Question"}
        </button>
      </div>
    </div>
  );
};

