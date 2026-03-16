import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User } from 'lucide-react';

const INITIAL_MESSAGES = [
  { id: 1, sender: 'bot', text: 'こんにちは！新規企画班のAIサポートボットです。「申請の仕方がわからない」「ミーティングルームの予約方法は？」など、気軽にご質問ください！' }
];

// Simple hardcoded responses for demo purposes
const getBotResponse = (input) => {
  const text = input.toLowerCase();
  if (text.includes('申請') || text.includes('フォーム')) {
    return '企画の申請については、Dashboardの「クイックアクセス」から「企画書フォーマット」をダウンロードし、記入後に班長までメールで送付してください。';
  } else if (text.includes('鍵') || text.includes('部室')) {
    return '部室の鍵は学生課で学生証を提示して借りることができます。使用後は必ず施錠して返却してください。';
  } else if (text.includes('会議') || text.includes('ミーティング')) {
    return '定例会議は毎週木曜の19時から部室で行われています。直近のスケジュールは「Calendar」タブから確認できますよ。';
  } else {
    return 'ご質問ありがとうございます！現状のボットではお答えできない内容のようなので、後ほど担当の鈴木（suzuki@example.com）あてに直接お問い合わせをお願いできますでしょうか？';
  }
};

function AssistantPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate network delay
    setTimeout(() => {
      const botResponseText = getBotResponse(userMsg.text);
      const botMsg = { id: Date.now() + 1, sender: 'bot', text: botResponseText };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <main className="main-content">
      <div className="container" style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexShrink: 0 }}>
          <MessageCircle size={28} color="var(--color-primary)" />
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>AI アシスタント</h1>
        </div>

        {/* Chat Container */}
        <div style={{ 
          flex: 1, 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          
          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ 
                display: 'flex', 
                gap: '1rem', 
                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start'
              }}>
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: msg.sender === 'user' ? 'var(--color-primary)' : '#e2e8f0',
                  color: msg.sender === 'user' ? 'white' : 'var(--color-text)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {msg.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                
                <div style={{ 
                  maxWidth: '70%',
                  backgroundColor: msg.sender === 'user' ? 'var(--color-primary)' : '#f1f5f9',
                  color: msg.sender === 'user' ? 'white' : 'var(--color-text)',
                  padding: '1rem',
                  borderRadius: '12px',
                  borderTopRightRadius: msg.sender === 'user' ? '0' : '12px',
                  borderTopLeftRadius: msg.sender === 'bot' ? '0' : '12px',
                  lineHeight: '1.5'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: '#e2e8f0', color: 'var(--color-text)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Bot size={20} />
                </div>
                <div style={{ 
                  backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '12px', borderTopLeftRadius: '0',
                  color: 'var(--color-text-light)', fontStyle: 'italic', fontSize: '0.875rem'
                }}>
                  AIが入力中...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{ 
            padding: '1rem', 
            borderTop: '1px solid var(--color-border)', 
            backgroundColor: '#f8fafc',
            display: 'flex',
            gap: '0.75rem'
          }}>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="質問を入力してください... 例: 申請の仕方を教えて"
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: '1px solid var(--color-border)',
                borderRadius: '999px',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '1rem'
              }}
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ borderRadius: '999px', width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              disabled={!inputValue.trim() || isTyping}
            >
              <Send size={20} />
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}

export default AssistantPage;
