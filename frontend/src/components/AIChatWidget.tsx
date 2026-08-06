import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, Loader2, Zap } from 'lucide-react'
import apiClient from '../apiClient'
import { AI_CONFIG } from '../config'

interface AIChatWidgetProps {
  currentCode: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({ currentCode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const loadHistory = async () => {
    if (historyLoaded || !AI_CONFIG.enabled) return
    setHistoryLoaded(true)
    try {
      const history = await apiClient.ai.getChatHistory()
      const mapped: ChatMessage[] = history.map((m: any) => ({ id: m.id, role: m.role, content: m.content }))
      if (mapped.length === 0) {
        mapped.push({
          id: 'welcome',
          role: 'assistant',
          content: 'Hi! I am the CodeMe Assistant. Need a hint on your code? Just ask!',
        })
      }
      setMessages(mapped)
    } catch {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Hi! I am the CodeMe Assistant. Need a hint on your code? Just ask!',
      }])
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userText = input.trim()
    const userMsg: ChatMessage = { id: `local-${Date.now()}`, role: 'user', content: userText }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const data = await apiClient.ai.ask(userText, currentCode)
      setMessages(prev => [...prev, { id: `local-${Date.now()}`, role: 'assistant', content: data.reply }])
      if (typeof data.remaining === 'number') setRemaining(data.remaining)
    } catch {
      setMessages(prev => [...prev, {
        id: `local-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, the AI tutor is unavailable right now. Please try again in a moment.',
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    loadHistory()
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
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

      {/* Chat Window */}
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
              width: '350px',
              height: '500px',
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
            {/* Header */}
            <div style={{ padding: '16px', backgroundColor: 'var(--color-purple)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={20} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>CodeMe AI Assistant</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                title="Close AI Tutor"
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--bg-secondary)' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ 
                    maxWidth: '85%', 
                    padding: '10px 14px', 
                    borderRadius: '12px',
                    backgroundColor: msg.role === 'user' ? 'var(--color-blue)' : 'var(--bg-primary)',
                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                    border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                    borderBottomLeftRadius: msg.role === 'assistant' ? '2px' : '12px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-tertiary)', fontSize: '0.8rem', padding: '4px' }}>
                  <Loader2 className="animate-spin" size={14} /> AI is thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                {typeof remaining === 'number' && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                    {remaining > 0 ? `${remaining} hint${remaining === 1 ? '' : 's'} left today` : 'Daily hint limit reached'}
                  </span>
                )}
                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Mock tutor · preview</span>
              </div>
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                style={{ display: 'flex', gap: '8px' }}
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for a hint..."
                  className="input-field"
                  style={{ flex: 1, minHeight: '40px', height: '40px', borderRadius: '20px', paddingLeft: '16px', fontSize: '0.85rem' }}
                />
                <button 
                  type="submit"
                  title="Send message"
                  disabled={!input.trim() || isTyping}
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    backgroundColor: input.trim() && !isTyping ? 'var(--color-purple)' : 'var(--bg-secondary)', 
                    color: input.trim() && !isTyping ? 'white' : 'var(--text-tertiary)',
                    border: 'none', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: input.trim() && !isTyping ? 'pointer' : 'default',
                    transition: 'all 0.2s'
                  }}
                >
                  <Send size={18} />
                </button>
              </form>
              <p style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: '8px', lineHeight: 1.4 }}>
                {AI_CONFIG.consentText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
