import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './widget.css';

const chartData = [
  { name: 'TMT Bars', mentions: 18, fill: '#0056b3' },
  { name: 'Mild Steel', mentions: 12, fill: '#28a745' },
  { name: 'Pipes', mentions: 9, fill: '#ffc107' },
  { name: 'Cement', mentions: 8, fill: '#17a2b8' }
];

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('chat'); // 'chat' or 'admin'
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I can help you with material properties, our GST billing process, or general FAQs. What do you need?", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  const messagesEndRef = useRef(null);
  const widgetRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, isOpen, view]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      // If widget is open, and click target is not inside the widget window
      if (isOpen && widgetRef.current && !widgetRef.current.contains(e.target)) {
        // Make sure we're not clicking the toggle button
        const toggleBtn = document.getElementById('eng-chat-toggle');
        if (toggleBtn && toggleBtn.contains(e.target)) {
            return;
        }
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (text === "") return;

    if (text === "/admin123") {
      setInputValue("");
      setView('admin');
      return;
    }

    const newUserMsg = { id: Date.now(), text, sender: "user" };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsThinking(true);

    try {
      const response = await fetch('https://9a321a3a-8101-4f0c-9d5f-0b00194ea03b-00-3cdyv54qlvqr7.picard.replit.dev/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, text: data.reply, sender: "bot" }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting right now.", sender: "bot" }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div id="eng-chat-widget">
      {!isOpen && (
        <button 
          id="eng-chat-toggle" 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          💬 Need Help?
        </button>
      )}

      {isOpen && (
        <div id="eng-chat-window" ref={widgetRef}>
          <div id="eng-chat-header">
            <strong id="eng-header-title">
              {view === 'admin' ? "Manager Dashboard" : "Steel & Eng Assistant"}
            </strong>
            <div className="header-controls">
              {view === 'admin' && (
                <button 
                  id="eng-admin-close" 
                  type="button"
                  title="Back to Chat"
                  onClick={(e) => {
                    e.stopPropagation();
                    setView('chat');
                  }}
                >
                  🔙
                </button>
              )}
              <button 
                id="eng-chat-close" 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                ✖
              </button>
            </div>
          </div>

          {view === 'chat' && (
            <div id="eng-chat-view">
              <div id="eng-chat-messages">
                {messages.map(msg => (
                  <div key={msg.id} className={`chat-message ${msg.sender === "user" ? "user-message" : "bot-message"}`}>
                    {msg.text}
                  </div>
                ))}
                {isThinking && (
                  <div className="chat-message bot-message">
                    Thinking...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div id="eng-chat-input-area">
                <input 
                  type="text" 
                  id="eng-chat-input" 
                  placeholder="Ask about materials or orders..." 
                  autoComplete="off"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button id="eng-chat-send" type="button" onClick={handleSend}>
                  Send
                </button>
              </div>
            </div>
          )}

          {view === 'admin' && (
            <div id="eng-admin-view">
              <div className="admin-stat-box">
                <div style={{ fontSize: "12px", color: "#666" }}>Total Inquiries Today</div>
                <div className="admin-stat-number">47</div>
              </div>
              
              <div style={{ width: "100%", background: "white", padding: "10px", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                <h4 style={{ margin: "0 0 10px 0", textAlign: "center", fontSize: "14px", color: "#333" }}>
                  Hot Materials Demanded
                </h4>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="mentions">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
