import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User as UserIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../apiClient';

interface DirectMessagingWidgetProps {
  currentUser: any;
  defaultContactId?: string | null;
  onClose?: () => void;
}

export const DirectMessagingWidget: React.FC<DirectMessagingWidgetProps> = ({ currentUser, defaultContactId, onClose }) => {
  const [isOpen, setIsOpen] = useState(!!defaultContactId);
  const [activeContact, setActiveContact] = useState<any | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultContactId) {
      setIsOpen(true);
      fetchHistory(defaultContactId);
      // We don't have the full profile of the default contact here easily,
      // but we can set a dummy active contact until conversations load.
      setActiveContact({ id: defaultContactId, full_name: 'Loading...' });
    }
  }, [defaultContactId]);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeContact && isOpen) {
      const interval = setInterval(() => {
        fetchHistory(activeContact.id, true);
      }, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [activeContact, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await apiClient.authenticatedFetch('/api/chat/conversations');
      if (res) {
        setConversations(res);
        if (defaultContactId) {
          const contact = res.find((c: any) => c.id === defaultContactId);
          if (contact) setActiveContact(contact);
        }
      }
    } catch (e) {
      console.error("Failed to fetch conversations", e);
    }
  };

  const fetchHistory = async (contactId: string, background = false) => {
    if (!background) setLoading(true);
    try {
      const res = await apiClient.authenticatedFetch(`/api/chat/history/${contactId}`);
      if (res) {
        setMessages(res);
        // Mark as read
        await apiClient.authenticatedFetch(`/api/chat/mark-read/${contactId}`, { method: 'POST' });
      }
    } catch (e) {
      console.error("Failed to fetch history", e);
    } finally {
      if (!background) setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeContact) return;
    
    const msg = inputMessage;
    setInputMessage('');
    setSending(true);
    
    // Optimistic update
    const optimisticMsg = {
      id: Date.now().toString(),
      sender_id: currentUser.id,
      receiver_id: activeContact.id,
      content: msg,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await apiClient.authenticatedFetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: activeContact.id, content: msg })
      });
      // fetchHistory(activeContact.id, true);
    } catch (e) {
      console.error("Send failed", e);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-50 group"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 w-96 h-[32rem] bg-[var(--surface-dark)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center text-white">
        {activeContact ? (
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveContact(null)} className="text-white/70 hover:text-white mr-2 text-sm font-bold">← Back</button>
            <div className="font-bold">{activeContact.full_name}</div>
          </div>
        ) : (
          <h3 className="font-bold flex items-center gap-2"><MessageSquare size={18}/> Messages</h3>
        )}
        <button onClick={() => { setIsOpen(false); onClose && onClose(); }} className="text-white/70 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-[var(--bg-main)]">
        {!activeContact ? (
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-[var(--muted)] text-sm">No recent conversations. Go to the course roster or directory to message someone.</div>
            ) : (
              conversations.map(contact => (
                <div 
                  key={contact.id} 
                  onClick={() => { setActiveContact(contact); fetchHistory(contact.id); }}
                  className="flex items-center gap-3 p-3 hover:bg-[var(--surface)] cursor-pointer rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    {contact.full_name ? contact.full_name.charAt(0) : <UserIcon size={16}/>}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[var(--text-primary)]">{contact.full_name}</div>
                    <div className="text-xs text-[var(--muted)] capitalize">{contact.role}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center p-4 text-indigo-500"><Loader2 className="animate-spin" size={24}/></div>
              ) : messages.length === 0 ? (
                <div className="text-center text-[var(--muted)] text-sm mt-10">No messages yet. Say hi!</div>
              ) : (
                messages.map((m, i) => {
                  const isMe = m.sender_id === currentUser.id;
                  return (
                    <div key={m.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] rounded-bl-none'}`}>
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSend} className="p-3 bg-[var(--surface-dark)] border-t border-[var(--border)] flex gap-2">
              <input 
                type="text" 
                value={inputMessage} 
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..." 
                className="flex-1 bg-[var(--bg-main)] border border-[var(--border)] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
              <button 
                type="submit" 
                disabled={!inputMessage.trim() || sending}
                className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-50 hover:bg-indigo-500 transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
};
