import { useState } from "react";
import { Bookmark, Search, BookOpen, ExternalLink, MessageCircle } from "lucide-react";

export const MyBookmarks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Removed mock data to adhere to the REAL DATA ONLY directive
  const bookmarks: any[] = [];

  const getIcon = (type: string) => {
    switch(type) {
      case "lesson": return <BookOpen className="text-blue-400" size={20} />;
      case "resource": return <ExternalLink className="text-green-400" size={20} />;
      case "announcement": return <MessageCircle className="text-yellow-400" size={20} />;
      default: return <Bookmark size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading">My Bookmarks</h1>
            <p className="text-[var(--muted)] mt-1">Quick access to your saved lessons and resources.</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={20} />
            <input 
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--surface-dark)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {bookmarks.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center">
            <Bookmark size={48} className="mx-auto text-[var(--muted)] mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No bookmarks yet</h3>
            <p className="text-[var(--muted)] max-w-md mx-auto">
              Save important lessons, resources, and announcements as you learn to easily find them later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-[var(--surface-dark)] rounded-lg">
                    {getIcon(bookmark.type)}
                  </div>
                  <button className="text-[var(--muted)] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Bookmark size={18} fill="currentColor" />
                  </button>
                </div>
                
                <h3 className="font-bold text-lg mb-1">{bookmark.title}</h3>
                <p className="text-sm text-[var(--muted)] mb-4">{bookmark.course}</p>
                
                <div className="flex justify-between items-center text-xs text-[var(--muted)]">
                  <span className="capitalize">{bookmark.type}</span>
                  <span>{bookmark.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

