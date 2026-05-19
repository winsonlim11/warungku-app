import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Loader2 } from 'lucide-react';

const SUGGESTIONS = [
  "Gimana cara naikin untung warung saya?",
  "Tips jualan biar ramai pas hari biasa",
  "Cara hitung harga jual yang pas",
  "Strategi promosi tanpa modal besar"
];

function TanyaAI({ transactions, products }) {
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Halo! Saya asisten pintar UMKM Anda. Ada yang bisa saya bantu untuk bisnis Anda hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Create context string from data
      const totalRevenue = transactions.reduce((sum, t) => sum + t.total_price, 0);
      const totalCost = transactions.reduce((sum, t) => sum + t.total_cost, 0);
      const profit = totalRevenue - totalCost;
      const contextStr = `Data UMKM:
- Total Produk: ${products?.length || 0}
- Total Transaksi: ${transactions?.length || 0}
- Total Pendapatan: Rp${totalRevenue}
- Total Keuntungan Bersih: Rp${profit}`;

      const apiUrl = import.meta.env.PROD ? '/api/chat' : 'http://localhost:8080/api/chat';
      
      const response = await axios.post(apiUrl, {
        message: text,
        history: messages.slice(1), // exclude the first greeting
        context: contextStr
      });

      setMessages(prev => [...prev, { role: 'model', content: response.data.reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = error.response?.data?.error || 'Maaf, terjadi kesalahan saat menghubungi server. Silakan coba lagi nanti.';
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: errorMsg,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Handle bold text **text**
      const boldParts = line.split(/(\*\*.*?\*\*)/g).map((chunk, j) => {
        if (chunk.startsWith('**') && chunk.endsWith('**')) {
          return <strong key={j} className="font-bold">{chunk.slice(2, -2)}</strong>;
        }
        // Handle list items starting with * or -
        if (j === 0 && (chunk.trim().startsWith('* ') || chunk.trim().startsWith('- '))) {
          return <span key={j} className="ml-4">• {chunk.substring(2)}</span>;
        }
        return chunk;
      });
      return (
        <span key={i} className="block mb-1">
          {boldParts}
        </span>
      );
    });
  };

  return (
    <div className="premium-card flex flex-col h-[75vh] max-h-[800px] animate-fade-in-up">
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 text-white rounded-t-3xl">
        <h2 className="font-bold text-lg flex items-center">
          <Bot className="mr-2" /> Konsultan Bisnis AI
        </h2>
        <p className="text-emerald-50 text-sm opacity-90 mt-1">Tanya apa saja seputar bisnis warung atau toko Anda</p>
      </div>

      {/* Chat Area */}
      <div className="flex-grow p-6 overflow-y-auto custom-scrollbar bg-[var(--bg-main)] space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${
                msg.role === 'user' ? 'bg-gradient-to-br from-indigo-400 to-indigo-600 ml-3' : 'bg-[var(--bg-card)] border border-[var(--border-color)] mr-3'
              }`}>
                {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-emerald-600 dark:text-emerald-400" />}
              </div>
              <div className={`p-4 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl rounded-tr-none' 
                  : msg.isError 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-2xl rounded-tl-none'
                    : 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] rounded-2xl rounded-tl-none'
              }`}>
                {msg.role === 'model' && !msg.isError ? (
                  <div className="text-sm">
                    {formatMessage(msg.content)}
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex flex-row max-w-[80%]">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] mr-3 flex items-center justify-center">
                <Bot size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm p-4 rounded-2xl rounded-tl-none flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500/40 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-500/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-color)] rounded-b-3xl">
        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug)}
                className="text-xs bg-[var(--bg-input)] text-[var(--text-muted)] px-3 py-1.5 rounded-full border border-[var(--border-color)] hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left shadow-sm"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            placeholder="Tulis pertanyaan Anda di sini..."
            className="premium-input resize-none h-14 py-4 overflow-hidden min-h-[56px] max-h-[120px]"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="btn-primary h-14 w-14 !p-0 flex items-center justify-center flex-shrink-0 rounded-xl"
          >
            {isLoading ? <Loader2 size={22} className="animate-spin text-white" /> : <Send size={22} className="text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TanyaAI;
