import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User } from 'lucide-react';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { sheetApi } from '../api/sheetApi';

// The API Key will be provided via environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const INITIAL_MESSAGES = [
  { id: 1, sender: 'bot', text: 'こんにちは！新規企画班のAIサポートボットです。スケジュールやタスク、企画の進捗状況などを学習済みです！何でも質問してください。' }
];

// Helper to format sheet data to text
const formatContext = (name, data) => {
  if (!data || data.length === 0) return `${name}: データなし\n`;
  const textRules = data.map(item => JSON.stringify(item)).join('\n');
  return `=== ${name} ===\n${textRules}\n\n`;
};

function AssistantPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [systemContext, setSystemContext] = useState('ローディング中...');
  const [isContextLoaded, setIsContextLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Fetch all context data when standard component mounts
    const loadContext = async () => {
      try {
        const [members, tasks, events, projects, goals] = await Promise.all([
          sheetApi.read('Members'),
          sheetApi.read('Tasks'),
          sheetApi.read('Events'),
          sheetApi.read('Projects'),
          sheetApi.read('Goals')
        ]);
        
        const contextStr = `
あなたは「新規企画班」の優秀なAIアシスタントです。
以下の現在のプロジェクト状況（JSONデータ）を把握した上で、班員からの質問に優しく、正確に答えてください。
推測ではなく、提供されたデータに基づいて答えてください。データにないことは「現在のデータにはありません」と正直に答えてください。

${formatContext('メンバー', members)}
${formatContext('タスク進捗', tasks)}
${formatContext('企画進捗', projects)}
${formatContext('スケジュール', events)}
${formatContext('重点目標', goals)}
`;
        setSystemContext(contextStr);
        setIsContextLoaded(true);
      } catch (err) {
        console.error("Failed to load context:", err);
        setSystemContext('エラー: データの読み込みに失敗しました。');
      }
    };
    
    loadContext();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !isContextLoaded) return;

    if (!API_KEY) {
      alert("エラー: Gemini APIキーが設定されていません (VITE_GEMINI_API_KEY)");
      return;
    }

    const userMsg = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Build previous message history for context
      const historyMsg = messages.map(m => m.sender === 'user' ? `User: ${m.text}` : `Assistant: ${m.text}`).join('\n');
      
      const prompt = `${systemContext}\n\n=== これまでの会話 ===\n${historyMsg}\n\nUser: ${userMsg.text}\nAssistant:`;

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Remove any trailing or leading assistant prefixes if the model added them
      text = text.replace(/^Assistant:\s*/i, '').trim();

      const botMsg = { id: Date.now() + 1, sender: 'bot', text: text };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Gemini API Error:', error);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: '申し訳ありません、APIリクエスト中にエラーが発生しました。しばらく経ってから再度お試しください。' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className="main-content">
      <div className="container" style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexShrink: 0 }}>
          <MessageCircle size={28} color="var(--color-primary)" />
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>AI アシスタント</h1>
          {!isContextLoaded && <span style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', marginLeft: '1rem' }}>連携データを読み込み中...</span>}
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
              disabled={isTyping || !isContextLoaded}
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ borderRadius: '999px', width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              disabled={!inputValue.trim() || isTyping || !isContextLoaded}
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
