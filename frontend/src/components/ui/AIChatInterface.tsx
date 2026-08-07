
import React, { useState, useEffect, useRef } from "react";
import { Send, Zap, Bot, Trash2, Loader2 } from "lucide-react";
import { Card } from "./Card";
import apiClient from "../../apiClient";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface AIChatInterfaceProps {
  contextCode?: string;
  contextType?: string;
  contextData?: string;
  mode?: "tutor" | "generate";
  height?: string | number;
}

export const AIChatInterface: React.FC<AIChatInterfaceProps> = ({ 
  contextCode, 
  contextType, 
  contextData,
  mode = "tutor",
  height = "500px"
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(mode === "tutor");
  const [remaining, setRemaining] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === "tutor") {
      loadHistory();
    }
  }, [mode]);

  const loadHistory = async () => {
    try {
      setFetchingHistory(true);
      const data = await apiClient.ai.getHistory();
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      if (mode === "tutor") {
        const res = await apiClient.ai.ask(userMessage.content, contextCode);
        setRemaining(res.remaining);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: res.reply || (res as any).result,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const res = await apiClient.ai.generate(userMessage.content, contextType || "general", contextData);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: res.result,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${err.message || "Something went wrong."}`,
        created_at: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const code = part.replace(/^```[a-z]*\n?/g, "").replace(/```$/, "");
        return (
          <div key={index} style={{
            background: "var(--surface-sunken)",
            padding: "var(--space-3)",
            borderRadius: "var(--radius-md)",
            margin: "var(--space-2) 0",
            fontFamily: "monospace",
            fontSize: "var(--text-sm)",
            overflowX: "auto",
            border: "1px solid var(--border-subtle)"
          }}>
            {code}
          </div>
        );
      }
      
      let formatted = part.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      formatted = formatted.replace(/\n/g, "<br />");
      
      return <span key={index} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <Card style={{ 
      display: "flex", 
      flexDirection: "column", 
      height,
      border: "1px solid rgba(139,92,246,0.3)",
      boxShadow: "0 4px 20px rgba(139,92,246,0.1)",
      overflow: "hidden"
    }}>
      <div style={{
        padding: "var(--space-3) var(--space-4)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(to right, rgba(139,92,246,0.05), transparent)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <div style={{ 
            width: 32, 
            height: 32, 
            borderRadius: "var(--radius-md)", 
            background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Zap size={16} color="#fff" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>
              {mode === "tutor" ? "AI Code Tutor" : "AI Assistant"}
            </h4>
            {remaining !== null && (
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                {remaining} requests remaining today
              </span>
            )}
          </div>
        </div>
        
        {mode === "tutor" && (
          <button 
            onClick={() => setMessages([])}
            style={{ 
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "var(--space-1)"
            }}
            title="Clear Chat"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        background: "var(--surface-default)"
      }}>
        {fetchingHistory ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <Loader2 className="spin" size={24} color="var(--primary)" />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center",
            height: "100%",
            color: "var(--text-secondary)",
            textAlign: "center",
            opacity: 0.7
          }}>
            <Bot size={48} style={{ marginBottom: "var(--space-3)", opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: "var(--text-sm)" }}>
              {mode === "tutor" 
                ? "I am your AI tutor. Ask me a question about your code or the lesson, and I will give you a hint!" 
                : "I am your AI assistant. Tell me what you need to generate."}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id}
              style={{
                display: "flex",
                gap: "var(--space-3)",
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%"
              }}
            >
              {msg.role === "assistant" && (
                <div style={{ 
                  width: 28, 
                  height: 28, 
                  borderRadius: "50%", 
                  background: "rgba(139,92,246,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2
                }}>
                  <Bot size={14} color="var(--primary)" />
                </div>
              )}
              
              <div style={{
                padding: "var(--space-3)",
                borderRadius: "var(--radius-lg)",
                background: msg.role === "user" ? "var(--primary)" : "var(--surface-sunken)",
                color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                fontSize: "var(--text-sm)",
                lineHeight: 1.5,
                border: msg.role === "assistant" ? "1px solid var(--border-subtle)" : "none",
                borderTopRightRadius: msg.role === "user" ? 4 : undefined,
                borderTopLeftRadius: msg.role === "assistant" ? 4 : undefined,
              }}>
                {renderContent(msg.content)}
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div style={{ display: "flex", gap: "var(--space-3)", alignSelf: "flex-start" }}>
            <div style={{ 
              width: 28, 
              height: 28, 
              borderRadius: "50%", 
              background: "rgba(139,92,246,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Bot size={14} color="var(--primary)" />
            </div>
            <div style={{
              padding: "var(--space-3)",
              borderRadius: "var(--radius-lg)",
              background: "var(--surface-sunken)",
              border: "1px solid var(--border-subtle)",
              borderTopLeftRadius: 4,
            }}>
              <Loader2 className="spin" size={16} color="var(--text-secondary)" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        padding: "var(--space-3)",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--surface-sunken)"
      }}>
        <div style={{
          display: "flex",
          gap: "var(--space-2)",
          background: "var(--surface-default)",
          padding: "var(--space-2)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-default)",
          alignItems: "flex-end"
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={mode === "tutor" ? "Ask for a hint..." : "Type your prompt..."}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              resize: "none",
              outline: "none",
              minHeight: "40px",
              maxHeight: "120px",
              padding: "var(--space-2)",
              fontSize: "var(--text-sm)",
              fontFamily: "inherit",
              color: "var(--text-primary)"
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn btn-primary"
            style={{
              padding: "var(--space-2)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              flexShrink: 0
            }}
          >
            {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </Card>
  );
};
