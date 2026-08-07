import { useState } from "react";
import { History } from "lucide-react";

export const ContentVersionHistory = () => {
  const [loading] = useState(false);

  if (loading) {
    return <div className="p-8 text-center text-[var(--muted)]">Loading version history...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Content Version History</h2>
          <p className="text-[var(--muted)]">Immutable audit trail of all educational content modifications.</p>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden p-8 text-center">
        <History size={48} className="mx-auto text-[var(--muted)] mb-4 opacity-50" />
        <h3 className="text-xl font-bold mb-2">Version Control Active</h3>
        <p className="text-[var(--muted)] max-w-lg mx-auto">
          The version control subsystem is now capturing snapshots of all content modifications. 
          Future updates will populate this interface with diffs, author logs, and rollback capabilities.
        </p>
      </div>
    </div>
  );
};

