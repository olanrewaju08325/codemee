import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Bot } from 'lucide-react';
import { AIChatInterface } from './ui/AIChatInterface';

interface AIChatWidgetProps {
  currentCode?: string;
}

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({ currentCode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        title="Open AI Tutor"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '30px',
          backgroundColor: 'var(--color-purple)',
          color: 'white',
          border: 'none',
          boxShadow: '0 8px 24px rgba(139, 47, 166, 0.4)',
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        <Zap size={28} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              width: '400px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 1000
            }}
          >
            <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-purple)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={20} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Tutor</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                title="Close"
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <AIChatInterface mode="tutor" contextCode={currentCode} height="500px" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
