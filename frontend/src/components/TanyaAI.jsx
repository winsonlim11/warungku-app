import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Loader2, Sparkles, Copy, Check, Megaphone } from 'lucide-react';

const SUGGESTIONS = [
  "Gimana cara naikin untung warung saya?",
  "Tips jualan biar ramai pas hari biasa",
  "Cara hitung harga jual yang pas",
  "Strategi promosi tanpa modal besar"
];

function TanyaAI({ transactions, products }) {
  // Navigation State: 'chat' or 'promo'
  const [subTab, setSubTab] = useState('chat');

  // Chat States
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Halo! Saya asisten pintar UMKM Anda. Ada yang bisa saya bantu untuk bisnis Anda hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Promotion States
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customProductName, setCustomProductName] = useState('');
  const [customHighlight, setCustomHighlight] = useState('');
  const [platform, setPlatform] = useState('WhatsApp');
  const [gaya, setGaya] = useState('Ramah');
  const [generatedCaptions, setGeneratedCaptions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [promoError, setPromoError] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (subTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, subTab]);

  // Handle send message to AI Consultant (with enriched context)
  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Calculate General Metrics
      const totalRevenue = transactions.reduce((sum, t) => sum + t.total_price, 0);
      const totalCost = transactions.reduce((sum, t) => sum + t.total_cost, 0);
      const profit = totalRevenue - totalCost;

      // 2. Calculate Best Sellers (Top 3)
      const productSales = {};
      transactions.forEach(t => {
        t.items.forEach(item => {
          if (!productSales[item.name]) {
            productSales[item.name] = { qty: 0 };
          }
          productSales[item.name].qty += item.qty;
        });
      });
      const bestSellers = Object.entries(productSales)
        .map(([name, data]) => ({ name, qty: data.qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 3);
      const bestSellersStr = bestSellers.length > 0 
        ? bestSellers.map((p, idx) => `${idx + 1}. ${p.name} (${p.qty}x laku)`).join(', ')
        : 'Belum ada data penjualan';

      // 3. Find Out-of-Stock and Low Stock Items
      const outOfStock = products.filter(p => (p.stock || 0) === 0);
      const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5);
      const outOfStockStr = outOfStock.length > 0 ? outOfStock.map(p => p.name).join(', ') : 'Tidak ada';
      const lowStockStr = lowStock.length > 0 ? lowStock.map(p => `${p.name} (Stok: ${p.stock})`).join(', ') : 'Tidak ada';

      // 4. Find Payment Method Preferences
      const paymentCounts = {};
      transactions.forEach(t => {
        const method = t.payment_method || 'Tunai';
        paymentCounts[method] = (paymentCounts[method] || 0) + 1;
      });
      const paymentMethodStr = Object.entries(paymentCounts)
        .map(([method, count]) => `${method} (${count}x)`).join(', ') || 'Belum ada transaksi';

      // Create enriched context string for Gemini
      const contextStr = `Data UMKM WarungKu:
- Total Jenis Produk di Gudang: ${products?.length || 0} jenis
- Total Transaksi: ${transactions?.length || 0} kali
- Total Pendapatan Kotor: Rp${totalRevenue.toLocaleString('id-ID')}
- Total Keuntungan Bersih: Rp${profit.toLocaleString('id-ID')}
- Produk Terlaris (Top 3): ${bestSellersStr}
- Produk Stok Habis: ${outOfStockStr}
- Produk Stok Menipis (<= 5 pcs): ${lowStockStr}
- Metode Pembayaran Terpopuler: ${paymentMethodStr}`;

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

  // Handle generate social media caption (Promo AI)
  const handleGeneratePromo = async () => {
    const productName = selectedProductId === 'custom' ? customProductName : products.find(p => p.id === selectedProductId)?.name;
    if (!productName || !productName.trim() || !customHighlight.trim() || isGenerating) return;

    setIsGenerating(true);
    setPromoError('');
    setGeneratedCaptions([]);

    try {
      const apiUrl = import.meta.env.PROD ? '/api/caption' : 'http://localhost:8080/api/caption';
      
      const response = await axios.post(apiUrl, {
        nama_produk: productName,
        deskripsi: customHighlight,
        platform,
        gaya
      });

      if (response.data && Array.isArray(response.data.captions)) {
        setGeneratedCaptions(response.data.captions);
      } else {
        throw new Error('Format respon tidak sesuai. Pastikan server merespon dengan array caption.');
      }
    } catch (error) {
      console.error('Error generating promo caption:', error);
      const errorMsg = error.response?.data?.error || 'Maaf, gagal membuat teks promosi. Pastikan server backend berjalan.';
      setPromoError(errorMsg);
    } finally {
      setIsGenerating(false);
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
      {/* Header with Sub-Tab Navigation */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 text-white rounded-t-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
        <div>
          <h2 className="font-bold text-xl flex items-center gap-2">
            <Bot className="w-6 h-6 animate-pulse" /> Asisten Bisnis AI
          </h2>
          <p className="text-emerald-50 text-sm opacity-90 mt-1">
            {subTab === 'chat' ? 'Konsultan keuangan & operasional warung Anda' : 'Buat caption promosi media sosial instan'}
          </p>
        </div>
        
        {/* Toggle Buttons */}
        <div className="flex bg-white/20 backdrop-blur-md p-1 rounded-xl border border-white/10 self-stretch sm:self-auto shadow-inner">
          <button
            onClick={() => setSubTab('chat')}
            className={`flex-grow sm:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
              subTab === 'chat' ? 'bg-white text-emerald-700 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            Konsultan AI
          </button>
          <button
            onClick={() => setSubTab('promo')}
            className={`flex-grow sm:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
              subTab === 'promo' ? 'bg-white text-emerald-700 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            Promosi AI
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {subTab === 'chat' ? (
        <>
          {/* Chat Conversation Area */}
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

          {/* Chat Input Area */}
          <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-color)] rounded-b-3xl">
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
        </>
      ) : (
        /* AI Promotion Area (Social Media Caption Generator) */
        <div className="flex-grow overflow-y-auto p-6 bg-[var(--bg-main)] custom-scrollbar rounded-b-3xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            
            {/* Form Inputs (5 columns) */}
            <div className="lg:col-span-5 space-y-5 border-b lg:border-b-0 lg:border-r border-[var(--border-color)] pb-6 lg:pb-0 lg:pr-8 flex flex-col justify-between">
              <div className="space-y-4">
                
                {/* Product Select Dropdown */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Pilih Produk</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedProductId(val);
                      if (val !== 'custom' && val !== '') {
                        const prod = products.find(p => p.id === val);
                        setCustomProductName(prod ? prod.name : '');
                      } else {
                        setCustomProductName('');
                      }
                    }}
                    className="premium-input w-full bg-white dark:bg-slate-800 text-sm py-3"
                  >
                    <option value="">-- Pilih Produk dari Gudang --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Rp{p.price.toLocaleString('id-ID')})
                      </option>
                    ))}
                    <option value="custom">✏️ Ketik Manual...</option>
                  </select>
                </div>

                {/* Custom Product Name Input (If "custom" selected) */}
                {selectedProductId === 'custom' && (
                  <div className="animate-fade-in-up">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Nama Produk Baru</label>
                    <input
                      type="text"
                      placeholder="Contoh: Kopi Aren Spesial"
                      value={customProductName}
                      onChange={(e) => setCustomProductName(e.target.value)}
                      className="premium-input w-full text-sm"
                    />
                  </div>
                )}

                {/* Custom Highlights Textarea */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Detail & Keunggulan Produk</label>
                  <textarea
                    placeholder="Contoh: Biji kopi robusta pilihan Lampung, wangi karamel, manis pas, diskon 15% khusus hari ini."
                    value={customHighlight}
                    onChange={(e) => setCustomHighlight(e.target.value)}
                    className="premium-input w-full h-24 text-sm resize-none"
                  />
                </div>

                {/* Platform Target Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Platform Media Sosial</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['WhatsApp', 'Instagram', 'TikTok', 'Facebook'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPlatform(p)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-300 ${
                          platform === p
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'border-[var(--border-color)] hover:bg-[var(--bg-input)] text-[var(--text-muted)]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Writing Style Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Gaya Bahasa</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Ramah', 'Santai', 'Lucu', 'Profesional'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGaya(g)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-300 ${
                          gaya === g
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'border-[var(--border-color)] hover:bg-[var(--bg-input)] text-[var(--text-muted)]'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Generate Button */}
              <div className="pt-4">
                <button
                  type="button"
                  disabled={isGenerating || (!customProductName.trim() && selectedProductId !== '') || !customHighlight.trim()}
                  onClick={handleGeneratePromo}
                  className="w-full btn-primary bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/30 hover:shadow-emerald-500/40 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-white hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-300"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Membuat Teks...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-white" />
                      <span>Buat Teks Promosi</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Results Screen (7 columns) */}
            <div className="lg:col-span-7 flex flex-col h-full min-h-[300px]">
              
              {/* Skeleton loading when isGenerating */}
              {isGenerating && (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="premium-card p-5 animate-pulse border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/5"></div>
                        <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                      </div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show Generated Results */}
              {!isGenerating && generatedCaptions.length > 0 && (
                <div className="space-y-4 overflow-y-auto pr-1 flex-1 max-h-[60vh] custom-scrollbar">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="font-bold text-sm text-[var(--text-main)]">Hasil Promosi untuk {platform} ({gaya}):</h3>
                  </div>
                  {generatedCaptions.map((cap, idx) => (
                    <div key={idx} className="premium-card p-5 border border-[var(--border-color)] bg-[var(--bg-card)] relative hover:border-emerald-500/40 transition-all duration-300 group">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Variasi #{idx + 1}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(cap);
                            setCopiedIndex(idx);
                            setTimeout(() => setCopiedIndex(null), 2000);
                          }}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-bold transition-all duration-300 ${
                            copiedIndex === idx
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : 'border-[var(--border-color)] text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                          }`}
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check size={14} className="text-white" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed text-[var(--text-main)] whitespace-pre-line bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border-color)]/30">{cap}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty & Error State */}
              {!isGenerating && generatedCaptions.length === 0 && (
                <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-3xl p-8 text-center min-h-[350px]">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mb-4 text-emerald-500">
                    <Megaphone className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-base text-[var(--text-main)] mb-1">Siap untuk Promosi?</h4>
                  <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">
                    Pilih produk di sebelah kiri, tambahkan keunggulan promosi, lalu klik tombol untuk menghasilkan 3 variasi caption promosi otomatis dari Gemini.
                  </p>
                  {promoError && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-500 text-xs max-w-xs font-semibold">
                      {promoError}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TanyaAI;
