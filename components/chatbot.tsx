'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function Chatbot() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'bot' }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { text: 'Merhaba! Size nasıl yardımcı olabilirim?', sender: 'bot' }
      ]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const msg = inputValue.trim();
    if (!msg || isTyping) return;

    setMessages(prev => [...prev, { text: msg, sender: 'user' }]);
    setInputValue('');
    setCharCount(0);
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }

    try {
      const user = session?.user as any;

      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          userId: user?.id || 'anonymous',
          userName: user?.name || 'Misafir',
          userEmail: user?.email || '',
          userRole: user?.rol?.ad || '',
          userRoleCode: user?.rol?.kod || '',
          userUnit: user?.birim?.ad || '',
          permissions: user?.rol?.yetkiler || []
        })
      });

      const data = await res.json();
      setIsTyping(false);

      if (data.success) {
        setMessages(prev => [...prev, { text: data.reply, sender: 'bot' }]);
      } else {
        setMessages(prev => [...prev, { text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', sender: 'bot' }]);
      }
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, { text: 'Bağlantı hatası. Lütfen tekrar deneyin.', sender: 'bot' }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 1000) {
      setInputValue(value);
      setCharCount(value.length);

      // Auto-resize
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const newHeight = Math.min(textareaRef.current.scrollHeight, 140);
        textareaRef.current.style.height = newHeight + 'px';
      }
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-full w-16 h-16 shadow-2xl transition-all duration-300 hover:scale-110 animate-pulse hover:animate-none flex items-center justify-center overflow-hidden"
          aria-label="Chatbot'u aç"
        >
          <img
            src="https://static.fokusistatistik.com/resimler/fokus216k.png"
            alt="Asistan"
            className="w-12 h-12 object-contain"
          />
        </button>
      )}

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-48px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-5 flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center overflow-hidden">
              <img
                src="https://static.fokusistatistik.com/resimler/fokus216k.png"
                alt="SAHA Asistan"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-white">
              <div className="font-semibold text-base">SAHA Asistan</div>
              <div className="text-xs text-white/80">Size nasıl yardımcı olabilirim?</div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Kapat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: msg.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br>')
                  }}
                />
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 flex items-center gap-1">
                  <span className="text-xs text-gray-600">Yazıyor</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Mesajınızı yazın..."
                className="flex-1 resize-none px-4 py-2.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 text-sm max-h-[140px]"
                style={{ height: '44px' }}
                maxLength={1000}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="w-11 h-11 min-w-[44px] bg-gradient-to-br from-primary to-primary/80 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform shadow-lg"
                aria-label="Gönder"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className={`text-xs text-right mt-1 ${charCount > 900 ? 'text-red-600' : charCount > 700 ? 'text-orange-600' : 'text-gray-500'}`}>
              {charCount} / 1000
            </div>
          </div>
        </div>
      )}
    </>
  );
}
