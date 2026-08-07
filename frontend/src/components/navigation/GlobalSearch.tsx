import { useState, useEffect } from 'react';
import { Search, Command, X } from 'lucide-react';

export const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (CMD/CTRL + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Future integration with search API
      console.log('Searching for:', query);
      setIsOpen(false);
      setQuery('');
      // navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <>
      <div 
        className="hidden-mobile" 
        onClick={() => setIsOpen(true)}
        style={{ 
          position: 'relative', 
          width: '300px', 
          cursor: 'pointer',
          background: 'var(--bg-app)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-2) var(--space-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--text-tertiary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Search size={16} />
          <span style={{ fontSize: 'var(--text-sm)' }}>Search anything...</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)' }}>
          <Command size={12} />
          <span>K</span>
        </div>
      </div>

      {/* Mobile search trigger (icon only) */}
      <button 
        className="visible-mobile btn btn-ghost" 
        style={{ padding: 'var(--space-2)' }}
        onClick={() => setIsOpen(true)}
      >
        <Search size={20} />
      </button>

      {/* Command Palette Modal */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '10vh'
        }} onClick={() => setIsOpen(false)}>
          <div 
            style={{
              width: '100%',
              maxWidth: '600px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-light)', padding: 'var(--space-3) var(--space-4)' }}>
              <Search size={20} style={{ color: 'var(--text-tertiary)' }} />
              <input 
                type="text" 
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search courses, lessons, users..."
                style={{ 
                  flex: 1, 
                  border: 'none', 
                  background: 'transparent', 
                  padding: 'var(--space-2)',
                  fontSize: 'var(--text-md)',
                  outline: 'none',
                  color: 'var(--text-primary)'
                }}
              />
              <button type="button" onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                <X size={20} />
              </button>
            </form>
            
            <div style={{ padding: 'var(--space-4)', minHeight: '200px' }}>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', textAlign: 'center', marginTop: 'var(--space-6)' }}>
                Start typing to search...
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
