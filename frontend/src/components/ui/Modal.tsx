import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '500px'
}: ModalProps) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ui-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="ui-modal-content" 
        style={{ maxWidth }} 
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="ui-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="ui-card-title">{title}</h3>
            <button 
              onClick={onClose} 
              className="btn btn-ghost" 
              style={{ padding: '8px', minHeight: 'auto', borderRadius: '50%' }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        {!title && (
          <button 
            onClick={onClose} 
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        )}

        <div className="ui-card-content">
          {children}
        </div>

        {footer && (
          <div className="ui-card-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
