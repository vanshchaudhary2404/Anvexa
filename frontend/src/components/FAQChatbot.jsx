import React, { useState } from 'react';
import chatbotIcon from '../assets/icon-chatbot.png';

const quickPrompts = [
  'Where is my order?',
  'How do I return?',
  'How do I pay?',
  'Where is my tracking?'
];

const FAQChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hi! I’m Anvexa Assistant. Ask me anything about orders, shipping, returns, login, or payments.'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (value = question) => {
    const trimmedQuestion = value.trim();
    if (!trimmedQuestion) return;

    const userMessage = { sender: 'user', text: trimmedQuestion };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/faq/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: trimmedQuestion })
      });

      const data = await res.json();
      const botMessage = {
        sender: 'bot',
        text: data.answer || 'I’m sorry, I couldn’t find an answer for that. Please contact support for help.'
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'I hit a small issue. Please try again in a moment.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="faq-chatbot">
      {!isOpen ? (
        <button className="faq-toggle" onClick={() => setIsOpen(true)} aria-label="Open chatbot">
          <img src={chatbotIcon} alt="Chatbot" className="faq-toggle-icon" />
          {/* <span>Chat with us</span> */}
        </button>
      ) : (
        <div className="faq-panel">
          <div className="faq-header">
            <div className="faq-header-title">
              <span className="faq-header-icon">🤖</span>
              <span>Anvexa Assistant</span>
            </div>
            <button className="faq-close" onClick={() => setIsOpen(false)} aria-label="Close chatbot">×</button>
          </div>

          <div className="faq-prompt-row">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="faq-prompt-chip"
                onClick={() => handleAsk(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="faq-messages">
            {messages.map((msg, index) => (
              <div key={`${msg.sender}-${index}`} className={`faq-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {loading && <div className="faq-message bot">Thinking...</div>}
          </div>

          <div className="faq-input-row">
            <input
              type="text"
              value={question}
              placeholder="Type your question..."
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAsk();
              }}
              aria-label="Ask a question"
            />
            <button onClick={() => handleAsk()} disabled={loading}>
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQChatbot;
